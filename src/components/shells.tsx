/**
 * Brand-aware shells — CUSTOMER-FIRST. One structure, adapted per device/context.
 * Brewery/pub/event lead the visual; PubPlay Network appears only as a subtle powered-by mark.
 *   PlayerShell · HostShell · TvShell · DemoShell (+ PresenterNav)
 */
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { DEMO_BRAND, brandInitials } from "../demo/brand";
import { BrandBanner, BrandAssetPreview, SponsorStrip, PoweredByPpnMark, PubEventHeader } from "./brandZones";

const brandVars = { ["--brand" as string]: DEMO_BRAND.primary } as React.CSSProperties;

/** Small brewery context chip (used where pub/event is primary and the brand is secondary). */
function BreweryChip() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">
      <span className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-black text-slate-950" style={{ background: DEMO_BRAND.primary }}>
        {brandInitials(DEMO_BRAND.sponsorName)}
      </span>
      <span className="text-xs text-slate-300">{DEMO_BRAND.sponsorName}</span>
    </span>
  );
}

// ── Player (phone): brewery banner → campaign hero with pub/event → flow → sponsor strip ──
export function PlayerShell({ venue, event, children }: { venue?: string; event?: string; children: ReactNode }) {
  return (
    <div style={brandVars} className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-950">
      <BrandBanner size="phone" />
      <div className="px-4">
        <BrandAssetPreview aspect="3/1">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>{venue ?? ""}</p>
            <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow">{event ?? "PubPlay event"}</h1>
          </div>
        </BrandAssetPreview>
      </div>
      <div className="flex-1 px-4 pt-4">{children}</div>
      <SponsorStrip size="phone" />
    </div>
  );
}

// ── Host (laptop/tablet, touch-friendly): pub/event PRIMARY, brewery context secondary ──
export function HostShell({ venue, event, status, children }: { venue?: string; event?: string; status?: string; children: ReactNode }) {
  return (
    <div style={brandVars} className="flex min-h-screen flex-col bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <PubEventHeader venue={venue} event={event} size="host" />
        <div className="flex items-center gap-2">
          <BreweryChip />
          {status && <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">{status}</span>}
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-4">{children}</main>
      <SponsorStrip size="host" />
    </div>
  );
}

// ── TV / display (large-screen): brewery banner → brand-immersive content → lower-third strip ──
export function TvShell({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ ...brandVars, background: `radial-gradient(120% 80% at 100% 0%, ${DEMO_BRAND.primaryDark}33, transparent 55%), #0b1220` }}
      className="flex min-h-screen flex-col"
    >
      <BrandBanner size="tv" />
      <main className="flex flex-1 flex-col items-center justify-center px-10 py-6 text-center">{children}</main>
      <SponsorStrip size="tv" />
    </div>
  );
}

// ── Presenter / demo (web presentation): brewery central, PPN as enabling platform ──
const NAV: { to: string; label: string }[] = [
  { to: "/", label: "Campaign" },
  { to: "/play/DEMO", label: "Player" },
  { to: "/host", label: "Host" },
  { to: "/tv/demo", label: "TV" },
  { to: "/setup", label: "Brand assets" },
  { to: "/kpi", label: "KPIs" },
  { to: "/rollout", label: "Rollout" },
  { to: "/capabilities", label: "Beyond quiz" },
];

export function PresenterNav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex gap-1 overflow-x-auto px-2 py-1">
      {NAV.map((n) => {
        const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${active ? "text-slate-950" : "text-slate-300 hover:bg-white/5"}`}
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
        {/* Brewery is the primary mark here too */}
        <span className="grid h-8 w-8 place-items-center rounded-lg text-sm font-black text-slate-950" style={{ background: DEMO_BRAND.primary }}>
          {brandInitials(DEMO_BRAND.sponsorName)}
        </span>
        <span className="font-semibold">{DEMO_BRAND.sponsorName}</span>
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          <PresenterNav />
          <PoweredByPpnMark />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 sm:hidden">
        <PresenterNav />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
