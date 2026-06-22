-- PPN POC — optional AI evening introduction (PPN-local Supabase only).
-- aiIntroEnabled lets a session include or skip a polished AI-hosted opening before questions start.
-- The intro itself is a 'phase' value ('intro') driven from the host panel; this column is the toggle.
alter table public.ppn_game_sessions add column if not exists ai_intro_enabled boolean not null default true;
