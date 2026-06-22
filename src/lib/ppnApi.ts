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
