/**
 * / — brewery campaign story (buyer's first impression). NOT a route list. In three seconds, silent, a brewery
 * should read: "this is {Brewery}'s branded pub-event campaign, at {pub}, powered (subtly) by PubPlay Network."
 * Operator/presenter navigation lives in Presenter Tools — never on this page.
 */
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DEMO_BRAND } from "../demo/brand";
import { DemoShell } from "../components/shells";
import { BrandAssetPreview, OfferBadge, PoweredByPpnMark } from "../components/brandZones";
import { resolveJoinToken } from "../lib/ppnApi";

const STORY = [
  { k: "Scan & join", v: "Customers scan a QR at their table and join on their own phones — no app, no login." },
  { k: "Play in teams", v: "Table teams answer live; the night is hosted by staff or an AI voice, on TV or audio." },
  { k: "Your brand, all night", v: "Branded welcome, sponsored round, offer and winner moment — measured for you." },
];

export default function Landing() {
  const { data } = useQuery({ queryKey: ["landing-demo"], queryFn: () => resolveJoinToken("DEMO") });
  const session = data && data.kind !== "invalid" ? data.session : undefined;
  const venue = session?.venueName ?? DEMO_BRAND.pubName;
  const event = session?.eventTitle ?? DEMO_BRAND.eventName; // "Quiz Night" — pub/brewery owns the event, never "PubPlay …"

  return (
    <DemoShell>
      <section className="mx-auto max-w-5xl px-5 py-8">
        {/* Brewery campaign hero — brewery + pub + event + offer + campaign image */}
        <BrandAssetPreview aspect="16/9" className="max-h-[52vh] w-full">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--ppn-text)]">{DEMO_BRAND.sponsorName} presents</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white drop-shadow sm:text-6xl">{event}</h1>
            <p className="mt-2 text-lg text-[var(--ppn-text)]">
              at <span className="font-semibold">{venue}</span> · {DEMO_BRAND.tagline}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <OfferBadge size="host" />
              <Link to="/tv/DEMO" className="rounded-xl px-5 py-2.5 font-semibold text-[var(--ppn-on-brand)]" style={{ background: DEMO_BRAND.primary }}>
                See the live event night →
              </Link>
            </div>
          </div>
        </BrandAssetPreview>

        {/* Campaign narrative — a story, not navigation */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STORY.map((s, i) => (
            <div key={s.k} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-xs font-semibold" style={{ color: DEMO_BRAND.primary }}>{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 font-semibold">{s.k}</p>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">{s.v}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-[var(--ppn-muted)]">
          A sponsored on-trade engagement campaign for {DEMO_BRAND.sponsorName} — branded, measurable, and run by the venue.
        </p>
        <p className="mt-6 text-center"><PoweredByPpnMark /></p>
      </section>
    </DemoShell>
  );
}
