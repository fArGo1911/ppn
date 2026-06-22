/**
 * /capabilities — content range + steering for the ACTIVE market (Pillars 3 & 4). Shows the 10-question
 * capability pack (LIVE-RUN vs capability-card), the pub-audience content-mix presets, and broader-than-quiz
 * future formats. Seeded config (questionPacks.ts / audiencePresets.ts) — no CMS, no recommendation engine.
 */
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { QUESTION_PACKS } from "../demo/questionPacks";
import { AUDIENCE_PRESETS } from "../demo/audiencePresets";

const BEYOND_QUIZ = [
  "Music nights", "Picture/video rounds", "Sport-bar prediction games", "Half-time games",
  "Local-derby games", "Pub challenges", "Sponsored mini-games", "Seasonal events", "Inter-pub competitions", "Brewery campaign activations",
];

function compatChips(c: { phonesOnly: boolean; tv: boolean; audio: boolean; localHost: boolean; aiAssisted: boolean }) {
  return [
    c.phonesOnly && "Phones", c.tv && "TV", c.audio && "Audio", c.localHost && "Local-host", c.aiAssisted && "AI",
  ].filter(Boolean) as string[];
}

export default function Capabilities() {
  const m = activeMarket();
  const pack = QUESTION_PACKS[m.market];
  return (
    <DemoShell>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{m.flag} {m.label} · content range</p>
        <h1 className="mt-2 text-3xl font-extrabold">10-question capability pack</h1>
        <p className="mt-1 text-[var(--ppn-muted)]">
          Proves range across audiences, locality and campaign. <span style={{ color: DEMO_BRAND.primary }}>●</span> = run live in the guided demo; the rest are capability cards.
        </p>

        <div className="mt-5 space-y-2">
          {pack.map((q) => (
            <div key={q.n} className="rounded-xl border bg-[var(--ppn-surface)] p-3" style={{ borderColor: q.liveRun ? DEMO_BRAND.primary : "var(--ppn-border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--ppn-muted)]">
                    {q.liveRun && <span style={{ color: DEMO_BRAND.primary }}>● LIVE · </span>}
                    {q.n}. {q.category}{q.sponsor ? " · sponsored" : ""}
                  </p>
                  <p className="mt-0.5 font-semibold">{q.prompt}</p>
                  <p className="mt-0.5 text-xs text-[var(--ppn-muted)]">Answer: {q.correct} · TV: {q.tvState} · phone: {q.phoneState}{q.mediaSlot ? ` · media: ${q.mediaSlot}` : ""}</p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--ppn-bg)", color: "var(--ppn-muted)" }}>{q.kind}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {compatChips(q.compat).map((c) => <span key={c} className="rounded bg-[var(--ppn-bg)] px-1.5 py-0.5 text-[10px] text-[var(--ppn-muted)]">{c}</span>)}
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-2xl font-bold">Pub-audience steering</h2>
        <p className="mt-1 text-[var(--ppn-muted)]">The same pack, steered to the crowd or a brewery campaign (content-mix presets).</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {AUDIENCE_PRESETS.map((p) => (
            <div key={p.id} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{p.label}</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "var(--ppn-bg)", color: p.steeredBy === "brewery" ? DEMO_BRAND.primary : "var(--ppn-muted)" }}>{p.steeredBy}-led</span>
              </div>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{p.description}</p>
              <p className="mt-2 text-xs">Gen {p.mix.general} · Sport {p.mix.sport} · Football {p.mix.football} · Music {p.mix.music} · Geo {p.mix.geography} · Local {p.mix.local} · Sponsor {p.mix.sponsor}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center gap-2">
          <h2 className="text-2xl font-bold">Broader than quiz</h2>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" }}>Future capability — not built</span>
        </div>
        <p className="mt-1 text-[var(--ppn-muted)]">Quiz is the first format — the same network is designed to later support:</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BEYOND_QUIZ.map((c) => <span key={c} className="rounded-xl border border-dashed border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2 text-sm text-[var(--ppn-muted)]">{c}</span>)}
        </div>
        <p className="mt-8 text-xs text-[var(--ppn-muted)]">Seeded demo content. Switch market/brewery at /config.</p>
      </div>
    </DemoShell>
  );
}
