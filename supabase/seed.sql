-- PPN POC — demo seed (reproducible). Idempotent: safe to re-run. Applied to the PPN-local DB only.
-- A single demo venue/event/session + a join token ("DEMO") + a couple of rounds/questions so the
-- functional live-event core (QR join → teams → answers → scoreboard) has something to demo.

insert into public.ppn_venues (id, name, slug, market) values
  ('00000000-0000-4000-8000-000000000001', 'The Anchor', 'the-anchor', 'UK')
on conflict (id) do nothing;

insert into public.ppn_events (id, venue_id, title, status, host_mode, setup_capabilities, tv_usage) values
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Quiz Night',
   'live', 'ai_assisted',
   '{"phones":true,"tv_display":true,"audio":true,"ai_voice":true}'::jsonb, 'both')
on conflict (id) do nothing;

insert into public.ppn_game_sessions (id, event_id, venue_id, status) values
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000002',
   '00000000-0000-4000-8000-000000000001', 'lobby')
on conflict (id) do nothing;

insert into public.ppn_join_links (id, session_id, join_token, is_active) values
  ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', 'DEMO', true)
on conflict (id) do nothing;

insert into public.ppn_rounds (id, session_id, sequence, type, title, status) values
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000003', 1, 'quiz', 'Round 1', 'pending'),
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000003', 2, 'sponsored', 'Sponsored round', 'pending')
on conflict (id) do nothing;

insert into public.ppn_questions (id, round_id, sequence, kind, prompt, options, correct_answer, points) values
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000010', 1, 'text',
   'Which planet is known as the Red Planet?',
   '["Mars","Venus","Jupiter","Mercury"]'::jsonb, 'Mars', 5),
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000010', 2, 'football',
   'Which country won the FIFA World Cup in 2018?',
   '["France","Croatia","Brazil","Germany"]'::jsonb, 'France', 5),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000011', 1, 'sponsored',
   'Our sponsor was founded in which city?',
   '["Manchester","London","Leeds","Bristol"]'::jsonb, 'Manchester', 5)
on conflict (id) do nothing;

-- Realistic demo teams + players (UK market for The Anchor) so host/TV look populated in a presentation.
insert into public.ppn_teams (id, session_id, name, join_code) values
  ('00000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000003', 'The Anchor Regulars', 'ANCH'),
  ('00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000003', 'Quiz Lightning', 'BOLT'),
  ('00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000003', 'Bar Stool Boffins', 'BOFF')
on conflict (id) do nothing;

insert into public.ppn_players (id, session_id, team_id, display_name) values
  ('00000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000030', 'James Smith'),
  ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000030', 'Emily Taylor'),
  ('00000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000030', 'Aisha Khan'),
  ('00000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000031', 'Oliver Brown'),
  ('00000000-0000-4000-8000-000000000044', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000031', 'Sophie Wilson'),
  ('00000000-0000-4000-8000-000000000045', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000031', 'Daniel Patel'),
  ('00000000-0000-4000-8000-000000000046', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000032', 'Grace Johnson'),
  ('00000000-0000-4000-8000-000000000047', '00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000032', 'Mohammed Ali')
on conflict (id) do nothing;

-- Captains (first player of each team) — visual/contextual only.
update public.ppn_teams set captain_player_id = '00000000-0000-4000-8000-000000000040' where id = '00000000-0000-4000-8000-000000000030' and captain_player_id is null;
update public.ppn_teams set captain_player_id = '00000000-0000-4000-8000-000000000043' where id = '00000000-0000-4000-8000-000000000031' and captain_player_id is null;
update public.ppn_teams set captain_player_id = '00000000-0000-4000-8000-000000000046' where id = '00000000-0000-4000-8000-000000000032' and captain_player_id is null;
