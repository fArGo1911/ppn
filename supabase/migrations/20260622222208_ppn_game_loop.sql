-- PPN POC — game loop + venue setup modes (PPN-local Supabase only).
--
-- One session-control model drives all setups. setup_mode determines OUTPUT (TV/audio/phones); hosting_mode is
-- separate (staff vs AI-assisted). phase drives what players/TV show. Scoring: correct = 1 point (no speed/tie).

alter table public.ppn_game_sessions add column if not exists setup_mode   text not null default 'tv_audio';   -- tv_audio | audio_only | local_host
alter table public.ppn_game_sessions add column if not exists hosting_mode text not null default 'staff';      -- staff | ai_assisted
alter table public.ppn_game_sessions add column if not exists phase        text not null default 'lobby';      -- lobby | question | reveal | scoreboard | ended

-- Atomic reveal + score for the current question, then recompute every team's total from its settled answers.
-- SECURITY DEFINER so the anon (publishable) client can trigger it; POC-scoped to one session.
create or replace function public.ppn_reveal_and_score(_session uuid, _question uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_correct text;
begin
  select correct_answer into v_correct from public.ppn_questions where id = _question;

  update public.ppn_answers a
     set is_correct     = (a.submitted_value is not distinct from v_correct),
         awarded_points = case when a.submitted_value is not distinct from v_correct then 1 else 0 end
   where a.question_id = _question;

  update public.ppn_teams t
     set score = coalesce((
       select sum(a.awarded_points)::int
       from public.ppn_answers a
       join public.ppn_questions q on q.id = a.question_id
       join public.ppn_rounds r    on r.id = q.round_id
       where a.team_id = t.id and r.session_id = _session
     ), 0)
   where t.session_id = _session;

  update public.ppn_game_sessions set phase = 'reveal', status = 'live' where id = _session;
end;
$$;

revoke all on function public.ppn_reveal_and_score(uuid, uuid) from public;
grant execute on function public.ppn_reveal_and_score(uuid, uuid) to anon, authenticated;
