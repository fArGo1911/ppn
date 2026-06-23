/**
 * /operator — Operator Demo Control Centre (gated). The guided "start here" hub: active-demo status, an ordered
 * run-the-demo journey with real buttons, and a persona-grouped route map for free exploration. Sits ABOVE
 * /config (which stays as the detailed setup). No game-loop/scoring changes.
 */
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { resolveJoinToken, getSessionState, listTeams } from "../lib/ppnApi";
import { listAssetPacks } from "../lib/ppnAssets";
import { overrideStatus, anyOverrideActive, clearClientOverrides } from "../lib/demoStatus";
import { getDemoBrief, clearDemoBrief, briefToScenario } from "../lib/demoBrief";
import { clientFacingIdentity } from "../lib/clientFacingDemo";
import { applyScenarioToSeed, deriveKpi, setupModeLabel } from "../demo/kpiModel";
import { resolveContentMix, contentMixSummary, contentMixWarnings, contentMixSetupWarnings, presetById, matchPresetId } from "../lib/contentMix";
import { getStagedDemoQuiz, clearStagedDemoQuiz } from "../lib/stagedDemoQuiz";

type Step = { t: string; i: string; to?: string; href?: string; label: string };
const JOURNEY: Step[] = [
  { t: "1 · Prepare brand assets", i: "Pick the brewery preset and upload or select the client's asset pack.", to: "/config", label: "Open setup" },
  { t: "2 · Prepare scenario", i: "Choose a venue-mix scenario template for believable numbers.", to: "/config", label: "Open setup" },
  { t: "3 · Reset / seed demo", i: "Clean the session and seed demo teams (small / medium / busy).", to: "/config", label: "Open setup" },
  { t: "4 · Open TV", i: "Full-screen the room display on the TV / projector.", href: "/tv/DEMO", label: "Open TV ↗" },
  { t: "5 · Open Host", i: "The host console — start, reveal, next, recover. Operator-only.", href: "/host", label: "Open Host ↗" },
  { t: "6 · Open Player", i: "A guest joins on their own phone. Players wait; the host starts.", href: "/play/DEMO", label: "Open Player ↗" },
  { t: "7 · Start from Host", i: "Press Play AI intro / Start game on the host console.", href: "/host", label: "Open Host ↗" },
  { t: "8 · Run question → reveal → scoreboard", i: "Drive each question, reveal & score, show the scoreboard.", href: "/host", label: "Open Host ↗" },
  { t: "9 · Show KPI / report", i: "The reconciled KPIs and the seeded brewery report.", to: "/report", label: "Open report" },
  { t: "10 · Show rollout / run sheet", i: "The campaign plan and the venue/host run sheet.", to: "/rollout", label: "Open rollout" },
  { t: "11 · What the brewery gets / next step", i: "Close on the proof + pilot recommendation.", to: "/report", label: "Open report" },
];

const GROUPS: { label: string; note: string; danger?: boolean; routes: [string, string][] }[] = [
  { label: "Operator prep", note: "Never show a client", danger: true, routes: [["/operator", "Control centre"], ["/config", "Detailed setup"], ["/setup", "Brand assets"]] },
  { label: "Event operation", note: "TV & player are client-safe; host controls are operator-only", routes: [["/host", "Host console (operator)"], ["/tv/DEMO", "TV display (client-safe)"], ["/play/DEMO", "Player phone (client-safe)"]] },
  { label: "Buyer / presentation", note: "Client-safe", routes: [["/", "Campaign"], ["/kpi", "KPI report"], ["/report", "Pilot report"], ["/rollout", "Rollout plan"], ["/capabilities", "Beyond quiz"]] },
  { label: "Venue handoff", note: "Operator / venue", routes: [["/run-sheet", "Run sheet"]] },
];

export default function Operator() {
  const m = activeMarket();
  const ov = overrideStatus();
  const sessQ = useQuery({ queryKey: ["op-session"], queryFn: () => resolveJoinToken("DEMO"), retry: false });
  const sid = sessQ.data && sessQ.data.kind !== "invalid" ? sessQ.data.session.sessionId : undefined;
  const stateQ = useQuery({ queryKey: ["op-state", sid], queryFn: () => getSessionState(sid!), enabled: !!sid, retry: false });
  const teamsQ = useQuery({ queryKey: ["op-teams", sid], queryFn: () => listTeams(sid!), enabled: !!sid, retry: false });
  const healthQ = useQuery({ queryKey: ["op-asset-health"], queryFn: listAssetPacks, retry: false });

  const brief = getDemoBrief();
  const briefKpi = brief ? deriveKpi(applyScenarioToSeed(activeMarket().kpiSeed, briefToScenario(brief))) : null;
  const cfi = clientFacingIdentity();
  const briefMix = brief ? resolveContentMix(brief) : null;
  const briefMixName = brief ? (presetById(brief.contentMixPreset)?.label ?? presetById(matchPresetId(briefMix!))?.label ?? "Custom") : "";
  const briefMixWarns = brief ? [...contentMixWarnings(briefMix!), ...contentMixSetupWarnings(briefMix!, brief.setupMode)] : [];
  const stagedPlan = getStagedDemoQuiz();

  const Chip = ({ label, on, onText = "on", offText = "off" }: { label: string; on: boolean; onText?: string; offText?: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1 text-xs">
      <span className="text-[var(--ppn-muted)]">{label}</span>
      <span className="font-semibold" style={{ color: on ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{on ? onText : offText}</span>
    </span>
  );
  const surfaceBtn = "rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--ppn-on-brand)]";

  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-8">
        <p className="text-sm uppercase tracking-widest" style={{ color: "var(--ppn-brand)" }}>Operator · demo control centre</p>
        <h1 className="mt-2 text-3xl font-extrabold">Run a {DEMO_BRAND.sponsorName} demo</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">Start here, follow the steps, or jump anywhere. Gated operator hub — not shown to clients.</p>

        {/* A. Current demo status */}
        <div className="mt-5 rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Current demo</p>
            {sessQ.isLoading
              ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-[var(--ppn-muted)]" style={{ background: "var(--ppn-bg)" }}>checking…</span>
              : (sessQ.data && sessQ.data.kind !== "invalid")
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" }}>Ready to run</span>
                : <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Needs attention</span>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip label="Brewery:" on onText={`${DEMO_BRAND.sponsorName} (${m.market})`} />
            <Chip label="Custom assets" on={ov.asset} />
            <Chip label="Theme override" on={ov.theme} />
            <Chip label="Scenario override" on={ov.scenario} />
            <Chip label="Session:" on={false} offText={stateQ.data ? stateQ.data.phase : (sessQ.isLoading ? "…" : "—")} />
            <Chip label="Teams:" on={false} offText={teamsQ.data ? String(teamsQ.data.length) : "—"} />
            <Chip label="Storage assets:" on={healthQ.isError} onText="unavailable" offText={healthQ.isSuccess ? "available" : "checking…"} />
          </div>
          {anyOverrideActive() ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs" style={{ color: "var(--ppn-warning)" }}>⚠ Custom client overrides are active — clear them before prepping a different brewery.</span>
              <button onClick={() => { clearClientOverrides(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold">Clear client overrides</button>
            </div>
          ) : <p className="mt-2 text-xs text-[var(--ppn-muted)]">No client overrides — showing preset defaults. Switching brewery in /config will ask before carrying any overrides over.</p>}
          {healthQ.isError && <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Storage-backed asset uploads need the local PPN Supabase running (ports 553xx). Manual URL/path mode still works without it.</p>}
        </div>

        {/* A2. Internal setup wizard — set up a client demo before anyone sees it */}
        <div className="mt-4 rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Set up a client demo</p>
            {brief
              ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" }}>Brief saved</span>
              : <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>No brief yet</span>}
          </div>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">Configure the client, outcome, scale and scenario before adding graphics. Internal setup — not shown to the client.</p>

          {brief && briefKpi ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Client: <span className="font-semibold text-[var(--ppn-text)]">{brief.clientName || "—"}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Campaign: <span className="font-semibold text-[var(--ppn-text)]">{brief.campaignName || "—"}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Target venues: <span className="font-semibold text-[var(--ppn-text)]">{brief.targetVenues}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Target reach: <span className="font-semibold text-[var(--ppn-text)]">~{briefKpi.campaignReachEstimate.toLocaleString()}</span></span>
                <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Setup: <span className="font-semibold text-[var(--ppn-text)]">{setupModeLabel(brief.setupMode)}</span></span>
              </div>

              {briefMix && (
                <div className="mt-2 text-xs text-[var(--ppn-muted)]">
                  <span className="font-semibold text-[var(--ppn-text)]">Content mix: {briefMixName}</span> — {contentMixSummary(briefMix)} · {brief.quizLength ?? 20}-question quiz{brief.includeTiebreak ? " + tiebreak" : ""}.
                  {briefMixWarns.length > 0 && <span style={{ color: "var(--ppn-warning)" }}> ⚠ {briefMixWarns.length} content warning{briefMixWarns.length === 1 ? "" : "s"} (open the wizard).</span>}
                </div>
              )}

              {cfi.mismatch && (
                <div className="mt-3 rounded-lg border-2 p-3 text-xs" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 50%, var(--ppn-border))", background: "color-mix(in srgb, var(--ppn-warning) 8%, transparent)" }}>
                  <p className="font-semibold" style={{ color: "var(--ppn-warning)" }}>⚠ Brief client does not match the active brand/preset.</p>
                  <p className="mt-1 text-[var(--ppn-muted)]">Brief client: <span className="font-semibold text-[var(--ppn-text)]">{brief.clientName}</span> · Active brand: <span className="font-semibold text-[var(--ppn-text)]">{DEMO_BRAND.sponsorName}</span> · Custom assets: <span className="font-semibold text-[var(--ppn-text)]">{ov.asset ? "custom" : "default"}</span></p>
                  <p className="mt-1 text-[var(--ppn-muted)]">Client identity (name, campaign, venue, offer wording) is now safe on the client-facing pages with a neutral mark. But theme colours and uploaded assets still come from the active brand until you align the preset. Align it in detailed config, or continue if this is intentional.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Link to="/config" className="rounded-lg px-3 py-1.5 font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Open detailed config to align</Link>
                    <Link to="/operator/setup-wizard" className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 font-semibold">Edit setup wizard</Link>
                    {anyOverrideActive() && <button onClick={() => { clearClientOverrides(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 font-semibold">Clear client overrides</button>}
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/operator/setup-wizard" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>Edit setup wizard</Link>
                <button onClick={() => { clearDemoBrief(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">Clear demo brief</button>
              </div>
            </>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs" style={{ color: "var(--ppn-warning)" }}>⚠ No demo brief yet — define the client and scenario before the demo.</span>
              <Link to="/operator/setup-wizard" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>Start setup wizard</Link>
            </div>
          )}
        </div>

        {/* A2c. Live demo quiz status — staged plan is PREPARED only; runtime apply is Phase 10B */}
        <div className="mt-4 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Live demo quiz</p>
            {stagedPlan
              ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-brand) 18%, transparent)", color: "var(--ppn-brand)" }}>Proposed quiz saved</span>
              : <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-[var(--ppn-muted)]" style={{ background: "var(--ppn-bg)" }}>Default quiz</span>}
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--ppn-success)" }}>Default live demo quiz still active.</p>
          {stagedPlan ? (
            <>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">Custom quiz plan prepared: <span className="font-semibold text-[var(--ppn-text)]">{presetById(stagedPlan.contentMixPreset)?.label ?? "Custom"} · {stagedPlan.quizLength} questions{stagedPlan.includeTiebreak ? " + tiebreak" : ""}</span> — ready for runtime apply.</p>
              <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Runtime apply requires a DB-backed replacement step (Phase 10B) — the tailored questions are not in the live demo yet.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link to="/operator/setup-wizard" className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">Edit in setup wizard</Link>
                <button onClick={() => { clearStagedDemoQuiz(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">Clear proposed quiz plan</button>
              </div>
            </>
          ) : (
            <p className="mt-1 text-xs text-[var(--ppn-muted)]">No custom quiz plan prepared. Prepare one in the setup wizard's Quiz content mix → Review step. Runtime apply requires a DB-backed replacement step (Phase 10B).</p>
          )}
        </div>

        {/* A3. Client presentation — the client-facing showcase (distinct from internal setup) */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Client presentation</p>
            <p className="text-xs text-[var(--ppn-muted)]">Internal setup prepares the demo · the client presentation shows the demo story. Read-only and client-safe.</p>
          </div>
          <Link to="/presentation" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>Open client presentation →</Link>
        </div>

        {/* B. Guided journey */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Guided demo journey</h2>
        <div className="mt-3 space-y-2">
          {JOURNEY.map((s) => (
            <div key={s.t} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{s.t}</p>
                <p className="text-xs text-[var(--ppn-muted)]">{s.i}</p>
              </div>
              {s.href
                ? <a href={s.href} target="_blank" rel="noreferrer" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>{s.label}</a>
                : <Link to={s.to!} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">{s.label}</Link>}
            </div>
          ))}
        </div>

        {/* C. Open demo surfaces (quick) */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Open demo surfaces</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/tv/DEMO" target="_blank" rel="noreferrer" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>Open TV ↗</a>
          <a href="/host" target="_blank" rel="noreferrer" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>Open Host ↗</a>
          <a href="/play/DEMO" target="_blank" rel="noreferrer" className={surfaceBtn} style={{ background: "var(--ppn-brand)" }}>Open Player ↗</a>
          <Link to="/config" className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">Detailed config</Link>
        </div>

        {/* D. Free exploration / route map */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">All surfaces (free exploration)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.label} className="rounded-xl border bg-[var(--ppn-surface)] p-3" style={{ borderColor: g.danger ? "color-mix(in srgb, var(--ppn-warning) 40%, var(--ppn-border))" : "var(--ppn-border)" }}>
              <p className="text-sm font-semibold">{g.label} <span className="text-[10px] font-normal" style={{ color: g.danger ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>· {g.note}</span></p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.routes.map(([to, label]) => (
                  <Link key={to} to={to} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1 text-xs hover:text-[var(--ppn-brand)]">{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* E. Troubleshooting */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Troubleshooting</h2>
        <div className="mt-3 rounded-xl border border-dashed border-[var(--ppn-border)] p-3 text-xs text-[var(--ppn-muted)]">
          <p>· Player/TV stuck on "waiting"? The host starts the quiz — open Host and press Start. Players never start the event.</p>
          <p className="mt-1">· Storage uploads unavailable? Start the local PPN database, or use manual paths in detailed config.</p>
          <p className="mt-1">· Wrong brewery showing? Clear client overrides above, then re-apply the right pack.</p>
        </div>
      </div>
    </DemoShell>
  );
}
