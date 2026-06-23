/**
 * /presentation — CLIENT-FACING guided presentation journey (journey 2). Read-only and client-safe: it tells the
 * demo story in the right order (why → campaign → pub night → live moment → sponsor → measurement → rollout →
 * next step) using the prepared demo brief + scenario where available, falling back to the active preset/market.
 *
 * This route configures NOTHING. No operator gate, no setup fields, no scenario editing, no asset upload, no
 * reset/seed. It never exposes internal setup surfaces or internal language.
 */
import { useState } from "react";
import { DemoShell } from "../components/shells";
import { getActiveBrand } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { getDemoBrief, briefToScenario } from "../lib/demoBrief";
import { applyScenarioToSeed, deriveKpi, getEffectiveKpiSeed, setupModeLabel, SETUP_MODE_INFO } from "../demo/kpiModel";

const OBJECTIVE_LABELS: Record<string, string> = {
  weekday_footfall: "Increase weekday footfall",
  sponsored_night: "Launch a brewery-sponsored pub night",
  brand_campaign: "Support a product or brand campaign",
  repeat_visits: "Drive repeat pub visits",
  trade_proof: "Build trade-marketing proof",
  sponsor_engagement: "Show sponsor engagement",
  localised_content: "Test localised quiz / game content",
};

const STEPS = ["Why PPN", "The campaign", "The pub night", "Live demo", "Sponsor exposure", "Measurement", "Rollout", "Next step"];

export default function Presentation() {
  const brand = getActiveBrand();
  const market = activeMarket();
  const brief = getDemoBrief();
  const [step, setStep] = useState(0);

  // Read-only: brief scenario if prepared, else market default + any prepared scenario. Never mutates anything.
  const seed = brief ? applyScenarioToSeed(market.kpiSeed, briefToScenario(brief)) : getEffectiveKpiSeed(market.kpiSeed);
  const d = deriveKpi(seed);
  const cur = market.kpiSeed.currency;
  const fmt = (n: number) => Math.round(n).toLocaleString();

  const client = brief?.clientName?.trim() || brand.sponsorName;
  const campaign = brief?.campaignName?.trim() || brand.campaignName;
  const exampleVenue = brief?.exampleVenueName?.trim() || brand.pubName;
  const region = brief?.marketRegion?.trim() || `${market.label} · ${market.region}`;
  const outcome = brief?.desiredOutcomeText?.trim();
  const objectives = (brief?.objectiveIds ?? []).map((id) => OBJECTIVE_LABELS[id]).filter(Boolean);
  const setupMode = setupModeLabel(brief?.setupMode ?? "tv_audio");
  const targetVenues = brief?.targetVenues ?? seed.venuesActivated;
  const occasionValue = d.playersCompleted * (seed.valuePerVisit ?? 0);

  const liveBtn = "rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)]";
  const linkBtn = "rounded-lg border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold";

  const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
    <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
      <p className="text-3xl font-extrabold" style={{ color: "var(--ppn-brand)" }}>{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
      {hint && <p className="text-xs text-[var(--ppn-muted)]">{hint}</p>}
    </div>
  );

  return (
    <DemoShell clientFacing>
      <div className="mx-auto max-w-4xl px-5 py-8">
        <p className="text-sm uppercase tracking-[0.25em]" style={{ color: "var(--ppn-brand)" }}>Client presentation</p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{campaign}</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">An on-trade engagement campaign for <span className="font-semibold text-[var(--ppn-text)]">{client}</span> — branded, measurable, and run by the venue.</p>

        {/* Stepper (guided order) */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)} className="rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: i === step ? "var(--ppn-brand)" : "var(--ppn-border)", color: i === step ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>
              <span className="font-bold">{i + 1}</span> · {s}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-5">
          {/* STEP 1 — Why PPN */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold">Why this exists</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-4"><p className="font-semibold">Pubs</p><p className="mt-1 text-sm text-[var(--ppn-muted)]">Quiet weeknights need an event-led reason for people to come in, stay longer, and come back.</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-4"><p className="font-semibold">Breweries</p><p className="mt-1 text-sm text-[var(--ppn-muted)]">Trade-marketing spend needs a measurable, on-trade activation — not just point-of-sale.</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-4"><p className="font-semibold">PPN</p><p className="mt-1 text-sm text-[var(--ppn-muted)]">A sponsored pub-night format that fills rooms and gives the brewery measurable engagement.</p></div>
              </div>
              {outcome && (
                <div className="mt-4 rounded-xl border-l-4 bg-[var(--ppn-bg)] p-4" style={{ borderColor: "var(--ppn-brand)" }}>
                  <p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Desired outcome for {client}</p>
                  <p className="mt-1 text-sm">“{outcome}”</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — The campaign */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold">The client campaign</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">A campaign brief for {client}.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Client</p><p className="font-semibold">{client}</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Campaign</p><p className="font-semibold">{campaign}</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Example venue</p><p className="font-semibold">{exampleVenue}</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Market / region</p><p className="font-semibold">{region}</p></div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Stat label="Target venues" value={fmt(targetVenues)} hint="across the campaign" />
                <Stat label="Target reach" value={`~${fmt(d.campaignReachEstimate)}`} hint="players + estimated onlookers (estimate)" />
              </div>
              {objectives.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Campaign objectives</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">{objectives.map((o) => <span key={o} className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-1 text-xs">{o}</span>)}</div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — The pub night */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold">The pub-night experience</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ["Players join on their phones", "Scan a QR at the table, join a team — no app, no login."],
                  ["The room shares the moment", "Where there's a TV or projector, it shows questions, reveal and the scoreboard for shared focus."],
                  ["The host runs the flow", "Staff drive the night — start, reveal, next — at a comfortable pace."],
                  ["Questions keep the room engaged", "Rounds, reveals and a live scoreboard build a social, competitive evening."],
                  ["Sponsor moments are part of the game", "The brewery's round, offer and winner moment are woven in — not bolted on."],
                ].map(([h, b]) => (
                  <li key={h} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><span className="font-semibold">{h}</span> — <span className="text-[var(--ppn-muted)]">{b}</span></li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-[var(--ppn-muted)]">Planned setup for this campaign: <span className="font-semibold text-[var(--ppn-text)]">{setupMode}</span>.</p>
            </div>
          )}

          {/* STEP 4 — Live demo moment */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold">See it live</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Open the guest-facing surfaces on this screen or a second device.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/tv/DEMO" target="_blank" rel="noreferrer" className={liveBtn} style={{ background: "var(--ppn-brand)" }}>Open TV display ↗</a>
                <a href="/play/DEMO" target="_blank" rel="noreferrer" className={liveBtn} style={{ background: "var(--ppn-brand)" }}>Open player phone ↗</a>
              </div>
              <p className="mt-3 text-xs text-[var(--ppn-muted)]">The presenter/host controls the night from a private console — it isn't shown to guests.</p>
            </div>
          )}

          {/* STEP 5 — Sponsor exposure */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold">Sponsor exposure</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Where {client} shows up across the night.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
                {[
                  ["On the TV", "Branded welcome, sponsor slide, sponsored round and winner moment."],
                  ["On phones", "Sponsor card and the sponsored question in each player's hand."],
                  ["In the host script", "The night is introduced and closed as brought to you by the brewery."],
                  ["In the report", "Sponsored-round engagement is summarised for the brewery afterwards."],
                ].map(([h, b]) => (
                  <div key={h} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="font-semibold">{h}</p><p className="mt-0.5 text-[var(--ppn-muted)]">{b}</p></div>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Stat label="Sponsored-answer opportunities" value={fmt(d.sponsoredTeamsAnswered)} hint="teams engaging the sponsored round" />
                <Stat label="Offer / CTA concept" value="Non-alcohol" hint="e.g. food or merch reward — ask staff for tonight's offer" />
              </div>
              <p className="mt-3 text-xs text-[var(--ppn-muted)]">{brand.responsibleNote}</p>
            </div>
          )}

          {/* STEP 6 — Measurement */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold">Measurement &amp; proof</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Stat label="Branded events" value={fmt(d.eventsRun)} />
                <Stat label="Players reached" value={fmt(d.playersJoined)} hint="player visits across the campaign" />
                <Stat label="Potential occasion value" value={`${cur}${fmt(occasionValue)}`} hint="planning assumption — not measured sales" />
              </div>
              <ul className="mt-3 space-y-1 text-sm text-[var(--ppn-muted)]">
                <li>· <span className="text-[var(--ppn-text)]">PPN-measurable engagement</span> — joins, teams, completion and sponsored-round participation.</li>
                <li>· <span className="text-[var(--ppn-text)]">Venue-reported outcome</span> — staff feedback on attendance and a busier night.</li>
                <li>· <span className="text-[var(--ppn-text)]">Estimated reach</span> and occasion value are planning assumptions, clearly labelled — never presented as measured sales.</li>
                <li>· Till / POS evidence is optional and a future add-on, never required.</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/kpi" target="_blank" rel="noreferrer" className={liveBtn} style={{ background: "var(--ppn-brand)" }}>View KPI report ↗</a>
                <a href="/report" target="_blank" rel="noreferrer" className={linkBtn}>View pilot report ↗</a>
              </div>
            </div>
          )}

          {/* STEP 7 — Rollout */}
          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold">Rollout &amp; operations</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">From a controlled pilot to a wider brewery activation.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 text-sm">
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="font-semibold">Pilot</p><p className="mt-0.5 text-[var(--ppn-muted)]">A handful of venues to prove the format.</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="font-semibold">Regional</p><p className="mt-0.5 text-[var(--ppn-muted)]">Scale across a region once it works.</p></div>
                <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3"><p className="font-semibold">Wider campaign</p><p className="mt-0.5 text-[var(--ppn-muted)]">A national brewery activation.</p></div>
              </div>
              <p className="mt-3 text-xs text-[var(--ppn-muted)]">Venue readiness is simple — the night runs on phones alone, with TV and audio added where the venue has them ({setupMode}).</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/rollout" target="_blank" rel="noreferrer" className={liveBtn} style={{ background: "var(--ppn-brand)" }}>View rollout plan ↗</a>
                <a href="/run-sheet" target="_blank" rel="noreferrer" className={linkBtn}>View venue run sheet ↗</a>
              </div>
            </div>
          )}

          {/* STEP 8 — Next step */}
          {step === 7 && (
            <div>
              <h2 className="text-xl font-bold">Next step</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">A clean path to a controlled pilot for {client}.</p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                <li>Agree the pilot scope.</li>
                <li>Pick the pilot venues.</li>
                <li>Confirm the campaign theme and sponsored round.</li>
                <li>Prepare the brand assets.</li>
                <li>Run a controlled pilot night.</li>
                <li>Review the report and decide on rollout.</li>
              </ol>
              <p className="mt-4 text-sm font-semibold">Fund a controlled pilot, receive measurable proof.</p>
            </div>
          )}
        </div>

        {/* Step nav */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={`${linkBtn} disabled:opacity-40`}>← Back</button>
          <span className="text-xs text-[var(--ppn-muted)]">Step {step + 1} of {STEPS.length} · {SETUP_MODE_INFO[brief?.setupMode ?? "tv_audio"].label}</span>
          <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} className={`${liveBtn} disabled:opacity-40`} style={{ background: "var(--ppn-brand)" }}>Next →</button>
        </div>
      </div>
    </DemoShell>
  );
}
