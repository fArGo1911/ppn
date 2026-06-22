/**
 * /kpi — brewery KPI mock-up (Pillar 2). Seeded numbers for the ACTIVE market/brewery preset — the proof a
 * sponsor receives after funding PPN events. NOT an analytics engine: pure config (markets.ts), no tracking.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";

export default function Kpi() {
  const m = activeMarket();
  const k = m.kpi;
  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
      <p className="text-2xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{value}</p>
      <p className="mt-1 text-xs text-[var(--ppn-muted)]">{label}</p>
    </div>
  );
  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{m.flag} {m.label} · Seeded projection</p>
        <h1 className="mt-2 text-3xl font-extrabold">{DEMO_BRAND.campaignName}</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{DEMO_BRAND.broughtBy} · the proof a sponsor receives after funding PPN events.</p>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Participating venues" value={`${k.venues}`} />
          <Stat label="Events run" value={`${k.eventsRun}`} />
          <Stat label="Players reached" value={k.playersReached.toLocaleString()} />
          <Stat label="Teams created" value={k.teamsCreated.toLocaleString()} />
          <Stat label="Avg players / venue" value={`${k.avgPlayersPerVenue}`} />
          <Stat label="Sponsored participation" value={`${k.sponsoredParticipationPct}%`} />
          <Stat label="Completion rate" value={`${k.completionPct}%`} />
          <Stat label="Est. campaign reach" value={k.estimatedCampaignReach.toLocaleString()} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">Engagement by venue</p>
            <div className="space-y-2">
              {k.engagementByVenue.map((v) => (
                <div key={v.venue} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                  <div className="flex items-center justify-between text-sm"><span>{v.venue}</span><span className="font-bold">{v.engagementPct}%</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-[var(--ppn-bg)]"><div className="h-2 rounded-full" style={{ width: `${v.engagementPct}%`, background: DEMO_BRAND.primary }} /></div>
                  <p className="mt-1 text-xs text-[var(--ppn-muted)]">{v.players} players</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Engagement by round</p>
            <div className="space-y-2">
              {k.engagementByRound.map((r) => (
                <div key={r.round} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                  <div className="flex items-center justify-between text-sm"><span>{r.round}</span><span className="font-bold">{r.answerRatePct}%</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-[var(--ppn-bg)]"><div className="h-2 rounded-full" style={{ width: `${r.answerRatePct}%`, background: DEMO_BRAND.colours.secondary }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-4 mb-2 text-sm font-semibold">Top-performing venues</p>
            <div className="flex flex-wrap gap-2">
              {k.topVenues.map((v) => <span key={v} className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1 text-xs">{v}</span>)}
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.responsibleNote} · Aggregated demo data — no raw player data. Switch market/brewery at /config.</p>
      </div>
    </DemoShell>
  );
}
