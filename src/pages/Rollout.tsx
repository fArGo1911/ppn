/**
 * /rollout — pitch-labelled CAMPAIGN PLAN (illustrative, seeded). Shows how a brewery-funded pilot becomes a
 * repeatable venue-activation programme: decision-gated stages (pilot → regional → wider), the proof the brewery
 * receives (tied to the S5 evidence model), the practical venue setup, setup levels, a readiness checklist, and a
 * suggested walkthrough. Stage numbers DERIVE from the same KPI seed so they reconcile. No ops/CRM/analytics.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { deriveStage, getEffectiveKpiSeed, getEffectiveStageVenues, getEffectiveVenueMix, deriveVenueMix } from "../demo/kpiModel";
import { SETUP_MODES } from "../demo/setup";

const STAGE: Record<string, { title: string; purpose: string[]; gate: string; evidence: string }> = {
  pilot: {
    title: "Pilot",
    purpose: ["Prove event execution", "Prove player participation", "Prove sponsored-round engagement", "Collect venue-reported commercial outcome", "Validate host / venue fit"],
    gate: "Proceed if completion and sponsored-round engagement hold, and venues say they'd run again.",
    evidence: "PPN-measured participation + sponsored engagement + completion, plus a venue-reported outcome per venue.",
  },
  regional: {
    title: "Regional campaign",
    purpose: ["Repeat across a cluster of venues", "Compare venue types", "Standardise sponsor surfaces", "Measure participation + venue-reported outcome at scale"],
    gate: "Proceed if participation is consistent across venue types and repeat bookings hold.",
    evidence: "Above, plus venue-type comparison and a standardised sponsor-surface set.",
  },
  campaign: {
    title: "Wider activation",
    purpose: ["Scalable brewery-funded on-trade network", "Repeatable event format", "Rollout playbook", "Regular campaign report cadence"],
    gate: "Run as a programme with a standard report cadence; review region by region.",
    evidence: "A repeatable playbook + recurring campaign reports across the network.",
  },
};

export default function Rollout() {
  const m = activeMarket();
  const s = getEffectiveKpiSeed(m.kpiSeed); // market default + any operator scenario override (/config)
  const n = (x: number) => x.toLocaleString();
  const brand = "var(--ppn-brand)";
  const stageVenues = getEffectiveStageVenues({
    pilot: m.rollout.find((r) => r.id === "pilot")?.venues ?? 5,
    regional: m.rollout.find((r) => r.id === "regional")?.venues ?? 25,
    campaign: m.rollout.find((r) => r.id === "campaign")?.venues ?? 100,
  });
  const mix = getEffectiveVenueMix();
  const mixD = mix ? deriveVenueMix(mix, s.campaignReachMultiplier, s.avgPlayersPerTeam) : null;
  const hasSpecial = mixD?.categoryMix.some((c) => c.special);

  const Section = ({ title }: { title: string }) => (
    <h2 className="mt-9 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">{title}</h2>
  );
  const readiness = [
    "Wi-Fi / mobile signal acceptable", "TV or projector available (optional)", "Audio route available (optional)",
    "Staff or local host available", "QR placement possible on tables", "Sponsor product stocked",
    "Venue agrees to a short post-event report", "POS / till evidence (optional, later)",
  ];
  const journey = [
    ["Campaign story", "the brewery sees the branded event being pitched"],
    ["Player joins", "a customer scans the QR and joins a team on their phone"],
    ["Host controls the night", "staff run the loop from the host tablet"],
    ["TV shows the room", "the big screen carries the event and sponsor moments"],
    ["KPI & sponsor evidence", "the measured + venue-reported proof a sponsor receives"],
    ["Rollout plan", "how the pilot becomes a repeatable activation (this page)"],
  ];
  const devices = [
    { role: "Laptop — room output engine", runs: "the TV screen", detail: "Connected to the TV/projector (and venue sound if available): welcome + QR, questions, reveal, scoreboard, sponsor moments, chimes/AI voice." },
    { role: "Tablet — host controller", runs: "the host console", detail: "An iPad/tablet or laptop: start game, next question, reveal & score, replay, see answered teams and what players/TV show, read the script." },
    { role: "Phones — player input", runs: "the player join", detail: "Each guest's own phone: join the event, create/join a team, answer, see submitted / reveal / scoreboard." },
  ];

  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: brand }}>{m.flag} {m.label} · Campaign plan · seeded projection</p>
        <h1 className="mt-2 text-3xl font-extrabold">From pilot night to {DEMO_BRAND.sponsorName} activation</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">{m.context}</p>
        <p className="mt-2 text-sm text-[var(--ppn-text)]">An illustrative plan: how a controlled pilot proves the format, what evidence the brewery gets, and what must be true before scaling. Numbers are estimated from the campaign assumptions — not live operations data.</p>

        {/* ── Venue & setup mix (when a scenario mix is set in /config) ── */}
        {mixD && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Venue mix</p>
                <p className="mt-1">{mixD.categoryMix.map((c) => `${c.venues}× ${c.label}`).join(" · ")}</p>
              </div>
              <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Setup / output mix (by venues)</p>
                <p className="mt-1">{mixD.setupMix.map((su) => `${su.pctVenues}% ${su.label}`).join(" · ")}</p>
              </div>
            </div>
            {hasSpecial && <p className="mt-2 text-xs text-[var(--ppn-muted)]">Pop-up / festival venues are special events, not ordinary pubs — shown separately from the core pub-network model.</p>}
          </>
        )}

        {/* ── Decision-gated stages ── */}
        <Section title="Pilot → regional → wider activation" />
        <div className="mt-3 space-y-3">
          {m.rollout.map((t, i) => {
            const cfg = STAGE[t.id];
            const venues = stageVenues[t.id as "pilot" | "regional" | "campaign"];
            const d = deriveStage(s, venues);
            const teamsPerEvent = (d.teams / Math.max(1, d.events)).toFixed(1);
            return (
              <div key={t.id} className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: i === 0 ? brand : "var(--ppn-border)" }}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-lg font-bold">{i + 1}. {cfg.title}</p>
                  <p className="text-2xl font-extrabold" style={{ color: brand }}>{venues} <span className="text-sm font-medium text-[var(--ppn-muted)]">venues</span></p>
                </div>
                <p className="mt-0.5 text-xs text-[var(--ppn-muted)]">{t.note} · ~{s.avgPlayersPerEvent} players/event · ~{teamsPerEvent} teams/event (stage totals below are across all its venues & events)</p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Purpose</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">{cfg.purpose.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Estimated scale</p>
                    <ul className="mt-1 space-y-0.5 text-sm">
                      <li className="flex justify-between"><span>Branded events</span><span className="font-semibold">{n(d.events)}</span></li>
                      <li className="flex justify-between"><span>Player visits (stage total)</span><span className="font-semibold">{n(d.players)}</span></li>
                      <li className="flex justify-between"><span>Teams (stage total)</span><span className="font-semibold">{n(d.teams)}</span></li>
                      <li className="flex justify-between"><span>Sponsored-round teams</span><span className="font-semibold">{n(d.sponsoredTeams)}</span></li>
                      <li className="flex justify-between text-[var(--ppn-muted)]"><span>Est. reach (incl. onlookers)</span><span>~{n(d.reach)}</span></li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                  <p className="rounded-lg bg-[var(--ppn-bg)] p-2"><span className="font-semibold text-[var(--ppn-text)]">Sponsor exposure: </span><span className="text-[var(--ppn-muted)]">{n(d.events)} branded events · welcome, sponsored round, scoreboard & winner each night.</span></p>
                  <p className="rounded-lg bg-[var(--ppn-bg)] p-2"><span className="font-semibold text-[var(--ppn-text)]">Evidence gathered: </span><span className="text-[var(--ppn-muted)]">{cfg.evidence}</span></p>
                </div>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full px-2 py-0.5 font-semibold uppercase" style={{ background: "color-mix(in srgb, var(--ppn-brand) 16%, transparent)", color: brand }}>Decision gate</span>
                  <span className="text-[var(--ppn-text)]">{cfg.gate}</span>
                </p>
                <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Players/teams scaled from the same per-event and per-team assumptions as the KPI report — estimated, not measured.</p>
              </div>
            );
          })}
        </div>

        {/* ── Proof after the pilot (ties to S5 evidence model) ── */}
        <Section title="What proof the brewery gets after the pilot" />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <p className="text-sm font-semibold">PPN-measured</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-[var(--ppn-muted)]"><li>Event participation</li><li>Sponsored-round engagement</li><li>Completion + dwell proxy</li><li>Venue-by-venue performance comparison</li></ul>
          </div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <p className="text-sm font-semibold">Venue-reported + recommendation</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-[var(--ppn-muted)]"><li>Venue-reported commercial outcome</li><li>Optional POS / till evidence (later)</li><li>Recommendation: repeat · change venue type · expand · stop</li></ul>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">PPN provides measured engagement; the venue provides commercial outcome; POS can support it later. PPN does not claim to measure bar sales.</p>

        {/* ── Operational setup / hardware ── */}
        <Section title="How a venue runs it" />
        <p className="mt-1 text-sm font-semibold" style={{ color: brand }}>Laptop runs the room. Tablet controls the night. Phones handle participation.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {devices.map((d) => (
            <div key={d.role} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-sm font-semibold">{d.role}</p>
              <p className="mt-1 text-xs" style={{ color: brand }}>Runs {d.runs}</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{d.detail}</p>
            </div>
          ))}
        </div>

        {/* ── Setup levels ── */}
        <Section title="Venues can start light or go richer" />
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">Not every pub has the same screen/audio. PPN runs the same event at three levels — no-TV pubs are not excluded.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {SETUP_MODES.map((mode) => (
            <div key={mode.id} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-sm font-semibold">{mode.label}</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{mode.supports}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Audio/AI voice are demonstrated in the POC; richer venue audio routing is roadmap, not a finished integration.</p>

        {/* ── Venue readiness ── */}
        <Section title="Pilot venue readiness checklist" />
        <p className="mt-1 text-xs text-[var(--ppn-muted)]">Commercial planning, not production onboarding.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {readiness.map((r) => (
            <div key={r} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2 text-sm"><span style={{ color: DEMO_BRAND.colours.success }}>☐</span> {r}</div>
          ))}
        </div>

        {/* ── Pilot / next venues ── */}
        <Section title="Pilot venues & next to activate" />
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Pilot venues ({m.pilotVenues.length})</p>
            <div className="space-y-1.5">
              {m.pilotVenues.map((v) => (
                <div key={v} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2 text-sm"><span style={{ color: DEMO_BRAND.colours.success }}>●</span> {v}</div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Next to activate</p>
            <div className="space-y-1.5">
              {m.nextVenues.map((v) => (
                <div key={v} className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--ppn-border)] px-3 py-2 text-sm text-[var(--ppn-muted)]"><span style={{ color: brand }}>○</span> {v}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Guided walkthrough (narrative, not a route grid) ── */}
        <Section title="Suggested brewery walkthrough" />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {journey.map(([title, blurb], i) => (
            <div key={title} className="flex items-start gap-3 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-black" style={{ background: brand, color: "var(--ppn-on-brand)" }}>{i + 1}</span>
              <span className="text-sm"><span className="font-semibold">{title}</span> — <span className="text-[var(--ppn-muted)]">{blurb}</span></span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-[var(--ppn-muted)]">Illustrative seeded campaign plan — not live rollout data. Switch market/brewery in Presenter tools or /config.</p>
      </div>
    </DemoShell>
  );
}
