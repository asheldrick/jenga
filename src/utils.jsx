// ─── THEME ───────────────────────────────────────────────────────────────────

export const COPPER      = "#9a6f30";
export const COPPER_DIM  = "#b8924a";
export const COPPER_LIGHT= "#c8a96e";
export const PARCHMENT   = "#faf4e8";
export const PARCHMENT_MID = "#f0e6cc";
export const PARCHMENT_DARK= "#e0d0aa";
export const INK         = "#1e1408";
export const INK_MID     = "#4a3418";
export const INK_LIGHT   = "#7a5c30";
export const PANEL       = "#faf4e8";
export const PANEL2      = "#f0e6cc";
export const ROOT_BG     = "#ede0c4";
export const GREEN_BG    = "#d4edda";
export const GREEN_FG    = "#1a5c1a";
export const RED_BG      = "#f4e8e8";
export const RED_FG      = "#8b2020";

// ─── DRILL CONSTANTS ─────────────────────────────────────────────────────────

export const PASS_THRESHOLD = 0.85;
export const STAGES = ["flashcard", "multiChoice", "written", "test"];
export const STAGE_LABELS = ["Flashcard", "Multiple Choice", "Written", "Test"];
export const STAGE_ICONS  = ["◈", "◉", "✍", "⚔"];

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "jenga_progress_v1";

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function saveProgress(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ─── UTILITIES ───────────────────────────────────────────────────────────────

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) =>
    Array.from({length: n+1}, (_, j) => j === 0 ? i : 0)
  );
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

export function isCloseEnough(input, answer) {
  const a = input.trim().toLowerCase().replace(/[.,!?]/g, "");
  const b = answer.trim().toLowerCase().replace(/[.,!?]/g, "");
  if (a === b) return "exact";
  const dist = levenshtein(a, b);
  const threshold = Math.floor(b.length * 0.15);
  if (dist <= Math.max(2, threshold)) return "close";
  return "wrong";
}

// ─── BOLD MARKDOWN ────────────────────────────────────────────────────────────

export function Bold({ text }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1
          ? <strong key={i}>{p}</strong>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}
