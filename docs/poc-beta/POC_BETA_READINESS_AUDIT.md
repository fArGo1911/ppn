# PPN POC — Controlled Beta Readiness Audit

- **Date:** 2026-06-23
- **HEAD audited:** `7012f56` (on `main`, incl. Phase 9 `4c3fd09`, Ambient docs `29fcc03`, Phase 10A `9503dbe`)
- **Repo:** `fArGo1911/ppn` · root `C:/Users/whatever/PPN` · working tree clean
- **Scope:** controlled POC beta/demo readiness of the existing app — **not** product-beta, **not** production hardening.
- **Local PPN Supabase:** running (`*_PPN` containers healthy) → the live host/TV/player loop is testable.

## Commands run
- `npm run build` → **exit 0** (only the pre-existing >500 kB chunk-size warning).
- `npm run test:e2e` → **63 passed** (chromium, warm PPN dev server on 127.0.0.1:5173).
- Route smoke: HTTP 200 on all 14 audited routes; app marker confirms **PPN** (not Kickoff).
- Persona/visual walkthrough via Playwright screenshots (operator + seeded brief; live host/TV/player; buyer pages).

## Routes audited
`/` · `/operator` · `/operator/setup-wizard` · `/presentation` · `/host` · `/tv/DEMO` · `/play/DEMO` · `/kpi` ·
`/report` · `/rollout` · `/run-sheet` · `/config` · `/capabilities` · `/setup` — all render, no blank screens, no
console crashes observed, primary nav links resolve.

## Automated test results
- Build: PASS. E2E: 63/63 PASS. (Note: a fresh/cold dev server can flake on first-hit compile under parallel load
  — warm the server first; all tests pass green warm.)

## Persona findings

| Persona | Starts on | First action obvious? | Findings |
|---|---|---|---|
| **PPN operator / presenter** | `/operator` | Yes | Comprehensive control centre: current demo status, "Set up a client demo" (brief saved + **mismatch warning** when brief client ≠ active preset), content-mix summary, "Live demo quiz" status (honest "Default still active / Proposed quiz saved"), guided journey, free exploration, troubleshooting. **Dense/long** (P2). |
| **Brewery buyer / MD** | `/presentation` | Yes | Boardroom-ready, **client-identity-safe** (shows "HB / Harbourline Brewery", logo-safe initials, no Northgate, no operator language). Content mix appears as a *prepared content profile*, not fake live. Links to `/kpi`,`/report`,`/rollout`,`/run-sheet` present. |
| **Pub / venue manager** | `/run-sheet` | Yes | Clear venue/host handoff; now includes a "Tonight's content profile" line (proposed mix, "can be tailored"). Client-safe. |
| **Quiz host** | `/host` (gated) | Yes | Loads the seeded DEMO session (3 teams · 8 players), venue-setup, AI intro, "Play AI intro / Start game". Functional. Shows **Northgate / The Anchor** (operator surface + seeded session). |
| **Player / team** | `/play/DEMO` (mobile) | Yes | Clean, credible mobile join ("You're in the right place", offer, Continue). No AI-host leak. **"Presenter" pill visible** unless audience mode (P2). |
| **TV / audience** | `/tv/DEMO` | n/a | Distance-readable welcome; **no Big Buck Bunny** (gradient "Brewery video" fallback); **"Tonight's intro"** (not "AI host"); QR "Scan to join · code DEMO". Good. |

## End-to-end POC journey findings
- **Operator journey:** works end-to-end — status → setup wizard → client/scenario → quiz content mix (sliders, composition, proposed preview) → **Save proposed quiz plan** (staged) → honest wording ("Default live demo quiz still active; runtime apply later") → open presentation.
- **Client presentation journey:** works — why-PPN / campaign / pub night / sponsor exposure / measurement / rollout; no operator-only language leaks; content mix shown as a prepared plan; buyer-page links resolve.
- **Live demo journey:** **completable** (local Supabase up) — `/host` loads the seeded session with teams and can start; `/tv/DEMO` shows the welcome/QR; `/play/DEMO` reaches the join flow. Reveal/scoreboard infrastructure is intact (unchanged from prior phases). **Classification: expected/functional.** The tailored content-mix quiz is **not** applied to the live runtime (honest, by design — Phase 10A).

## Content-mix readiness findings
- Categories clear; **Music, Picture round and Video round are separate** ✓
- Setup-mode warnings sensible (e.g. video needs TV; audio-only flags video) ✓
- Proposed quiz preview is credible (real seeded questions, category-labelled, "PREVIEW ONLY") ✓
- Staged-plan wording honest ("Custom quiz plan prepared. Default live demo quiz still active. Runtime apply requires a DB-backed replacement step.") ✓
- `/operator` summary clear; `/presentation` summary client-safe; **no wording claims a live tailored quiz is active** ✓

## Visual / UX quick pass
- `/operator` is information-dense (lots of cards) — readable but long (P2).
- Live `/host`,`/tv`,`/play` render the **seeded Northgate/The Anchor** session regardless of the prepared brief (P1 — demo coherence; see below).
- "Presenter" pill appears on `/play` and `/tv` unless audience mode is enabled (P2 — operator chrome on client devices; mitigated).
- Mobile player and TV readability are good; no cramped/broken layouts seen.

## Findings by severity

### P0 — blocks controlled POC beta/demo
**None.** No blank routes, wrong app, player-can't-join, host-can't-run, TV-unusable, or catastrophic operator-control exposure.

### P1 — should fix / know before demo
- **P1-1 — Live event brand can diverge from the presented client.** `/host`,`/tv`,`/play` always run the **seeded Northgate / The Anchor** DEMO session. If the prepared brief's client ≠ the active preset (e.g. presenting "Harbourline"), the *live* event shows Northgate, not the client. **Already surfaced** by the `/operator` mismatch warning. **Mitigation (no code):** present using a preset *as* the client (or set the active preset to match the brief), or frame the live event as a generic example. Full fix = runtime/session work (Phase 10B-class) — parked.
- **P1-2 — Enable audience mode on client-facing devices.** On `/play` and `/tv` the "Presenter" pill shows unless audience mode is on. For a controlled demo where the operator drives it's fine; if real attendees scan, enable audience mode first so no operator chrome appears on their phones/the TV. **Mitigation (no code):** toggle audience mode before handing devices to guests.

### P2 — polish
- `/operator` density — could group/condense cards.
- Operator-chrome "Presenter" pill on client surfaces (mitigated by audience mode).
- Minor seeded copy on the operator host script references "Northgate" (operator surface only).

### Parked — future product (do not build now)
- **Phase 10B** DB-backed runtime apply (make the tailored quiz actually live: snapshot→replace `ppn_questions`→verify host/TV/player/reveal/scoreboard→restore).
- Live session/brand re-seed per brief (so the live event matches any custom client) — runtime work.
- Real CMS, AI question generation, large content bank, venue self-service portal, Ambient Venue Screen Mode, production auth/analytics/RLS, hosted Supabase, MP3/audio voice.

## Readiness verdict
**Ready for controlled POC beta — with caveats.**
The app demonstrates the full intended story honestly: operator setup → venue content mix → seeded question pool → proposed quiz preview → saved staged plan → client-safe presentation → live host/TV/player on the seeded demo session. No P0 blockers. The content-mix feature is credible and its "preview/plan vs live" separation is honest.

## Must-do before showing anyone (operational, no code required)
1. Ensure the **local PPN Supabase is running** (it is) so `/host`,`/tv`,`/play` work.
2. **Reset/seed** the DEMO session to a clean lobby with sample teams before the run (the `/config` reset/seed controls; the session currently has 3 teams · 8 players).
3. For brand coherence, **present a client that matches the active preset** (or accept the live event is a generic example) — heed the `/operator` mismatch warning.
4. **Enable audience mode** on any player phone / TV that guests will see (hides operator chrome).
5. Keep the content-mix narrative as **prepared/proposed** — do not claim the live quiz is the tailored one.

## What is already good enough
- All routes load; PPN served (not Kickoff); 63/63 e2e green; build clean.
- Operator setup wizard + content mix + proposed preview + staged plan (honest).
- Client-safe presentation + buyer pages (brief-identity-safe, no operator leaks, content profile surfaced).
- Live host/TV/player loop on the seeded session (teams present, startable, TV/QR/player clean; no bunny, no "AI host" label).

## Recommended next slice
**Hold and demo as-is** for the controlled POC beta (no code change required from this audit). If a small polish pass is wanted next, address **P1-2/P2** with a tiny, safe change: auto-enable (or one-click "Go audience") for `/play` + `/tv` when launched for guests. The larger **P1-1** brand-coherence and the tailored-quiz-goes-live work is **Phase 10B** and remains parked until explicitly approved.
