-- PPN POC — live-event core schema (PPN-local Supabase only).
--
-- Covers the FUNCTIONAL live-event core: venues/events → game sessions → QR join links → rounds/questions →
-- teams/players → answers (one shared team answer per question) → scoreboard (team.score) + session/TV state.
-- Commercial/brewery surfaces (presets, KPI, rollout) are seeded/mock in the app, not here.
--
-- RLS: enabled with PERMISSIVE policies suitable for a LOCAL demo (anonymous players join via an unguessable
-- token). This is a POC convenience — tighten before any public/hosted deployment.

-- ─── Tables ───────────────────────────────────────────────────────────────────
create table if not exists public.ppn_venues (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique,
  market     text,                       -- 'SE' | 'DE' | 'UK' (demo market)
  created_at timestamptz not null default now()
);

create table if not exists public.ppn_events (
  id                  uuid primary key default gen_random_uuid(),
  venue_id            uuid references public.ppn_venues(id) on delete cascade,
  title               text not null,
  status              text not null default 'draft',     -- draft | live | ended
  host_mode           text not null default 'staff',     -- staff | ai_assisted
  setup_capabilities  jsonb not null default '{"phones":true,"tv_display":false,"audio":false,"ai_voice":false}'::jsonb,
  tv_usage            text not null default 'none',       -- none | promo | quiz | both
  created_at          timestamptz not null default now()
);

create table if not exists public.ppn_game_sessions (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid references public.ppn_events(id) on delete cascade,
  venue_id            uuid references public.ppn_venues(id) on delete cascade,
  status              text not null default 'lobby',      -- lobby | live | paused | ended
  current_round_id    uuid,
  current_question_id uuid,
  settings            jsonb not null default '{}'::jsonb,
  started_at          timestamptz,
  ended_at            timestamptz,
  created_at          timestamptz not null default now()
);

create table if not exists public.ppn_join_links (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ppn_game_sessions(id) on delete cascade,
  join_token text not null unique,                        -- short, unguessable; encoded in the QR
  is_active  boolean not null default true,               -- regenerate => deactivate old
  created_at timestamptz not null default now()
);

create table if not exists public.ppn_rounds (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ppn_game_sessions(id) on delete cascade,
  sequence   int not null,
  type       text not null default 'quiz',                -- quiz | sponsored | tiebreak
  title      text,
  sponsor    text,
  status     text not null default 'pending'              -- pending | active | done
);

create table if not exists public.ppn_questions (
  id             uuid primary key default gen_random_uuid(),
  round_id       uuid not null references public.ppn_rounds(id) on delete cascade,
  sequence       int not null,
  kind           text not null default 'text',            -- text|sport|football|geography|local|music|picture|video|sponsored|tiebreak
  prompt         text not null,
  options        jsonb,                                   -- multiple-choice options
  correct_answer text,
  media_url      text,
  time_limit     int,
  points         int not null default 5,
  capability     jsonb not null default '{"works_phones_only":true,"works_host_read":true}'::jsonb
);

create table if not exists public.ppn_teams (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ppn_game_sessions(id) on delete cascade,
  name       text not null,
  score      int not null default 0,                      -- denormalised scoreboard cache
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ppn_players (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references public.ppn_game_sessions(id) on delete cascade,
  team_id      uuid references public.ppn_teams(id) on delete set null,
  display_name text not null,
  joined_at    timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- One shared team answer per question (any member updates before lock; last-write-wins).
create table if not exists public.ppn_answers (
  id                   uuid primary key default gen_random_uuid(),
  question_id          uuid not null references public.ppn_questions(id) on delete cascade,
  team_id              uuid not null references public.ppn_teams(id) on delete cascade,
  submitted_by_player_id uuid references public.ppn_players(id) on delete set null,
  submitted_value      text,
  is_correct           boolean,
  awarded_points       int not null default 0,
  submitted_at         timestamptz not null default now(),
  unique (question_id, team_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists ppn_sessions_event_idx   on public.ppn_game_sessions(event_id);
create index if not exists ppn_join_token_idx        on public.ppn_join_links(join_token);
create index if not exists ppn_rounds_session_idx    on public.ppn_rounds(session_id);
create index if not exists ppn_questions_round_idx    on public.ppn_questions(round_id);
create index if not exists ppn_teams_session_idx      on public.ppn_teams(session_id);
create index if not exists ppn_players_session_idx    on public.ppn_players(session_id);
create index if not exists ppn_answers_question_idx   on public.ppn_answers(question_id);

-- ─── RLS (POC: permissive for local demo; tighten before any hosted deploy) ────
do $$
declare t text;
begin
  foreach t in array array[
    'ppn_venues','ppn_events','ppn_game_sessions','ppn_join_links','ppn_rounds',
    'ppn_questions','ppn_teams','ppn_players','ppn_answers'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format($p$create policy "ppn_poc_all" on public.%I for all to anon, authenticated using (true) with check (true);$p$, t);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated;', t);
  end loop;
end $$;
