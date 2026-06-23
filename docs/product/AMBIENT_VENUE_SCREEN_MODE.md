# Ambient Venue Screen Mode

> **Status: BACKBURNER / future concept — do NOT build now.** This is a parked product concept captured for
> reference. It is not part of the current POC and has no code, routes, schema, or UI. See
> [§7 Relationship to current roadmap](#7-relationship-to-current-roadmap).

## 1. Concept summary

**Ambient Venue Screen Mode** is an always-on pub/venue screen mode where guests can scan a QR code and start or
join short branded games from their phone — **without a scheduled, host-led quiz night**.

A screen in a pub or sports bar runs a branded PPN "ambient" loop showing a QR code. A guest scans it, interacts
with the screen from their own phone (no app install), and starts or joins a short game or challenge. There is no
host driving the event — the screen and the guests' phones carry it.

## 2. Why it matters

This is a bigger **engagement-network** idea, not just quiz software:

- **Venue screens become sponsor / engagement inventory** — a brand surface that works even when nothing is
  "scheduled".
- **The QR code is the no-install entry point** — zero friction, the same join primitive the hosted POC already
  proves.
- **Guests can interact during quiet/dead time** — quiet weeknights, pre-match, half-time, waiting for food,
  between rounds.
- **Breweries / sponsors get repeatable engagement** across many venues, not just one quiz night.
- **PPN can measure engagement signals** — scans, joins, completions, repeat plays, sponsor interactions.
- It **strengthens the "engagement network" positioning** beyond hosted quiz nights — recurring, always-on,
  measurable on-trade engagement.

## 3. Difference from current product modes

Keep these clearly separate so the product story doesn't blur:

| Mode | Name | What it is | Status |
|---|---|---|---|
| **Mode 1** | **Hosted Event** | Host-led quiz night, driven from `/host`, with TV (`/tv`) + player (`/play`) surfaces. A human host controls start/reveal/next. | **Current** (functional core) |
| **Mode 2** | **Operator Demo / Client Presentation** | The POC sales journey: internal setup (`/operator`, `/operator/setup-wizard`, `/config`, `/setup`) and the client-facing showcase (`/presentation`, `/kpi`, `/report`, `/rollout`, `/run-sheet`). | **Current** (POC) |
| **Mode 3** | **Ambient Venue Screen Mode** | Always-on screen with a QR, guests self-start/join short games, **no host required**. | **Backburner** (this doc) |
| **Mode 4** | **Campaign Network Mode** | Breweries activate across many venues and compare engagement by venue type, content profile and campaign. | **Future** |

Ambient mode (Mode 3) is the bridge between a single hosted event (Mode 1) and a measurable multi-venue campaign
network (Mode 4): it makes engagement **continuous and unsupervised**, which is what makes a venue network
valuable to a sponsor.

## 4. Example use cases

- **Sports bar matchday challenge** — predictions and sport trivia around a live fixture.
- **Half-time quiz** — a 2–3 minute burst while the match is paused.
- **Quick prediction game** — "who scores next?", "final score?", settled live.
- **Beer / brand trivia** — sponsor-funded round tied to the brewery.
- **Music bar audio challenge** — name-the-track / name-the-artist where the venue has sound.
- **Local pub community trivia** — neighbourhood / venue-flavoured questions for the regulars.
- **Pop-up / event sponsor challenge** — a branded mini-game at a festival or activation.
- **"Beat the table" / "beat the venue" challenge** — a guest or table competes against a rolling venue
  high-score.

## 5. Product requirements (later)

Captured for when this is picked up — **not a build list for now**:

- Screen **idle loop with QR** (the always-on attract state).
- Phone **join flow** (reuse the existing frictionless QR/join-token primitive).
- **Self-start or join** an active challenge (no host).
- **No-host game control** — the screen + phones drive state; staff are not required to run it.
- **Safe screen state transitions:** `idle → joined → challenge active → result → sponsor CTA → reset`, with
  every state recoverable back to idle.
- **Abuse prevention / rate limits** on scans, joins and self-starts.
- **Venue controls:** pause, disable, reset, set campaign active/inactive.
- **Sponsor campaign controls** — which campaign/content runs on which screens.
- **Content profile by venue type** — reuses the venue content-mix model (see §7).
- **Short-form games, ideally 1–5 minutes**, designed for unsupervised play.
- Works for **one player, a small group, or a table**.
- **Reporting:** scans, joins, completions, repeat plays, sponsor interactions, estimated reach.

## 6. Risks / guardrails

- Guests **must not be able to hijack the venue screen** (no arbitrary content on the public display).
- **No offensive team / name display** — reuse and extend the existing moderation/`safeDisplayName` model.
- **No gambling framing** — predictions are for fun, never wagering.
- **No misleading sales / ROI claims** — engagement signals only; never "measured bar sales".
- **Alcohol reward / legal handling must stay careful** — non-alcohol default; rewards subject to venue and
  local rules; no youth-targeted promotion.
- **Venue staff must be able to disable / pause** the screen instantly.
- **QR / session abuse needs limits** — rate-limit joins, expire/rotate sessions, lock on abuse.
- **Privacy / retention must be solved before any real beta** — aggregated reporting, no raw personal data,
  clear retention rules.

## 7. Relationship to current roadmap

- **Do not build this now.** It stays parked.
- **Venue Content Mix / Quiz Category Sliders has now landed** (POC Phase 9): operator-controlled content
  categories, venue presets, a seeded question pool, and a proposed-quiz preview. Ambient Venue Screen Mode is a
  direct beneficiary — **always-on, unsupervised games will need exactly these venue-specific content profiles**
  to pick the right short-form content per venue type.
- This concept should stay parked until the **hosted-demo POC and the content-mix feature are stable** and the
  client-facing demo has been validated with real stakeholders.
- When picked up, it should **reuse existing primitives**, not reinvent them: the QR/join-token flow, the
  theme/brand identity layer, the client-facing identity safety, moderation, and the content-mix model.

## 8. Open questions

- Should ambient mode be **sponsor-funded, venue-funded, or part of a campaign package**?
- **Who owns the screen hardware** (venue-supplied TV/mini-PC, PPN-provided device, BYO)?
- **How does the venue start / stop** the screen day-to-day?
- **Which games are best for unsupervised play** (and which fail without a host)?
- Should the screen be **passive until someone joins**, or **continuously rotating challenges** to attract?
- What is the **minimum safe moderation model** for unsupervised, public-screen play?
- How does this **interact with scheduled host-led quiz nights** (hand-off, scheduling, screen sharing)?

---

*Parked concept — captured for the backlog. Current immediate work: see [docs/product/README.md](./README.md).*
