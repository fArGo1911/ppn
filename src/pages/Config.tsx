/**
 * /config — hidden OPERATOR prep room (presenter only; never part of the buyer journey). Lightweight demo prep:
 * brewery preset, market, setup mode, reset demo, seed/clear teams, audience-mode toggle. Richer profile pickers
 * are labelled stubs. NOT an admin/CMS/portal — just enough to prepare a demo run.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { SETUP_MODES } from "../demo/setup";
import { useAudienceMode } from "../lib/audience";
import { resolveJoinToken, getSessionState, setSessionSetup, resetDemo, clearTeams, seedDemoTeams, listTeams } from "../lib/ppnApi";

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
