/**
 * PPN live-event core — typed data layer over the isolated PPN local Supabase.
 * Covers the QR-join → onboarding → host slice: resolve a join token, create/join a team, list teams+players.
 * No hardcoded URLs/keys (the client reads env); no business logic depends on localhost.
 */
import { supabase } from "./supabaseClient";

export type SessionStatus = "lobby" | "live" | "paused" | "ended";

export interface ResolvedSession {
  sessionId: string;
  status: SessionStatus;
  venueName: string;
  eventTitle: string;
}

export type JoinResolution =
  | { kind: "ok"; session: ResolvedSession }
  | { kind: "invalid" }
  | { kind: "ended"; session: ResolvedSession };

export interface TeamRow {
  id: string;
  name: string;
  score: number;
  join_code: string | null;
  captain_player_id: string | null;
  players: { id: string; display_name: string }[];
}

/** Short, unambiguous invite code (POC: client-generated; collision risk negligible at demo scale). */
function genJoinCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/O/0/1/L
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

/** Shape returned by the embedded select (loosely typed — Supabase embeds resolve to nested objects). */
type JoinLinkEmbed = {
  is_active: boolean;
  session:
    | {
        id: string;
        status: SessionStatus;
        venue: { name: string } | { name: string }[] | null;
        event: { title: string } | { title: string }[] | null;
      }
    | null;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

/** Resolve a QR join token → the correct session + venue/event, with invalid/ended handling. */
export async function resolveJoinToken(token: string): Promise<JoinResolution> {
  const { data, error } = await supabase
    .from("ppn_join_links")
    .select("is_active, session:ppn_game_sessions(id, status, venue:ppn_venues(name), event:ppn_events(title))")
    .eq("join_token", token)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  const row = data as JoinLinkEmbed | null;
  const s = row?.session;
  if (!row || !row.is_active || !s) return { kind: "invalid" };

  const venue = one(s.venue);
  const event = one(s.event);
  const session: ResolvedSession = {
    sessionId: s.id,
    status: s.status,
    venueName: venue?.name ?? "Venue",
    eventTitle: event?.title ?? "Event",
  };
  if (s.status === "ended") return { kind: "ended", session };
  return { kind: "ok", session };
}

/** Resolve a session id from a token (host view default = the DEMO session). */
export async function resolveSessionId(token: string): Promise<string | null> {
  const r = await resolveJoinToken(token);
  return r.kind === "invalid" ? null : r.session.sessionId;
}

/** Create a new team (with an invite code), add the creating player, and mark them captain (visual only). */
export async function createTeamAndJoin(
  sessionId: string,
  teamName: string,
  displayName: string,
): Promise<{ teamId: string; playerId: string; joinCode: string }> {
  const joinCode = genJoinCode();
  const { data: team, error: teamErr } = await supabase
    .from("ppn_teams")
    .insert({ session_id: sessionId, name: teamName, join_code: joinCode })
    .select("id")
    .single();
  if (teamErr) throw teamErr;
  const teamId = (team as { id: string }).id;
  const playerId = await addPlayer(sessionId, teamId, displayName);
  // First player = captain (contextual only; no permissions).
  await supabase.from("ppn_teams").update({ captain_player_id: playerId }).eq("id", teamId);
  return { teamId, playerId, joinCode };
}

/** Find a team in a session by its invite code (for the /play/:token?team=<code> preselect). */
export async function findTeamByCode(sessionId: string, code: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await supabase
    .from("ppn_teams")
    .select("id, name")
    .eq("session_id", sessionId)
    .eq("join_code", code)
    .maybeSingle();
  if (error) throw error;
  return (data as { id: string; name: string } | null) ?? null;
}

/** Add a player to an existing team. */
export async function addPlayer(sessionId: string, teamId: string, displayName: string): Promise<string> {
  const { data, error } = await supabase
    .from("ppn_players")
    .insert({ session_id: sessionId, team_id: teamId, display_name: displayName })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

/** List teams (with players) for a session — used by the join screen (to pick a team) and the host panel. */
export async function listTeams(sessionId: string): Promise<TeamRow[]> {
  const { data, error } = await supabase
    .from("ppn_teams")
    // Disambiguate: ppn_teams now has TWO relationships to ppn_players (team_id + captain_player_id), so the
    // players embed must name the team_id FK explicitly, else PostgREST errors (PGRST201).
    .select("id, name, score, join_code, captain_player_id, players:ppn_players!ppn_players_team_id_fkey(id, display_name)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamRow[];
}

// ─── Game loop + venue setup modes ────────────────────────────────────────────
export type SetupMode = "tv_audio" | "audio_only" | "local_host";
export type HostingMode = "staff" | "ai_assisted";
export type Phase = "lobby" | "question" | "reveal" | "scoreboard" | "ended";

export interface SessionState {
  sessionId: string;
  status: SessionStatus;
  phase: Phase;
  setupMode: SetupMode;
  hostingMode: HostingMode;
  currentQuestionId: string | null;
}

export interface QuestionRow {
  id: string;
  roundSeq: number;
  sequence: number;
  kind: string; // text|sport|football|geography|local|music|picture|video|sponsored|tiebreak
  prompt: string;
  options: string[] | null;
  correctAnswer: string | null;
  points: number;
}

export async function getSessionState(sessionId: string): Promise<SessionState> {
  const { data, error } = await supabase
    .from("ppn_game_sessions")
    .select("id, status, phase, setup_mode, hosting_mode, current_question_id")
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  const r = data as { id: string; status: SessionStatus; phase: Phase; setup_mode: SetupMode; hosting_mode: HostingMode; current_question_id: string | null };
  return { sessionId: r.id, status: r.status, phase: r.phase, setupMode: r.setup_mode, hostingMode: r.hosting_mode, currentQuestionId: r.current_question_id };
}

type RoundEmbed = { sequence: number; questions: { id: string; sequence: number; kind: string; prompt: string; options: string[] | null; correct_answer: string | null; points: number }[] };

/** Ordered question list for a session (round.sequence, then question.sequence). */
export async function getSessionQuestions(sessionId: string): Promise<QuestionRow[]> {
  const { data, error } = await supabase
    .from("ppn_rounds")
    .select("sequence, questions:ppn_questions(id, sequence, kind, prompt, options, correct_answer, points)")
    .eq("session_id", sessionId)
    .order("sequence", { ascending: true });
  if (error) throw error;
  const rounds = (data ?? []) as RoundEmbed[];
  const out: QuestionRow[] = [];
  for (const r of rounds) {
    for (const q of [...(r.questions ?? [])].sort((a, b) => a.sequence - b.sequence)) {
      out.push({ id: q.id, roundSeq: r.sequence, sequence: q.sequence, kind: q.kind, prompt: q.prompt, options: q.options, correctAnswer: q.correct_answer, points: q.points });
    }
  }
  return out;
}

// ── Host actions ──
export async function setSessionSetup(sessionId: string, setupMode: SetupMode, hostingMode: HostingMode) {
  const { error } = await supabase.from("ppn_game_sessions").update({ setup_mode: setupMode, hosting_mode: hostingMode }).eq("id", sessionId);
  if (error) throw error;
}
export async function startGame(sessionId: string, firstQuestionId: string) {
  const { error } = await supabase.from("ppn_game_sessions").update({ status: "live", phase: "question", current_question_id: firstQuestionId, started_at: new Date().toISOString() }).eq("id", sessionId);
  if (error) throw error;
}
export async function gotoQuestion(sessionId: string, questionId: string) {
  const { error } = await supabase.from("ppn_game_sessions").update({ phase: "question", current_question_id: questionId }).eq("id", sessionId);
  if (error) throw error;
}
export async function setPhase(sessionId: string, phase: Phase) {
  const { error } = await supabase.from("ppn_game_sessions").update({ phase }).eq("id", sessionId);
  if (error) throw error;
}
export async function revealAndScore(sessionId: string, questionId: string) {
  const rpc = supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>;
  const { error } = await rpc("ppn_reveal_and_score", { _session: sessionId, _question: questionId });
  if (error) throw error;
}
export async function endGame(sessionId: string) {
  const { error } = await supabase.from("ppn_game_sessions").update({ status: "ended", phase: "ended", ended_at: new Date().toISOString() }).eq("id", sessionId);
  if (error) throw error;
}

// ── Player answer (shared team answer; any member updates before reveal; scored once per team) ──
export async function submitTeamAnswer(questionId: string, teamId: string, value: string, playerId?: string) {
  const { error } = await supabase
    .from("ppn_answers")
    .upsert({ question_id: questionId, team_id: teamId, submitted_value: value, submitted_by_player_id: playerId ?? null }, { onConflict: "question_id,team_id" });
  if (error) throw error;
}
export async function getTeamAnswer(questionId: string, teamId: string): Promise<{ submitted_value: string | null; is_correct: boolean | null; awarded_points: number } | null> {
  const { data, error } = await supabase
    .from("ppn_answers")
    .select("submitted_value, is_correct, awarded_points")
    .eq("question_id", questionId)
    .eq("team_id", teamId)
    .maybeSingle();
  if (error) throw error;
  return (data as { submitted_value: string | null; is_correct: boolean | null; awarded_points: number } | null) ?? null;
}
