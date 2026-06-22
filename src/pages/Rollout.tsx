/**
 * /rollout — network/scale story (mock). Seeded 5 → 25 → 100-venue tiers for the ACTIVE market/brewery,
 * plus pilot venues + next venues to activate. Config only (markets.ts) — no real multi-venue ops.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";

export default function Rollout() {
  const m = activeMarket();
  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{m.flag} {m.label} · rollout (mock)</p>
        <h1 className="mt-2 text-3xl font-extrabold">From pilot to {DEMO_BRAND.sponsorName} network</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{m.context}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {m.rollout.map((t, i) => (
            <div key={t.id} className="rounded-xl border bg-[var(--ppn-surface)] p-4" style={{ borderColor: i === 0 ? DEMO_BRAND.primary : "var(--ppn-border)" }}>
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="mt-2 text-3xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{t.venues}<span className="text-base font-medium text-[var(--ppn-muted)]"> venues</span></p>
              <p className="mt-2 text-sm">{t.eventsRunPerMonth} events / month</p>
              <p className="text-sm">{t.playersReached.toLocaleString()} players reached</p>
              <p className="mt-2 text-xs text-[var(--ppn-muted)]">{t.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Pilot venues ({m.pilotVenues.length})</p>
            <div className="space-y-1.5">
              {m.pilotVenues.map((v) => (
                <div key={v} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2 text-sm">
                  <span style={{ color: DEMO_BRAND.colours.success }}>●</span> {v}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Next venues to activate</p>
            <div className="space-y-1.5">
              {m.nextVenues.map((v) => (
                <div key={v} className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--ppn-border)] px-3 py-2 text-sm text-[var(--ppn-muted)]">
                  <span style={{ color: DEMO_BRAND.primary }}>○</span> {v}
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--ppn-muted)]">Seeded demo data. Switch market/brewery at /config.</p>
      </div>
    </DemoShell>
  );
}
