# PPN POC — Comprehensive Controlled-Beta Readiness Audit

- **Date:** 2026-06-23
- **HEAD audited:** `00cd01d` (incl. Phase 9 `4c3fd09`, Ambient docs `29fcc03`, Phase 10A `9503dbe`, polish `7012f56`)
- **Repo:** `fArGo1911/ppn` · root `C:/Users/whatever/PPN` · working tree clean · dev server confirmed **PPN** (not Kickoff)
- **Local PPN Supabase:** 12 `*_PPN` containers running → the live host/TV/player loop is testable.
- **Commands run:** `npm run build` → exit 0; `npm run test:e2e` → **63 passed**; console-error pass on all 14 routes → **0 errors**; route smoke → all 200; Playwright screenshot capture of TV states (welcome/intro/question/reveal/scoreboard/victory, audience + default), `/config` asset surface, operator/host/player/presentation.
- **Scope:** controlled POC beta readiness — audit only, no app changes.

> **Correction to the prior (00cd01d) audit:** it graded the TV surface "good" — that was too generous. This audit
> confirms the seed finding: the **TV welcome/intro state is not audience-credible** (empty "Brewery video" panel,
> host-script card, and a "Presenter" pill). Those are the headline must-fix items below.

---

## 1. Executive summary

**Verdict: Ready after P1 fixes.** The POC tells the full intended story and the *gameplay* surfaces are strong:
operator setup → venue content mix (with a credible seeded preview + honest staged plan) → client-safe
presentation → a functional live host/TV/player loop on the seeded DEMO session (with local Supabase up). Build is
clean, e2e is green, and there are **zero console errors** on any route. **However**, the single most-displayed
audience surface — the **TV welcome/“between” state** — currently shows operator/host-internal content (a
host-script card, an empty “Brewery video” placeholder, and a “Presenter” pill in default mode). That would
embarrass an unsupervised pub-TV demo. With a tightly operator-driven demo it is runnable today, but the TV
welcome state and the operator-chrome-on-client-surfaces should be fixed before showing anyone.

**Overall grade: B−** (usable for a controlled, operator-driven POC beta with known, fixable caveats).

**Top 5 risks**
1. **TV welcome/intro state leaks internal content** (host-script card + empty "Brewery video" panel) — P1, on the most-shown audience screen, *not* fixed by audience mode.
2. **"Presenter" pill on client/audience routes** (`/tv`, `/play`, `/`, buyer pages) in default mode — operator chrome a guest can tap into operator pages — P1 (hidden only in audience mode).
3. **Live host/TV/player run the seeded Northgate/The Anchor session regardless of the prepared brief** — brand divergence when brief client ≠ active preset — P1 (mitigated by using a preset-as-client; flagged by the `/operator` mismatch warning).
4. **Live loop hard-depends on the local PPN Supabase** — if it's down, host/TV/player degrade to fallback/empty — operational P1 (ensure it's up + seeded before a demo).
5. **Asset upload is real but several slots are preview-only** (phone-card / lower-third / venue images don't appear in live gameplay; videos only play if an asset-pack URL is set; audio/MP3 absent) — credible branding is achievable but the operator must know the limits — P2/P1.

**Top 5 strengths**
1. **TV active-question / reveal states are excellent** — large, distance-readable, clean, no chrome (A-grade).
2. **Content-mix feature is genuinely credible** — 8 separate categories (Music/Picture/Video distinct), live composition, a real seeded proposed-quiz preview, and **honest** "preview/plan vs live" wording (no fake "live tailored quiz").
3. **Client-facing identity is brief-safe** — `/presentation` and buyer pages show the brief client (logo-safe initials, no wrong-brewery leak, no operator language).
4. **Functional live loop** — host can see teams/answers, start, advance, reveal & score, scoreboard, rename/remove teams; players join + answer on clean mobile; server-authoritative state recovers on refresh.
5. **Zero console errors; build + 63 e2e green; honest operator status everywhere** (mismatch warning, "Default live demo quiz still active").

**Readiness verdict (one of the required four): Ready after P1 fixes.**

---

## 2. Readiness matrix (functional areas, 0–5)

| # | Area | Persona | Grade | Score | Demo-ready? | Evidence | Fix? | Priority |
|---|---|---|---|---|---|---|---|---|
| 1 | Operator setup journey | Operator | B+ | 4 | Yes | Wizard 8 steps, clear order, mismatch warning | minor | P2 |
| 2 | Demo state clarity | Operator | B+ | 4 | Yes | `/operator` "Current demo" + "Live demo quiz" status | minor | P2 |
| 3 | Content-mix sliders | Operator | A | 5 | Yes | 8 separate sliders, total/normalise, setup warnings | no | — |
| 4 | Seeded question-pool preview | Operator | A | 5 | Yes | Real proposed-quiz preview, category-labelled | no | — |
| 5 | Staged quiz-plan honesty | Operator | A | 5 | Yes | "PREVIEW ONLY", "Default live demo still active" | no | — |
| 6 | Asset upload / brand prep | Brand mgr | C+ | 3 | Partly | `/config` manual paths + storage-backed upload; some slots preview-only | yes | P1/P2 |
| 7 | Brand identity consistency | All | C+ | 3 | Partly | Client surfaces brief-safe; live host/TV use seeded preset | yes | P1 |
| 8 | Client presentation | Buyer | A− | 5 | Yes | Boardroom flow, client-safe, content profile | no | — |
| 9 | KPI / measurement story | Buyer | B+ | 4 | Yes | Honest seeded projection, labelled estimates | minor | P2 |
| 10 | Report / buyer evidence | Buyer | B+ | 4 | Yes | Pilot report, evidence breakdown, content profile | minor | P2 |
| 11 | Rollout / operations story | Buyer | B | 4 | Yes | Pilot→regional→wider, decision gates | minor | P2 |
| 12 | Run-sheet / execution plan | Venue | B | 4 | Yes | Venue/host handoff + content profile | minor | P2 |
| 13 | Host console | Host | B+ | 4 | Yes (Supabase up) | Start/next/reveal/scoreboard/rename/remove | minor | P2 |
| 14 | Team/player management | Host | B | 4 | Yes | listTeams, rename, lobby remove, answered count | minor | P2 |
| 15 | Player join flow | Player | B | 4 | Yes | Clean mobile join; Presenter pill exposure | yes | P1 |
| 16 | Player answer flow | Player | B+ | 4 | Yes | Shared team answer, submitted/reveal/scoreboard | minor | P2 |
| 17 | **TV / audience display** | TV | **C** | **2** | **Welcome: No / Gameplay: Yes** | Question state A; welcome leaks script/video/pill | **yes** | **P1** |
| 18 | Sponsor exposure | Buyer/TV | B+ | 4 | Yes | Offer badge, sponsor strip, sponsored round | minor | P2 |
| 19 | Setup-mode compatibility | Operator/Venue | A | 5 | Yes | Video→TV, picture→display, music→audio warnings | no | — |
| 20 | Route / gating separation | All | C+ | 3 | Mostly | `/host`/`/config` gated; Presenter pill on client routes | yes | P1 |
| 21 | Mobile usability (player) | Player | B+ | 4 | Yes | Large buttons, readable, focus states | minor | P2 |
| 22 | TV readability | TV | B | 4 | Gameplay yes | Question/reveal huge + clear; welcome cluttered | yes | P1 |
| 23 | Error / recovery / reset | Operator | B | 4 | Yes | `/config` reset+seed; server-authoritative recovery | minor | P2 |
| 24 | Local-Supabase / demo-data dependency | Operator | C+ | 3 | Conditional | Live loop requires local Supabase up + seeded | yes | P1 (ops) |
| 25 | **Overall controlled POC beta** | All | **B−** | **3.5** | **After P1** | See verdict | yes | — |

---

## 3. Persona matrix

| Persona | Desired outcome | Current support | Gaps | Grade | Must-fix before demo |
|---|---|---|---|---|---|
| **PPN operator / presenter** | Prepare, launch, explain, recover without confusion | Strong: `/operator` hub, wizard, staged plan, mismatch warning, reset/seed, free exploration | `/operator` dense; must know live event = seeded session | **B+** | Know brand-divergence + keep Supabase up/seeded |
| **Brewery buyer / MD** | Understands commercial value | Strong: client-safe `/presentation`, KPI/report/rollout truthful, content-profile differentiator | — | **A−** | None (content/credibility good) |
| **Pub / venue manager** | Understands venue role + responsibilities | Good: `/run-sheet` (what venue needs, setup options, before/during/after, fallbacks), setup-mode clarity | No printable/QR-poster artefact | **B** | None blocking |
| **Quiz host** | Run the event | Good (Supabase up): see teams/answers, start, advance, reveal & score, scoreboard, rename/remove, refresh-recovers | Manual score deferred; host needs the gated console | **B+** | Ensure Supabase up + seeded teams |
| **Player / team** | Join + play without explanation | Good: clean mobile join, name/team, answer, states | **Presenter pill visible** unless audience mode | **B** | Enable audience mode on guest phones (or hide pill) |
| **TV / audience** | Clean venue screen, not admin/debug | **Mixed**: gameplay states excellent; **welcome/intro leaks** script card + empty video panel (+ pill default) | Welcome state not audience-credible | **C** | **Fix TV welcome state (P1)** |
| **Brand/content manager** | Prepare a credible brewery-branded demo | Partly: 12 colour-reskinning presets + `/config` manual + storage-backed upload; in-repo Northgate SVGs | Several slots preview-only; videos need URLs; no audio | **C+** | Know which slots are live before branding a demo |

---

## 4. Surface matrix

| Route | Audience | Purpose | Grade | Wrong-surface content? | Visual/readability | Issues |
|---|---|---|---|---|---|---|
| `/` (Landing) | Buyer/client | Campaign story | B+ | Presenter pill (default) | Clean, brief-safe | P1 pill |
| `/operator` | Operator | Control centre | B | — (gated) | Dense but readable | P2 density |
| `/operator/setup-wizard` | Operator | Internal setup + content mix | A− | — (gated) | Clear stepper, good preview | strong |
| `/presentation` | Buyer/client | Guided showcase | A− | None | Boardroom, brief-safe | strong |
| `/host` | Host (gated) | Live host console | B+ | — (gated) | Readable live; shows seeded Northgate | needs Supabase |
| `/tv/DEMO` | **Audience** | Room display | **C** | **Welcome: host-script card + empty "Brewery video" + pill** | Gameplay huge/clean; welcome cluttered | **P1 ×3** |
| `/play/DEMO` | Player | Phone join/play | B | Presenter pill (default) | Clean mobile, no AI leak | P1 pill |
| `/kpi` | Buyer | Engagement projection | B+ | None | Dense but honest | P2 |
| `/report` | Buyer | Pilot report | B+ | None | Clear, content profile | P2 |
| `/rollout` | Buyer | Scale plan | B | None | Clear stages | P2 |
| `/run-sheet` | Venue/host | Execution handoff | B | None | Clear checklist | P2 |
| `/config` | Operator (gated) | Detailed prep + asset upload | B | — (gated) | Very dense | P2 density |
| `/capabilities` | Buyer | Beyond-quiz cards | B | None | Fine | P2 |
| `/setup` | Operator | Asset checklist/spec | B | — | Dense doc | P2 |

---

## 5. Functionality matrix (selected critical functions)

| Function | Works? | Demo quality | Evidence | Issues | Severity | Recommendation |
|---|---|---|---|---|---|---|
| Operator → wizard → content mix → staged plan | Yes | High | walkthrough + e2e | — | — | Demo as-is |
| Content-mix sliders + composition | Yes | High | wizard screenshot | — | — | Demo as-is |
| Proposed-quiz preview from seeded pool | Yes | High | real questions, labelled | preview ≠ live | Parked (10B) | Keep honest |
| Staged plan honesty | Yes | High | "PREVIEW ONLY", default-active | — | — | Keep |
| Asset upload (manual + storage) | Yes | Medium | `/config` sections; Supabase up | several slots preview-only | P1/P2 | Document live vs preview slots |
| Brand identity (client surfaces) | Yes | High | `/presentation` HB initials | — | — | Keep |
| Brand identity (live host/TV/player) | Partial | Medium | shows seeded Northgate | divergence vs brief | P1 | Use preset-as-client |
| Player join + answer | Yes | High | mobile screenshot + PlayerLive | pill exposure | P1 | Audience mode |
| Host start/advance/reveal/scoreboard | Yes | High | Host.tsx + ppnApi RPC | needs Supabase | P1 (ops) | Pre-flight Supabase |
| TV active question / reveal | Yes | **High** | tv-question screenshot | — | — | Keep (great) |
| **TV welcome/intro** | Renders | **Low** | tv-welcome screenshots | script card + empty video + pill | **P1** | **Clean the welcome state** |
| Setup-mode compatibility warnings | Yes | High | wizard warnings | — | — | Keep |
| Gating (`/host`,`/config`) | Yes | High | e2e gating tests | — | — | Keep |
| Reset / seed demo | Yes | Medium | `/config` controls | manual step | P2 | Pre-flight |
| Console errors | None | — | 0 on 14 routes | — | — | — |

---

## 6. P0 / P1 / P2 / Parked

### P0 — blocks controlled POC beta
**None.** No blank/crash route, wrong app, can't-join, can't-run, unusable gameplay TV, or catastrophic control exposure. (The Presenter-pill exposure is real but mitigated by audience mode → P1 per the brief's taxonomy.)

### P1 — must fix before showing anyone
- **P1-A — TV welcome/intro state leaks internal content.** The room-facing `/tv/DEMO` welcome (shown the whole time guests are joining) renders: (1) the **"Tonight's intro" host-script card** (the full AI/host script paragraph), (2) an **empty "Brewery video ▶" placeholder panel**, (3) the **"Presenter" pill** (default mode). *Audience mode hides only the pill — the script card and empty video panel remain.* This is the headline fix. *(Source: `Tv.tsx` welcome/`intro` states render `AiAnnouncementSlot` + `VideoSlot(clientVideoUrl("intro"))` unconditionally.)*
- **P1-B — "Presenter" pill on client/audience routes.** On `/`, `/tv`, `/play`, and buyer pages the global `PresenterTools` pill shows in default mode and opens an operator jump-menu; a guest could reach operator pages. Mitigated only if audience mode is enabled first.
- **P1-C — Live event brand divergence.** `/host`,`/tv`,`/play` always run the seeded **Northgate / The Anchor** session, not the prepared brief's client. Flagged by the `/operator` mismatch warning; mitigated by presenting a preset-as-client.
- **P1-D — Live loop / local-Supabase operational dependency.** Host/TV/player require the local PPN Supabase up **and** the DEMO session seeded (teams). If it's down, those surfaces degrade. Must be pre-flighted.
- **P1-E — Asset "live vs preview" clarity.** Upload exists, but phone-card/lower-third/venue images are preview-only and videos only play with an asset-pack URL — an operator branding a demo needs to know which slots actually appear live.

### P2 — polish
- `/operator` and `/config` density (many cards).
- Empty "Brewery video" panel also appears in `/tv` slideshow/closing presenter states.
- KPI/report repeated caveat density; minor spacing.
- No printable QR-poster / one-page venue artefact.

### Parked — future product (do not build now)
- Phase 10B DB-backed runtime apply (make the tailored quiz actually live).
- Per-brief live-session re-seed (live event matches any custom client).
- Real CMS, AI question generation, large content library, venue self-service, Ambient Venue Screen Mode, production auth/RLS/analytics, hosted Supabase, MP3/audio voice.

---

## 7. Asset / brand readiness

- **Can I upload files/images?** **Yes.** `/config` (gated) has two paths: **Quick manual paths** (paste image/video URLs/paths, no upload) and **Upload asset pack (storage-backed)** — create a named pack, upload image files (logo/hero/sponsor_slide/phone_card/lower_third/venue_image) and videos (intro/sponsor_bumper/closing) to the **local PPN Supabase Storage** + registry, then "Apply this pack". Storage upload shows available (Supabase up).
- **Can uploaded assets populate a proper brewery-branded quiz?** **Partly.** Logo, hero, and sponsor-slide go **live** (player banner/hero, TV banner/slides, landing/presentation). **Phone-card, lower-third, and venue images are preview-only** (shown in `/setup`/`/config` previews, *not* in live gameplay yet). Videos play **only** when an asset-pack video URL is set (sample clips are suppressed on the client TV). Copy fields (sponsor name, campaign, offer, tagline, responsible note) apply via the asset pack or the 12 presets.
- **Which surfaces use the assets?** Logo → player/TV banner, DemoShell header; hero → landing/player splash; sponsor slide → TV sponsor slideshow; colours → whole-app re-skin (theme tokens). The 12 built-in presets already give distinct, polished colour identities.
- **Where do fake placeholders still appear?** The **empty "Brewery video ▶" panel** on the TV welcome/intro/slideshow/closing states when no real video URL is set (P1). Otherwise missing images degrade to a **brand-tinted gradient** (acceptable). The Northgate placeholder uses in-repo SVGs (logo/hero/sponsor-slide/phone-card/lower-third/venue) — safe and reasonably polished.
- **Is missing-media handling acceptable?** For images, **yes** (gradient fallback). For **video, no** — the fallback is a visible empty "Brewery video" play panel on the audience TV (should be suppressed when no real clip exists).
- **Can the operator see which assets are active?** Yes — `/config` "Current demo" chips (custom vs default), "Where assets appear" map, and the wizard readiness step.
- **What's needed before a real brewery-branded demo?** (1) Suppress the empty video panel on the audience TV when no clip is set (P1-A). (2) Either upload a real logo/hero/sponsor-slide for the client or use a matching preset. (3) Be aware phone-card/lower-third/venue are preview-only and audio is absent. With a logo + hero + sponsor slide + matching colours, a credible branded demo **is** achievable today.

---

## 8. Host readiness

- **Can the host do what's expected?** **Mostly yes**, with local Supabase up. From the gated `/host` console the host can: **see teams** (live list, 3 teams · 8 players in the seeded demo), **see answered count** per question, **start** the game (with optional AI intro), **advance** to the next question, **replay/repeat** a question (re-points to the same question; never resets answers), **reveal & score** (server RPC), show the **scoreboard**, reach the **winner/end** state, **rename** a team, and **remove** a team in the lobby. State is **server-authoritative**, so a page refresh recovers mid-event.
- **What can't the host do?** **Manual score override** is intentionally deferred (the reveal RPC recomputes from answers). No merge-teams. No content swap at runtime (tailored quiz is plan-only).
- **What's confusing?** The host shows the **seeded Northgate/The Anchor** brand regardless of the prepared brief (operator surface — acceptable, but note the divergence). The console is information-rich; the "primary action per phase" pattern keeps the next step obvious.
- **Private host controls hidden from players/TV?** **Yes** — `/host` is gated; players and TV are separate routes and don't expose host controls.
- **Enough for a controlled POC beta?** **Yes**, provided the local Supabase is up and the session is seeded. Grade **B+**.

---

## 9. Brewery / business readiness

- **Right commercial information?** **Yes.** `/presentation` leads with why-PPN → campaign → pub night → sponsor exposure → measurement → rollout → next step; `/kpi` and `/report` give a reconciled engagement projection; `/rollout` gives decision-gated pilot→regional→wider.
- **KPIs useful and truthful?** **Yes** — engagement-led (events, players, teams, completion, sponsored-round engagement, dwell proxy, estimated reach), every rate has a denominator, estimates are labelled, and it explicitly **does not claim measured bar sales or ROI**. Not vanity-only.
- **Sponsor value clear?** **Yes** — where the brand appears (phone/TV/host script/report), sponsored-round engagement, offer/CTA (non-alcohol default).
- **Rollout credible?** **Yes** — staged with decision gates and venue readiness; numbers reconcile from the same scenario seed.
- **Report useful?** **Yes** — pilot-report format with PPN-measured vs venue-reported vs estimated, plus the content profile.
- **What's missing?** A printable/exportable artefact (PDF/poster); the content mix is shown as a *prepared* plan (not yet live). Otherwise the business story is demo-ready. Grade **A−**.

---

## 10. Final verdict

**Ready after P1 fixes.**

The concept is clearly visible and credible, the gameplay and business surfaces are strong, and everything is
honest. The blocker to "Ready for controlled POC beta" without caveats is the **TV welcome/intro audience surface**
plus **operator chrome on client routes** — small, contained fixes.

### Must-fix before showing anyone
1. **Clean the TV welcome/intro state (P1-A):** remove/hide the host-script "Tonight's intro" card on the public TV, and **suppress the empty "Brewery video" panel** when no real clip is set (fall back to the gradient/QR only).
2. **Hide the "Presenter" pill on client/audience routes (P1-B)** — or auto-enable audience mode for `/tv` and `/play` so no operator chrome is shown to guests.
3. **Operational pre-flight (P1-C/D):** ensure local Supabase is up + the DEMO session is reset/seeded, and present a **preset-as-client** (or set the active preset to the brief's client) so the live event brand matches the deck.
4. **State the asset "live vs preview" limits (P1-E)** to whoever prepares the branded demo.

### Safe to park
Phase 10B runtime apply, per-brief live-session re-seed, CMS/AI/large content bank, Ambient mode, venue
self-service, production auth/analytics, hosted deploy, MP3/audio.

### Recommended next slices (in order)
1. **TV/audience-surface cleanup (P1-A + P1-B)** — small, safe front-end slice: suppress the script card + empty
   video on the public TV welcome, and hide the Presenter pill (or auto-audience) on `/tv` and `/play`. This is
   the single highest-value fix for demo credibility.
2. **Operator demo pre-flight checklist** — a one-click "Demo ready?" panel on `/operator` (Supabase up? session
   seeded? brief client = active preset? audience mode for guest devices?) to de-risk the live run.
3. (Only if approved) **Phase 10B** runtime apply of the tailored quiz — remains parked.
