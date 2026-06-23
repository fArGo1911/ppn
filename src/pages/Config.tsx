/**
 * /config — hidden OPERATOR prep room (presenter only; never part of the buyer journey). Lightweight demo prep:
 * brewery preset, market, setup mode, reset demo, seed/clear teams, audience-mode toggle. Richer profile pickers
 * are labelled stubs. NOT an admin/CMS/portal — just enough to prepare a demo run.
 */
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials, type ThemeColours } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { SETUP_MODES } from "../demo/setup";
import { useAudienceMode } from "../lib/audience";
import { applyTheme, getThemeOverride, setThemeOverride, clearThemeOverride, themeWarnings, type ColourOverride } from "../demo/theme";
import { resolveJoinToken, getSessionState, setSessionSetup, resetDemo, clearTeams, seedDemoTeams, listTeams } from "../lib/ppnApi";

const THEME_FIELDS: { key: keyof ThemeColours; label: string }[] = [
  { key: "primary", label: "Primary / brand" }, { key: "primaryDark", label: "Brand dark" }, { key: "accent", label: "Accent" },
  { key: "bg", label: "Background" }, { key: "surface", label: "Surface / card" }, { key: "border", label: "Border" },
  { key: "text", label: "Main text" }, { key: "muted", label: "Muted text" }, { key: "onBrand", label: "Button text" },
  { key: "success", label: "Success" }, { key: "warning", label: "Warning" },
];

export default function Config() {
  const active = getActiveBrand();
  const market = activeMarket();
  const qc = useQueryClient();
  const [audience, setAudience] = useAudienceMode();

  const sessQ = useQuery({ queryKey: ["config-session"], queryFn: () => resolveJoinToken("DEMO") });
  const sid = sessQ.data && sessQ.data.kind !== "invalid" ? sessQ.data.session.sessionId : undefined;
  const stateQ = useQuery({ queryKey: ["config-state", sid], queryFn: () => getSessionState(sid!), enabled: !!sid });
  const teamsQ = useQuery({ queryKey: ["config-teams", sid], queryFn: () => listTeams(sid!), enabled: !!sid, refetchInterval: 4000 });
  const st = stateQ.data;

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["config-state", sid] }); qc.invalidateQueries({ queryKey: ["config-teams", sid] }); },
  });
  const run = (fn: () => Promise<unknown>) => act.mutate(fn);
  const busy = act.isPending;

  const specs = [
    { name: market.teamNames[0], players: market.playerNames.slice(0, 3) },
    { name: market.teamNames[1], players: market.playerNames.slice(3, 6) },
    { name: market.teamNames[2], players: market.playerNames.slice(6, 8) },
  ];

  // ── Internal theme studio (operator-only colour override; localStorage; applies live) ──
  const [over, setOver] = useState<ColourOverride>(getThemeOverride());
  const update = (key: keyof ThemeColours, value: string) => {
    const next = { ...over, [key]: value };
    setOver(next); setThemeOverride(next); applyTheme(active);
  };
  const resetTheme = () => { clearThemeOverride(); setOver({}); applyTheme(active); };
  const effective = { ...active.colours, ...over } as ThemeColours;
  const warns = themeWarnings(effective);
  const hasOver = Object.keys(over).length > 0;

  const choose = (id: string) => { setActiveBrand(id); window.location.reload(); };
  const Card = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );

  return (
    <DemoShell>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: active.primary }}>Presenter · operator prep room</p>
        <h1 className="mt-2 text-3xl font-extrabold">Demo setup</h1>
        <p className="mt-2 text-[var(--ppn-muted)]">Prepare a run before a brewery sees it. Hidden from the buyer journey.</p>

        <div className="mt-6 space-y-4">
          <Card title="Brewery preset · market">
            <div className="space-y-2">
              {PRESETS.map((p) => {
                const on = p.id === active.id;
                return (
                  <button key={p.id} onClick={() => choose(p.id)} className="flex w-full items-center gap-3 rounded-xl border bg-[var(--ppn-bg)] p-3 text-left" style={{ borderColor: on ? p.colours.primary : "var(--ppn-border)" }}>
                    <span className="grid h-9 w-9 place-items-center rounded-lg font-black" style={{ background: p.colours.primary, color: p.colours.onBrand }}>{brandInitials(p.sponsorName)}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{p.sponsorName} <span className="ml-1 rounded bg-[var(--ppn-surface)] px-1.5 py-0.5 text-[10px] text-[var(--ppn-muted)]">{p.market}</span></p>
                      <p className="text-xs text-[var(--ppn-muted)]">{p.tagline} · {p.pubName}</p>
                    </div>
                    {on && <span className="text-xs font-semibold" style={{ color: p.colours.primary }}>Active</span>}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Internal theme studio (operator only)">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--ppn-muted)]">Base preset: <span className="font-semibold text-[var(--ppn-text)]">{active.sponsorName}</span> <span className="ml-1 rounded bg-[var(--ppn-bg)] px-1.5 py-0.5 text-[10px]">{active.market}</span></p>
              {hasOver
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Custom colours active</span>
                : <span className="text-[10px] text-[var(--ppn-muted)]">preset defaults</span>}
            </div>
            <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Predesign a brewery look before the pitch. Internal only — applies to all demo surfaces; never shown to the brewery.</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {THEME_FIELDS.map((f) => {
                const val = (over[f.key] ?? active.colours[f.key]) as string;
                const isHex = /^#([0-9a-f]{6})$/i.test(val);
                return (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="h-7 w-7 shrink-0 rounded border border-[var(--ppn-border)]" style={{ background: val }} />
                    {isHex && <input type="color" value={val} onChange={(e) => update(f.key, e.target.value)} className="h-7 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" aria-label={`${f.label} picker`} />}
                    <label className="w-24 shrink-0 text-xs text-[var(--ppn-muted)]">{f.label}</label>
                    <input value={val} onChange={(e) => update(f.key, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 font-mono text-xs" />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={resetTheme} disabled={!hasOver} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">↺ Reset to preset defaults</button>
            </div>

            {warns.length > 0 ? (
              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, transparent)", background: "color-mix(in srgb, var(--ppn-warning) 12%, transparent)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--ppn-warning)" }}>⚠ Readability warnings (operator-only)</p>
                <ul className="mt-1 list-disc pl-5 text-xs text-[var(--ppn-muted)]">{warns.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            ) : <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Contrast looks readable.</p>}

            {/* Live preview */}
            <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Live preview</p>
            <div className="mt-2 rounded-xl border border-[var(--ppn-border)] p-3" style={{ background: "var(--ppn-bg)" }}>
              <div className="rounded-lg p-3" style={{ background: "var(--ppn-surface)", border: "1px solid var(--ppn-border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--ppn-text)" }}>Sample card · {active.sponsorName}</p>
                <p className="text-xs" style={{ color: "var(--ppn-muted)" }}>Muted text reads here.</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }}>Primary</button>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ border: "1px solid var(--ppn-border)", color: "var(--ppn-text)" }}>Secondary</button>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-success) 20%, transparent)", color: "var(--ppn-success)" }}>success</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>warning</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--ppn-brand-dark) 14%, transparent), transparent)", borderTop: "1px solid var(--ppn-border)" }}>
                <span className="text-xs" style={{ color: "var(--ppn-muted)" }}><span className="font-semibold" style={{ color: "var(--ppn-brand)" }}>{active.sponsorName}</span> · {active.broughtBy}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-brand) 18%, transparent)", color: "var(--ppn-brand)" }}>🎁 {active.offer}</span>
                <span className="ml-auto text-[10px]" style={{ color: "var(--ppn-muted)" }}>⚡ {active.poweredBy}</span>
              </div>
            </div>
          </Card>

          <Card title="Setup mode (output)">
            {!st ? <p className="text-sm text-[var(--ppn-muted)]">Loading session…</p> : (
              <div className="grid gap-2 sm:grid-cols-3">
                {SETUP_MODES.map((m) => {
                  const on = st.setupMode === m.id;
                  return (
                    <button key={m.id} disabled={busy} onClick={() => run(() => setSessionSetup(sid!, m.id, st.hostingMode))}
                      className="rounded-xl border p-3 text-left text-sm disabled:opacity-60"
                      style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", background: on ? "color-mix(in srgb, var(--ppn-brand) 12%, transparent)" : "transparent" }}>
                      <p className="font-semibold">{m.label}</p>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Hosting mode + AI intro are toggled live on the host panel.</p>
          </Card>

          <Card title="Demo session">
            <div className="flex flex-wrap items-center gap-2">
              <button disabled={busy || !sid} onClick={() => run(() => resetDemo(sid!))} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)] disabled:opacity-50" style={{ background: "var(--ppn-brand)" }}>↺ Reset demo (clean lobby)</button>
              <button disabled={busy || !sid} onClick={() => run(() => seedDemoTeams(sid!, specs))} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">＋ Seed demo teams</button>
              <button disabled={busy || !sid} onClick={() => run(() => clearTeams(sid!))} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">✕ Clear teams</button>
            </div>
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">
              {teamsQ.data ? `${teamsQ.data.length} team${teamsQ.data.length === 1 ? "" : "s"} in session · ` : ""}
              Seed uses {market.label} names ({specs.map((s) => s.name).join(", ")}).
            </p>
          </Card>

          <Card title="Presentation mode">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAudience(true)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>▶ Enter audience mode (hide all chrome)</button>
              <button onClick={() => setAudience(false)} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold">Exit audience mode</button>
              <span className="text-xs text-[var(--ppn-muted)]">Currently: {audience ? "audience (clean)" : "presenter (chrome on)"}</span>
            </div>
          </Card>

          <Card title="Content / KPI / rollout profiles">
            <div className="flex flex-wrap gap-2 text-xs text-[var(--ppn-muted)]">
              {["Content-mix profile", "KPI profile", "Rollout profile"].map((s) => (
                <span key={s} className="rounded-full border border-dashed border-[var(--ppn-border)] px-3 py-1.5">{s} · operator stub</span>
              ))}
            </div>
            <p className="mt-3 text-xs"><Link to="/setup" className="text-[var(--ppn-brand)]">Brand asset spec →</Link> <span className="text-[var(--ppn-muted)]">(operator reference — not shown to the buyer)</span></p>
          </Card>
        </div>
      </div>
    </DemoShell>
  );
}
