-- PPN POC — team invite code + captain (visual/contextual only; no permissions, no accounts).
--
-- join_code: short code used in the invite link (/play/:token?team=<join_code>) to preselect a team.
-- captain_player_id: the first player (team creator) — shown as "Captain" in the host panel / team view.

alter table public.ppn_teams add column if not exists join_code text;
alter table public.ppn_teams add column if not exists captain_player_id uuid
  references public.ppn_players(id) on delete set null;

create unique index if not exists ppn_teams_join_code_idx on public.ppn_teams(join_code);

-- Grants for the new column are covered by the table-level grants from ppn_core; RLS "ppn_poc_all" already
-- permits the update that sets captain_player_id after the creating player is inserted.
