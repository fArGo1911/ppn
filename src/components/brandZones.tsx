/**
 * Brand-aware layout zones — CUSTOMER-FIRST hierarchy.
 * Primary on customer surfaces: brewery/sponsor brand · pub/venue · event · campaign/offer · imagery.
 * Secondary: PubPlay Network (only a subtle "powered by" mark).
 */
import type { ReactNode } from "react";
import { DEMO_BRAND, brandInitials } from "../demo/brand";

type Size = "phone" | "host" | "tv";

const LOGO = { phone: "h-9 w-9 text-sm", host: "h-9 w-9 text-sm", tv: "h-20 w-20 text-3xl" } as const;

/** Premium image/asset container — a brand-tinted gradient (implies real asset space) or a provided image. */
export function BrandAssetPreview({
  aspect = "16/9",
  image,
  label,
  className = "",
  children,
}: {
  aspect?: string;
  image?: string;
  label?: string; // shown only where we WANT to document the slot (e.g. the asset-spec page)
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        aspectRatio: aspect,
        background: image
          ? `center/cover url(${image})`
          : `radial-gradient(120% 120% at 0% 0%, ${DEMO_BRAND.primary}33, transparent 60%), linear-gradient(135deg, ${DEMO_BRAND.primaryDark}, #0b1220)`,
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      {children && <div className="absolute inset-0 flex items-center p-5">{children}</div>}
      {label && (
        <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] text-slate-200">{label}</span>
      )}
    </div>
  );
}

/** Top BREWERY banner (primary). Logo + brewery name; no PPN here. */
export function BrandBanner({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <header className={`flex items-center gap-3 ${tv ? "px-10 py-6" : "px-4 py-3"}`}>
      <div
        className={`grid place-items-center rounded-xl font-black text-slate-950 ${LOGO[size]}`}
        style={{ background: DEMO_BRAND.primary }}
        aria-hidden
      >
        {brandInitials(DEMO_BRAND.sponsorName)}
      </div>
      <div className="min-w-0">
        <p className={`font-bold leading-tight ${tv ? "text-3xl" : "text-base"}`}>{DEMO_BRAND.sponsorName}</p>
        <p className={`truncate text-slate-400 ${tv ? "text-lg" : "text-xs"}`}>{DEMO_BRAND.tagline}</p>
      </div>
    </header>
  );
}

/** Pub + event identity. Pub name must be clearly visible on every surface. */
export function PubEventHeader({ venue, event, size = "phone" }: { venue?: string; event?: string; size?: Size }) {
  const tv = size === "tv";
  return (
    <div className={tv ? "px-10" : "px-4"}>
      <p className={`uppercase tracking-widest ${tv ? "text-xl" : "text-xs"}`} style={{ color: DEMO_BRAND.primary }}>
        {venue ?? "Venue"}
      </p>
      <h1 className={`font-extrabold leading-tight ${tv ? "text-6xl" : "text-2xl"}`}>{event ?? "PubPlay event"}</h1>
    </div>
  );
}

export function OfferBadge({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${tv ? "px-4 py-1.5 text-lg" : "px-2.5 py-1 text-xs"}`}
      style={{ background: `${DEMO_BRAND.primary}22`, color: DEMO_BRAND.primary, border: `1px solid ${DEMO_BRAND.primary}55` }}
    >
      🎁 {DEMO_BRAND.offer}
    </span>
  );
}

/** Sponsor message text slot (where brewery campaign copy goes). */
export function SponsorMessageSlot({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <p className={`text-slate-300 ${tv ? "text-2xl" : "text-sm"}`}>
      <span className="font-semibold" style={{ color: DEMO_BRAND.primary }}>{DEMO_BRAND.sponsorName}</span> · {DEMO_BRAND.broughtBy}
    </p>
  );
}

/** Where AI-host voice state appears (planning slot — no generation in this slice). */
export function AiAnnouncementSlot({ scriptKey = "eventIntro", size = "phone" }: { scriptKey?: keyof typeof DEMO_BRAND.ai; size?: Size }) {
  const tv = size === "tv";
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] ${tv ? "p-5" : "p-3"}`}>
      <p className={`flex items-center gap-2 font-medium text-slate-300 ${tv ? "text-xl" : "text-xs"}`}>
        <span className="inline-grid h-5 w-5 place-items-center rounded-full text-[10px] text-slate-950" style={{ background: DEMO_BRAND.primary }}>AI</span>
        AI host
      </p>
      <p className={`mt-1 text-slate-400 ${tv ? "text-lg" : "text-xs"}`}>“{DEMO_BRAND.ai[scriptKey]}”</p>
    </div>
  );
}

/** Subtle platform mark — PPN is the enabling platform, NOT the main sender. */
export function PoweredByPpnMark({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <span className={`text-slate-500 ${tv ? "text-base" : "text-[11px]"}`}>
      <span aria-hidden>⚡ </span>powered by <span className="text-slate-400">{DEMO_BRAND.network}</span>
    </span>
  );
}

/** Bottom sponsor/footer strip: offer + sponsor + subtle powered-by. */
export function SponsorStrip({ size = "phone", showOffer = true }: { size?: Size; showOffer?: boolean }) {
  const tv = size === "tv";
  return (
    <footer
      className={`mt-auto flex flex-wrap items-center gap-3 border-t border-white/10 ${tv ? "px-10 py-6" : "px-4 py-3"}`}
      style={{ background: `linear-gradient(90deg, ${DEMO_BRAND.primaryDark}22, transparent)` }}
    >
      <SponsorMessageSlot size={size} />
      {showOffer && <div className="ml-auto"><OfferBadge size={size} /></div>}
      <div className={showOffer ? "w-full" : "ml-auto"}>
        <PoweredByPpnMark size={size} />
      </div>
    </footer>
  );
}
