/**
 * Brand-aware layout zones — CUSTOMER-FIRST + THEME-TOKEN driven (re-skin per brewery preset).
 * Primary: brewery/sponsor · pub/venue · event · campaign/offer · imagery. Secondary: PPN ("powered by" only).
 * Colours come from CSS tokens (var(--ppn-*)) set by applyTheme, so a white/red brewery re-skins everything.
 */
import { useState, type ReactNode } from "react";
import { DEMO_BRAND, brandInitials } from "../demo/brand";
import { clientFacingIdentity } from "../lib/clientFacingDemo";

type Size = "phone" | "host" | "tv";
const LOGO = { phone: "h-9 w-9 text-sm", host: "h-9 w-9 text-sm", tv: "h-20 w-20 text-3xl" } as const;
const onBrand = { background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" };

/** Brewery logo — renders the asset-pack logo image if set + loadable, else falls back to brand initials. */
export function BrandLogo({ size = "phone" }: { size?: Size }) {
  const [broken, setBroken] = useState(false);
  const url = DEMO_BRAND.images.logoUrl;
  if (url && !broken) {
    return <img src={url} alt={DEMO_BRAND.sponsorName} onError={() => setBroken(true)} className={`${LOGO[size]} rounded-xl object-contain`} style={{ background: "var(--ppn-surface)" }} />;
  }
  return <div className={`grid place-items-center rounded-xl font-black ${LOGO[size]}`} style={onBrand} aria-hidden>{brandInitials(DEMO_BRAND.sponsorName)}</div>;
}

/** Premium campaign-image slot — brand-tinted gradient (implies real asset space) or a provided image. */
export function BrandAssetPreview({
  aspect = "16/9",
  image,
  label,
  overlay = "dark",
  alt,
  className = "",
  children,
}: {
  aspect?: string;
  image?: string;
  label?: string; // documentation tag (asset-spec page only)
  overlay?: "dark" | "light" | "none";
  alt?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        aspectRatio: aspect,
        // Layer the image OVER the brand gradient so a missing/broken path degrades gracefully to the gradient.
        background: image
          ? `center/cover url(${image}), radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--ppn-brand) 35%, transparent), transparent 60%), linear-gradient(135deg, var(--ppn-brand-dark), #0b1220)`
          : `radial-gradient(120% 120% at 0% 0%, color-mix(in srgb, var(--ppn-brand) 35%, transparent), transparent 60%), linear-gradient(135deg, var(--ppn-brand-dark), #0b1220)`,
      }}
    >
      {overlay !== "none" && <div className={`absolute inset-0 ${overlay === "light" ? "bg-white/30" : "bg-black/35"}`} />}
      {children && <div className="absolute inset-0 flex items-center p-5">{children}</div>}
      {label && <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[11px] text-white">{label}</span>}
    </div>
  );
}

/** Top BREWERY banner (primary). Client-facing: follows the prepared brief identity (logo-safe). No PPN here. */
export function BrandBanner({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  const id = clientFacingIdentity();
  const [broken, setBroken] = useState(false);
  return (
    <header className={`flex items-center gap-3 ${tv ? "px-10 py-6" : "px-4 py-3"}`}>
      {id.logoUrl && !broken
        ? <img src={id.logoUrl} alt={id.sponsorName} onError={() => setBroken(true)} className={`${LOGO[size]} rounded-xl object-contain`} style={{ background: "var(--ppn-surface)" }} />
        : <div className={`grid place-items-center rounded-xl font-black ${LOGO[size]}`} style={onBrand} aria-hidden>{id.initials}</div>}
      <div className="min-w-0">
        <p className={`font-bold leading-tight ${tv ? "text-3xl" : "text-base"}`}>{id.sponsorName}</p>
        <p className={`truncate text-[var(--ppn-muted)] ${tv ? "text-lg" : "text-xs"}`}>{id.tagline}</p>
      </div>
    </header>
  );
}

/** Pub + event identity. PUB NAME is primary; event is a clear sub-line (pub-owned copy, never "PubPlay …"). */
export function PubEventHeader({ venue, event, size = "phone" }: { venue?: string; event?: string; size?: Size }) {
  const tv = size === "tv";
  const pub = venue ?? DEMO_BRAND.pubName;
  const ev = event ?? DEMO_BRAND.eventName;
  return (
    <div className={tv ? "px-10" : "px-4"}>
      <h1 className={`font-extrabold leading-tight ${tv ? "text-6xl" : "text-2xl"}`}>{pub}</h1>
      <p className={`font-semibold text-[var(--ppn-brand)] ${tv ? "text-2xl" : "text-sm"}`}>
        {ev} · {DEMO_BRAND.broughtBy}
      </p>
    </div>
  );
}

export function OfferBadge({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${tv ? "px-4 py-1.5 text-lg" : "px-2.5 py-1 text-xs"}`}
      style={{ background: "color-mix(in srgb, var(--ppn-brand) 18%, transparent)", color: "var(--ppn-brand)", border: "1px solid color-mix(in srgb, var(--ppn-brand) 45%, transparent)" }}
    >
      🎁 {clientFacingIdentity().offer}
    </span>
  );
}

export function SponsorMessageSlot({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  const id = clientFacingIdentity();
  return (
    <p className={`text-[var(--ppn-muted)] ${tv ? "text-2xl" : "text-sm"}`}>
      <span className="font-semibold text-[var(--ppn-brand)]">{id.sponsorName}</span> · {id.broughtBy}
    </p>
  );
}

/** Where AI-host voice state appears (planning slot — no generation this slice). */
export function AiAnnouncementSlot({ scriptKey = "eventIntro", size = "phone" }: { scriptKey?: keyof typeof DEMO_BRAND.ai; size?: Size }) {
  const tv = size === "tv";
  return (
    <div className={`rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] ${tv ? "p-5" : "p-3"}`}>
      <p className={`flex items-center gap-2 font-medium ${tv ? "text-xl" : "text-xs"}`}>
        <span className="inline-grid h-5 w-5 place-items-center rounded-full text-[10px]" style={onBrand}>AI</span>
        AI host
      </p>
      <p className={`mt-1 text-[var(--ppn-muted)] ${tv ? "text-lg" : "text-xs"}`}>“{DEMO_BRAND.ai[scriptKey]}”</p>
    </div>
  );
}

/** Subtle platform mark — PPN powers the experience; never the main sender. Placed bottom-right where practical. */
export function PoweredByPpnMark({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <span className={`text-[var(--ppn-muted)] opacity-80 ${tv ? "text-base" : "text-[11px]"}`}>
      <span aria-hidden>⚡ </span>{DEMO_BRAND.poweredBy}
    </span>
  );
}

/** Bottom sponsor/footer strip: sponsor + offer (left/centre) + subtle powered-by (bottom-right). */
export function SponsorStrip({ size = "phone", showOffer = true }: { size?: Size; showOffer?: boolean }) {
  const tv = size === "tv";
  return (
    <footer
      className={`mt-auto flex flex-wrap items-center gap-3 border-t border-[var(--ppn-border)] ${tv ? "px-10 py-6" : "px-4 py-3"}`}
      style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--ppn-brand-dark) 14%, transparent), transparent)" }}
    >
      <SponsorMessageSlot size={size} />
      {showOffer && <OfferBadge size={size} />}
      <div className="ml-auto"><PoweredByPpnMark size={size} /></div>
    </footer>
  );
}
