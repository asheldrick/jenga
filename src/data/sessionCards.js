// src/data/sessionCards.js
// ─── SESSION VOCAB — SUPABASE HELPERS ────────────────────────────────────────
//
// Run this SQL once in your Supabase SQL editor to create the table:
//
//   create table jenga_sessions (
//     id           uuid primary key default gen_random_uuid(),
//     user_id      uuid references auth.users(id) on delete cascade,
//     session_date text not null,
//     session_label text not null,
//     cards        jsonb not null,
//     created_at   timestamptz default now()
//   );
//
//   alter table jenga_sessions enable row level security;
//
//   create policy "Users manage own sessions"
//     on jenga_sessions for all
//     using (auth.uid() = user_id)
//     with check (auth.uid() = user_id);
//
//   create index jenga_sessions_user_id_idx on jenga_sessions(user_id);
//
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "../supabase.js";

export async function fetchSessions(userId) {
  const { data, error } = await supabase
    .from("jenga_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insertSession(userId, sessionDate, sessionLabel, cards) {
  const { data, error } = await supabase
    .from("jenga_sessions")
    .insert({ user_id: userId, session_date: sessionDate, session_label: sessionLabel, cards })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from("jenga_sessions")
    .delete()
    .eq("id", sessionId);
  if (error) throw error;
}

// ─── PARSE BULK IMPORT TEXT ───────────────────────────────────────────────────
// Expected format:
//   SESSION: 2026-03-27 | Umeme na Teknolojia
//   Kazi yangu ni nyingi sana. | My work is very busy this week. | vocab fix
//   Vitu vyote vilisimama. | Everything stopped. | concord + tense
//
// Returns { sessionDate, sessionLabel, cards } or throws on bad format.

export function parseBulkImport(text) {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) throw new Error("Empty input");

  const headerLine = lines[0];
  if (!headerLine.toUpperCase().startsWith("SESSION:")) {
    throw new Error('First line must start with "SESSION: DATE | Label"');
  }

  const headerBody = headerLine.replace(/^SESSION:\s*/i, "");
  const headerParts = headerBody.split("|").map(s => s.trim());
  if (headerParts.length < 2) throw new Error('Header must be "SESSION: DATE | Label"');

  const sessionDate = headerParts[0];
  const sessionLabel = headerParts[1];

  const cards = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("|").map(s => s.trim());
    if (parts.length < 2) continue;
    cards.push({
      sw: parts[0],
      en: parts[1],
      tag: parts[2] || "",
    });
  }

  if (!cards.length) throw new Error("No cards found — check pipe-separated format");
  return { sessionDate, sessionLabel, cards };
}
