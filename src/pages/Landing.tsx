/**
 * / — brewery campaign landing (customer-first). The brewery/pub/event/offer + campaign imagery lead; PubPlay
 * Network is named only as the enabling platform (subtle). Presentation-friendly, not a route list.
 */
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DEMO_BRAND } from "../demo/brand";
import { DemoShell } from "../components/shells";
import { BrandAssetPreview, OfferBadge, PoweredByPpnMark } from "../components/brandZones";
import { resolveJoinToken } from "../lib/ppnApi";

const LIVE = [
  { to: "/play/DEMO", title: "Player join", desc: "Scan a pub QR → join the right game → create/join a table team on your phone." },
  { to: "/host", title: "Host panel", desc: "Staff see teams forming live, with players and captains grouped by table." },
  { to: "/tv/demo", title: "TV display", desc: "Big-screen welcome, brewery hero, join QR and the in-venue sponsor banner." },
];
const PREVIEW = [
  { to: "/setup", title: "Brand assets" },
  { to: "/kpi", title: "Brewery KPIs" },
  { to: "/rollout", title: "Rollout / network" },
  { to: "/capabilities", title: "Beyond quiz" },
];

export default function Landing() {
  const { data } = useQuery({ queryKey: ["landing-demo"], queryFn: () => resolveJoinToken("DEMO") });
  const session = data && data.kind !== "invalid" ? data.session : undefined;
  const venue = session?.venueName ?? "The Anchor";
  const event = session?.eventTitle ?? "PubPlay Quiz Night";

  return (
    <DemoShell>
      <section className="mx-auto max-w-5xl px-5 py-8">
        {/* Brewery campaign hero — real campaign image goes here */}
        <BrandAssetPreview aspect="16/9" className="max-h-[42vh] w-full">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--ppn-text)]">{DEMO_BRAND.sponsorName} presents</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-white drop-shadow sm:text-6xl">{event}</h1>
            <p className="mt-2 text-lg text-[var(--ppn-text)]">
              at <span className="font-semibold">{venue}</span> · {DEMO_BRAND.tagline}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <OfferBadge size="host" />
              <Link to="/play/DEMO" className="rounded-xl px-5 py-2.5 font-semibold text-[var(--ppn-on-brand)]" style={{ background: DEMO_BRAND.primary }}>
                Join the game →
              </Link>
            </div>
          </div>
        </BrandAssetPreview>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">See it in this demo</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {LIVE.map((c) => (
            <Link key={c.to} to={c.to} className="group rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 transition-colors hover:border-white/20">
              <p className="text-lg font-semibold group-hover:text-white" style={{ color: DEMO_BRAND.primary }}>{c.title} →</p>
              <p className="mt-1 text-sm text-[var(--ppn-muted)]">{c.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Also in the guided demo</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PREVIEW.map((c) => (
            <Link key={c.to} to={c.to} className="rounded-xl border border-dashed border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-[var(--ppn-text)] hover:border-white/20">
              <p className="font-medium">{c.title}</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">Preview</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center"><PoweredByPpnMark /></p>
      </section>
    </DemoShell>
  );
}
