/**
 * PPN Supabase client — config comes ONLY from env vars (never hardcoded), so the same build runs against the
 * isolated PPN LOCAL Supabase (ports 55321+) now and a dedicated hosted PPN project later, with no code changes.
 *
 * Local dev values are filled into a git-ignored `.env` after `supabase start`; `.env.example` documents them.
 * The live-event core (sessions, join tokens, teams, players, answers, scoreboard) uses this client.
 */
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaced loudly in dev; commercial/brewery surfaces can still run on seeded/mock data without this.
  console.warn(
    "[ppn] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — the live-event core needs the local PPN Supabase. Run `supabase start` and copy values into .env (see .env.example).",
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
