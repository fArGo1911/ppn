/**
 * /operator — Operator Demo Control Centre (gated). The truthful "start here" hub: active-demo status, then three
 * lanes that match the operator's real job — Design demo → Preview client tour → Run live demo — plus an appendix
 * of supporting material (rollout / run-sheet / capabilities / asset reference). Sits ABOVE /config (the detailed
 * setup). IA/copy only — no game-loop/scoring/runtime changes.
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

// The operator's real job is to DESIGN the demo, PREVIEW the client tour, then RUN the live demo. Each lane lists
// the truthful surface for that job — not a forced route-checklist, and with no vague "setup"/"scenario"/"AI intro"
// wording. `href` opens a live surface in a new tab (↗); `to` is an in-app page.
type Action = { to?: string; href?: string; label: string; note: string; role: string; primary?: boolean };
type Lane = { n: string; title: string; blurb: string; actions: Action[] };
const LANES: Lane[] = [
  {
    n: "1", title: "Design demo", blurb: "Prepare the client demo before anyone sees it.",
    actions: [
      { to: "/operator/setup-wizard", label: "Demo setup wizard", note: "Start here — the demo brief: client, outcome, scale and content mix.", role: "Operator-only", primary: true },
      { to: "/config", label: "Detailed config / brand & media setup", note: "Where you prepare the brewery logo, colours, offer/sponsor assets and screen media. The actual prep page.", role: "Operator-only", primary: true },
      { to: "/config", label: "Campaign assumptions / demo numbers", note: "The venue-mix numbers that feed the KPI, report and rollout pages.", role: "Operator-only" },
      { to: "/operator/setup-wizard", label: "Content mix", note: "Choose the quiz content profile — the proposed-quiz preview.", role: "Operator-only" },
    ],
  },
  {
    n: "2", title: "Preview client tour", blurb: "Open the client-safe surfaces to tell the story.",
    actions: [
      { to: "/presentation", label: "Client presentation", note: "The guided buyer showcase.", role: "Client-safe", primary: true },
      { href: "/tv/DEMO", label: "TV display / audience screen", note: "The room screen guests see.", role: "TV / audience" },
      { href: "/play/DEMO", label: "Player phone", note: "What a guest sees on their own phone.", role: "Guest / player" },
      { to: "/report", label: "Report", note: "The seeded pilot report.", role: "Client-safe" },
      { to: "/kpi", label: "KPI summary", note: "The reconciled engagement projection.", role: "Client-safe" },
    ],
  },
  {
    n: "3", title: "Run live demo", blurb: "The seeded live game on the DEMO session. The tailored content mix / staged quiz plan is prepared only — the default live demo quiz still runs the event (not live runtime).",
    actions: [
      { href: "/host", label: "Host console", note: "Start the live demo from here (start intro / start game), reveal, next, recover.", role: "Operator-only", primary: true },
      { href: "/tv/DEMO", label: "TV display", note: "Full-screen on the TV / projector.", role: "TV / audience" },
      { href: "/play/DEMO", label: "Player phone", note: "A guest joins and plays.", role: "Guest / player" },
      { to: "/config", label: "Reset demo session", note: "Clean the session and add demo teams in detailed config.", role: "Operator-only" },
    ],
  },
];

// Available for depth, but NOT core guided-demo steps.
const APPENDIX: { to: string; label: string; role: string }[] = [
  { to: "/rollout", label: "Rollout", role: "Supporting / appendix" },
  { to: "/run-sheet", label: "Run sheet", role: "Supporting / appendix" },
  { to: "/capabilities", label: "Beyond quiz / capabilities", role: "Supporting / appendix" },
  { to: "/setup", label: "Asset reference / slot guide", role: "Reference" },
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
        <p className="mt-1 text-[var(--ppn-muted)]">Start here: design the demo, preview the client tour, then run the live demo. Gated operator hub — not shown to clients.</p>

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
            <Chip label="Demo numbers override" on={ov.scenario} />
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

        {/* A2d. Active demo branding — read-only summary (existing override state). Points to the real prep page
            (/config) vs the reference-only slot guide (/setup) so the operator never has to infer either. */}
        <div className="mt-4 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
          <p className="text-sm font-semibold">Active demo branding</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip label="Active brand preset:" on onText={`${DEMO_BRAND.sponsorName} · ${m.market}`} />
            <Chip label="Custom assets" on={ov.asset} />
            <Chip label="Brand colours" on={ov.theme} onText="custom" offText="preset" />
          </div>
          <p className="mt-2 text-xs text-[var(--ppn-muted)]">Prepare the brewery logo, colours, offer/sponsor assets and screen media in <span className="font-semibold text-[var(--ppn-text)]">Detailed config / brand & media setup</span>. The asset reference is a slot guide only — it shows which asset appears on which screen, but you set and upload assets in detailed config.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/config" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Open brand &amp; media setup →</Link>
            <Link to="/setup" className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-sm font-semibold">Where each asset appears (reference) →</Link>
          </div>
        </div>

        {/* B. The three demo lanes — the operator's real job, in order */}
        <div className="mt-6 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
          <p className="text-sm font-semibold">Start here</p>
          <p className="mt-1 text-sm text-[var(--ppn-muted)]">Design the demo, preview the client tour, then run the live demo. The three lanes below follow that order; rollout / run-sheet / beyond-quiz are appendix material, not core steps.</p>
        </div>

        <div className="mt-4 space-y-4">
          {LANES.map((lane) => (
            <div key={lane.n} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <div className="flex items-baseline gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-full text-xs font-black text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>{lane.n}</span>
                <h2 className="text-lg font-bold">{lane.title}</h2>
              </div>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{lane.blurb}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {lane.actions.map((a, i) => {
                  const inner = (
                    <>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {a.label}
                          <span className="ml-2 rounded border border-[var(--ppn-border)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--ppn-muted)]">{a.role}</span>
                        </p>
                        <p className="text-xs text-[var(--ppn-muted)]">{a.note}</p>
                      </div>
                      <span className="shrink-0 text-[var(--ppn-brand)]">{a.href ? "↗" : "→"}</span>
                    </>
                  );
                  const cls = "flex items-center justify-between gap-2 rounded-lg border p-3 hover:border-[var(--ppn-brand)]";
                  const style = { borderColor: a.primary ? "color-mix(in srgb, var(--ppn-brand) 45%, var(--ppn-border))" : "var(--ppn-border)" };
                  return a.href
                    ? <a key={i} href={a.href} target="_blank" rel="noreferrer" className={cls} style={style}>{inner}</a>
                    : <Link key={i} to={a.to!} className={cls} style={style}>{inner}</Link>;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* C. Appendix / supporting material — available, but not core guided-demo steps */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Appendix / supporting material</h2>
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">Available for depth, but not core guided-demo steps.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {APPENDIX.map((a) => (
            <Link key={a.to} to={a.to} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-1.5 text-xs hover:text-[var(--ppn-brand)]">
              <span className="font-semibold">{a.label}</span>
              <span className="text-[9px] text-[var(--ppn-muted)]">· {a.role}</span>
            </Link>
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
