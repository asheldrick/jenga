import { useState, useEffect, useRef } from "react";
import FRAMES from "./data/frames.js";
import {
  PASS_THRESHOLD, STAGES, STAGE_LABELS, STAGE_ICONS,
  loadProgress, saveProgress,
  shuffle, isCloseEnough, Bold,
  COPPER, COPPER_DIM, COPPER_LIGHT,
  PARCHMENT, PARCHMENT_MID, PARCHMENT_DARK,
  INK, INK_MID, INK_LIGHT,
  PANEL, PANEL2, ROOT_BG,
  GREEN_BG, GREEN_FG, RED_BG, RED_FG,
} from "./utils.jsx";

// ─── STYLES ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    minHeight:"100vh", background: ROOT_BG, color: INK,
    fontFamily:"'Georgia', 'Times New Roman', serif",
    maxWidth:680, margin:"0 auto", padding:"1rem",
    boxSizing:"border-box", fontSize:"16px",
  },
  header: {
    textAlign:"center", padding:"2rem 0 1.5rem",
    borderBottom:`2px solid ${COPPER_DIM}`,
    marginBottom:"1.5rem",
  },
  logo: {
    fontSize:"3rem", fontWeight:"bold", letterSpacing:"0.4em",
    color: COPPER, fontFamily:"'Georgia', serif",
  },
  tagline: {
    fontSize:"0.75rem", letterSpacing:"0.2em", color: INK_LIGHT,
    textTransform:"uppercase", marginTop:"0.25rem",
  },

  // data bar
  dataBar: {
    display:"flex", alignItems:"center", gap:"0.4rem",
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`,
    borderRadius:5, padding:"0.5rem 0.75rem", marginBottom:"0.5rem",
    boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
  },
  dataBarLabel: {
    fontSize:"0.65rem", color: INK_LIGHT, letterSpacing:"0.15em",
    textTransform:"uppercase", marginRight:"0.25rem", flexShrink:0,
  },
  dataBtn: {
    background: PANEL2, border:`1px solid ${PARCHMENT_DARK}`, color: INK_MID,
    borderRadius:4, padding:"0.3rem 0.65rem", cursor:"pointer",
    fontSize:"0.72rem", fontFamily:"inherit", letterSpacing:"0.05em", flexShrink:0,
  },
  dataBtnActive: { background: PARCHMENT_DARK, color: INK, border:`1px solid ${COPPER_DIM}` },
  dataBtnReset: { color: RED_FG, border:`1px solid ${RED_FG}44`, marginLeft:"auto" },
  ioBox: {
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:5,
    padding:"0.75rem", marginBottom:"1rem",
    boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
  },
  ioBoxLabel: { fontSize:"0.75rem", color: INK_LIGHT, marginBottom:"0.5rem", lineHeight:1.5 },
  ioTextarea: {
    width:"100%", boxSizing:"border-box",
    background: PARCHMENT_MID, border:`1px solid ${PARCHMENT_DARK}`,
    color: INK, borderRadius:4, padding:"0.5rem",
    fontSize:"0.72rem", fontFamily:"monospace", resize:"vertical", outline:"none",
  },

  // frame list
  frameList: { display:"flex", flexDirection:"column", gap:"1rem" },
  frameCard: {
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`,
    borderRadius:6, padding:"1rem 1.2rem",
    boxShadow:"0 1px 4px rgba(0,0,0,0.08)",
  },
  frameTop: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"0.75rem" },
  frameNum: { fontSize:"0.65rem", color: COPPER_DIM, letterSpacing:"0.15em", textTransform:"uppercase" },
  frameTitle: { fontSize:"1.2rem", color: INK, fontWeight:"bold", marginTop:"0.1rem" },
  frameSub: { fontSize:"0.82rem", color: INK_LIGHT, marginTop:"0.2rem" },
  frameStatus: { flexShrink:0, marginLeft:"0.5rem" },
  passedBadge: { background: GREEN_BG, color: GREEN_FG, padding:"2px 8px", borderRadius:3, fontSize:"0.65rem", letterSpacing:"0.1em", border:`1px solid ${GREEN_FG}44` },
  inProgressBadge: { background:"#fef3dc", color: COPPER, padding:"2px 8px", borderRadius:3, fontSize:"0.65rem", border:`1px solid ${COPPER_DIM}55` },
  newBadge: { background: PANEL2, color: INK_LIGHT, padding:"2px 8px", borderRadius:3, fontSize:"0.65rem" },
  lockedBadge: { fontSize:"1rem" },

  // stage row
  stageRow: { display:"flex", gap:"0.4rem", flexWrap:"wrap" },
  stageBtnWrap: { flex:"1 1 auto", minWidth:90, display:"flex", flexDirection:"column", alignItems:"stretch", gap:"3px" },
  stageBtn: {
    width:"100%", background: PANEL2, border:`1px solid ${PARCHMENT_DARK}`,
    color: INK_LIGHT, borderRadius:4, padding:"0.4rem 0.3rem",
    cursor:"pointer", fontSize:"0.7rem",
    display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
    transition:"all 0.15s",
  },
  stageDone: { background: GREEN_BG, border:`1px solid ${GREEN_FG}66`, color: GREEN_FG },
  stageCurrent: { border:`1px solid ${COPPER}`, color: COPPER, background:"#fef8ee" },
  stageIcon: { fontSize:"0.9rem" },
  stageLbl: { letterSpacing:"0.05em" },
  stagePct: { fontSize:"0.65rem", opacity:0.8 },
  overrideLabel: { display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", gap:"4px", padding:"2px 0" },
  overrideCheck: { display:"none" },
  overrideTick: { fontSize:"0.7rem", color: COPPER_DIM, letterSpacing:"0.05em", userSelect:"none" },
  footerNote: { textAlign:"center", fontSize:"0.65rem", color: INK_LIGHT, marginTop:"1.5rem", letterSpacing:"0.05em", lineHeight:1.8 },

  // subheader
  subHeader: { display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1rem" },
  backBtn: {
    background:"none", border:`1px solid ${PARCHMENT_DARK}`, color: INK_LIGHT,
    padding:"0.3rem 0.7rem", borderRadius:4, cursor:"pointer", fontSize:"0.8rem", flexShrink:0,
  },
  subTitle: { color: INK_MID, fontSize:"0.85rem" },

  // explain
  explainBox: {
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:6,
    padding:"1.2rem 1.4rem", marginBottom:"1rem",
    boxShadow:"0 1px 4px rgba(0,0,0,0.07)",
  },
  explainHeading: { fontSize:"1.3rem", color: COPPER, marginBottom:"0.2rem" },
  explainSub: { fontSize:"0.8rem", color: INK_LIGHT, marginBottom:"0.8rem" },
  explainBody: { fontSize:"0.9rem", lineHeight:1.75, color: INK_MID },
  explainMeta: { textAlign:"center", fontSize:"0.72rem", color: INK_LIGHT, marginBottom:"0.75rem", letterSpacing:"0.1em" },
  startBtn: {
    width:"100%", background: COPPER, color: PARCHMENT,
    border:"none", borderRadius:5, padding:"0.85rem",
    fontSize:"1rem", fontWeight:"bold", cursor:"pointer",
    letterSpacing:"0.1em", fontFamily:"inherit",
  },

  // drill header
  drillHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" },
  drillMeta: { display:"flex", alignItems:"center", gap:"0.6rem" },
  drillStage: { fontSize:"0.75rem", color: COPPER, letterSpacing:"0.1em" },
  drillCount: { fontSize:"0.75rem", color: INK_LIGHT },
  remedBadge: { background:"#fef3dc", color: COPPER, padding:"1px 6px", borderRadius:3, fontSize:"0.6rem", border:`1px solid ${COPPER_DIM}55` },
  drillScore: { fontSize:"0.85rem", color: INK_MID },
  progressBar: { height:3, background: PARCHMENT_DARK, borderRadius:2, marginBottom:"1rem" },
  progressFill: { height:"100%", background: COPPER, borderRadius:2, transition:"width 0.3s" },
  drillBody: { display:"flex", flexDirection:"column", gap:"1rem" },

  // card
  cardWrap: {
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`, borderRadius:8,
    padding:"1.5rem 1.4rem", cursor:"pointer", minHeight:130,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    boxShadow:"0 2px 6px rgba(0,0,0,0.08)",
  },
  cardPromptLabel: { fontSize:"0.65rem", letterSpacing:"0.2em", color: INK_LIGHT, marginBottom:"0.5rem" },
  cardPrompt: { fontSize:"1.3rem", textAlign:"center", color: INK, lineHeight:1.4 },
  cardTap: { fontSize:"0.72rem", color: INK_LIGHT, marginTop:"1rem", letterSpacing:"0.1em" },
  divider: { width:"40%", height:1, background: PARCHMENT_DARK, margin:"0.8rem 0" },
  cardAnswerLabel: { fontSize:"0.65rem", letterSpacing:"0.2em", color: COPPER, marginBottom:"0.4rem" },
  cardAnswer: { fontSize:"1.35rem", color: COPPER, textAlign:"center", fontStyle:"italic" },

  // flashcard buttons
  fcButtons: { display:"flex", gap:"0.75rem" },
  fcBtn: { flex:1, padding:"0.75rem", borderRadius:5, border:"none", fontSize:"0.95rem", cursor:"pointer", fontFamily:"inherit", fontWeight:"bold" },
  fcWrong: { background: RED_BG, color: RED_FG, border:`1px solid ${RED_FG}33` },
  fcRight: { background: GREEN_BG, color: GREEN_FG, border:`1px solid ${GREEN_FG}33` },

  // multiple choice
  choiceGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.5rem" },
  choiceBtn: {
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`,
    color: INK_MID, borderRadius:5, padding:"0.8rem 0.6rem",
    cursor:"pointer", fontSize:"0.95rem", textAlign:"center",
    fontFamily:"inherit", transition:"all 0.15s",
    boxShadow:"0 1px 3px rgba(0,0,0,0.06)",
  },
  choiceCorrect: { background: GREEN_BG, border:`1px solid ${GREEN_FG}77`, color: GREEN_FG },
  choiceWrong:   { background: RED_BG,   border:`1px solid ${RED_FG}77`,   color: RED_FG   },
  choiceReveal:  { background: GREEN_BG, border:`1px solid ${GREEN_FG}44`, color: GREEN_FG, opacity:0.7 },

  // written
  writtenArea: { display:"flex", flexDirection:"column", gap:"0.6rem" },
  writtenInput: {
    background: PANEL, border:`1px solid ${PARCHMENT_DARK}`,
    color: INK, borderRadius:5, padding:"0.85rem 1rem",
    fontSize:"1.1rem", fontFamily:"inherit", outline:"none",
    width:"100%", boxSizing:"border-box",
    boxShadow:"inset 0 1px 3px rgba(0,0,0,0.06)",
  },
  inputWrong: { border:`1px solid ${RED_FG}88`, background: RED_BG },
  inputRight: { border:`1px solid ${GREEN_FG}88`, background: GREEN_BG },
  submitBtn: {
    background: COPPER, color: PARCHMENT, border:"none", borderRadius:5,
    padding:"0.75rem", fontSize:"1rem", cursor:"pointer",
    fontWeight:"bold", fontFamily:"inherit",
  },
  writtenFeedback: { display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem", flexWrap:"wrap" },
  fbExact: { color: GREEN_FG, fontSize:"0.92rem", fontWeight:"bold" },
  fbClose: { color: COPPER,   fontSize:"0.92rem" },
  fbWrong: { color: RED_FG,   fontSize:"0.92rem", fontWeight:"bold" },
  nextBtn: {
    background: PANEL2, color: COPPER, border:`1px solid ${COPPER_DIM}88`,
    borderRadius:4, padding:"0.4rem 0.8rem", cursor:"pointer",
    fontSize:"0.85rem", fontFamily:"inherit",
  },

  // results
  resultsWrap: { display:"flex", flexDirection:"column", alignItems:"center", gap:"0.75rem", paddingTop:"1rem" },
  resultsBig: { fontSize:"4rem", color: COPPER, fontWeight:"bold", lineHeight:1 },
  resultsLabel: { fontSize:"0.8rem", color: INK_LIGHT, letterSpacing:"0.1em", textAlign:"center" },
  resultsVerdict: { fontSize:"1rem", letterSpacing:"0.15em", fontWeight:"bold" },
  resultsSub: { fontSize:"0.85rem", color: INK_MID },
  resultsAdvice: {
    background: RED_BG, border:`1px solid ${RED_FG}33`, borderRadius:5,
    padding:"0.6rem 0.8rem", fontSize:"0.78rem", color: RED_FG,
    textAlign:"center", maxWidth:400,
  },
  missedList: {
    width:"100%", maxWidth:500, background: PANEL,
    border:`1px solid ${PARCHMENT_DARK}`, borderRadius:5,
    padding:"0.75rem", maxHeight:220, overflowY:"auto",
  },
  missedTitle: { fontSize:"0.65rem", color: COPPER_DIM, letterSpacing:"0.15em", marginBottom:"0.4rem" },
  missedItem: { display:"flex", justifyContent:"space-between", padding:"0.25rem 0", borderBottom:`1px solid ${PARCHMENT_DARK}`, fontSize:"0.85rem" },
  missedEn: { color: INK_MID },
  missedSw: { color: COPPER, fontStyle:"italic" },
  resultsBtns: { display:"flex", flexWrap:"wrap", gap:"0.5rem", justifyContent:"center", marginTop:"0.5rem" },
  retryBtn: { background: PANEL2, border:`1px solid ${PARCHMENT_DARK}`, color: INK_MID, borderRadius:5, padding:"0.6rem 1rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem" },
  advanceBtn: { background: COPPER, color: PARCHMENT, border:"none", borderRadius:5, padding:"0.6rem 1rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem", fontWeight:"bold" },
  homeBtn: { background:"none", border:`1px solid ${PARCHMENT_DARK}`, color: INK_LIGHT, borderRadius:5, padding:"0.6rem 1rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.85rem" },
};

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [progress, setProgress]           = useState(loadProgress);
  const [view, setView]                   = useState("home");
  const [activeFrame, setActiveFrame]     = useState(null);
  const [activeStage, setActiveStage]     = useState(0);
  const [queue, setQueue]                 = useState([]);
  const [cardIdx, setCardIdx]             = useState(0);
  const [flipped, setFlipped]             = useState(false);
  const [choices, setChoices]             = useState([]);
  const [selected, setSelected]           = useState(null);
  const [typedAnswer, setTypedAnswer]     = useState("");
  const [feedback, setFeedback]           = useState(null);
  const [sessionScore, setSessionScore]   = useState({correct:0, total:0});
  const [missedCards, setMissedCards]     = useState([]);
  const [round, setRound]                 = useState(1);
  const [showExportBox, setShowExportBox] = useState(false);
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText]       = useState("");
  const inputRef = useRef(null);

  useEffect(() => { saveProgress(progress); }, [progress]);

  // ── progress helpers ──────────────────────────────────────────────────────

  function getFrameProgress(frameId) {
    return progress[frameId] || { highestStage:-1, stageScores:{}, passed:false };
  }

  function markStageComplete(frameId, stage, score) {
    setProgress(prev => {
      const fp = prev[frameId] || { highestStage:-1, stageScores:{}, passed:false };
      const stageScores = { ...fp.stageScores, [stage]: score };
      const passed = stage === 3 ? score >= PASS_THRESHOLD : fp.passed;
      return { ...prev, [frameId]: { highestStage: Math.max(fp.highestStage, stage), stageScores, passed: fp.passed || passed } };
    });
  }

  function manualMarkStage(frameId, stageIdx) {
    setProgress(prev => {
      const fp = prev[frameId] || { highestStage:-1, stageScores:{}, passed:false };
      const stageScores = { ...fp.stageScores };
      for (let i = 0; i <= stageIdx; i++) if (stageScores[i] === undefined) stageScores[i] = 1.0;
      const passed = stageIdx === 3 || fp.passed;
      return { ...prev, [frameId]: { highestStage: Math.max(fp.highestStage, stageIdx), stageScores, passed } };
    });
  }

  function manualUnmarkStage(frameId, stageIdx) {
    setProgress(prev => {
      const fp = prev[frameId] || { highestStage:-1, stageScores:{}, passed:false };
      const stageScores = { ...fp.stageScores };
      for (let i = stageIdx; i <= 3; i++) delete stageScores[i];
      const highestStage = Object.keys(stageScores).length > 0 ? Math.max(...Object.keys(stageScores).map(Number)) : -1;
      return { ...prev, [frameId]: { highestStage, stageScores, passed: false } };
    });
  }

  // ── export / import ───────────────────────────────────────────────────────

  function toggleExport() { setShowExportBox(v => !v); setShowImportBox(false); }
  function toggleImport() { setShowImportBox(v => !v); setShowExportBox(false); setImportText(""); }

  function confirmImport() {
    try {
      const parsed = JSON.parse(importText);
      setProgress(parsed);
      setShowImportBox(false);
      setImportText("");
    } catch { alert("Invalid data. Paste the complete exported text."); }
  }

  // ── drill helpers ─────────────────────────────────────────────────────────

  function makeChoices(card, allCards) {
    const pool = allCards.filter(c => c.sw !== card.sw);
    return shuffle([card.sw, ...shuffle(pool).slice(0,3).map(c => c.sw)]);
  }

  function startStage(frame, stageIdx) {
    setActiveFrame(frame);
    setActiveStage(stageIdx);
    const cards = shuffle(frame.cards);
    setQueue(cards);
    setCardIdx(0);
    setFlipped(false); setSelected(null); setTypedAnswer(""); setFeedback(null);
    setSessionScore({correct:0, total:0});
    setMissedCards([]);
    setRound(1);
    if (stageIdx === 1) setChoices(makeChoices(cards[0], frame.cards));
    setView("drill");
  }

  // ── advance card ──────────────────────────────────────────────────────────
  // Stages 0-2: missed cards appended until queue clears perfectly
  // Stage 3 (test): single pass, 85% gate

  function nextCard(correct) {
    const newScore = { correct: sessionScore.correct + (correct?1:0), total: sessionScore.total+1 };
    const currentCard = queue[cardIdx];
    const isLast = cardIdx + 1 >= queue.length;

    if (activeStage === 3) {
      if (isLast) {
        markStageComplete(activeFrame.id, 3, newScore.correct / newScore.total);
        setSessionScore(newScore);
        setMissedCards(correct ? missedCards : [...missedCards, currentCard]);
        setView("results");
      } else {
        setCardIdx(c => c+1);
        setFlipped(false); setSelected(null); setTypedAnswer(""); setFeedback(null);
        if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
        setSessionScore(newScore);
        setMissedCards(correct ? missedCards : [...missedCards, currentCard]);
      }
      return;
    }

    // Training mode — append missed card to end
    const newQueue = correct ? queue : [...queue, currentCard];

    if (isLast && correct) {
      markStageComplete(activeFrame.id, activeStage, newScore.correct / newScore.total);
      setSessionScore(newScore);
      setMissedCards([]);
      setView("results");
    } else {
      const next = cardIdx + 1;
      if (!correct) { setQueue(newQueue); setRound(r => r+1); }
      setCardIdx(next);
      setFlipped(false); setSelected(null); setTypedAnswer(""); setFeedback(null);
      if (activeStage === 1) setChoices(makeChoices(newQueue[next], activeFrame.cards));
      if (activeStage >= 2 && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
      setSessionScore(newScore);
    }
  }

  function submitWritten() {
    if (!typedAnswer.trim()) return;
    setFeedback(isCloseEnough(typedAnswer, queue[cardIdx].sw));
  }

  // ─── HOME ─────────────────────────────────────────────────────────────────

  if (view === "home") return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.logo}>JENGA</div>
        <div style={S.tagline}>Swahili Grammar Drill System</div>
      </div>

      {/* Data bar */}
      <div style={S.dataBar}>
        <span style={S.dataBarLabel}>Progress</span>
        <button style={{...S.dataBtn, ...(showExportBox ? S.dataBtnActive : {})}} onClick={toggleExport}>
          {showExportBox ? "▲ Hide" : "⬇ Export"}
        </button>
        <button style={{...S.dataBtn, ...(showImportBox ? S.dataBtnActive : {})}} onClick={toggleImport}>
          {showImportBox ? "▲ Hide" : "⬆ Import"}
        </button>
        <button style={{...S.dataBtn, ...S.dataBtnReset}}
          onClick={() => { if (window.confirm("Reset ALL progress? Cannot be undone.")) { setProgress({}); setShowExportBox(false); setShowImportBox(false); }}}>
          ✕ Reset
        </button>
      </div>

      {showExportBox && (
        <div style={S.ioBox}>
          <div style={S.ioBoxLabel}>Select all and copy. Save in Notes or a text file. Paste back via Import next session.</div>
          <textarea readOnly style={S.ioTextarea} rows={5}
            value={JSON.stringify(progress, null, 2)}
            onFocus={e => e.target.select()} onClick={e => e.target.select()} />
        </div>
      )}

      {showImportBox && (
        <div style={S.ioBox}>
          <div style={S.ioBoxLabel}>Paste your saved progress text below, then confirm.</div>
          <textarea style={S.ioTextarea} rows={5}
            value={importText} onChange={e => setImportText(e.target.value)}
            placeholder="Paste exported JSON here..." />
          <div style={{display:"flex", gap:"0.5rem", marginTop:"0.5rem"}}>
            <button style={{...S.startBtn, padding:"0.55rem"}} onClick={confirmImport}>Confirm Import</button>
            <button style={{...S.retryBtn}} onClick={() => setShowImportBox(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Frame list */}
      <div style={S.frameList}>
        {FRAMES.map((frame, fi) => {
          const fp = getFrameProgress(frame.id);
          const locked = fi > 0 && !getFrameProgress(FRAMES[fi-1].id).passed;
          return (
            <div key={frame.id} style={{...S.frameCard, opacity: locked ? 0.45 : 1}}>
              <div style={S.frameTop}>
                <div>
                  <div style={S.frameNum}>FRAME {fi+1}</div>
                  <div style={S.frameTitle}>{frame.title}</div>
                  <div style={S.frameSub}>{frame.subtitle}</div>
                </div>
                <div style={S.frameStatus}>
                  {fp.passed && <span style={S.passedBadge}>✓ PASSED</span>}
                  {!fp.passed && fp.highestStage >= 0 && <span style={S.inProgressBadge}>IN PROGRESS</span>}
                  {!fp.passed && fp.highestStage < 0 && !locked && <span style={S.newBadge}>NEW</span>}
                  {locked && <span style={S.lockedBadge}>🔒</span>}
                </div>
              </div>
              <div style={S.stageRow}>
                {STAGES.map((s, si) => {
                  const done = fp.stageScores?.[si] !== undefined;
                  const stageLocked = locked || (si > 0 && fp.stageScores?.[si-1] === undefined);
                  return (
                    <div key={s} style={S.stageBtnWrap}>
                      <button disabled={stageLocked}
                        onClick={() => { setActiveFrame(frame); setActiveStage(si); setView("explain"); }}
                        style={{...S.stageBtn, ...(done ? S.stageDone : {}), ...(!done && !stageLocked ? S.stageCurrent : {})}}>
                        <span style={S.stageIcon}>{STAGE_ICONS[si]}</span>
                        <span style={S.stageLbl}>{STAGE_LABELS[si]}</span>
                        {fp.stageScores?.[si] !== undefined && <span style={S.stagePct}>{Math.round(fp.stageScores[si]*100)}%</span>}
                      </button>
                      <label style={S.overrideLabel} title={done ? "Unmark" : "Mark complete"}>
                        <input type="checkbox" checked={done} style={S.overrideCheck}
                          onChange={() => done ? manualUnmarkStage(frame.id, si) : manualMarkStage(frame.id, si)} />
                        <span style={S.overrideTick}>{done ? "✓" : "○"}</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={S.footerNote}>
        Flashcard · Multiple Choice · Written: missed cards repeat until 100% clean.<br/>
        Test: single pass, 85% to advance. Frames unlock sequentially.<br/>
        <span style={{opacity:0.6}}>Use ✓/○ to manually mark stages. Export progress after each session.</span>
      </div>
    </div>
  );

  // ─── EXPLAIN ──────────────────────────────────────────────────────────────

  if (view === "explain" && activeFrame) return (
    <div style={S.root}>
      <div style={S.subHeader}>
        <button style={S.backBtn} onClick={() => setView("home")}>← Back</button>
        <div style={S.subTitle}>Frame: {activeFrame.title}</div>
      </div>
      <div style={S.explainBox}>
        <div style={S.explainHeading}>{activeFrame.title}</div>
        <div style={S.explainSub}>{activeFrame.subtitle}</div>
        <div style={S.explainBody}>
          {activeFrame.explanation.split("\n").map((line, i) => (
            <p key={i} style={{margin:"0.35rem 0"}}><Bold text={line}/></p>
          ))}
        </div>
      </div>
      <div style={S.explainMeta}>{activeFrame.cards.length} cards · {STAGE_LABELS[activeStage]} stage</div>
      <button style={S.startBtn} onClick={() => startStage(activeFrame, activeStage)}>
        Begin {STAGE_LABELS[activeStage]} →
      </button>
    </div>
  );

  // ─── DRILL ────────────────────────────────────────────────────────────────

  if (view === "drill" && activeFrame) {
    const card = queue[cardIdx];
    const pct  = Math.round((cardIdx / queue.length) * 100);

    return (
      <div style={S.root}>
        <div style={S.drillHeader}>
          <button style={S.backBtn} onClick={() => setView("home")}>✕</button>
          <div style={S.drillMeta}>
            <span style={S.drillStage}>{STAGE_ICONS[activeStage]} {STAGE_LABELS[activeStage]}</span>
            <span style={S.drillCount}>{cardIdx+1} / {queue.length}</span>
            {activeStage < 3 && round > 1 && <span style={S.remedBadge}>PASS {round}</span>}
            {activeStage === 3 && <span style={S.remedBadge}>SINGLE PASS</span>}
          </div>
          <div style={S.drillScore}>{sessionScore.correct}/{sessionScore.total}</div>
        </div>

        <div style={S.progressBar}><div style={{...S.progressFill, width:`${pct}%`}}/></div>

        {/* FLASHCARD */}
        {activeStage === 0 && (
          <div style={S.drillBody}>
            <div style={S.cardWrap} onClick={() => setFlipped(f => !f)}>
              <div style={S.cardPromptLabel}>ENGLISH</div>
              <div style={S.cardPrompt}>{card.en}</div>
              {!flipped && <div style={S.cardTap}>tap to reveal</div>}
              {flipped && <>
                <div style={S.divider}/>
                <div style={S.cardAnswerLabel}>SWAHILI</div>
                <div style={S.cardAnswer}>{card.sw}</div>
              </>}
            </div>
            {flipped && (
              <div style={S.fcButtons}>
                <button style={{...S.fcBtn, ...S.fcWrong}} onClick={() => nextCard(false)}>✕ Didn't know</button>
                <button style={{...S.fcBtn, ...S.fcRight}} onClick={() => nextCard(true)}>✓ Knew it</button>
              </div>
            )}
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {activeStage === 1 && (
          <div style={S.drillBody}>
            <div style={S.cardWrap}>
              <div style={S.cardPromptLabel}>TRANSLATE TO SWAHILI</div>
              <div style={S.cardPrompt}>{card.en}</div>
            </div>
            <div style={S.choiceGrid}>
              {choices.map((c, ci) => {
                const isCorrect = c === card.sw;
                let btn = S.choiceBtn;
                if (selected !== null) {
                  if (c === selected && isCorrect)  btn = {...btn, ...S.choiceCorrect};
                  else if (c === selected)           btn = {...btn, ...S.choiceWrong};
                  else if (isCorrect)                btn = {...btn, ...S.choiceReveal};
                }
                return (
                  <button key={ci} disabled={selected !== null} style={btn}
                    onClick={() => { setSelected(c); setTimeout(() => nextCard(c === card.sw), 900); }}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* WRITTEN / TEST */}
        {(activeStage === 2 || activeStage === 3) && (
          <div style={S.drillBody}>
            <div style={S.cardWrap}>
              <div style={S.cardPromptLabel}>WRITE IN SWAHILI</div>
              <div style={S.cardPrompt}>{card.en}</div>
            </div>
            <div style={S.writtenArea}>
              <input ref={inputRef} autoComplete="off" autoCorrect="off" spellCheck="false"
                placeholder="Type your answer..."
                style={{...S.writtenInput, ...(feedback==="wrong" ? S.inputWrong : feedback ? S.inputRight : {})}}
                value={typedAnswer}
                onChange={e => { setTypedAnswer(e.target.value); setFeedback(null); }}
                onKeyDown={e => { if (e.key==="Enter" && !feedback) submitWritten(); }}
              />
              {!feedback && <button style={S.submitBtn} onClick={submitWritten}>Submit</button>}
              {feedback && (
                <div style={S.writtenFeedback}>
                  {feedback==="exact" && <span style={S.fbExact}>✓ Exact</span>}
                  {feedback==="close" && <span style={S.fbClose}>≈ Close — check: <em>{card.sw}</em></span>}
                  {feedback==="wrong" && <span style={S.fbWrong}>✗ Correct: <em>{card.sw}</em></span>}
                  <button style={S.nextBtn} onClick={() => nextCard(feedback !== "wrong")}>Next →</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULTS ──────────────────────────────────────────────────────────────

  if (view === "results" && activeFrame) {
    const score    = sessionScore.correct / sessionScore.total;
    const passed   = activeStage < 3 ? true : score >= PASS_THRESHOLD;
    const frameIdx = FRAMES.findIndex(f => f.id === activeFrame.id);
    const nextStage = activeStage + 1;
    const nextFrame = FRAMES[frameIdx + 1];

    return (
      <div style={S.root}>
        <div style={S.resultsWrap}>
          <div style={S.resultsBig}>{Math.round(score * 100)}%</div>
          <div style={S.resultsLabel}>{STAGE_LABELS[activeStage]} — {activeFrame.title}</div>
          <div style={{...S.resultsVerdict, color: passed ? COPPER : RED_FG}}>
            {activeStage < 3
              ? "✓ 100% — STAGE COMPLETE"
              : passed ? "✓ TEST PASSED" : "✗ TEST FAILED"}
          </div>
          <div style={S.resultsSub}>
            {sessionScore.correct} correct of {sessionScore.total} attempts
          </div>

          {activeStage === 3 && !passed && (
            <div style={S.resultsAdvice}>Score must reach 85% to advance. Retry this stage.</div>
          )}

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
            <button style={S.retryBtn} onClick={() => startStage(activeFrame, activeStage)}>↺ Retry</button>
            {passed && nextStage < STAGES.length && (
              <button style={S.advanceBtn} onClick={() => { setActiveStage(nextStage); setView("explain"); }}>
                Next: {STAGE_LABELS[nextStage]} →
              </button>
            )}
            {passed && nextStage >= STAGES.length && nextFrame && (
              <button style={S.advanceBtn} onClick={() => { setActiveFrame(nextFrame); setActiveStage(0); setView("explain"); }}>
                Frame {frameIdx+2}: {nextFrame.title} →
              </button>
            )}
            <button style={S.homeBtn} onClick={() => setView("home")}>⌂ Home</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
