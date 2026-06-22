/**
 * /kpi — brewery campaign dashboard (Pillar 2). A SEEDED PROJECTION: every headline number is DERIVED from a
 * handful of honest per-market assumptions (kpiModel.ts) so the funnel visibly reconciles. No analytics, no
 * tracking, no charts library — arithmetic a trade-marketing buyer can check in their head. Active market/brewery.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { deriveKpi, perVenue, perRound, pct } from "../demo/kpiModel";

export default function Kpi() {
  const m = activeMarket();
  const s = m.kpiSeed;
  const d = deriveKpi(s);
  const venues = perVenue(s);
  const rounds = perRound(s, d.teamsCreated);
  const sponsored = rounds.find((r) => r.sponsor);
  const n = (x: number) => x.toLocaleString();

  const funnel = [
    { v: s.venuesActivated, label: "Venues activated", basis: "campaign footprint (assumption)", why: "on-trade reach" },
    { v: d.eventsRun, label: "Events run", basis: `${s.venuesActivated} venues × ${s.avgEventsPerVenue} events/venue`, why: "activation volume" },
    { v: d.playersJoined, label: "Players joined", basis: `${n(d.eventsRun)} events × ${s.avgPlayersPerEvent} players/event`, why: "audience reached" },
    { v: d.teamsCreated, label: "Teams created", basis: `${n(d.playersJoined)} players ÷ ${s.avgPlayersPerTeam} players/team`, why: "engaged units" },
  ];

  const Rate = ({ label, value, denom }: { label: string; value: string; denom: string }) => (
    <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
      <p className="text-2xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{value}</p>
      <p className="mt-0.5 text-sm font-semibold">{label}</p>
      <p className="mt-1 text-xs text-[var(--ppn-muted)]">{denom}</p>
    </div>
  );

  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{m.flag} {m.label} · Seeded campaign projection</p>
        <h1 className="mt-2 text-3xl font-extrabold">{DEMO_BRAND.campaignName}</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{DEMO_BRAND.broughtBy} · an illustrative projection of the proof a sponsor receives after a campaign.</p>

        {/* ── Reconciliation funnel ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Campaign funnel — how the numbers reconcile</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {funnel.map((f, i) => (
            <div key={f.label} className="relative rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-3xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{n(f.v)}</p>
              <p className="mt-0.5 text-sm font-semibold">{f.label}</p>
              <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">{f.basis}</p>
              <p className="mt-1 text-[11px]" style={{ color: DEMO_BRAND.primary }}>{f.why}</p>
              {i < funnel.length - 1 && <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[var(--ppn-muted)] sm:block">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">
          Reconciles: {n(d.playersJoined)} players ≈ {n(d.eventsRun)} events × {s.avgPlayersPerEvent} · {n(d.teamsCreated)} teams = {n(d.playersJoined)} ÷ {s.avgPlayersPerTeam} · {n(d.avgPlayersPerVenue)} players/venue = {n(d.playersJoined)} ÷ {s.venuesActivated} · {d.avgTeamsPerEvent} teams/event.
        </p>

        {/* ── Denominator-backed rates ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Engagement — every rate has a denominator</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Rate label="Completion rate" value={pct(s.completionRate)} denom={`${n(d.playersCompleted)} of ${n(d.playersJoined)} joined players reached the final question`} />
          <Rate label="Sponsored answer rate" value={pct(s.sponsoredAnswerRate)} denom={`${n(d.sponsoredTeamsAnswered)} of ${n(d.teamsCreated)} teams answered the sponsored question`} />
          <Rate label="Repeat-venue signal" value={pct(s.repeatBookingRate)} denom={`${d.repeatVenuesEstimate} of ${s.venuesActivated} venues booked 2+ events`} />
          <Rate label="Dwell proxy" value={`~${d.eventDurationEstimate} min`} denom={`${s.questionsPerEvent} questions × ${s.avgMinutesPerQuestion} min + ${s.bufferMinutes} min buffer`} />
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
          <p className="text-sm"><span className="font-bold" style={{ color: DEMO_BRAND.primary }}>~{n(d.campaignReachEstimate)}</span> estimated campaign reach
            <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" }}>estimate</span></p>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">{n(d.playersJoined)} players joined × {s.campaignReachMultiplier} reach multiplier (players + estimated onlookers). An estimate, not measured attendance.</p>
        </div>

        {/* ── Per-venue ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Top venues — scaled from the same assumptions</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs text-[var(--ppn-muted)]">
              <th className="px-3 py-2">Venue</th><th className="px-3 py-2">Events</th><th className="px-3 py-2">Players/event</th><th className="px-3 py-2">Players</th><th className="px-3 py-2">Teams</th><th className="px-3 py-2">Completed final Q</th><th className="px-3 py-2">Teams answered sponsor</th>
            </tr></thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.name} className="rounded-lg border-t border-[var(--ppn-border)]">
                  <td className="px-3 py-2 font-semibold">{v.name}</td>
                  <td className="px-3 py-2">{v.events}</td>
                  <td className="px-3 py-2">{v.avgPlayersPerEvent}</td>
                  <td className="px-3 py-2">{n(v.playersJoined)}</td>
                  <td className="px-3 py-2">{n(v.teams)}</td>
                  <td className="px-3 py-2">{pct(v.completionRate)} <span className="text-[var(--ppn-muted)]">({Math.round(v.playersJoined * v.completionRate)})</span></td>
                  <td className="px-3 py-2">{pct(v.sponsoredAnswerRate)} <span className="text-[var(--ppn-muted)]">({Math.round(v.teams * v.sponsoredAnswerRate)})</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Per-round (sponsor engagement explicit) ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">By round — teams shown vs answered</h2>
        <div className="mt-3 space-y-2">
          {rounds.map((r) => (
            <div key={r.name} className="rounded-xl border bg-[var(--ppn-surface)] p-3" style={{ borderColor: r.sponsor ? DEMO_BRAND.primary : "var(--ppn-border)" }}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{r.name}{r.sponsor && <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "color-mix(in srgb, var(--ppn-brand) 16%, transparent)", color: DEMO_BRAND.primary }}>brand exposure moment</span>}</span>
                <span className="font-bold">{pct(r.answerRate)}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{n(r.teamsAnswered)} of {n(r.teamsShown)} teams answered{r.sponsor ? ` — ${n(r.teamsAnswered)} teams actively engaged with the ${DEMO_BRAND.sponsorName} round` : ""}.</p>
            </div>
          ))}
        </div>

        {/* ── Why this matters ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Why this matters to {DEMO_BRAND.sponsorName}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3"><span className="font-semibold">Venue activation footprint</span> — {s.venuesActivated} venues, {n(d.eventsRun)} branded events: real on-trade presence.</li>
          <li className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3"><span className="font-semibold">Repeat potential</span> — {d.repeatVenuesEstimate} venues booked 2+ events ({pct(s.repeatBookingRate)}): a recurring channel, not a one-off.</li>
          <li className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3"><span className="font-semibold">Participation &amp; dwell</span> — {n(d.playersCompleted)} players stayed to the final question (~{d.eventDurationEstimate} min/event): time in venue = food &amp; drink occasions.</li>
          <li className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3"><span className="font-semibold">Sponsor engagement</span> — {sponsored ? `${n(sponsored.teamsAnswered)} teams (${pct(s.sponsoredAnswerRate)})` : "—"} actively answered your sponsored round: measured brand interaction, not just impressions.</li>
          {s.valuePerVisit != null && (
            <li className="rounded-xl border border-dashed border-[var(--ppn-border)] p-3">
              <span className="font-semibold">ROI lens (your assumption)</span> — if an engaged visit is worth ~{s.currency}{s.valuePerVisit} in food/drink, {n(d.playersCompleted)} engaged visits ≈ <span style={{ color: DEMO_BRAND.primary }}>{s.currency}{n(d.playersCompleted * s.valuePerVisit)}</span> of occasion value.
              <span className="ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" }}>assumption — not measured sales</span>
            </li>
          )}
        </ul>

        {/* ── Measurement model ── */}
        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">How this is calculated</h2>
        <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm text-[var(--ppn-muted)]">
          <ul className="list-disc space-y-1 pl-5">
            <li>This is a <span className="text-[var(--ppn-text)]">seeded campaign projection</span> — figures are <span className="text-[var(--ppn-text)]">derived from assumptions</span> (venues, events/venue, players/event, players/team, completion &amp; sponsored-answer rates), not real analytics.</li>
            <li>Funnel, per-venue and per-round numbers all scale from the same assumptions, so they reconcile.</li>
            <li>Every percentage states its denominator; campaign reach is an <span className="text-[var(--ppn-text)]">estimate</span>, not measured attendance.</li>
            <li>Aggregated only — <span className="text-[var(--ppn-text)]">no raw personal player data</span> is shown.</li>
            <li>In a real deployment these assumptions are replaced by actual event data from the live game.</li>
          </ul>
        </div>
        <p className="mt-6 text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.responsibleNote} · Switch market/brewery in Presenter tools or /config.</p>
      </div>
    </DemoShell>
  );
}
