/**
 * / — presenter/brewery demo overview. Polished, brand-aware, web-presentation friendly. No raw route list.
 * The functional surfaces (Player / Host / TV) are live; the commercial surfaces are branded previews (this
 * slice is layout only — KPI/brand-studio/etc. are built later).
 */
import { Link } from "react-router-dom";
import { DEMO_BRAND } from "../demo/brand";
import { DemoShell } from "../components/shells";
import { OfferBadge } from "../components/brandZones";

const LIVE = [
  { to: "/play/DEMO", title: "Player join", desc: "Scan a pub QR → join the right game → create/join a table team on your phone." },
  { to: "/host", title: "Host panel", desc: "Staff see teams forming live, with players and captains grouped by table." },
  { to: "/tv/demo", title: "TV display", desc: "Big-screen welcome, QR to join, and the in-venue sponsor banner." },
];

const PREVIEW = [
  { to: "/setup", title: "Brand & setup" },
  { to: "/kpi", title: "Brewery KPIs" },
  { to: "/rollout", title: "Rollout / network" },
  { to: "/capabilities", title: "Beyond quiz" },
];

export default function Landing() {
  return (
    <DemoShell>
      <section className="mx-auto max-w-4xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>
          On-trade engagement network
        </p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">
          Put your brand inside pubs — with live events people actually play.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-400">
          {DEMO_BRAND.network} turns quiet pub nights into branded, measurable engagement: customers join by QR on
          their phones, play in table teams, and your brand runs the room.
        </p>
        <div className="mt-4">
          <OfferBadge size="host" />
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-slate-400">Live in this demo</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {LIVE.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-white/20"
            >
              <p className="text-lg font-semibold group-hover:text-white" style={{ color: DEMO_BRAND.primary }}>
                {c.title} →
              </p>
              <p className="mt-1 text-sm text-slate-400">{c.desc}</p>
            </Link>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Coming up in the guided demo
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PREVIEW.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-slate-300 hover:border-white/20"
            >
              <p className="font-medium">{c.title}</p>
              <p className="mt-1 text-xs text-slate-500">Preview</p>
            </Link>
          ))}
        </div>
      </section>
    </DemoShell>
  );
}
