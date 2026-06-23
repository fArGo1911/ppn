/**
 * /report — Brewery report. A boardroom-friendly view of what a brewery would RECEIVE after a pilot.
 * Seeded demo data (reconciles with the same scenario seed as /kpi + /rollout) — NOT a completed campaign.
 * Persona: brewery report. No analytics, no export/PDF, no measured-sales claims.
 */
import { DemoShell } from "../components/shells";
import { activeMarket } from "../demo/markets";
import { clientFacingIdentity } from "../lib/clientFacingDemo";
import { getDemoBrief } from "../lib/demoBrief";
import { resolveContentMix, topCategories } from "../lib/contentMix";
import { deriveKpi, getEffectiveKpiSeed, getEffectiveVenueMix, deriveVenueMix, pct } from "../demo/kpiModel";

const contentTop = (n = 3) =>
  topCategories(resolveContentMix(getDemoBrief()), n)
    .map((c) => c.label.replace(" / football", "").replace(" / venue", "").replace(" / culture", "").replace(" round", "").toLowerCase())
    .join(", ");

export default function Report() {
  const m = activeMarket();
  const ci = clientFacingIdentity();
  const s = getEffectiveKpiSeed(m.kpiSeed);
  const d = deriveKpi(s);
  const mix = getEffectiveVenueMix();
  const mixD = mix ? deriveVenueMix(mix, s.campaignReachMultiplier, s.avgPlayersPerTeam) : null;
  const vr = m.venueReport;
  const n = (x: number) => x.toLocaleString();
  const brand = "var(--ppn-brand)";

  const Section = ({ title }: { title: string }) => <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">{title}</h2>;
  const Stat = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4"><p className="text-2xl font-extrabold" style={{ color: brand }}>{value}</p><p className="mt-0.5 text-xs text-[var(--ppn-muted)]">{label}</p></div>
  );

  return (
    <DemoShell clientFacing>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: brand }}>{m.flag} {m.label} · Brewery report</p>
        <h1 className="mt-2 text-3xl font-extrabold">{ci.campaignName} — pilot report</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{ci.broughtBy}</p>
        <div className="mt-3 rounded-xl border-2 p-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 40%, var(--ppn-border))", background: "color-mix(in srgb, var(--ppn-warning) 8%, transparent)" }}>
          <span className="font-semibold">Example pilot report</span> — seeded demo data, <span className="font-semibold">not a completed campaign</span>. Shows the format a brewery receives after a real pilot.
        </div>

        <Section title="Campaign summary" />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          <Stat label="Venues activated" value={`${s.venuesActivated}`} />
          <Stat label="Branded events" value={n(d.eventsRun)} />
          <Stat label="Player visits" value={n(d.playersJoined)} />
          <Stat label="Teams" value={n(d.teamsCreated)} />
          <Stat label="Completed to final Q" value={n(d.playersCompleted)} />
          <Stat label="Est. reach (incl. onlookers)" value={`~${n(d.campaignReachEstimate)}`} />
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">Campaign totals across many venues & events — not one pub night.</p>

        <Section title="Venue & setup mix" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Venue mix</p>
            <p className="mt-1">{mixD ? mixD.categoryMix.map((c) => `${c.venues}× ${c.label}`).join(" · ") : `${s.venuesActivated} venues (${m.context.split("—")[0].trim()})`}</p>
          </div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Setup / output mix</p>
            <p className="mt-1">{mixD ? mixD.setupMix.map((su) => `${su.pctVenues}% ${su.label}`).join(" · ") : "TV + audio where available, with audio-only and manual live fallbacks"}</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">Content profile: <span className="text-[var(--ppn-text)]">venue-tuned — weighted towards {contentTop()}</span>. A proposed question mix; final questions can be tailored per venue before launch.</p>

        <Section title="Participation" />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Completion rate" value={pct(s.completionRate)} />
          <Stat label="Avg players / event" value={`${Math.round(s.avgPlayersPerEvent)}`} />
          <Stat label="Avg teams / event" value={`${d.avgTeamsPerEvent}`} />
          <Stat label="Dwell proxy" value={`~${d.eventDurationEstimate}m`} />
        </div>

        <Section title="Sponsor exposure" />
        <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm">
          <p><span className="font-semibold">{n(d.eventsRun)}</span> branded events · <span className="font-semibold">{n(d.sponsoredTeamsAnswered)}</span> teams ({pct(s.sponsoredAnswerRate)}) engaged the sponsored round.</p>
          <p className="mt-1 text-[var(--ppn-muted)]">Brand moments each night: welcome + QR · AI intro · sponsored round · scoreboard · winner / thanks.</p>
        </div>

        <Section title="Venue-reported outcome (example)" />
        <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm">
          <div className="flex items-center justify-between"><p className="font-semibold">{m.venueExample}</p><span className="rounded-full bg-[var(--ppn-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--ppn-muted)]">venue-reported</span></div>
          <p className="mt-2 text-[var(--ppn-muted)]">{vr.attendanceEstimate} guests · {vr.sponsorUnitsSold} sponsor units sold · {vr.offerRedemptions} redemptions · busier than usual: {vr.busierThanUsual ? "Yes" : "No"} · would run again: {vr.wouldRunAgain ? "Yes" : "No"}</p>
          <p className="mt-1 italic">“{vr.staffComment}”</p>
          <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">{vr.posEvidenceStatus} · PPN does not claim to measure bar sales.</p>
        </div>

        <Section title="Evidence breakdown" />
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm"><p className="font-semibold">Measured by PPN (live pilot)</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">Players, teams, answer submissions, sponsored engagement, completion, dwell proxy.</p></div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm"><p className="font-semibold">Reported by venue</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">Attendance, units sold, redemptions, staff feedback, would run again.</p></div>
          <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-3 text-sm"><p className="font-semibold">Estimated / future</p><p className="mt-1 text-xs text-[var(--ppn-muted)]">Reach &amp; occasion value (estimated); POS/till evidence optional later — not connected in this demo.</p></div>
        </div>

        <Section title="Recommendation / next decision" />
        <div className="mt-3 rounded-xl border-2 bg-[var(--ppn-surface)] p-4 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
          <p><span className="font-semibold">Expand to a regional campaign.</span> Completion ({pct(s.completionRate)}) and sponsored engagement ({pct(s.sponsoredAnswerRate)}) met targets and venues would rebook. Compare venue types in the next stage before a wider activation.</p>
          <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Illustrative recommendation from seeded data — a live pilot replaces these with measured results.</p>
        </div>

        <p className="mt-8 text-xs text-[var(--ppn-muted)]">Prepared demo report — illustrative seeded data. The scenario can be tailored for the chosen venue mix before a pilot.</p>
      </div>
    </DemoShell>
  );
}
