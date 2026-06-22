/**
 * Brand-aware shells — one structure, adapted per device/context.
 *   PlayerShell  → phone (mobile-first, thumb-friendly, branded top + bottom)
 *   HostShell    → laptop/tablet (operational clarity, touch-friendly, branded context)
 *   TvShell      → large screen/projector (readable from a distance, banner zones)
 *   DemoShell    → presenter/brewery web-presentation wrapper (guided + free click-through nav)
 */
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { DEMO_BRAND } from "../demo/brand";
import { BrandBanner, PubEventHeader, SponsorStrip } from "./brandZones";

const brandVars = { ["--brand" as string]: DEMO_BRAND.primary } as React.CSSProperties;

// ── Player (phone) ──────────────────────────────────────────────────────────
export function PlayerShell({
  venue,
  event,
  children,
}: {
  venue?: string;
  event?: string;
  children: ReactNode;
}) {
  return (
    <div style={brandVars} className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-950">
      <BrandBanner size="phone" />
      {(venue || event) && <PubEventHeader venue={venue} event={event} size="phone" />}
      <div className="flex-1 px-4 pb-6">{children}</div>
      <SponsorStrip size="phone" />
    </div>
  );
}

// ── Host (laptop/tablet, touch-friendly) ────────────────────────────────────
export function HostShell({
  venue,
  event,
  status,
  children,
}: {
  venue?: string;
  event?: string;
  status?: string;
  children: ReactNode;
}) {
  return (
    <div style={brandVars} className="flex min-h-screen flex-col bg-slate-950">
      <BrandBanner size="host" />
      <div className="flex flex-wrap items-end justify-between gap-2 px-5 pt-4">
        <PubEventHeader venue={venue} event={event} size="host" />
        {status && (
          <span className="mb-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
            {status}
          </span>
        )}
      </div>
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-4">{children}</main>
      <SponsorStrip size="host" />
    </div>
  );
}

// ── TV / display (large-screen-first) ───────────────────────────────────────
export function TvShell({ children }: { children: ReactNode }) {
  return (
    <div style={brandVars} className="flex min-h-screen flex-col bg-slate-950">
      <BrandBanner size="tv" />
      <main className="flex flex-1 flex-col items-center justify-center px-10 py-8 text-center">{children}</main>
      <SponsorStrip size="tv" />
    </div>
  );
}

// ── Presenter / demo (web presentation) ─────────────────────────────────────
const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Overview" },
  { to: "/play/DEMO", label: "Player join" },
  { to: "/host", label: "Host panel" },
  { to: "/tv/demo", label: "TV display" },
  { to: "/setup", label: "Brand & setup" },
  { to: "/kpi", label: "Brewery KPIs" },
  { to: "/rollout", label: "Rollout" },
  { to: "/capabilities", label: "Capabilities" },
];

export function PresenterNav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex gap-1 overflow-x-auto px-4 py-2">
      {NAV.map((n) => {
        const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
              active ? "text-slate-950" : "text-slate-300 hover:bg-white/5"
            }`}
            style={active ? { background: DEMO_BRAND.primary } : undefined}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <div style={brandVars} className="flex min-h-screen flex-col bg-slate-950">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg text-sm font-black text-slate-950"
          style={{ background: DEMO_BRAND.primary }}
          aria-hidden
        >
          PP
        </div>
        <span className="font-semibold">{DEMO_BRAND.network}</span>
        <span
          className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ color: DEMO_BRAND.primary, border: `1px solid ${DEMO_BRAND.primary}55` }}
        >
          Demo mode
        </span>
        <div className="ml-auto hidden sm:block">
          <PresenterNav />
        </div>
      </div>
      <div className="sm:hidden border-b border-white/10">
        <PresenterNav />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
