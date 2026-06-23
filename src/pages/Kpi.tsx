/**
 * /kpi — brewery campaign report (Pillar 2), EXECUTIVE-FRAMED. Leads with the commercial story a C-level /
 * trade-marketing buyer cares about ("what did my brand get?"), then proves it with the reconciliation funnel
 * and denominator-backed detail. Still a SEEDED PROJECTION (kpiModel.ts) — no analytics, no tracking, no schema.
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

  const Section = ({ title }: { title: string }) => (
    <h2 className="mt-9 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">{title}</h2>
  );
  const Tag = ({ text, warn }: { text: string; warn?: boolean }) => (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={warn
      ? { background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" }
      : { background: "color-mix(in srgb, var(--ppn-brand) 16%, transparent)", color: DEMO_BRAND.primary }}>{text}</span>
  );

  // ── Executive snapshot cards (what the brewery gets) ──
  const exec: { value: string; label: string; meaning: string; basis: string; tag?: { text: string; warn?: boolean } }[] = [
    { value: n(d.eventsRun), label: "Branded events delivered", meaning: `${DEMO_BRAND.sponsorName} nights actually staged in venues.`, basis: `${s.venuesActivated} venues × ${s.avgEventsPerVenue} events/venue` },
    { value: n(d.playersCompleted), label: "Engaged players", meaning: "Played through to the final question — active participation, not passive impressions.", basis: `${pct(s.completionRate)} of ${n(d.playersJoined)} who joined` },
    { value: pct(s.sponsoredAnswerRate), label: "Sponsor-round engagement", meaning: "Teams that actively answered your sponsored question.", basis: `${n(d.sponsoredTeamsAnswered)} of ${n(d.teamsCreated)} teams` },
    { value: pct(s.repeatBookingRate), label: "Venue repeat signal", meaning: "Venues that booked again — a recurring channel, not a one-off.", basis: `${d.repeatVenuesEstimate} of ${s.venuesActivated} venues booked 2+ events` },
    { value: `~${d.eventDurationEstimate}m`, label: "Dwell-time proxy", meaning: "Time in venue per event = food & drink occasions.", basis: `${s.questionsPerEvent} Q × ${s.avgMinutesPerQuestion}m + ${s.bufferMinutes}m`, tag: { text: "proxy", warn: true } },
    { value: `~${n(d.campaignReachEstimate)}`, label: "Estimated campaign reach", meaning: "Players plus estimated onlookers across the campaign.", basis: `${n(d.playersJoined)} players × ${s.campaignReachMultiplier}`, tag: { text: "estimate", warn: true } },
  ];

  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        {/* A. Header */}
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{m.flag} {m.label} · Seeded campaign projection</p>
        <h1 className="mt-2 text-3xl font-extrabold">{DEMO_BRAND.campaignName}</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{DEMO_BRAND.broughtBy} · brewery campaign report — an illustrative projection of the proof a sponsor receives.</p>

        {/* B. Executive snapshot */}
        <Section title="Campaign performance snapshot" />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {exec.map((c) => (
            <div key={c.label} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-3xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{c.value}</p>
                {c.tag && <Tag text={c.tag.text} warn={c.tag.warn} />}
              </div>
              <p className="mt-1 text-sm font-semibold">{c.label}</p>
              <p className="mt-1 text-xs text-[var(--ppn-text)]">{c.meaning}</p>
              <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">{c.basis}</p>
            </div>
          ))}
        </div>

        {/* C. Commercial interpretation */}
        <Section title={`What this means for ${DEMO_BRAND.sponsorName}`} />
        <div className="mt-3 rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
          <p className="text-sm text-[var(--ppn-text)]">
            This projection shows whether a brewery-funded pub night can create <span className="font-semibold">repeatable on-trade participation</span> —
            not just passive logo exposure. The strongest indicators are participation volume, sponsored-round response,
            completion to the final question, and the repeat-venue signal.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            <li className="rounded-lg bg-[var(--ppn-bg)] p-3"><span className="font-semibold">Footprint</span> — {s.venuesActivated} venues, {n(d.eventsRun)} branded events: real presence in the on-trade.</li>
            <li className="rounded-lg bg-[var(--ppn-bg)] p-3"><span className="font-semibold">Participation</span> — {n(d.playersCompleted)} players engaged to the end: active, not passive.</li>
            <li className="rounded-lg bg-[var(--ppn-bg)] p-3"><span className="font-semibold">Sponsor engagement</span> — {sponsored ? `${n(sponsored.teamsAnswered)} teams (${pct(s.sponsoredAnswerRate)})` : "—"} interacted with your round: brand interaction, not impressions.</li>
            <li className="rounded-lg bg-[var(--ppn-bg)] p-3"><span className="font-semibold">Repeatability &amp; rollout</span> — {d.repeatVenuesEstimate} venues rebooked: evidence to justify a wider regional rollout.</li>
          </ul>
        </div>

        {/* D. Decision support after pilot */}
        <Section title="Decision support after a pilot" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          {[
            "Decide whether to continue the venue rollout (and how fast).",
            "Compare venue types — which crowds engage most.",
            "Check sponsored-round engagement against your campaign goal.",
            "Estimate cost per engaged player later (placeholder — needs media spend input).",
            "Identify which venues deserve repeat events.",
          ].map((t) => (
            <div key={t} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3"><span style={{ color: DEMO_BRAND.primary }}>›</span> {t}</div>
          ))}
        </div>

        {/* E. Reconciliation funnel (S4 — kept) */}
        <Section title="Campaign funnel — how the numbers reconcile" />
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {[
            { v: s.venuesActivated, label: "Venues activated", basis: "campaign footprint (assumption)" },
            { v: d.eventsRun, label: "Events run", basis: `${s.venuesActivated} × ${s.avgEventsPerVenue} events/venue` },
            { v: d.playersJoined, label: "Players joined", basis: `${n(d.eventsRun)} × ${s.avgPlayersPerEvent} players/event` },
            { v: d.teamsCreated, label: "Teams created", basis: `${n(d.playersJoined)} ÷ ${s.avgPlayersPerTeam} players/team` },
          ].map((f, i, arr) => (
            <div key={f.label} className="relative rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-2xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{n(f.v)}</p>
              <p className="mt-0.5 text-sm font-semibold">{f.label}</p>
              <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">{f.basis}</p>
              {i < arr.length - 1 && <span className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-[var(--ppn-muted)] sm:block">→</span>}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">Reconciles: {n(d.playersJoined)} ≈ {n(d.eventsRun)} × {s.avgPlayersPerEvent} · {n(d.teamsCreated)} = {n(d.playersJoined)} ÷ {s.avgPlayersPerTeam} · {n(d.avgPlayersPerVenue)} players/venue · {d.avgTeamsPerEvent} teams/event.</p>

        {/* F. Engagement rates (S4 — kept) */}
        <Section title="Engagement — every rate has a denominator" />
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            { label: "Completion rate", value: pct(s.completionRate), denom: `${n(d.playersCompleted)} of ${n(d.playersJoined)} joined reached the final question` },
            { label: "Sponsored answer rate", value: pct(s.sponsoredAnswerRate), denom: `${n(d.sponsoredTeamsAnswered)} of ${n(d.teamsCreated)} teams answered the sponsored question` },
            { label: "Repeat-venue signal", value: pct(s.repeatBookingRate), denom: `${d.repeatVenuesEstimate} of ${s.venuesActivated} venues booked 2+ events` },
          ].map((r) => (
            <div key={r.label} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-2xl font-extrabold" style={{ color: DEMO_BRAND.primary }}>{r.value}</p>
              <p className="mt-0.5 text-sm font-semibold">{r.label}</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{r.denom}</p>
            </div>
          ))}
        </div>

        {/* Per-venue (S4 — kept) */}
        <Section title="Top venues — scaled from the same assumptions" />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs text-[var(--ppn-muted)]">
              <th className="px-3 py-2">Venue</th><th className="px-3 py-2">Events</th><th className="px-3 py-2">Players/event</th><th className="px-3 py-2">Players</th><th className="px-3 py-2">Teams</th><th className="px-3 py-2">Completed final Q</th><th className="px-3 py-2">Teams answered sponsor</th>
            </tr></thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.name} className="border-t border-[var(--ppn-border)]">
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

        {/* Per-round (S4 — kept) */}
        <Section title="By round — teams shown vs answered" />
        <div className="mt-3 space-y-2">
          {rounds.map((r) => (
            <div key={r.name} className="rounded-xl border bg-[var(--ppn-surface)] p-3" style={{ borderColor: r.sponsor ? DEMO_BRAND.primary : "var(--ppn-border)" }}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{r.name}{r.sponsor && <span className="ml-2"><Tag text="brand exposure moment" /></span>}</span>
                <span className="font-bold">{pct(r.answerRate)}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{n(r.teamsAnswered)} of {n(r.teamsShown)} teams answered{r.sponsor ? ` — ${n(r.teamsAnswered)} teams actively engaged with the ${DEMO_BRAND.sponsorName} round` : ""}.</p>
            </div>
          ))}
        </div>

        {/* Occasion-value lens (ROI — clearly an assumption) */}
        {s.valuePerVisit != null && (
          <>
            <Section title="Potential occasion value lens" />
            <div className="mt-3 rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
              <p className="text-sm">
                If an engaged visit is worth ~<span className="font-semibold">{s.currency}{s.valuePerVisit}</span> in food/drink, {n(d.playersCompleted)} engaged visits ≈
                <span className="ml-1 font-bold" style={{ color: DEMO_BRAND.primary }}>{s.currency}{n(d.playersCompleted * s.valuePerVisit)}</span> of potential occasion value.
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--ppn-muted)]">
                <Tag text="planning assumption" warn /> <Tag text="not measured sales" warn />
                Used only to discuss potential ROI — replace with your own brewery/venue commercial assumptions.
              </p>
            </div>
          </>
        )}

        {/* Seeded now vs real pilot later */}
        <Section title="Seeded projection now → real pilot later" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <p className="text-sm font-semibold">Seeded projection (now)</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--ppn-muted)]">
              <li>Venue / event / player / team assumptions</li>
              <li>Assumed sponsored-answer rate</li>
              <li>Assumed repeat-venue rate</li>
              <li>Estimated campaign reach</li>
            </ul>
          </div>
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <p className="text-sm font-semibold" style={{ color: DEMO_BRAND.primary }}>Real pilot (later)</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[var(--ppn-muted)]">
              <li>Actual venues activated &amp; events run</li>
              <li>Actual players joined &amp; teams created</li>
              <li>Actual completion &amp; sponsored-answer rate</li>
              <li>Event-by-event performance — no raw personal player data</li>
            </ul>
          </div>
        </div>

        {/* G. Measurement model (S4 — kept, now at the bottom) */}
        <Section title="How this is calculated" />
        <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-sm text-[var(--ppn-muted)]">
          <ul className="list-disc space-y-1 pl-5">
            <li>A <span className="text-[var(--ppn-text)]">seeded campaign projection</span> — figures are derived from assumptions, not real analytics.</li>
            <li>Funnel, per-venue and per-round numbers all scale from the same assumptions, so they reconcile.</li>
            <li>Every percentage states its denominator; campaign reach is an <span className="text-[var(--ppn-text)]">estimate</span>, not measured attendance.</li>
            <li>Aggregated only — <span className="text-[var(--ppn-text)]">no raw personal player data</span> is shown.</li>
            <li>In a real deployment these assumptions are replaced by actual event data.</li>
          </ul>
        </div>
        <p className="mt-6 text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.responsibleNote} · Switch market/brewery in Presenter tools or /config.</p>
      </div>
    </DemoShell>
  );
}
