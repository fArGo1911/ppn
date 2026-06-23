# PPN POC — Beta Red-Team **Question Matrix** (full persona-by-persona)

- **Date:** 2026-06-23
- **HEAD audited:** `8b02516` (PPN, `fArGo1911/ppn`, working tree clean). App code is **identical** to the prior red-team HEAD `fc6c731` — the only commit between them is the docs commit itself, so all source claims below still hold.
- **Validation run:** `npm run build` → **exit 0**; `npm run test:e2e` → **63 passed**.
- **Evidence re-verified in source (not just trusted from the prior audit):**
  - `src/pages/Tv.tsx:260-269` — default **welcome** state renders `VideoSlot(clientVideoUrl("intro"))` + `AiAnnouncementSlot("eventIntro")` with **no audience/empty guard**.
  - `src/lib/clientFacingDemo.ts:103-111` — `clientVideoUrl("intro")` returns `undefined` unless an asset-pack URL is set → empty by default.
  - `src/components/VideoSlot.tsx:49,43` — `if (!url || errored) return Fallback` → the visible **"▶ Brewery video"** panel.
  - `src/components/PresenterTools.tsx:46-65` — **"Presenter"** pill renders on every route in default mode; hidden **only** in audience mode.
  - `src/lib/operator.ts:11` — operator gate code = `"demo"`, "**NOT production authentication**", localStorage-only.
  - `src/lib/moderation.ts` — `validateTeamName` / `validatePlayerName` / `safeDisplayName` (real, TV-safe).
- **Companion docs:** executive view + lists in [`POC_BETA_RED_TEAM_QUESTIONS.md`](POC_BETA_RED_TEAM_QUESTIONS.md); readiness grades in [`COMPREHENSIVE_POC_BETA_AUDIT.md`](COMPREHENSIVE_POC_BETA_AUDIT.md).

> **This is the full matrix — one row per harsh question, personas not collapsed.** Columns:
> **Why** = why the persona asks · **POC answer + evidence** · **A?** = answerable convincingly today (Y / Partly / No) ·
> **Impact** = controlled-POC severity (P0 / P1 / P2 / Parked) · **Fix?** = must fix before showing anyone (Yes / No / Know = narrate the caveat) · **When** = Immediate / Parked.

---

## Persona grade table (harsh)

| # | Persona | Grade | Score /5 | Satisfy controlled POC? | Top risk | Must-fix before demo |
|---|---|---|---|---|---|---|
| 1 | Brewery CMO / Marketing Director | **B−** | 3 | Partly | KPIs are a *projection*, not measured | Brand divergence + TV welcome |
| 2 | Brewery sales / trade marketing | **C+** | 3 | Partly | Reads as a manual agency service at scale | None blocking (narrate scale) |
| 3 | Pub / venue manager | **B−** | 3 | Partly | Needs a host; phones can't reach localhost | LAN/host join path (if guest phones) |
| 4 | Quiz host | **B−** | 3 | Partly | Host script leaks onto the public TV | TV welcome host-script (P1-A) |
| 5 | Player / team member | **B−** | 3 | Partly | "Presenter" pill + localhost join | Pill/audience + LAN join |
| 6 | TV / audience viewer | **C** | 2 | **No (welcome)** | Welcome looks like an admin page | **TV welcome cleanup (P1-A)** |
| 7 | Brand / content operator | **C+** | 3 | Partly | Preview-only slots; no real media rounds | Know live-vs-preview; don't claim asset rounds |
| 8 | PPN operator / presenter | **B−** | 3 | Partly | 5173/Kickoff + Supabase + brand mismatch | Pre-flight + 1-page runbook |
| 9 | Technical operator / support | **C+** | 3 | Partly | localhost + single-Supabase SPOF | LAN/tunnel + pre-flight |
| 10 | Legal / compliance / brand safety | **B−** | 3 | Partly | No privacy notice for player names | Privacy line (P1 for real beta; narrate for POC) |
| 11 | Finance / commercial | **D** | 1 | No | No business model anywhere in app | None — Parked (strategy) |
| 12 | Investor / sceptical founder | **C** | 2 | Partly (honesty only) | No moat; network is a concept | None — Parked (strategy) |
| 13 | Competitor / substitution | **C+** | 3 | Partly | Rivals already do hosted + real media | Be honest about the gaps |
| 14 | Abuse / failure-mode attacker | **C+** | 3 | Partly | No rate limits; gate is `"demo"` | Don't claim "secure" |

**Overall controlled-POC grade: B− (3.5)** — defensible *only* operator-narrated, with the 3 P1 fixes. Average persona score ≈ 2.6 reflects the harsh, unsupervised-probe view.

---

## 1. Brewery CMO / Marketing Director — **B−**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Why fund this vs ads / Kahoot / Crowdpurr / a quiz company? | Defends budget against cheaper, proven options | Wedge = brand *inside* the pub + venue-tailored sponsored night + engagement report (`/presentation`, `/capabilities`). Concept, not proof. | Partly | P1 | Know | Immediate |
| Where is the actual sponsor value? | Needs concrete brand exposure, not vibes | Sponsor-exposure map (phone/TV/host/report) + sponsored-round engagement (`/kpi`, `/report`). | Y | — | No | — |
| Is this measurable or a vanity engagement demo? | Must report numbers internally | Engagement projection with denominators; **no measured sales/ROI**. Honest but **assumed**. | Partly | P1 | Know | Immediate |
| What do I get after the event? | Wants a tangible deliverable | `/report` pilot format: PPN-measured vs venue-reported vs estimated. | Y | — | No | — |
| Does the report justify spend internally? | Needs a board-credible artefact | Report exists on-screen; **no PDF/export**; numbers are seeded. | Partly | P2 | Know | Immediate |
| Are the KPIs credible or made up? | Sniffs out invented metrics | Seeded assumptions, reconciled, denominators shown — honest but **illustrative**. | Partly | P1 | Know | Immediate |
| Can I compare venues? | Multi-venue planning | Single seeded scenario; **no real cross-venue comparison**. | No | Parked | Park | Parked |
| Reach / engagement / completions / sponsor interactions? | Standard campaign metrics | Present as projection in `/kpi`/`/report`; not live-measured. | Partly | P1 | Know | Immediate |
| Are alcohol / reward claims safe? | Brand/legal exposure | Non-alcohol default, 18+, "ask staff", responsible note. | Y | — | No | — |
| Does the brand look premium enough? | Won't ship a cheap-looking activation | Presets/colours good; **TV welcome + preview-only slots undercut it**. | Partly | **P1** | **Yes** | Immediate |
| Replace Northgate with my brand without breaking? | Wants their own brand on screen | 12 presets + asset upload + client-safe identity on client surfaces; **live host/TV still show the seeded preset/session**. | Partly | **P1** | **Yes** | Immediate |
| Can I approve content before it goes live? | Brand governance | **No approval workflow**; content mix is a *plan*; operator can override. | No | Parked | Park | Parked |
| Can I control how much sponsor content appears? | Avoids over-branding the night | Sponsor slider + >15% over-exposure warning. | Y | — | No | — |
| What if the quiz content is poor / off-brand? | Reputation risk | Seeded pool is curated; **no per-brief authoring/approval** to fix it. | Partly | P2 | Know | Parked |

## 2. Brewery sales / trade marketing — **C+**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| How does this drive footfall / sell more? | Trade pitch must move volume | `/presentation`, `/rollout` narrative + dwell proxy. Concept. | Partly | P1 | Know | Immediate |
| What's the pitch to the pub / what does the pub do? | Needs a repeatable sell-in | `/run-sheet`: what the venue needs, before/during/after. Clear. | Y | — | No | — |
| How much staff work is involved? | Pub won't adopt a burden | Setup modes + run-sheet; **a staff host is required**. | Partly | P1 | Know | Immediate |
| Run across 10 / 50 / 100 pubs, even conceptually? | Scale = the whole business case | `/rollout` staged plan — **conceptual only**, no real ops. | Partly | P1 | Know | Immediate |
| What's the setup burden / "small / medium / large"? | Operational sizing | Setup modes (phones-only / audio / TV+audio) with compatibility warnings. | Y | — | No | — |
| Venue readiness checklist? | De-risk the rollout | `/run-sheet` + setup compatibility. | Y | — | No | — |
| How does this avoid becoming a manual agency service? | Margin / scalability fear | **Not answered** — host-dependent + manually prepared today. | No | Parked | Park | Parked |
| No TV / no audio / bad Wi-Fi / no host? | Real-venue messiness | Setup modes handle no-TV/no-audio; **no-host = parked**; **Wi-Fi/phone-reach is a hard dependency**. | Partly | P1 | Know | Immediate |
| Target sports bars vs music pubs? | Tailoring to venue type | Content-mix presets + sliders — strong. | Y | — | No | — |

## 3. Pub / venue manager — **B−**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Why let this into my venue / disruption? | Protects the room and staff | `/run-sheet` + setup modes; **a staff host is required**. | Partly | P1 | Know | Immediate |
| Needs my TV / audio / Wi-Fi? | Hardware reality | TV/audio optional; **needs working Wi-Fi + a way for phones to reach the app**. | Partly | P1 | Know | Immediate |
| Who runs it? | Staffing | Host-driven (`/host`); no-host (Ambient) is parked. | Partly | P1 | Know | Immediate |
| What if it breaks mid-quiz? | Live-night fear | Server-authoritative recovery on refresh; `/config` reset/seed. | Y | — | No | — |
| Who handles angry players / offensive name? | Crowd control | Names moderated on entry + TV-safe `safeDisplayName`. | Y | — | No | — |
| Change the content mix to fit my crowd? | Local fit | Yes (operator-set today; venue self-service parked). | Partly | P2 | Park | Parked |
| Choose no video if I have no screen? | Hardware-limited | Setup-mode compatibility warns/blocks. | Y | — | No | — |
| Run this without a host? | Wants zero-staff option | **No** — needs staff host (Ambient is parked). | No | Parked | Park | Parked |
| What do I get in return? | Commercial incentive | Footfall/engagement story (`/run-sheet`/`/presentation`); **not measured**. | Partly | P1 | Know | Immediate |
| Reward wording practical / legal if alcohol? | Licensing risk | Non-alcohol default, 18+, "ask staff", responsible note. | Y | — | No | — |
| Will customers understand how to join? | Adoption at the table | Clean QR + "you're in the right place" splash + manual `DEMO` code fallback. | Y | — | No | — |

## 4. Quiz host — **B−**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Run the whole night from the console? Know next click? | Must not freeze on stage | Yes — phase-based primary action, gated `/host`. | Y | — | No | — |
| See who answered? | Pacing the room | Answered-count per question. | Y | — | No | — |
| Repeat a question? | Recovery | Replay re-points the same question; never resets answers. | Y | — | No | — |
| Rename / remove teams? | Housekeeping | Rename + lobby remove. | Y | — | No | — |
| Recover after refresh? | Tech panic | Server-authoritative state recovers. | Y | — | No | — |
| Pause? | Real-night interruptions | **No explicit pause** surfaced (`paused` exists in model, not in host UI). | Partly | P2 | Know | Parked |
| Handle late joiners? | Stragglers | Lobby join works; mid-game join is an edge case. | Partly | P2 | Know | Immediate |
| Handle tie-breaks? | Deciding a winner | Tiebreak question *kind* exists; **no distinct tie-break flow**. | Partly | P2 | Park | Parked |
| Control the TV? | Drive the room screen | TV mirrors session phase (no direct "TV control" beyond phase). | Y | — | No | — |
| Does the host script live in the right place, or leak to the TV? | Embarrassment risk | **It leaks** — the public TV welcome shows the host-script card. | No | **P1** | **Yes** | Immediate |
| Readable during a real event? | Stage usability | Yes. | Y | — | No | — |
| What if reveal / scoreboard fails? | Live failure | Server RPC; **fails if Supabase is down** → pre-flight. | Partly | P1 | Know | Immediate |

## 5. Player / team member — **B−**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Join without explanation? | Zero patience at a pub | Clean splash + venue/event; QR or manual `DEMO` code. | Y | — | No | — |
| Did I scan the right QR? | Reassurance | "You're in the right place" + venue name. | Y | — | No | — |
| Is the phone UI obvious? | Usability | Large buttons, change-team, submitted/locked states. | Y | — | No | — |
| Change teams if I mis-tap? | Error recovery | Yes — change-team. | Y | — | No | — |
| See whether my answer submitted? | Anxiety | Submitted/locked state shown. | Y | — | No | — |
| Fast enough on mobile? | Patience | Yes locally; **over real network depends on hosting**. | Partly | P1 | Know | Immediate |
| Confused by sponsor messages? | Annoyance | Sponsor suppressed in focus/gameplay states. | Y | — | No | — |
| Can I see operator/private screens? | Shouldn't | **"Presenter" pill is visible** unless audience mode; opens an operator jump-menu (`/config`,`/host` still gated). | Partly | **P1** | **Yes** | Immediate |
| Refresh? | Phone reality | Recovers (server-authoritative). | Y | — | No | — |
| Two people on a team both answer? | Double-submit | One shared team answer (upsert, last-write-wins). | Y | — | No | — |
| Join late? | Latecomers | Lobby late-join works; mid-game is edge. | Partly | P2 | Know | Immediate |
| Lose connection? | Flaky pub Wi-Fi | react-query reconnect recovers. | Partly | P2 | Know | Immediate |

## 6. TV / audience viewer — **C** (gameplay A / welcome C)

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Real pub TV or an admin/demo page? | First impression in the room | **Welcome looks admin-ish** (script + empty video + pill); **gameplay looks great**. | Partly | **P1** | **Yes** | Immediate |
| Text big enough across the room? | Distance readability | Yes — gameplay huge. | Y | — | No | — |
| QR big enough? | Join from a table | Yes — QR is large. | Y | — | No | — |
| Is the "Presenter" pill visible? | Looks unfinished | **Yes on welcome** (default mode). | No | **P1** | **Yes** | Immediate |
| Is host/internal script visible? | Breaks the illusion | **Yes** — `AiAnnouncementSlot("eventIntro")` on welcome. | No | **P1** | **Yes** | Immediate |
| Fake / empty media blocks visible? | Cheap-looking | **Yes** — empty "▶ Brewery video" panel when no clip set (`VideoSlot` fallback). | No | **P1** | **Yes** | Immediate |
| Good without real video/audio assets? | Most demos lack assets | Images → brand gradient (OK); **video → empty panel (bad)**. | Partly | P1 | Yes | Immediate |
| Clearly tells guests what to do? | Conversion to join | Yes on welcome (QR + code), once the clutter is removed. | Partly | P1 | Yes | Immediate |
| Clean transitions lobby→…→winner? | Polish | Gameplay transitions clean; **welcome is the weak link**. | Partly | P1 | Yes | Immediate |
| Sponsor branding polished or cheap? | Buyer-facing | Colours/slides good; empty video panel cheapens it. | Partly | P1 | Yes | Immediate |
| Would this embarrass us in front of a buyer? | The whole point | **Yes — on the welcome state.** | No | **P1** | **Yes** | Immediate |

## 7. Brand / content operator — **C+**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Upload logos / images? | Brand prep | Yes — gated `/config`: manual paths + storage-backed upload (local Supabase Storage). | Y | — | No | — |
| Where do uploaded files go? | Trust / control | Local PPN Supabase Storage + registry; "Apply this pack". | Y | — | No | — |
| Which surfaces actually use uploaded assets? | Avoid false promises | Logo/hero/sponsor-slide go **live**; **phone-card/lower-third/venue = preview-only**; video only if URL set. | Partly | P1 | Know | Immediate |
| Brewery-branded quiz without coding? | Self-serve hope | Branding yes (preset + assets); **questions not author-able** (seeded pool only). | Partly | P2 | Park | Parked |
| Replace logo / hero / sponsor slide / lower-third / phone card / venue visual? | Full reskin | Logo/hero/sponsor-slide live; **lower-third/phone-card/venue preview-only**. | Partly | P1 | Know | Immediate |
| What happens when assets are missing? | Failure look | Images → brand gradient (OK); **video → empty "▶ Brewery video" panel (bad)**. | Partly | P1 | Yes | Immediate |
| Does the app show fake placeholders publicly? | Brand safety | **Yes** — the empty video panel on the public TV. | No | P1 | Yes | Immediate |
| Preview the full branded experience before demoing? | Rehearsal | Yes — `/setup`, `/config` previews + `/presentation`. | Y | — | No | — |
| Picture / video rounds with real assets, or only labelled? | Core feature claim | **Labelled/preview only** — no real images/clips driving rounds. | No | P1 | Don't claim | Parked |
| Build a quiz from uploaded content? | CMS expectation | **No** (no CMS). | No | Parked | Park | Parked |
| Content approval workflow? | Governance | **No.** | No | Parked | Park | Parked |
| What can I realistically promise today? | Honesty | Branded reskin + proposed-quiz preview + live seeded gameplay loop. | Y | — | No | — |

## 8. PPN operator / presenter — **B−**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Exact demo script / first route / safest path? | Must not fumble live | `/operator` guided journey is closest; **no written runbook in-app**. | Partly | P1 | Yes (write runbook) | Immediate |
| How do I avoid showing operator controls to a buyer? | Credibility | Audience mode hides the pill; **keep TV off the welcome state**. | Partly | P1 | Yes | Immediate |
| Launch audience-safe TV/player views? | Clean surfaces | Audience mode + direct `/tv`, `/play`. | Partly | P1 | Yes | Immediate |
| Reset the demo? | Between runs | `/config` reset + seed. | Y | — | No | — |
| What if the app opens Kickoff/Tippick on 5173? | Has happened before | **Real risk** — must verify the PPN server. | Partly | P1 | Yes (pre-flight) | Immediate |
| What if local Supabase is down? | Live loop dies | Host/TV/player degrade to fallback. | Partly | P1 | Yes (pre-flight) | Immediate |
| Prepared client ≠ seeded live brand (Harbourline vs Northgate)? | On-screen mismatch | `/operator` mismatch warning; **present a preset-as-client**. | Partly | P1 | Yes (process) | Immediate |
| What should I avoid clicking? | Self-sabotage | Avoid the TV welcome state in front of a buyer; avoid wrong preset. | Partly | P1 | Yes (runbook) | Immediate |
| Recover quickly in the room? | Live failure | Reset/seed + server recovery. | Y | — | No | — |

## 9. Technical operator / support — **C+**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| What depends on local Supabase? | SPOF mapping | The whole live loop (sessions/teams/questions/answers/reveal RPC). | Y | P1 | Know (pre-flight) | Immediate |
| What depends on localStorage? | Dirty-cache failures | operator-unlock, demo brief, staged plan, asset/theme/scenario overrides, audience mode, per-session team. | Y | P2 | Know (doc "clear cache" reset) | Immediate |
| What if the browser cache is dirty? | Stale state | Clear localStorage / reset demo. | Partly | P2 | Know | Immediate |
| Reset procedure? | Repeatable runs | `/config` reset + seed. | Y | — | No | — |
| Multiple browsers / devices join? | Multi-device demo | Yes **if** they can reach the host (LAN/hosted). | Partly | P1 | Yes | Immediate |
| Can phones reach `localhost`? | The killer question | **No** — needs LAN IP / tunnel / hosting. | No | **P1** | **Yes** | Immediate |
| What needs LAN IP / tunnel / hosting? | Setup planning | Any real guest-phone join. | No | P1 | Yes | Immediate |
| What logs prove the game worked? | Evidence | Supabase rows (teams/answers/scores). | Y | — | No | — |
| Known failure modes? | Runbook | Supabase down, localhost join, dirty cache, 5173/Kickoff mix-up. | Y | P1 | Know | Immediate |
| Minimum hardware setup? | Provisioning | One host machine + screen + phones + Wi-Fi + reachable host URL. | Partly | P1 | Know | Immediate |
| Fallback if QR fails? | Resilience | Manual `DEMO` code shown on TV/player. | Y | — | No | — |
| Single point of failure / dangerous env mix-up with Kickoff/Tippick? | The big one | Local Supabase + single dev server SPOF; **5173/Kickoff/Tippick mix-up is real**. | Partly | P1 | Yes (pre-flight) | Immediate |

## 10. Legal / compliance / brand safety — **B−**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Alcohol rewards safely worded? | Licensing | Non-alcohol default, 18+, "ask staff", responsible note. | Y | — | No | — |
| Are we collecting personal data? | GDPR | Player names in local DB (minimal PII). | Partly | P1 (real beta) | Know | Immediate |
| Privacy text for player names? | Notice requirement | **No privacy notice text.** | No | P1 (real beta) | Yes (before real beta) | Immediate |
| Underage participants considered? | Age safety | "18+" wording present; **no age gate**. | Partly | P2 | Know | Immediate |
| Sponsor / ROI claims truthful? | Misrepresentation | **Yes** — explicitly avoids measured-sales/ROI. | Y | — | No | — |
| Can offensive names appear publicly? | Brand safety | Moderated on entry + TV-safe display. | Y | — | No | — |
| Can someone inject bad content? | Abuse | Names moderated; asset upload operator-only. | Y | — | No | — |
| Uploaded assets moderated / approved? | Governance | **No approval workflow** (operator-trusted). | No | Parked | Park | Parked |
| Responsible-drinking message where needed? | Compliance | Present in brand copy + report. | Y | — | No | — |

## 11. Finance / commercial decision-maker — **D**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| What is the business model? | Go/no-go | **Not in the app.** Pitch/strategy, not built. | No | Parked | Park (strategy) | Parked |
| Who pays — brewery or venue? | Revenue source | Not modelled. | No | Parked | Park | Parked |
| What does a campaign cost? | Pricing | Not modelled. | No | Parked | Park | Parked |
| ROI hypothesis / what proof? | Investment case | POC + seeded projection — **demo, not proof**. | Partly | P1 | Be honest | Immediate |
| Hidden operational cost / cost to run 10 pubs? | Unit economics | Not modelled; host-dependent + manually prepared. | No | Parked | Park | Parked |
| Repeatable margins / scalable vs manual? | Scalability | **Mostly manual today**; scale is conceptual. | No | Parked | Park | Parked |
| Does this need human hosts everywhere? | Cost driver | **Yes today** (Ambient/no-host is parked). | No | Parked | Be honest | Parked |
| Agency-service business? | Margin fear | Risk acknowledged; not resolved. | No | Parked | Park | Parked |

## 12. Investor / sceptical founder — **C**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Is this just a quiz app? | Differentiation | Differentiator = venue-tailored content + sponsor-in-venue network; **network is planned, not built**. | Partly | P1 | Be honest | Immediate |
| Why can't Kahoot / a quiz co. copy it? Moat? | Defensibility | **No moat yet** — concept-stage. | No | Parked | Park (strategy) | Parked |
| Is the network idea real yet / the wedge? | Thesis | Wedge = pub-native sponsored night; network = aspiration. | Partly | P1 | Be honest | Immediate |
| What evidence proves pubs want it / breweries pay? | Demand validation | **None yet** — that's what the pilot is for. | No | P1 | Be honest | Immediate |
| Smallest beta to validate demand? | De-risk | This POC + 1–2 real pubs is exactly that. | Y | — | No | — |
| What must be true for this to be a business? | Risk map | Pub adoption, brewery willingness to pay, host model, hosting/multi-device, content quality. | Y | — | No | — |
| Top reasons this fails? | Pre-mortem | Host dependency, adoption, willingness-to-pay, multi-device/hosting, content quality. | Y | — | No | — |

## 13. Competitor comparison / substitution — **C+**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Why not Kahoot / Crowdpurr / Mentimeter? | Cheaper, hosted, proven | PPN angle = pub-native, sponsor-branded, venue-tailored, on-trade measurable — but those tools already do **hosted multi-device + real media rounds**, which PPN only **previews**. | Partly | P1 | Be honest | Immediate |
| Why not a normal quiz host / agency? | Human alternative | PPN adds brand-in-venue + tailoring + report; **still host-dependent today**. | Partly | P1 | Be honest | Immediate |
| Why not screens with QR polls? | Lowest-effort rival | PPN is a full game loop + sponsor story, not a single poll. | Y | — | No | — |
| What does PPN do that generic tools don't? | The wedge | Venue content tailoring + brewery-network framing + brand-inside-pub story. | Partly | P1 | Lead with this | Immediate |
| What does PPN *not* do that rivals already do? | Gap honesty | Real cloud multi-device join, real picture/video/audio rounds, content libraries, polished hosted product. | No (gap) | P1 | Know | Immediate |
| What's genuinely differentiated *today* vs only planned? | BS detector | Today: venue tailoring + brand reskin + honest engagement story. Planned: network, hosting, real media, CMS. | Partly | P1 | Be honest | Immediate |

## 14. Abuse / failure-mode attacker — **C+**

| Harsh question | Why they ask | POC answer + evidence | A? | Impact | Fix? | When |
|---|---|---|---|---|---|---|
| Can I spam joins / flood the host? | DoS | **No rate limits.** Fine at demo scale; abuse-prone for open beta. | No | Parked | Park | Parked |
| Can I create offensive names? | Brand damage | Moderated on entry + TV-safe display. | Y | — | No | — |
| Can I hijack the TV? | Disruption | TV is read-only (mirrors session); a guest can't drive it. | Y | — | No | — |
| Can I open operator routes? | Privilege | Gate is **`"demo"`, not real auth** — a curious user can unlock `/host`/`/config`. | Partly | P1 | Don't claim "secure" | Immediate |
| Can I submit multiple answers? | Score abuse | One shared team answer (upsert); server-authoritative — **safe**. | Y | — | No | — |
| Can I break scoring by refreshing? | Corruption | Server recomputes from answers — **safe**. | Y | — | No | — |
| Can I join from outside the venue? | Boundary | `DEMO` token is guessable; anyone with the URL can join. POC-acceptable. | Partly | Parked | Park | Parked |
| Can I see another team's answer? | Leak | **No** — only own team's answer is readable. | Y | — | No | — |
| Can a bad asset upload break the screen? | Resilience | Upload is operator-only; images degrade to gradient. | Y | — | No | — |

---

## Roll-up: counts

- **Personas red-teamed:** 14
- **Harsh questions graded:** ~140 (see rows above)
- **Yes (answerable convincingly today):** the functional core, moderation, honesty framing, setup flexibility, host loop, report/KPI concept.
- **Partly (only with operator narration/caveat):** wedge/value, KPI-as-projection, scale, brand divergence, host failure-on-Supabase-down, late-join, live-vs-preview assets, operator pre-flight, multi-device-if-hosted, privacy, competitor gaps.
- **No (cannot answer convincingly today):** TV welcome credibility, phones-on-localhost, business model/pricing/margins, moat, content approval/CMS/real media rounds, no-host mode, demand proof, "is it secure".
- **Immediate P1 fixes:** TV welcome cleanup (P1-A), Presenter pill on `/tv`+`/play` (P1-B), operator pre-flight + LAN join + runbook (P1-C/D).
- **Parked (strategy/product, do NOT build now):** Phase 10B runtime apply, CMS/approval/authoring, real picture/video/audio, AI generation, Ambient no-host mode, venue self-service, production auth/RLS, rate-limiting, hosted deploy + cloud multi-device, analytics, pricing/ROI/business model, multi-venue ops.
