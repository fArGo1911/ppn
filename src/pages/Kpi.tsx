/**
 * /kpi — brewery campaign report (Pillar 2), EXECUTIVE-FRAMED. Leads with the commercial story a C-level /
 * trade-marketing buyer cares about ("what did my brand get?"), then proves it with the reconciliation funnel
 * and denominator-backed detail. Still a SEEDED PROJECTION (kpiModel.ts) — no analytics, no tracking, no schema.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { clientFacingIdentity } from "../lib/clientFacingDemo";
import { deriveKpi, perVenue, perRound, pct, getEffectiveKpiSeed, getEffectiveVenueMix, deriveVenueMix } from "../demo/kpiModel";

export default function Kpi() {
  const m = activeMarket();
  const ci = clientFacingIdentity();
  const s = getEffectiveKpiSeed(m.kpiSeed); // market default + any operator scenario override (/config)
  const mix = getEffectiveVenueMix();
  const setupMix = mix ? deriveVenueMix(mix, s.campaignReachMultiplier, s.avgPlayersPerTeam).setupMix : null;
  const setupLine = setupMix
    ? setupMix.map((su) => `${su.pctVenues}% ${su.label}`).join(" · ")
    : "TV + audio where available, with audio-only and manual live / phones-only fallbacks";
  const d = deriveKpi(s);
  const venues = perVenue(s);
  const rounds = perRound(s, d.teamsCreated);
  const sponsored = rounds.find((r) => r.sponsor);
  const n = (x: number) => x.toLocaleString();
  const vr = m.venueReport;
  const yn = (b: boolean) => (b ? "Yes" : "No");

  // Where the brewery appears across the evening (status = how real it is in this demo).
  type Live = "live" | "presenter" | "future";
  const phoneExposure: { m: string; s: Live }[] = [
    { m: "Splash / arrival", s: "live" }, { m: "Join success", s: "live" }, { m: "Lobby / waiting", s: "live" }, { m: "Sponsored question", s: "live" }, { m: "Winner / post-event card", s: "live" },
  ];
  const tvExposure: { m: string; s: Live }[] = [
    { m: "Welcome + QR", s: "live" }, { m: "AI intro", s: "live" }, { m: "Question coming up", s: "live" }, { m: "Sponsor slide / pause", s: "presenter" }, { m: "Sponsored question", s: "live" }, { m: "Victory / winner", s: "live" }, { m: "Closing / thanks", s: "presenter" },
  ];
  const hostExposure: { m: string; s: Live }[] = [
    { m: "Evening intro mention", s: "live" }, { m: "Sponsored round readout", s: "live" }, { m: "Winner / thanks", s: "live" },
  ];
  const StatusChip = ({ s }: { s: Live }) => s === "live"
    ? <Tag text="live in demo" />
    : s === "presenter"
      ? <span className="rounded-full bg-[var(--ppn-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--ppn-muted)]">presenter demo</span>
      : <Tag text="future" warn />;

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
    { value: n(d.eventsRun), label: "Branded events delivered", meaning: `${ci.sponsorName} nights actually staged in venues.`, basis: `${s.venuesActivated} venues × ${s.avgEventsPerVenue} events/venue` },
    { value: n(d.playersCompleted), label: "Engaged players", meaning: "Played through to the final question — active participation, not passive impressions.", basis: `${pct(s.completionRate)} of ${n(d.playersJoined)} who joined` },
    { value: pct(s.sponsoredAnswerRate), label: "Sponsor-round engagement", meaning: "Teams that actively answered your sponsored question.", basis: `${n(d.sponsoredTeamsAnswered)} of ${n(d.teamsCreated)} teams` },
    { value: pct(s.repeatBookingRate), label: "Venue repeat signal", meaning: "Venues that booked again — a recurring channel, not a one-off.", basis: `${d.repeatVenuesEstimate} of ${s.venuesActivated} venues booked 2+ events` },
    { value: `~${d.eventDurationEstimate}m`, label: "Dwell-time proxy", meaning: "Time in venue per event = food & drink occasions.", basis: `${s.questionsPerEvent} Q × ${s.avgMinutesPerQuestion}m + ${s.bufferMinutes}m`, tag: { text: "proxy", warn: true } },
    { value: `~${n(d.campaignReachEstimate)}`, label: "Estimated campaign reach", meaning: "Players plus estimated onlookers across the campaign.", basis: `${n(d.playersJoined)} players × ${s.campaignReachMultiplier}`, tag: { text: "estimate", warn: true } },
  ];

  return (
    <DemoShell clientFacing>
      <div className="mx-auto max-w-4xl px-5 py-10">
        {/* A. Header */}
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{m.flag} {m.label} · Brewery report (demo projection)</p>
        <h1 className="mt-2 text-3xl font-extrabold">{ci.campaignName}</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{ci.broughtBy}</p>
        <div className="mt-3 rounded-xl border-2 p-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 40%, var(--ppn-border))", background: "color-mix(in srgb, var(--ppn-warning) 8%, transparent)" }}>
          <span className="font-semibold">Demo projection</span> — this is what a brewery report will look like <span className="font-semibold">after a pilot</span>. The figures here are seeded campaign assumptions used for the pitch, not a measured campaign. In a live pilot the assumptions are replaced by actual event data.
        </div>

        {/* B. Executive snapshot */}
        <Section title="Campaign performance snapshot" />
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">All figures are campaign totals across {s.venuesActivated} venues and {n(d.eventsRun)} events (~{Math.round(s.avgPlayersPerEvent)} players/event, ~{d.avgTeamsPerEvent} teams/event) — not one pub night.</p>
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">Operating setup: <span className="text-[var(--ppn-text)]">{setupLine}</span> <span className="opacity-80">· scenario assumption for demo planning, not measured operational data.</span></p>
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
        <Section title={`What this means for ${ci.sponsorName}`} />
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

        {/* Brand exposure delivered */}
        <Section title="Brand exposure delivered" />
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">Where {ci.sponsorName} appears across the evening.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[{ head: "On the phone", items: phoneExposure }, { head: "On the TV", items: tvExposure }, { head: "Host / AI script", items: hostExposure }].map((col) => (
            <div key={col.head} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-sm font-semibold">{col.head}</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {col.items.map((it) => (
                  <li key={it.m} className="flex items-center justify-between gap-2"><span>{it.m}</span><StatusChip s={it.s} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]"><span className="font-semibold" style={{ color: DEMO_BRAND.primary }}>live in demo</span> runs in the live demo · <span className="font-semibold">presenter demo</span> shown on demand · <span className="font-semibold" style={{ color: "var(--ppn-warning)" }}>future</span> not built yet.</p>

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
            { v: d.playersJoined, label: "Player visits (campaign)", basis: `${n(d.eventsRun)} × ${s.avgPlayersPerEvent} players/event` },
            { v: d.teamsCreated, label: "Teams (campaign)", basis: `${n(d.playersJoined)} ÷ ${s.avgPlayersPerTeam} players/team` },
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
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{n(r.teamsAnswered)} of {n(r.teamsShown)} teams answered{r.sponsor ? ` — ${n(r.teamsAnswered)} teams actively engaged with the ${ci.sponsorName} round` : ""}.</p>
            </div>
          ))}
        </div>

        {/* Commercial outcome evidence — four clearly-separated categories */}
        <Section title="Commercial outcome evidence" />
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">In a live pilot: PPN measures engagement · the venue reports commercial outcomes · POS can support it later · estimates are labelled. These are never mixed. (Below is a seeded demo projection.)</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">PPN-measurable in a live pilot</p><Tag text="live pilot" /></div>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between"><span>Players joined</span><span className="font-semibold">{n(d.playersJoined)}</span></li>
              <li className="flex justify-between"><span>Teams created</span><span className="font-semibold">{n(d.teamsCreated)}</span></li>
              <li className="flex justify-between"><span>Sponsored teams answered</span><span className="font-semibold">{n(d.sponsoredTeamsAnswered)}</span></li>
              <li className="flex justify-between"><span>Completion rate</span><span className="font-semibold">{pct(s.completionRate)}</span></li>
              <li className="flex justify-between"><span>Dwell-time proxy</span><span className="font-semibold">~{d.eventDurationEstimate}m</span></li>
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">Reported by venue</p><span className="rounded-full bg-[var(--ppn-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--ppn-muted)]">venue-reported</span></div>
            <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">
              <li>Event attendance estimate</li><li>Sponsored product units sold</li><li>Offer / voucher redemptions</li><li>Busier than usual · stock-out</li><li>Staff feedback · would run again</li>
            </ul>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Reported by the venue — not measured by PubPlay. See the example report below.</p>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">POS-supported (future / optional)</p><Tag text="future" warn /></div>
            <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">
              <li>Till / POS screenshot</li><li>POS / EPOS export</li><li>Stock report</li><li>Distributor / EPOS integration</li>
            </ul>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Not connected in this demo. PPN does not measure bar sales directly.</p>
          </div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">Estimated</p><Tag text="estimate" warn /></div>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex justify-between"><span>Campaign reach</span><span className="font-semibold">~{n(d.campaignReachEstimate)}</span></li>
              <li className="text-[var(--ppn-muted)]">Potential occasion value (assumption)</li>
              <li className="text-[var(--ppn-muted)]">Cost per engaged player (later — needs spend input)</li>
            </ul>
          </div>
        </div>

        {/* Post-event venue report (mock — manual, POS optional later) */}
        <Section title="Post-event venue report" />
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">Example venue-reported outcome — a short manual report is enough; POS is future / optional.</p>
        <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
          <div className="flex items-center justify-between"><p className="font-semibold">{m.venueExample}</p><span className="rounded-full bg-[var(--ppn-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--ppn-muted)]">venue-reported</span></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
            {[
              ["Total guests during event window", `${vr.attendanceEstimate}`],
              ["Sponsored product units sold", `${vr.sponsorUnitsSold}`],
              ["Offer / voucher redemptions", `${vr.offerRedemptions}`],
              ["Busier than a normal night?", yn(vr.busierThanUsual)],
              ["Sponsor stock ran out?", yn(vr.stockOut)],
              ["Would the venue run this again?", yn(vr.wouldRunAgain)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-lg bg-[var(--ppn-bg)] px-3 py-2"><span className="text-[var(--ppn-muted)]">{k}</span><span className="font-semibold">{v}</span></div>
            ))}
          </div>
          <p className="mt-3 text-sm italic text-[var(--ppn-text)]">“{vr.staffComment}”</p>
          <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">POS evidence: {vr.posEvidenceStatus} · A short manual venue report is enough; PPN does not claim to measure bar sales directly.</p>
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

        {/* What the brewery can prove after a pilot */}
        <Section title="What the brewery can prove after a pilot" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
          {[
            ["Event participation proof", "measured by PubPlay"],
            ["Sponsored-round engagement proof", "measured by PubPlay"],
            ["Venue-level performance comparison", "measured by PubPlay"],
            ["Venue-reported commercial outcome", "venue-reported"],
            ["Optional POS / till evidence", "future / optional"],
            ["Rollout recommendation", "derived"],
          ].map(([t, src]) => (
            <div key={t} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
              <span><span style={{ color: DEMO_BRAND.primary }}>›</span> {t}</span>
              <span className="shrink-0 text-[10px] uppercase text-[var(--ppn-muted)]">{src}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">The bridge from demo to ROI conversation: PPN provides measured engagement, the venue provides commercial outcome, POS can support it later. PPN does not claim to measure bar sales.</p>

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
        <p className="mt-6 text-xs text-[var(--ppn-muted)]">{ci.responsibleNote} · Prepared demo scenario — assumptions can be tailored for the chosen venue mix before a pilot.</p>
      </div>
    </DemoShell>
  );
}
