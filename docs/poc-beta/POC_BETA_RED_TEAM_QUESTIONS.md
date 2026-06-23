# PPN POC — Beta Red-Team Audit (Harsh Persona Questions)

- **Date:** 2026-06-23
- **HEAD audited:** `fc6c731` (PPN, `fArGo1911/ppn`, working tree clean)
- **Commands run:** `npm run build` → exit 0; `npm run test:e2e` → **63 passed**; source audit (gate, moderation, join, runtime, asset upload); reviewed `COMPREHENSIVE_POC_BETA_AUDIT.md`.
- **Scope:** red-team / harsh-question audit only — no app changes.
- **Method:** for each question — can the POC answer it *today*, with *evidence*, **Yes / Partly / No**, severity, action.

---

## 1. Executive red-team summary

**Harsh verdict:** The POC is a **credible, operator-narrated *demo of the concept*** — not yet *evidence of a
business*. It answers **experiential** questions well (what the pub night feels like, how content tailors to a
venue, how a brewery's brand shows up, what engagement a sponsor could expect) and is **honest** about what's a
plan vs live. It **cannot** answer **commercial-proof** questions (measured ROI, pricing, unit economics, moat,
real multi-venue scale) — because those are pitch/strategy, not built — and it has real **operational fragility**
(phones can't reach `localhost`, single local-Supabase dependency, the `5173`/Kickoff mix-up) plus the known
**TV-welcome embarrassment**. For a *controlled, narrated* demo: **defensible (B−)**. Left to stand on its own,
unsupervised, or technically probed: **not ready (D)**.

### Top 10 confidence killers (what a sceptic exposes)
1. **TV welcome leaks internal content** — host-script card + empty "Brewery video" placeholder + "Presenter" pill on the audience screen. *Most likely live-demo embarrassment.*
2. **Phones can't reach `localhost`** — real guests can't join from their own phones without a LAN IP / tunnel / hosting. The demo "multi-device" story breaks outside one machine.
3. **No business model / pricing anywhere** — finance/CMO "what does it cost / who pays / ROI" has no in-app answer.
4. **Engagement is a *projection*, not *measurement*** — KPIs are honest seeded assumptions; there is no real measured campaign data yet.
5. **The "network" is a concept, not built** — multi-venue rollout is a deck; no real ops, no live multi-venue.
6. **Live event runs the seeded Northgate/The Anchor brand** regardless of the prepared client (Harbourline) — divergence unless you present a preset-as-client.
7. **Operator gate is `"demo"`, not real auth** — a curious player can unlock `/host`/`/config`.
8. **Content mix is a *plan*, not the live quiz** — must never be claimed as the running quiz.
9. **Picture/Video rounds are *labelled*, not real** — no real images/clips; preview-only.
10. **Local-Supabase single point of failure** — if it's down, host/TV/player degrade; plus the dangerous `5173`/Kickoff/Tippick environment mix-up.

### Top 10 already defensible
1. **Frictionless QR → join → team → play** is functional (the hard core works).
2. **TV *gameplay* states are excellent** — large, clean, distance-readable.
3. **Venue content tailoring** (8 categories incl. separate Music/Picture/Video) with a **credible seeded proposed-quiz preview**.
4. **Honest measurement framing** — no measured-sales/ROI claims; every rate has a denominator; estimates labelled.
5. **Brand re-skin per brewery** — 12 colour presets + manual/storage-backed asset upload + client-safe identity.
6. **Setup-mode flexibility** — phones-only / audio / TV+audio with compatibility warnings (no-TV/no-audio handled).
7. **Team-name moderation** — validated on entry, TV-safe via `safeDisplayName`.
8. **Host can run the night** — see teams/answers, start, advance, reveal & score, scoreboard, rename/remove, refresh-recovers.
9. **Server-authoritative scoring** — refresh/replay don't corrupt scores; one shared answer per team.
10. **Honest operator status** — staged-plan "preview only / default still active", brief↔preset mismatch warning.

### What would embarrass us most in a live demo
The **TV welcome screen** in front of a brewery buyer (host script + empty video panel + Presenter pill), and a
**guest trying to scan/join from their own phone and failing** because of `localhost`.

### What to park, not build now
Phase 10B runtime apply, real CMS / content approval workflow, AI generation, large content library, Ambient Venue
Screen Mode, venue self-service, production auth/RLS, real analytics, hosted deploy, business-model/pricing build.

---

## 2. Persona question matrix

> Legend — **A?** = answerable convincingly today (Y / Partly / No). **Sev** = severity if unanswered. **Fix?** = must fix before a *controlled* POC beta.

### 1. Brewery CMO / Marketing Director
| Question | POC answer / evidence | A? | Sev | Action | Fix? |
|---|---|---|---|---|---|
| Why fund this vs ads / Kahoot / a quiz company? | Wedge = brand *inside* the pub + venue-tailored sponsored night + measurable engagement (`/presentation`,`/capabilities`). Concept, not proof. | Partly | P1 | Sharpen the wedge narrative; don't over-claim | Know the limits |
| Where's the actual sponsor value? | Sponsor exposure map (phone/TV/host/report) + sponsored-round engagement (`/kpi`,`/report`). | Y | — | Demo as-is | No |
| Measurable or vanity? | Engagement projection, labelled estimates, no measured sales. **Projection, not measured.** | Partly | P1 | Frame as "what you'd receive after a pilot" | Know |
| What do I get after the event? | `/report` pilot format (PPN-measured vs venue-reported vs estimated). | Y | — | — | No |
| KPIs credible or made up? | Seeded assumptions, reconciled, denominators shown — honest but **assumed**. | Partly | P1 | Say "illustrative until a pilot" | Know |
| Replace Northgate with my brand without breaking? | 12 presets + asset upload + client-safe identity on client surfaces; **but live host/TV still show the seeded preset/session.** | Partly | P1 | Use preset-as-client / matching preset | Yes |
| Approve content before it goes live? | **No approval workflow.** Content mix is a *plan*; operator can override. | No | P2 | Park CMS/approval | Park |
| Control how much sponsor content appears? | Yes — sponsor slider + >15% warning. | Y | — | — | No |
| Brand look premium enough? | Presets/colours good; **TV welcome + preview-only slots undercut it.** | Partly | P1 | Fix TV welcome; upload real assets | Yes |

### 2. Brewery sales / trade marketing
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| How does this help pubs sell more / footfall? | `/presentation`,`/rollout` narrative + dwell proxy. Concept. | Partly | P1 | Know |
| What does the pub do / staff workload? | `/run-sheet` (what venue needs, before/during/after). Clear. | Y | — | No |
| Run across 10/50/100 pubs, even conceptually? | `/rollout` staged plan — **conceptual only**, no real ops. | Partly | P1 | Don't claim live scale | Know |
| No TV / no audio / no host fallback? | Setup modes handle it well (phones-only, audio-only, manual live). | Y | — | No |
| Target sports bars vs music pubs? | Content-mix presets + sliders — strong. | Y | — | No |
| Avoid becoming a manual agency service? | **Not answered** — currently host-dependent + manually prepared. | No | Parked | Park |

### 3. Pub / venue manager
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Why let this in / disruption / who runs it? | `/run-sheet` + setup modes; **a staff host is required** (no-host = Ambient/parked). | Partly | P1 | Know |
| Needs my TV/audio/Wi-Fi? | Optional TV/audio; **needs working Wi-Fi/signal + a way for phones to reach the app.** | Partly | P1 | Know (LAN/hosting) |
| Breaks mid-quiz / angry players? | Server-authoritative recovery on refresh; host reset/seed via `/config`. | Y | — | No |
| Offensive team name? | Moderated on entry + TV-safe display. | Y | — | No |
| Change content mix to fit my crowd? | Yes (operator-set today; venue self-service parked). | Partly | P2 | Park |
| Choose no video if no screen? | Yes — setup-mode compatibility warns/blocks. | Y | — | No |
| Run without a host? | **No** — needs staff host (Ambient mode is parked). | No | Parked | Park |
| Reward wording safe/practical? | Non-alcohol default, "ask staff", responsible note. | Y | — | No |

### 4. Quiz host
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Run whole night from console? Know next click? | Yes — phase-based primary action, gated `/host`. | Y | — | No |
| See who answered / repeat / rename-remove / recover on refresh? | Yes (answered count, replay, rename, lobby remove, server recovery). | Y | — | No |
| Pause? | **No explicit pause** in host UI (status `paused` exists in model, not surfaced). | Partly | P2 | Park/polish |
| Late joiners? | Lobby join works; mid-game join is edge. | Partly | P2 | Know |
| Tie-breaks? | Tiebreak *question kind* exists; **no distinct tie-break flow** in the host loop. | Partly | P2 | Park |
| Control the TV? | TV mirrors session state (no direct host "TV control" beyond phase). | Y | — | No |
| Host script leaking to audience? | **Yes — the TV welcome shows the script card.** | No | **P1** | **Yes** |
| Readable during a live event? | Yes. | Y | — | No |
| Reveal/scoreboard fails? | Server RPC; if Supabase down it fails. | Partly | P1 (ops) | Pre-flight |

### 5. Player / team member
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Join without explanation / right QR? | Clean splash "you're in the right place" + venue/event. | Y | — | No |
| Phone UI obvious / change team / submitted state? | Yes — large buttons, change-team, submitted/locked. | Y | — | No |
| Fast on mobile? | Yes (local); over real network depends on hosting. | Partly | P1 | Know |
| Confused by sponsor messages? | Suppressed in focus/gameplay states — good balance. | Y | — | No |
| See private/operator screens? | **"Presenter" pill visible** unless audience mode. | Partly | **P1** | Yes |
| Refresh / two answer / late join / lose connection? | Refresh recovers; one shared team answer (last-write-wins); lobby late-join; react-query reconnect. | Y/Partly | P2 | Mostly fine |

### 6. TV / audience viewer
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Looks like a pub TV or admin page? | **Welcome looks admin-ish** (script/video/pill); **gameplay looks great.** | Partly | **P1** | **Yes** |
| Text/QR big enough? | Yes — gameplay huge; QR large. | Y | — | No |
| "Presenter" pill / host script / empty media visible? | **Yes on welcome** (pill default-only; script + empty video even in audience mode). | No | **P1** | **Yes** |
| Looks good without real video/audio? | Images → gradient (OK); **video → empty "Brewery video" panel (bad).** | Partly | P1 | Yes (suppress) |
| Clean transitions lobby→…→winner? | Gameplay transitions clean; welcome is the weak link. | Partly | P1 | Yes |
| Embarrass us in front of a buyer? | **Yes, on the welcome state.** | No | **P1** | **Yes** |

### 7. Brand / content operator
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Upload logos/images? Where do they go? | Yes — gated `/config`: manual paths + storage-backed upload to **local** Supabase Storage. | Y | — | No |
| Which surfaces use uploaded assets? | Logo/hero/sponsor-slide go **live**; phone-card/lower-third/venue **preview-only**; video only if URL set. | Partly | P1 | Know |
| Brewery-branded quiz without coding? | Yes (preset + assets) for branding; **content/questions not author-able** (seeded pool only). | Partly | P2 | Park |
| Missing assets / fake placeholders public? | Images → gradient (OK); **empty "Brewery video" panel public (bad).** | Partly | P1 | Yes |
| Picture/Video rounds with real assets? | **No — labelled only**, no real images/clips. | No | P1 | Don't claim |
| Build a quiz from uploaded content? | **No** (no CMS). | No | Parked | Park |
| Content approval workflow? | **No.** | No | Parked | Park |
| Preview full branded experience? | Yes — `/setup`,`/config` previews + presentation. | Y | — | No |

### 8. PPN operator / presenter
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Exact demo script / first route / safest path? | `/operator` guided journey is closest; **no written runbook in-app.** | Partly | P1 | Write a 1-page runbook |
| Avoid showing operator controls to a buyer? | Audience mode hides the pill; **keep TV off the welcome state.** | Partly | P1 | Yes (TV welcome) |
| Reset the demo? | Yes — `/config` reset + seed. | Y | — | No |
| App opens Kickoff/Tippick on 5173? | **Real risk** — happened before; must verify PPN server. | Partly | P1 | Pre-flight check |
| Local Supabase down? | Host/TV/player degrade to fallback. | Partly | P1 | Pre-flight |
| Prepared client ≠ seeded live brand (Harbourline vs Northgate)? | Mismatch warning on `/operator`; **present a preset-as-client.** | Partly | P1 | Yes (process) |
| Recover quickly in the room? | Reset/seed + server recovery — yes. | Y | — | No |

### 9. Technical operator / support
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| What depends on local Supabase? | The whole live loop (sessions, teams, questions, answers, reveal RPC). | Y (known) | P1 | Pre-flight |
| What depends on localStorage? | operator-unlock, demo brief, staged plan, asset/theme/scenario overrides, audience mode, per-session team. | Y | P2 | Doc "clear cache" reset |
| Phones reach `localhost`? | **No** — needs LAN IP / tunnel / hosting for real multi-device. | No | **P1** | Yes (for multi-device) |
| Multiple browsers/devices join? | Yes *if* they can reach the host (LAN/hosted). | Partly | P1 | Yes |
| Logs that prove the game worked? | Supabase rows (teams/answers/scores). | Y | — | No |
| SPOF / dangerous env mix-up? | Local Supabase + single dev server SPOF; **`5173`/Kickoff/Tippick mix-up is real.** | — | P1 | Pre-flight |
| Fallback if QR fails? | Manual code (`DEMO`) shown on TV/player. | Y | — | No |

### 10. Legal / compliance / brand safety
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Alcohol rewards safely worded? | Non-alcohol default, 18+, "ask staff", responsible note. | Y | — | No |
| Collecting personal data / privacy text for names? | Player names stored in local DB (minimal PII); **no privacy notice text.** | Partly | P1 (beta) | Add notice before real beta |
| Underage considered? | "18+" wording present; no age gate. | Partly | P2 | Know |
| Sponsor/ROI claims truthful? | Yes — explicitly avoids measured-sales/ROI. | Y | — | No |
| Offensive names public / content injection? | Names moderated + TV-safe; asset upload operator-only. | Y | — | No |
| Uploaded assets moderated/approved? | **No approval workflow** (operator-trusted). | No | Parked | Park |
| Responsible-drinking message where needed? | Present in brand copy + report. | Y | — | No |

### 11. Finance / commercial decision-maker
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Business model / who pays / campaign cost / ROI? | **Not in the app at all.** Pitch/strategy, not built. | No | Parked | Park (strategy) |
| Proof we have? | The POC + seeded projection — demo, not proof. | Partly | P1 | Be honest |
| Hidden operational cost / cost to run 10 pubs / margins? | **Not modelled.** Host-dependent + manually prepared today. | No | Parked | Park |
| Scalable vs manually prepared? | Honestly **mostly manual today**; scale is conceptual. | No | Parked | Park |

### 12. Investor / sceptical founder
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Just a quiz app? | Differentiator = venue-tailored content + sponsor-in-venue network; **network is planned, not built.** | Partly | P1 | Be honest |
| Why can't Kahoot/quiz co. copy it? Moat? | **No moat yet** — concept-stage. | No | Parked | Park (strategy) |
| Network real yet / the wedge? | Wedge = pub-native sponsored night; network = aspiration. | Partly | P1 | Be honest |
| Smallest beta to validate demand? | This POC + 1–2 real pubs is exactly that. | Y | — | No |
| Top reasons it fails? | Host dependency, pub adoption, brewery willingness to pay, multi-device/hosting, content quality. | Y (honest) | — | No |

### 13. Competitor comparison / substitution
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Why not Kahoot / Crowdpurr / a normal host / QR polls? | PPN angle = **pub-native, sponsor-branded, venue-tailored, measurable on-trade** — but those tools already do **hosted multi-device + real media rounds**, which PPN only **previews**. | Partly | P1 | Be honest about gaps |
| What does PPN do that generic tools don't? | Venue content tailoring + brewery-network framing + brand-inside-pub story. | Partly | P1 | Lead with this |
| What do competitors do that PPN doesn't yet? | Real cloud multi-device join, real picture/video/audio rounds, content libraries, polished hosted product. | — (gap) | P1 | Know |

### 14. Abuse / failure-mode attacker
| Question | POC answer / evidence | A? | Sev | Fix? |
|---|---|---|---|---|
| Spam joins / flood the host? | **No rate limits.** Fine at demo scale; abuse-prone for open beta. | No | Parked | Park |
| Offensive names? | Moderated on entry + TV-safe. | Y | — | No |
| Hijack the TV? | TV is read-only (mirrors session); can't be driven by a guest. | Y | — | No |
| Open operator routes? | Gate is **`"demo"`, not real auth** — a curious user can unlock. | Partly | P1 | Don't claim "secure" |
| Submit multiple answers / break scoring by refresh? | One shared answer per team (upsert); scoring is server-authoritative — **safe.** | Y | — | No |
| Join from outside the venue? | `DEMO` token is guessable; anyone with the URL can join. POC. | Partly | Parked | Park |
| See another team's answer? | **No** — only own team's answer is readable. | Y | — | No |
| Bad asset upload breaks the screen? | Upload is operator-only; images degrade gracefully. | Y | — | No |

---

## 3. "Cannot answer convincingly today" (No / weak Partly)
- Business model, pricing, unit economics, cost-to-run-10-pubs, margins, ROI proof (finance/CMO/investor).
- Moat / why-not-Kahoot-defensibly / network-is-real (investor/competitor).
- Real multi-venue scale and "not a manual agency service" (sales/finance).
- **Guests joining from their own phones** (technical — `localhost`).
- Content approval workflow / author-a-quiz / real picture-video rounds / CMS (brand/content).
- "Run without a host" (pub manager — that's Ambient, parked).
- "Is it secure?" (gate is demo-only).

## 4. "Can answer well today" (with evidence)
- QR → join → team → answer → reveal → scoreboard (functional core; `/host`,`/play`,`/tv` + Supabase).
- Venue content tailoring + credible proposed-quiz preview (8 categories; `/operator/setup-wizard`).
- Honest engagement projection, no measured-sales claims (`/kpi`,`/report`).
- Brand re-skin per brewery + client-safe identity (`/presentation`, 12 presets, `/config` upload).
- Setup-mode flexibility incl. no-TV/no-audio (compatibility warnings).
- Team-name moderation + TV-safe display.
- Operator honesty (staged-plan preview-only, mismatch warning, reset/seed recovery).

## 5. "Do NOT claim" in a demo
- ❌ "We **measure** footfall / bar sales / ROI." (It's a projection.)
- ❌ "The **tailored quiz is live** / the content mix is running the event." (It's a *plan*; the live event is the seeded quiz.)
- ❌ "Runs across **100 pubs** today" / "a live **network**." (Conceptual.)
- ❌ "**No host** needed." (That's Ambient mode — parked.)
- ❌ "Real **picture/video rounds**." (Labelled/preview only.)
- ❌ "It's **secure** / has auth." (Gate is `"demo"`.)
- ❌ "Guests just **scan and join** on their phones." (Needs LAN/hosting; not on `localhost`.)
- ❌ "Your brand flows everywhere automatically." (Live host/TV use the seeded preset/session.)

## 6. SAFE claims
- ✅ "Scan a QR, join a team, play on your phone — **no app, no login**." (works)
- ✅ "The quiz **content profile can be tuned to the venue** — here's the proposed quiz it produces." (preview)
- ✅ "The brewery gets **branded exposure across the night and an engagement report** — we don't claim measured bar sales."
- ✅ "It runs **with or without a TV/audio** — phones carry the game."
- ✅ "Team names are **moderated**; the TV stays clean of bad input."
- ✅ "This is a **controlled POC**; a live pilot replaces these assumptions with real data."
- ✅ "Each brewery gets **its own colours/brand**; the client-facing surfaces never show another brewery."

## 7. Must-fix before showing anyone (genuinely necessary)
- **P1 — TV welcome/intro cleanup:** hide the host-script card + suppress the empty "Brewery video" panel on the public TV; hide the "Presenter" pill on `/tv` and `/play` (or auto-audience).
- **P1 — Multi-device join path:** if any real guest phone joins, serve PPN on a **LAN IP / tunnel / host** (not `localhost`), or restrict the demo to operator-driven single-machine.
- **P1 — Operator pre-flight (process, not code):** confirm PPN (not Kickoff) on `5173`, Supabase up + session seeded, present a **preset-as-client**, enable audience mode on guest devices.

## 8. Nice-to-fix polish (P2)
- `/operator` + `/config` density; host pause/tie-break/late-join affordances; privacy-notice text for player names (becomes P1 for real beta); `paused` status surfaced in host UI.

## 9. Parked future work
Phase 10B runtime apply; content approval workflow / CMS / quiz authoring; real picture/video/audio assets; AI
generation; Ambient Venue Screen Mode (no-host); venue self-service; production auth/RLS; rate-limiting/abuse
hardening; hosted deploy + cloud multi-device; real analytics; business-model/pricing build.

## 10. Recommended next 1–3 slices (lean, POC-focused)
1. **TV/audience-surface cleanup (P1)** — suppress host-script + empty-video on the public TV welcome; hide the Presenter pill on `/tv`+`/play` (or auto-audience). Highest-value credibility fix; small and safe.
2. **Operator demo runbook + pre-flight panel** — a 1-page in-repo demo script **and** an `/operator` "Demo ready?" checklist (PPN-on-5173? Supabase up? session seeded? brief client = active preset? audience mode on guest devices? join URL is a LAN IP not localhost?). De-risks the room.
3. *(Only if a real guest-phone demo is needed)* **LAN/tunnel join doc** — document serving PPN on a LAN IP / quick tunnel so phones can scan-and-join. (Not Phase 10B.)

---

### Final note
For a **controlled, operator-narrated POC demo**: defensible with the P1 process/UI fixes above. For an
**unsupervised, technically-probed, or commercially-interrogated** audience: **not yet** — and the gaps there are
mostly *strategy/business* (pricing, moat, scale) and *product depth* (real media, hosting, no-host), which should
stay **parked**, not crammed into the POC.
