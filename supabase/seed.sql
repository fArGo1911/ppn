-- PPN POC — demo seed (reproducible). Idempotent: safe to re-run. Applied to the PPN-local DB only.
-- A single demo venue/event/session + a join token ("DEMO") + a couple of rounds/questions so the
-- functional live-event core (QR join → teams → answers → scoreboard) has something to demo.

insert into public.ppn_venues (id, name, slug, market) values
  ('00000000-0000-4000-8000-000000000001', 'The Anchor', 'the-anchor', 'UK')
on conflict (id) do nothing;

insert into public.ppn_events (id, venue_id, title, status, host_mode, setup_capabilities, tv_usage) values
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'PubPlay Quiz Night',
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
