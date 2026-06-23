/**
 * /operator/setup-wizard — INTERNAL client-demo setup wizard (gated; operator-only). Journey 1: prepare a
 * client/brewery demo BEFORE anyone sees it — client, desired outcome, commercial scale/reach, venue mix, setup
 * mode, readiness — then apply the numbers into the existing KPI Scenario so /kpi /report /rollout reconcile.
 *
 * This is NOT the client-facing presentation flow: there are no "show TV / show player / run question" actions
 * here. Graphics come LAST (a readiness step that links out to asset setup; it never forces an upload).
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { getActiveBrand } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { listAssetPacks } from "../lib/ppnAssets";
import { overrideStatus, anyOverrideActive, clearClientOverrides } from "../lib/demoStatus";
import {
  applyScenarioToSeed, deriveKpi, scenarioWarnings, setScenario,
  SETUP_MODE_INFO, type SetupModeId, type VenueProfile,
} from "../demo/kpiModel";
import {
  getDemoBrief, setDemoBrief, clearDemoBrief, briefToScenario, type DemoBrief,
} from "../lib/demoBrief";

const OBJECTIVES: { id: string; label: string }[] = [
  { id: "weekday_footfall", label: "Increase weekday footfall" },
  { id: "sponsored_night", label: "Launch a brewery-sponsored pub night" },
  { id: "brand_campaign", label: "Support a product or brand campaign" },
  { id: "repeat_visits", label: "Drive repeat pub visits" },
  { id: "trade_proof", label: "Build trade-marketing proof" },
  { id: "sponsor_engagement", label: "Show sponsor engagement" },
  { id: "localised_content", label: "Test localised quiz / game content" },
];

const PROFILES: { id: VenueProfile; label: string; implies: string }[] = [
  { id: "small", label: "Small pub", implies: "Lower attendance, manual / phones-only is realistic." },
  { id: "neighbourhood", label: "Neighbourhood pub", implies: "Balanced crowd; phones + host, TV optional." },
  { id: "sports", label: "Sports bar", implies: "Higher attendance; TV + audio strongly preferred." },
  { id: "large", label: "Large venue", implies: "Big rooms; TV + audio expected." },
  { id: "popup", label: "Pop-up / event", implies: "Special-event scale (120+), not a normal pub — TV + audio." },
  { id: "mixed", label: "Mixed campaign", implies: "A blend across pub types and setups — the realistic default." },
];

const SETUP_EXPLAIN: Record<SetupModeId, { needs: string; ppn: string; host: string; player: string }> = {
  tv_audio: {
    needs: "A TV / projector and some room sound (house PA or a speaker).",
    ppn: "Drives the TV: QR, questions, reveal, scoreboard and sponsor moments; audio cues through the room.",
    host: "Runs the night from a tablet — start, reveal, next, recover.",
    player: "Answers on their phone; the TV adds shared focus and atmosphere.",
  },
  audio_only: {
    needs: "Room sound only — no TV dependency.",
    ppn: "Audio / host readout supports the room; sponsor surfaces land on phones, audio and the report.",
    host: "Reads from the host panel; controls the flow.",
    player: "Carries questions, options, reveal and scoreboard on their phone.",
  },
  phones_hosted: {
    needs: "Nothing beyond staff + the host panel — the low-friction setup.",
    ppn: "Powers the session; no TV and no platform audio required.",
    host: "Reads each question from the host panel via the pub mic / speaker.",
    player: "Carries the whole event on their phone.",
  },
};

const STEPS = ["Client basics", "Desired outcome", "Scale & reach", "Venue mix", "Setup mode", "Readiness & assets", "Review & apply"];

function defaultBrief(): DemoBrief {
  const b = getActiveBrand();
  const m = activeMarket();
  const k = m.kpiSeed;
  const stage = (id: string, fallback: number) => m.rollout.find((r) => r.id === id)?.venues ?? fallback;
  return {
    clientName: b.sponsorName,
    campaignName: b.campaignName,
    exampleVenueName: b.pubName,
    marketRegion: `${m.label} · ${m.region}`,
    objectiveIds: [],
    desiredOutcomeText: "",
    targetVenues: k.venuesActivated,
    eventsPerVenue: k.avgEventsPerVenue,
    expectedPlayersPerEvent: k.avgPlayersPerEvent,
    expectedPlayersPerTeam: k.avgPlayersPerTeam,
    completionRate: k.completionRate,
    sponsoredAnswerRate: k.sponsoredAnswerRate,
    reachMultiplier: k.campaignReachMultiplier,
    valuePerVisit: k.valuePerVisit ?? 6,
    pilotVenues: stage("pilot", 5),
    regionalVenues: stage("regional", 25),
    campaignVenues: stage("campaign", 100),
    venueProfile: "mixed",
    setupMode: "tv_audio",
    internalNotes: "",
  };
}

export default function SetupWizard() {
  const market = activeMarket();
  const brand = getActiveBrand();
  const ov = overrideStatus();
  const healthQ = useQuery({ queryKey: ["wiz-asset-health"], queryFn: listAssetPacks, retry: false });

  const existing = getDemoBrief();
  const [brief, setBriefState] = useState<DemoBrief>(existing ?? defaultBrief());
  const [hadExisting, setHadExisting] = useState(existing !== null);
  const [briefDismissed, setBriefDismissed] = useState(false);
  const [ovDismissed, setOvDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState<null | "saved" | "applied">(null);

  const patch = (p: Partial<DemoBrief>) => { setBriefState((b) => ({ ...b, ...p })); setSaved(null); };
  const toggleObjective = (id: string) =>
    patch({ objectiveIds: brief.objectiveIds.includes(id) ? brief.objectiveIds.filter((x) => x !== id) : [...brief.objectiveIds, id] });

  // ── Live derived outputs (reuse the existing KPI model — no faked precision) ──
  const effSeed = applyScenarioToSeed(market.kpiSeed, briefToScenario(brief));
  const d = deriveKpi(effSeed);
  const warns = scenarioWarnings(effSeed, brief.venueProfile);
  const cur = market.kpiSeed.currency;
  const occasionValue = d.playersCompleted * (effSeed.valuePerVisit ?? 0);

  const visualCount = Object.values(brand.images).filter(Boolean).length;
  const storage = healthQ.isError ? "unavailable" : healthQ.isSuccess ? "available" : "checking…";

  const saveBrief = () => { setDemoBrief(brief); setHadExisting(true); setSaved("saved"); };
  const applyScenario = () => { setDemoBrief(brief); setScenario(briefToScenario(brief)); setHadExisting(true); setSaved("applied"); };
  const clearBrief = () => { clearDemoBrief(); setBriefState(defaultBrief()); setHadExisting(false); setBriefDismissed(true); setStep(0); setSaved(null); };

  const fmt = (n: number) => Math.round(n).toLocaleString();

  // ── small presentational helpers (plain functions, NOT components — avoids remount / focus loss on edit) ──
  const numField = (label: string, k: keyof DemoBrief, st = 1) => (
    <label key={k} className="text-xs text-[var(--ppn-muted)]">{label}
      <input type="number" step={st} aria-label={label} value={brief[k] as number}
        onChange={(e) => patch({ [k]: Number(e.target.value) } as Partial<DemoBrief>)}
        className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" />
    </label>
  );
  const out = (id: string, label: string, value: string, hint?: string) => (
    <div key={id} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
      <p className="text-[10px] uppercase tracking-wide text-[var(--ppn-muted)]">{label}</p>
      <p data-testid={id} className="text-xl font-extrabold" style={{ color: "var(--ppn-brand)" }}>{value}</p>
      {hint && <p className="text-[10px] text-[var(--ppn-muted)]">{hint}</p>}
    </div>
  );
  const outputs = () => (
    <div data-testid="wizard-outputs" className="grid gap-2 sm:grid-cols-3">
      {out("out-events", "Total events", fmt(d.eventsRun), `${brief.targetVenues} venues × ${effSeed.avgEventsPerVenue} events`)}
      {out("out-players", "Est. players reached", fmt(d.playersJoined), "player visits across the campaign")}
      {out("out-teams", "Estimated teams", fmt(d.teamsCreated), `~${d.avgTeamsPerEvent} teams/event`)}
      {out("out-sponsored", "Sponsored answer opps", fmt(d.sponsoredTeamsAnswered), "teams answering the sponsored round")}
      {out("out-completed", "Completion (assumed)", fmt(d.playersCompleted), `${Math.round(effSeed.completionRate * 100)}% reach the final question`)}
      {out("out-reach", "Estimated reach", fmt(d.campaignReachEstimate), "players + estimated onlookers (estimate)")}
      {out("out-value", "Potential occasion value", `${cur}${fmt(occasionValue)}`, "planning assumption — never measured sales")}
    </div>
  );

  return (
    <DemoShell>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-sm uppercase tracking-widest" style={{ color: "var(--ppn-brand)" }}>Operator · internal setup</p>
        <h1 className="mt-2 text-3xl font-extrabold">Demo setup wizard</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">Prepare a client demo before anyone sees it — client, outcome, scale and scenario. Add graphics last. Internal only; never shown to the client.</p>

        {/* Wrong-client protection — a saved brief is loaded */}
        {hadExisting && !briefDismissed && (
          <div className="mt-4 rounded-xl border-2 p-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, var(--ppn-border))", background: "color-mix(in srgb, var(--ppn-warning) 8%, transparent)" }}>
            <p>A saved demo brief is loaded — <span className="font-semibold">{brief.clientName || "(unnamed client)"}</span>. Continue editing it, or clear it and start a new client.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => setBriefDismissed(true)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Continue editing</button>
              <button onClick={clearBrief} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold">Clear &amp; start new client</button>
            </div>
          </div>
        )}

        {/* Wrong-client protection — client overrides active */}
        {anyOverrideActive() && !ovDismissed && (
          <div className="mt-3 rounded-xl border p-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, var(--ppn-border))" }}>
            <p style={{ color: "var(--ppn-warning)" }}>⚠ Custom client overrides (assets / theme / scenario) are active — they may belong to another client.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => { clearClientOverrides(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold">Clear client overrides</button>
              <button onClick={() => setOvDismissed(true)} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold">Continue carefully</button>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className="rounded-full border px-2.5 py-1 text-xs font-medium"
              style={{ borderColor: i === step ? "var(--ppn-brand)" : "var(--ppn-border)", color: i === step ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>
              <span className="font-bold">{i + 1}</span> · {s}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
          {/* STEP 1 — Client basics */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-bold">Client basics</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Name the demo before configuring the numbers.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-[var(--ppn-muted)]">Client / brewery name
                  <input aria-label="Client / brewery name" value={brief.clientName} onChange={(e) => patch({ clientName: e.target.value })} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" /></label>
                <label className="text-xs text-[var(--ppn-muted)]">Demo / campaign name
                  <input aria-label="Demo / campaign name" value={brief.campaignName} onChange={(e) => patch({ campaignName: e.target.value })} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" /></label>
                <label className="text-xs text-[var(--ppn-muted)]">Example pub / venue name
                  <input aria-label="Example pub / venue name" value={brief.exampleVenueName} onChange={(e) => patch({ exampleVenueName: e.target.value })} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" /></label>
                <label className="text-xs text-[var(--ppn-muted)]">Market / region
                  <input aria-label="Market / region" value={brief.marketRegion} onChange={(e) => patch({ marketRegion: e.target.value })} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" /></label>
              </div>
              <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Defaults come from the active preset ({brand.sponsorName} · {market.label}). Change the preset in detailed config if you need a different base.</p>
            </div>
          )}

          {/* STEP 2 — Desired outcome */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold">Desired outcome</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">What is the business objective for this client? (Not the show order — this is the commercial goal.)</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {OBJECTIVES.map((o) => {
                  const on = brief.objectiveIds.includes(o.id);
                  return (
                    <button key={o.id} onClick={() => toggleObjective(o.id)}
                      className="rounded-full border px-3 py-1.5 text-xs font-medium"
                      style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", color: on ? "var(--ppn-brand)" : "var(--ppn-muted)", background: on ? "color-mix(in srgb, var(--ppn-brand) 10%, transparent)" : "transparent" }}>
                      {on ? "✓ " : ""}{o.label}
                    </button>
                  );
                })}
              </div>
              <label className="mt-3 block text-xs text-[var(--ppn-muted)]">Desired outcome (free text)
                <textarea aria-label="Desired outcome" rows={3} value={brief.desiredOutcomeText} onChange={(e) => patch({ desiredOutcomeText: e.target.value })}
                  placeholder="e.g. Prove a sponsored quiz night fills the pub on quiet Tuesdays and gives the brewery measurable engagement."
                  className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5 text-sm text-[var(--ppn-text)]" /></label>
            </div>
          )}

          {/* STEP 3 — Scale & reach */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold">Scale &amp; reach</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Set the commercial assumptions. The outputs update live and feed /kpi, /report and /rollout.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {numField("Target pubs / venues", "targetVenues")}
                {numField("Events per venue", "eventsPerVenue", 0.1)}
                {numField("Expected players per event", "expectedPlayersPerEvent")}
                {numField("Players per team", "expectedPlayersPerTeam", 0.1)}
                {numField("Completion rate (0–1)", "completionRate", 0.01)}
                {numField("Sponsored-answer rate (0–1)", "sponsoredAnswerRate", 0.01)}
                {numField("Reach multiplier", "reachMultiplier", 0.1)}
                {numField("Value per visit (planning assumption)", "valuePerVisit")}
                {numField("Pilot venues", "pilotVenues")}
                {numField("Regional venues", "regionalVenues")}
                {numField("Wider campaign venues", "campaignVenues")}
              </div>
              <div className="mt-4">{outputs()}</div>
              {warns.length > 0 ? (
                <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, transparent)", background: "color-mix(in srgb, var(--ppn-warning) 10%, transparent)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--ppn-warning)" }}>⚠ Realism warnings (operator-only)</p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-[var(--ppn-muted)]">{warns.map((w) => <li key={w}>{w}</li>)}</ul>
                </div>
              ) : <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Assumptions look realistic.</p>}
            </div>
          )}

          {/* STEP 4 — Venue mix */}
          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold">Venue mix</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Which kind of venues is this demo assuming? This sets the realism bounds for the warnings above.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {PROFILES.map((p) => {
                  const on = brief.venueProfile === p.id;
                  return (
                    <button key={p.id} onClick={() => patch({ venueProfile: p.id })}
                      className="rounded-xl border p-3 text-left text-sm"
                      style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", background: on ? "color-mix(in srgb, var(--ppn-brand) 10%, transparent)" : "transparent" }}>
                      <p className="font-semibold">{p.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--ppn-muted)]">{p.implies}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3 text-xs text-[var(--ppn-muted)]">
                With <span className="font-semibold text-[var(--ppn-text)]">{PROFILES.find((p) => p.id === brief.venueProfile)?.label}</span> at {brief.expectedPlayersPerEvent} players/event:
                {warns.length > 0 ? <span style={{ color: "var(--ppn-warning)" }}> {warns.length} realism warning{warns.length === 1 ? "" : "s"} (see Scale &amp; reach).</span> : <span style={{ color: "var(--ppn-success)" }}> assumptions sit inside this profile's realistic range.</span>}
              </div>
            </div>
          )}

          {/* STEP 5 — Setup mode */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-bold">Setup mode</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">What setup is realistic for these venues? This is setup planning — not the live run.</p>
              <div className="mt-3 space-y-2">
                {(Object.keys(SETUP_MODE_INFO) as SetupModeId[]).map((id) => {
                  const on = brief.setupMode === id;
                  const ex = SETUP_EXPLAIN[id];
                  return (
                    <button key={id} onClick={() => patch({ setupMode: id })}
                      className="block w-full rounded-xl border p-3 text-left text-sm"
                      style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", background: on ? "color-mix(in srgb, var(--ppn-brand) 10%, transparent)" : "transparent" }}>
                      <p className="font-semibold">{SETUP_MODE_INFO[id].label}</p>
                      <div className="mt-1 grid gap-0.5 text-xs text-[var(--ppn-muted)] sm:grid-cols-2">
                        <p><span className="text-[var(--ppn-text)]">Pub needs:</span> {ex.needs}</p>
                        <p><span className="text-[var(--ppn-text)]">PPN controls:</span> {ex.ppn}</p>
                        <p><span className="text-[var(--ppn-text)]">Host:</span> {ex.host}</p>
                        <p><span className="text-[var(--ppn-text)]">Player sees:</span> {ex.player}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6 — Readiness & assets (LAST / separate) */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-bold">Readiness &amp; assets</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Add graphics last — once the client, outcome and scenario are clear. Nothing here is required to define the demo.</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full px-2 py-1 font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>{brand.sponsorName} · {brand.market}</span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Client assets: <span className="font-semibold" style={{ color: ov.asset ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{ov.asset ? "custom" : "default"}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Theme: <span className="font-semibold" style={{ color: ov.theme ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{ov.theme ? "custom" : "default"}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Storage upload: <span className="font-semibold">{storage}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Image slots: <span className="font-semibold">{visualCount}/6</span></span>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-[var(--ppn-muted)]">
                <li>· Logo / hero / sponsor slide appear live; <span className="text-[var(--ppn-text)]">phone-card, lower-third and venue images are preview-only</span> (not in live gameplay yet).</li>
                <li>· <span className="text-[var(--ppn-text)]">MP3 voice audio is not added yet</span> — host / TV use the on-screen script. Audio is a later slice.</li>
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/config" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Open asset setup (/config)</Link>
                <Link to="/setup" className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">Asset checklist (/setup)</Link>
              </div>
              <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Assets are intentionally separate — graphics are polish, not the commercial brief.</p>
            </div>
          )}

          {/* STEP 7 — Review & apply */}
          {step === 6 && (
            <div>
              <h2 className="text-lg font-bold">Review &amp; apply internal setup</h2>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">Save the brief and apply the scale assumptions into the demo's KPI / report / rollout scenario.</p>

              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Client</p>
                  <p className="font-semibold">{brief.clientName || "—"}</p>
                  <p className="text-xs text-[var(--ppn-muted)]">{brief.campaignName} · {brief.marketRegion}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Desired outcome</p>
                  <p className="text-xs text-[var(--ppn-text)]">{brief.objectiveIds.map((id) => OBJECTIVES.find((o) => o.id === id)?.label).filter(Boolean).join(" · ") || "—"}</p>
                  {brief.desiredOutcomeText && <p className="mt-1 text-xs text-[var(--ppn-muted)]">“{brief.desiredOutcomeText}”</p>}
                  <p className="mt-2 text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Venue mix · setup</p>
                  <p className="text-xs text-[var(--ppn-text)]">{PROFILES.find((p) => p.id === brief.venueProfile)?.label} · {SETUP_MODE_INFO[brief.setupMode].label}</p>
                </div>
                <div className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                  <p className="text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Target</p>
                  <p className="font-semibold">{brief.targetVenues} venues · target reach ~{fmt(d.campaignReachEstimate)}</p>
                  <p className="mt-2 text-xs text-[var(--ppn-muted)]">{fmt(d.eventsRun)} events · {fmt(d.playersJoined)} players · {fmt(d.teamsCreated)} teams</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-[var(--ppn-muted)]">Assets</p>
                  <p className="text-xs text-[var(--ppn-text)]">{ov.asset ? "custom" : "default"} assets · {visualCount}/6 image slots · storage {storage} · MP3 not added</p>
                </div>
              </div>

              {warns.length > 0 && (
                <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, transparent)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--ppn-warning)" }}>Needs attention</p>
                  <ul className="mt-1 list-disc pl-5 text-xs text-[var(--ppn-muted)]">{warns.map((w) => <li key={w}>{w}</li>)}</ul>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={saveBrief} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold">Save demo brief</button>
                <button onClick={applyScenario} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Apply scenario to demo</button>
                <Link to="/operator" className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold">Open Demo Control Centre</Link>
                <button onClick={clearBrief} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold">Clear demo brief</button>
              </div>
              {saved === "saved" && <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Demo brief saved on this device.</p>}
              {saved === "applied" && <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Saved and scenario applied — /kpi, /report and /rollout now reflect these numbers.</p>}
            </div>
          )}
        </div>

        {/* Step nav */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="rounded-lg border border-[var(--ppn-border)] px-4 py-2 text-sm font-semibold disabled:opacity-40">← Back</button>
          <span className="text-xs text-[var(--ppn-muted)]">Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1
            ? <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Next →</button>
            : <Link to="/operator" className="rounded-lg border border-[var(--ppn-border)] px-4 py-2 text-sm font-semibold">Back to control centre</Link>}
        </div>
      </div>
    </DemoShell>
  );
}
