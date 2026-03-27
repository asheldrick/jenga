// src/SessionVocab.jsx
import { useState, useEffect, useRef } from "react";
import {
  COPPER, COPPER_DIM, COPPER_LIGHT,
  PARCHMENT, PARCHMENT_DARK, PARCHMENT_MID,
  INK, INK_MID, INK_LIGHT,
  PANEL, PANEL2, ROOT_BG,
  GREEN_BG, GREEN_FG, RED_BG, RED_FG,
  shuffle, isCloseEnough,
} from "./utils.jsx";
import {
  fetchSessions, insertSession, deleteSession, parseBulkImport,
} from "./data/sessionCards.js";

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = {
  // layout
  root:         { minHeight:"100vh", background:ROOT_BG, color:INK, fontFamily:"'Georgia','Times New Roman',serif", maxWidth:680, margin:"0 auto", padding:"1rem", boxSizing:"border-box", fontSize:"16px" },
  subHeader:    { display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" },
  backBtn:      { background:"none", border:`1px solid ${PARCHMENT_DARK}`, color:INK_LIGHT, padding:"0.3rem 0.7rem", borderRadius:4, cursor:"pointer", fontSize:"0.8rem", flexShrink:0 },
  subTitle:     { color:INK_MID, fontSize:"0.85rem", letterSpacing:"0.05em" },

  // section label
  sectionLabel: { fontSize:"0.65rem", color:COPPER_DIM, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.6rem" },

  // import area
  importBox:    { background:PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:6, padding:"1rem 1.2rem", marginBottom:"1.25rem", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  importToggle: { display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", userSelect:"none" },
  importTitle:  { fontSize:"0.85rem", color:COPPER, fontWeight:"bold", letterSpacing:"0.05em" },
  importHint:   { fontSize:"0.7rem", color:INK_LIGHT, marginTop:"0.5rem", lineHeight:1.6 },
  importFormat: { background:PANEL2, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:4, padding:"0.5rem 0.75rem", fontSize:"0.7rem", fontFamily:"monospace", color:INK_MID, margin:"0.5rem 0", lineHeight:1.7 },
  textarea:     { width:"100%", boxSizing:"border-box", background:PANEL2, border:`1px solid ${PARCHMENT_DARK}`, color:INK, borderRadius:4, padding:"0.5rem", fontSize:"0.78rem", fontFamily:"monospace", resize:"vertical", outline:"none", marginTop:"0.5rem" },
  importBtns:   { display:"flex", gap:"0.5rem", marginTop:"0.6rem" },
  importBtn:    { background:COPPER, color:PARCHMENT, border:"none", borderRadius:4, padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.82rem", fontWeight:"bold", fontFamily:"inherit" },
  cancelBtn:    { background:"none", border:`1px solid ${PARCHMENT_DARK}`, color:INK_LIGHT, borderRadius:4, padding:"0.5rem 0.8rem", cursor:"pointer", fontSize:"0.82rem", fontFamily:"inherit" },
  errorMsg:     { fontSize:"0.75rem", color:RED_FG, marginTop:"0.4rem" },

  // session list
  sessionList:  { display:"flex", flexDirection:"column", gap:"0.85rem" },
  sessionCard:  { background:PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:6, padding:"1rem 1.2rem", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" },
  sessionTop:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.65rem" },
  sessionDate:  { fontSize:"0.65rem", color:COPPER_DIM, letterSpacing:"0.15em", textTransform:"uppercase" },
  sessionLabel: { fontSize:"1.05rem", color:INK, fontWeight:"bold", marginTop:"0.1rem" },
  sessionMeta:  { fontSize:"0.78rem", color:INK_LIGHT, marginTop:"0.2rem" },
  sessionRight: { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"0.3rem", flexShrink:0 },
  cardCount:    { fontSize:"0.72rem", color:INK_LIGHT },
  deleteBtn:    { background:"none", border:"none", color:`${RED_FG}99`, cursor:"pointer", fontSize:"0.7rem", padding:"2px 4px" },
  drillBtns:    { display:"flex", gap:"0.5rem", flexWrap:"wrap" },
  drillBtn:     { flex:1, background:PANEL2, border:`1px solid ${COPPER_DIM}55`, color:COPPER, borderRadius:4, padding:"0.45rem 0.4rem", cursor:"pointer", fontSize:"0.72rem", fontFamily:"inherit", letterSpacing:"0.04em", transition:"all 0.12s" },
  drillBtnPri:  { background:COPPER, color:PARCHMENT, border:`1px solid ${COPPER}`, fontWeight:"bold" },
  emptyState:   { textAlign:"center", color:INK_LIGHT, fontSize:"0.88rem", padding:"2.5rem 1rem", lineHeight:1.8 },

  // drill screen
  drillHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" },
  drillMeta:    { display:"flex", alignItems:"center", gap:"0.6rem" },
  drillStage:   { fontSize:"0.75rem", color:COPPER, letterSpacing:"0.1em" },
  drillCount:   { fontSize:"0.75rem", color:INK_LIGHT },
  drillScore:   { fontSize:"0.85rem", color:INK_MID },
  drillBody:    { display:"flex", flexDirection:"column", gap:"1rem" },
  progressBar:  { height:3, background:PARCHMENT_DARK, borderRadius:2, marginBottom:"1rem" },
  progressFill: { height:"100%", background:COPPER, borderRadius:2, transition:"width 0.3s" },

  // direction toggle
  dirRow:       { display:"flex", justifyContent:"center", gap:"0.4rem", marginBottom:"0.75rem" },
  dirBtn:       { background:PANEL2, border:`1px solid ${PARCHMENT_DARK}`, color:INK_LIGHT, borderRadius:20, padding:"0.25rem 0.85rem", cursor:"pointer", fontSize:"0.72rem", fontFamily:"inherit", transition:"all 0.12s" },
  dirBtnActive: { background:COPPER, color:PARCHMENT, border:`1px solid ${COPPER}`, fontWeight:"bold" },

  // card
  cardWrap:        { background:PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:8, padding:"1.5rem 1.4rem", cursor:"pointer", minHeight:130, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.08)" },
  cardPromptLabel: { fontSize:"0.65rem", letterSpacing:"0.2em", color:INK_LIGHT, marginBottom:"0.5rem" },
  cardPrompt:      { fontSize:"1.3rem", textAlign:"center", color:INK, lineHeight:1.4 },
  cardTag:         { fontSize:"0.65rem", color:COPPER_DIM, marginTop:"0.6rem", fontStyle:"italic" },
  cardTap:         { fontSize:"0.72rem", color:INK_LIGHT, marginTop:"1rem", letterSpacing:"0.1em" },
  divider:         { width:"40%", height:1, background:PARCHMENT_DARK, margin:"0.8rem 0" },
  cardAnswerLabel: { fontSize:"0.65rem", letterSpacing:"0.2em", color:COPPER, marginBottom:"0.4rem" },
  cardAnswer:      { fontSize:"1.35rem", color:COPPER, textAlign:"center", fontStyle:"italic" },

  // flashcard buttons
  fcButtons: { display:"flex", gap:"0.75rem" },
  fcBtn:     { flex:1, padding:"0.75rem", borderRadius:5, border:"none", fontSize:"0.95rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" },
  fcWrong:   { background:RED_BG, color:RED_FG, border:`1px solid ${RED_FG}33` },
  fcRight:   { background:GREEN_BG, color:GREEN_FG, border:`1px solid ${GREEN_FG}33` },

  // written
  writtenArea:     { display:"flex", flexDirection:"column", gap:"0.6rem" },
  writtenInput:    { background:PANEL, border:`1px solid ${PARCHMENT_DARK}`, color:INK, borderRadius:5, padding:"0.85rem 1rem", fontSize:"1.1rem", fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box", boxShadow:"inset 0 1px 3px rgba(0,0,0,0.06)" },
  inputWrong:      { border:`1px solid ${RED_FG}88`, background:RED_BG },
  inputRight:      { border:`1px solid ${GREEN_FG}88`, background:GREEN_BG },
  submitBtn:       { background:COPPER, color:PARCHMENT, border:"none", borderRadius:5, padding:"0.75rem", fontSize:"1rem", cursor:"pointer", fontWeight:"bold", fontFamily:"inherit" },
  writtenFeedback: { display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem", flexWrap:"wrap" },
  fbExact:         { color:GREEN_FG, fontSize:"0.92rem", fontWeight:"bold" },
  fbClose:         { color:COPPER, fontSize:"0.92rem" },
  fbWrong:         { color:RED_FG, fontSize:"0.92rem", fontWeight:"bold" },
  nextBtn:         { background:PANEL2, color:COPPER, border:`1px solid ${COPPER_DIM}88`, borderRadius:4, padding:"0.4rem 0.8rem", cursor:"pointer", fontSize:"0.85rem", fontFamily:"inherit" },

  // results
  resultsWrap:    { display:"flex", flexDirection:"column", alignItems:"center", gap:"0.75rem", paddingTop:"1rem" },
  resultsBig:     { fontSize:"4rem", color:COPPER, fontWeight:"bold", lineHeight:1 },
  resultsLabel:   { fontSize:"0.8rem", color:INK_LIGHT, letterSpacing:"0.1em", textAlign:"center" },
  resultsVerdict: { fontSize:"1rem", letterSpacing:"0.15em", fontWeight:"bold" },
  resultsSub:     { fontSize:"0.85rem", color:INK_MID },
  missedList:     { width:"100%", maxWidth:500, background:PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:5, padding:"0.75rem", maxHeight:220, overflowY:"auto" },
  missedTitle:    { fontSize:"0.65rem", color:COPPER_DIM, letterSpacing:"0.15em", marginBottom:"0.4rem" },
  missedItem:     { display:"flex", justifyContent:"space-between", padding:"0.25rem 0", borderBottom:`1px solid ${PARCHMENT_DARK}`, fontSize:"0.85rem", gap:"0.5rem" },
  missedSw:       { color:COPPER, fontStyle:"italic", textAlign:"right" },
  missedEn:       { color:INK_MID },
  resultsBtns:    { display:"flex", flexWrap:"wrap", gap:"0.5rem", justifyContent:"center", marginTop:"0.5rem" },
  retryBtn:       { background:PANEL2, border:`1px solid ${PARCHMENT_DARK}`, color:INK_MID, borderRadius:5, padding:"0.6rem 1rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem" },
  homeBtn:        { background:"none", border:`1px solid ${PARCHMENT_DARK}`, color:INK_LIGHT, borderRadius:5, padding:"0.6rem 1rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem" },
  advanceBtn:     { background:COPPER, color:PARCHMENT, border:"none", borderRadius:5, padding:"0.6rem 1rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem", fontWeight:"bold" },

  // test direction picker
  testDirWrap:  { background:PANEL, border:`2px solid ${COPPER}`, borderRadius:8, padding:"1.5rem", maxWidth:420, margin:"0 auto", textAlign:"center" },
  testDirTitle: { fontSize:"1rem", color:COPPER, fontWeight:"bold", letterSpacing:"0.1em", marginBottom:"0.4rem" },
  testDirSub:   { fontSize:"0.8rem", color:INK_MID, marginBottom:"1.25rem", lineHeight:1.5 },
  testDirBtns:  { display:"flex", gap:"0.75rem" },
  testDirBtn:   { flex:1, background:PANEL2, border:`1px solid ${COPPER_DIM}55`, color:COPPER, borderRadius:5, padding:"0.75rem 0.5rem", cursor:"pointer", fontSize:"0.82rem", fontFamily:"inherit", lineHeight:1.5 },
  testDirBtnAlt:{ flex:1, background:COPPER, color:PARCHMENT, border:"none", borderRadius:5, padding:"0.75rem 0.5rem", cursor:"pointer", fontSize:"0.82rem", fontFamily:"inherit", fontWeight:"bold", lineHeight:1.5 },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PRIOR_SALT = 6; // cards pulled from previous sessions for the test

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SessionVocab({ user, onBack }) {
  const [sessions, setSessions]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showImport, setShowImport]   = useState(false);
  const [importText, setImportText]   = useState("");
  const [importError, setImportError] = useState("");
  const [importing, setImporting]     = useState(false);

  // drill state
  const [view, setView]               = useState("list"); // list | flashcard | written | testDir | test | results
  const [activeSession, setActiveSession] = useState(null);
  const [direction, setDirection]     = useState("sw-en"); // "sw-en" or "en-sw"
  const [testDir, setTestDir]         = useState("en-sw");
  const [queue, setQueue]             = useState([]);
  const [cardIdx, setCardIdx]         = useState(0);
  const [flipped, setFlipped]         = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedback, setFeedback]       = useState(null);
  const [sessionScore, setSessionScore] = useState({ correct:0, total:0 });
  const [missedCards, setMissedCards] = useState([]);
  const [round, setRound]             = useState(1);
  const [drillStage, setDrillStage]   = useState(""); // "flashcard" | "written" | "test"

  const inputRef = useRef(null);

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  async function loadSessions() {
    setLoading(true);
    try {
      const data = await fetchSessions(user.id);
      setSessions(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  // ── IMPORT ─────────────────────────────────────────────────────────────────

  async function handleImport() {
    setImportError("");
    try {
      const { sessionDate, sessionLabel, cards } = parseBulkImport(importText);
      setImporting(true);
      await insertSession(user.id, sessionDate, sessionLabel, cards);
      await loadSessions();
      setImportText("");
      setShowImport(false);
    } catch (e) {
      setImportError(e.message);
    }
    setImporting(false);
  }

  async function handleDelete(sessionId) {
    if (!window.confirm("Delete this session and all its cards?")) return;
    await deleteSession(sessionId);
    setSessions(s => s.filter(x => x.id !== sessionId));
  }

  // ── DRILL HELPERS ──────────────────────────────────────────────────────────

  function getPromptAnswer(card, dir) {
    return dir === "sw-en"
      ? { prompt: card.sw, answer: card.en, promptLabel: "SWAHILI", answerLabel: "ENGLISH" }
      : { prompt: card.en, answer: card.sw, promptLabel: "ENGLISH", answerLabel: "SWAHILI" };
  }

  function resetDrillState() {
    setCardIdx(0); setFlipped(false); setTypedAnswer(""); setFeedback(null);
    setSessionScore({ correct:0, total:0 }); setMissedCards([]); setRound(1);
  }

  function startFlashcard(session, dir) {
    setActiveSession(session);
    setDirection(dir);
    setDrillStage("flashcard");
    setQueue(shuffle(session.cards));
    resetDrillState();
    setView("flashcard");
  }

  function startWritten(session, dir) {
    setActiveSession(session);
    setDirection(dir);
    setDrillStage("written");
    setQueue(shuffle(session.cards));
    resetDrillState();
    setView("written");
  }

  function startTestDir(session) {
    setActiveSession(session);
    setView("testDir");
  }

  function startTest(session, dir) {
    setTestDir(dir);
    // Current session cards + salt from prior sessions
    const currentCards = shuffle(session.cards);
    const priorCards = sessions
      .filter(s => s.id !== session.id)
      .flatMap(s => s.cards);
    const salt = shuffle(priorCards).slice(0, PRIOR_SALT);
    const allCards = shuffle([...currentCards, ...salt]);
    setActiveSession(session);
    setDirection(dir);
    setDrillStage("test");
    setQueue(allCards);
    resetDrillState();
    setView("test");
  }

  // ── FLASHCARD NAV ──────────────────────────────────────────────────────────

  function fcNext(correct) {
    const newScore = { correct: sessionScore.correct + (correct?1:0), total: sessionScore.total+1 };
    const currentCard = queue[cardIdx];
    const newQueue = correct ? queue : [...queue, currentCard];
    const isLast = cardIdx+1 >= queue.length && correct;
    if (isLast) {
      setSessionScore(newScore);
      setView("results");
    } else {
      if (!correct) setQueue(newQueue);
      setCardIdx(c => c+1);
      setFlipped(false);
      setSessionScore(newScore);
    }
  }

  // ── WRITTEN NAV ────────────────────────────────────────────────────────────

  function submitWritten() {
    if (!typedAnswer.trim()) return;
    const { answer } = getPromptAnswer(queue[cardIdx], direction);
    setFeedback(isCloseEnough(typedAnswer, answer));
  }

  function writtenNext(correct) {
    const newScore = { correct: sessionScore.correct + (correct?1:0), total: sessionScore.total+1 };
    const currentCard = queue[cardIdx];
    const newMissed = correct ? missedCards : [...missedCards, currentCard];
    const newQueue = correct ? queue : [...queue, currentCard];
    const isLast = cardIdx+1 >= queue.length && correct;
    if (isLast) {
      setSessionScore(newScore); setMissedCards(newMissed); setView("results");
    } else {
      if (!correct) { setQueue(newQueue); setRound(r => r+1); }
      setCardIdx(c => c+1);
      setTypedAnswer(""); setFeedback(null);
      if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
      setSessionScore(newScore); setMissedCards(newMissed);
    }
  }

  // ── TEST NAV (single pass) ─────────────────────────────────────────────────

  function submitTest() {
    if (!typedAnswer.trim()) return;
    const { answer } = getPromptAnswer(queue[cardIdx], testDir);
    setFeedback(isCloseEnough(typedAnswer, answer));
  }

  function testNext(correct) {
    const newScore = { correct: sessionScore.correct + (correct?1:0), total: sessionScore.total+1 };
    const newMissed = correct ? missedCards : [...missedCards, queue[cardIdx]];
    const isLast = cardIdx+1 >= queue.length;
    if (isLast) {
      setSessionScore(newScore); setMissedCards(newMissed); setView("results");
    } else {
      setCardIdx(c => c+1);
      setTypedAnswer(""); setFeedback(null);
      if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
      setSessionScore(newScore); setMissedCards(newMissed);
    }
  }

  // ─── RENDER: LIST ──────────────────────────────────────────────────────────

  if (view === "list") return (
    <div style={S.root}>
      <div style={S.subHeader}>
        <button style={S.backBtn} onClick={onBack}>← Grammar</button>
        <div style={S.subTitle}>Session Vocab Track</div>
      </div>

      {/* Import box */}
      <div style={S.importBox}>
        <div style={S.importToggle} onClick={() => { setShowImport(v=>!v); setImportError(""); }}>
          <span style={S.importTitle}>+ Import Session Cards</span>
          <span style={{ color:COPPER_DIM, fontSize:"0.8rem" }}>{showImport ? "▲" : "▼"}</span>
        </div>

        {showImport && (
          <>
            <div style={S.importHint}>
              Paste the block Claude generates at the end of each transcript analysis. Format:
            </div>
            <div style={S.importFormat}>
              SESSION: 2026-03-27 | Umeme na Teknolojia{"\n"}
              Kazi yangu ni nyingi sana. | My work is very busy. | vocab fix{"\n"}
              Vitu vyote vilisimama. | Everything stopped. | concord + tense
            </div>
            <textarea
              style={S.textarea}
              rows={8}
              value={importText}
              onChange={e => { setImportText(e.target.value); setImportError(""); }}
              placeholder="Paste session block here..."
              autoCorrect="off" spellCheck="false"
            />
            {importError && <div style={S.errorMsg}>⚠ {importError}</div>}
            <div style={S.importBtns}>
              <button style={S.importBtn} onClick={handleImport} disabled={importing}>
                {importing ? "Importing..." : "Import Cards"}
              </button>
              <button style={S.cancelBtn} onClick={() => { setShowImport(false); setImportError(""); setImportText(""); }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Session list */}
      <div style={S.sectionLabel}>Your Sessions</div>

      {loading && <div style={S.emptyState}>Loading sessions...</div>}

      {!loading && sessions.length === 0 && (
        <div style={S.emptyState}>
          No sessions yet.<br/>
          Import your first batch above.<br/>
          <span style={{ fontSize:"0.75rem", color:COPPER_DIM }}>After each tutor lesson, Claude will generate the import block for you.</span>
        </div>
      )}

      {!loading && (
        <div style={S.sessionList}>
          {sessions.map(session => (
            <div key={session.id} style={S.sessionCard}>
              <div style={S.sessionTop}>
                <div>
                  <div style={S.sessionDate}>{session.session_date}</div>
                  <div style={S.sessionLabel}>{session.session_label}</div>
                  <div style={S.sessionMeta}>{session.cards.length} cards</div>
                </div>
                <div style={S.sessionRight}>
                  <span style={S.cardCount}>{session.cards.length} ✦</span>
                  <button style={S.deleteBtn} onClick={() => handleDelete(session.id)}>✕ delete</button>
                </div>
              </div>

              <div style={S.drillBtns}>
                <button style={S.drillBtn} onClick={() => startFlashcard(session, "sw-en")}>
                  ◈ SW→EN
                </button>
                <button style={S.drillBtn} onClick={() => startFlashcard(session, "en-sw")}>
                  ◈ EN→SW
                </button>
                <button style={S.drillBtn} onClick={() => startWritten(session, "sw-en")}>
                  ✍ SW→EN
                </button>
                <button style={{...S.drillBtn, ...S.drillBtnPri}} onClick={() => startWritten(session, "en-sw")}>
                  ✍ EN→SW
                </button>
                <button style={{...S.drillBtn, background:"#fef8ee", border:`1px solid ${COPPER}`, color:COPPER}} onClick={() => startTestDir(session)}>
                  ⚔ Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── RENDER: TEST DIRECTION PICKER ────────────────────────────────────────

  if (view === "testDir") return (
    <div style={S.root}>
      <div style={S.subHeader}>
        <button style={S.backBtn} onClick={() => setView("list")}>← Back</button>
      </div>
      <div style={{ paddingTop:"2rem" }}>
        <div style={S.testDirWrap}>
          <div style={S.testDirTitle}>⚔ CHOOSE TEST DIRECTION</div>
          <div style={S.testDirSub}>
            {activeSession?.session_label}<br/>
            <span style={{ color:INK_LIGHT, fontSize:"0.72rem" }}>
              {activeSession?.cards.length} cards + up to {PRIOR_SALT} from prior sessions
            </span>
          </div>
          <div style={S.testDirBtns}>
            <button style={S.testDirBtn} onClick={() => startTest(activeSession, "sw-en")}>
              SW → EN<br/>
              <span style={{ fontSize:"0.68rem", opacity:0.7 }}>Recognition</span>
            </button>
            <button style={S.testDirBtnAlt} onClick={() => startTest(activeSession, "en-sw")}>
              EN → SW<br/>
              <span style={{ fontSize:"0.68rem", opacity:0.85 }}>Production (harder)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── RENDER: FLASHCARD ────────────────────────────────────────────────────

  if (view === "flashcard") {
    const card = queue[cardIdx];
    const { prompt, answer, promptLabel, answerLabel } = getPromptAnswer(card, direction);
    const pct = Math.round((cardIdx / queue.length) * 100);

    return (
      <div style={S.root}>
        <div style={S.drillHeader}>
          <button style={S.backBtn} onClick={() => setView("list")}>✕</button>
          <div style={S.drillMeta}>
            <span style={S.drillStage}>◈ Flashcard</span>
            <span style={S.drillCount}>{cardIdx+1} / {queue.length}</span>
          </div>
          <div style={S.drillScore}>{sessionScore.correct}/{sessionScore.total}</div>
        </div>
        <div style={S.progressBar}><div style={{...S.progressFill, width:`${pct}%`}}/></div>

        {/* Direction toggle */}
        <div style={S.dirRow}>
          <button style={{...S.dirBtn, ...(direction==="sw-en"?S.dirBtnActive:{})}} onClick={() => setDirection("sw-en")}>SW → EN</button>
          <button style={{...S.dirBtn, ...(direction==="en-sw"?S.dirBtnActive:{})}} onClick={() => setDirection("en-sw")}>EN → SW</button>
        </div>

        <div style={S.drillBody}>
          <div style={S.cardWrap} onClick={() => setFlipped(f => !f)}>
            <div style={S.cardPromptLabel}>{promptLabel}</div>
            <div style={S.cardPrompt}>{prompt}</div>
            {card.tag && <div style={S.cardTag}>{card.tag}</div>}
            {!flipped && <div style={S.cardTap}>tap to reveal</div>}
            {flipped && (
              <>
                <div style={S.divider}/>
                <div style={S.cardAnswerLabel}>{answerLabel}</div>
                <div style={S.cardAnswer}>{answer}</div>
              </>
            )}
          </div>
          {flipped && (
            <div style={S.fcButtons}>
              <button style={{...S.fcBtn, ...S.fcWrong}} onClick={() => fcNext(false)}>✕ Didn't know</button>
              <button style={{...S.fcBtn, ...S.fcRight}} onClick={() => fcNext(true)}>✓ Knew it</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER: WRITTEN ──────────────────────────────────────────────────────

  if (view === "written") {
    const card = queue[cardIdx];
    const { prompt, answer, promptLabel } = getPromptAnswer(card, direction);
    const pct = Math.round((cardIdx / queue.length) * 100);

    return (
      <div style={S.root}>
        <div style={S.drillHeader}>
          <button style={S.backBtn} onClick={() => setView("list")}>✕</button>
          <div style={S.drillMeta}>
            <span style={S.drillStage}>✍ Written</span>
            <span style={S.drillCount}>{cardIdx+1} / {queue.length}</span>
            {round > 1 && <span style={{ fontSize:"0.65rem", color:COPPER, background:"#fef3dc", padding:"1px 6px", borderRadius:3, border:`1px solid ${COPPER_DIM}55` }}>PASS {round}</span>}
          </div>
          <div style={S.drillScore}>{sessionScore.correct}/{sessionScore.total}</div>
        </div>
        <div style={S.progressBar}><div style={{...S.progressFill, width:`${pct}%`}}/></div>

        {/* Direction toggle */}
        <div style={S.dirRow}>
          <button style={{...S.dirBtn, ...(direction==="sw-en"?S.dirBtnActive:{})}} onClick={() => { setDirection("sw-en"); setTypedAnswer(""); setFeedback(null); }}>SW → EN</button>
          <button style={{...S.dirBtn, ...(direction==="en-sw"?S.dirBtnActive:{})}} onClick={() => { setDirection("en-sw"); setTypedAnswer(""); setFeedback(null); }}>EN → SW</button>
        </div>

        <div style={S.drillBody}>
          <div style={S.cardWrap}>
            <div style={S.cardPromptLabel}>{promptLabel}</div>
            <div style={S.cardPrompt}>{prompt}</div>
            {card.tag && <div style={S.cardTag}>{card.tag}</div>}
          </div>
          <div style={S.writtenArea}>
            <input
              ref={inputRef}
              autoComplete="off" autoCorrect="off" spellCheck="false"
              placeholder="Type your answer..."
              style={{...S.writtenInput, ...(feedback==="wrong"?S.inputWrong:feedback?S.inputRight:{})}}
              value={typedAnswer}
              onChange={e => { setTypedAnswer(e.target.value); setFeedback(null); }}
              onKeyDown={e => { if (e.key==="Enter" && !feedback) submitWritten(); }}
            />
            {!feedback && <button style={S.submitBtn} onClick={submitWritten}>Submit</button>}
            {feedback && (
              <div style={S.writtenFeedback}>
                {feedback==="exact" && <span style={S.fbExact}>✓ Exact</span>}
                {feedback==="close" && <span style={S.fbClose}>≈ Close — check: <em>{answer}</em></span>}
                {feedback==="wrong" && <span style={S.fbWrong}>✗ Correct: <em>{answer}</em></span>}
                <button style={S.nextBtn} onClick={() => writtenNext(feedback !== "wrong")}>Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: TEST (single pass) ───────────────────────────────────────────

  if (view === "test") {
    const card = queue[cardIdx];
    const { prompt, answer, promptLabel } = getPromptAnswer(card, testDir);
    const pct = Math.round((cardIdx / queue.length) * 100);

    return (
      <div style={S.root}>
        <div style={S.drillHeader}>
          <button style={S.backBtn} onClick={() => setView("list")}>✕</button>
          <div style={S.drillMeta}>
            <span style={S.drillStage}>⚔ Test</span>
            <span style={S.drillCount}>{cardIdx+1} / {queue.length}</span>
            <span style={{ fontSize:"0.65rem", color:COPPER, background:"#fef3dc", padding:"1px 6px", borderRadius:3, border:`1px solid ${COPPER_DIM}55` }}>SINGLE PASS</span>
          </div>
          <div style={S.drillScore}>{sessionScore.correct}/{sessionScore.total}</div>
        </div>
        <div style={S.progressBar}><div style={{...S.progressFill, width:`${pct}%`}}/></div>

        <div style={S.drillBody}>
          <div style={{...S.cardWrap, border:`1px solid ${COPPER}55`}}>
            <div style={S.cardPromptLabel}>{promptLabel}</div>
            <div style={S.cardPrompt}>{prompt}</div>
            {card.tag && <div style={S.cardTag}>{card.tag}</div>}
          </div>
          <div style={S.writtenArea}>
            <input
              ref={inputRef}
              autoComplete="off" autoCorrect="off" spellCheck="false"
              placeholder="Type your answer..."
              style={{...S.writtenInput, ...(feedback==="wrong"?S.inputWrong:feedback?S.inputRight:{})}}
              value={typedAnswer}
              onChange={e => { setTypedAnswer(e.target.value); setFeedback(null); }}
              onKeyDown={e => { if (e.key==="Enter" && !feedback) submitTest(); }}
            />
            {!feedback && <button style={S.submitBtn} onClick={submitTest}>Submit</button>}
            {feedback && (
              <div style={S.writtenFeedback}>
                {feedback==="exact" && <span style={S.fbExact}>✓ Exact</span>}
                {feedback==="close" && <span style={S.fbClose}>≈ Close — check: <em>{answer}</em></span>}
                {feedback==="wrong" && <span style={S.fbWrong}>✗ Correct: <em>{answer}</em></span>}
                <button style={S.nextBtn} onClick={() => testNext(feedback !== "wrong")}>Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: RESULTS ──────────────────────────────────────────────────────

  if (view === "results") {
    const score = sessionScore.total > 0 ? sessionScore.correct / sessionScore.total : 0;
    const isTest = drillStage === "test";
    const passed = !isTest || score >= 0.85;

    return (
      <div style={S.root}>
        <div style={S.resultsWrap}>
          <div style={S.resultsBig}>{Math.round(score * 100)}%</div>
          <div style={S.resultsLabel}>
            {drillStage === "flashcard" ? "Flashcard" : drillStage === "written" ? "Written" : "Test"} — {activeSession?.session_label}
          </div>
          <div style={{...S.resultsVerdict, color: passed ? COPPER : RED_FG}}>
            {drillStage === "flashcard" ? "✓ ROUND COMPLETE"
              : drillStage === "written" ? "✓ 100% CLEAN"
              : passed ? "✓ TEST PASSED" : "✗ TEST FAILED"}
          </div>
          <div style={S.resultsSub}>{sessionScore.correct} correct of {sessionScore.total} attempts</div>

          {missedCards.length > 0 && (
            <div style={S.missedList}>
              <div style={S.missedTitle}>CARDS TO REVIEW</div>
              {missedCards.map((c, i) => (
                <div key={i} style={S.missedItem}>
                  <span style={S.missedEn}>{c.en}</span>
                  <span style={S.missedSw}>{c.sw}</span>
                </div>
              ))}
            </div>
          )}

          <div style={S.resultsBtns}>
            {drillStage === "flashcard" && (
              <button style={S.advanceBtn} onClick={() => startWritten(activeSession, direction)}>
                ✍ Written →
              </button>
            )}
            {drillStage === "written" && (
              <button style={S.advanceBtn} onClick={() => startTestDir(activeSession)}>
                ⚔ Take Test →
              </button>
            )}
            <button style={S.retryBtn} onClick={() => {
              if (drillStage === "flashcard") startFlashcard(activeSession, direction);
              else if (drillStage === "written") startWritten(activeSession, direction);
              else startTestDir(activeSession);
            }}>↺ Retry</button>
            <button style={S.homeBtn} onClick={() => setView("list")}>⌂ Sessions</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
