/**
 * Brand-aware layout zones, shared by all surfaces (player / host / TV / presenter) and sized per device.
 * They mark WHERE branding belongs without overpowering gameplay/readability.
 */
import { DEMO_BRAND, brandInitials } from "../demo/brand";

type Size = "phone" | "host" | "tv";

const LOGO = {
  phone: "h-7 w-7 text-xs",
  host: "h-8 w-8 text-sm",
  tv: "h-16 w-16 text-2xl",
} as const;

/** Top brewery/pub banner: logo placeholder + network + "brought to you by". */
export function BrandBanner({ size = "phone" }: { size?: Size }) {
  const tv = size === "tv";
  return (
    <header
      className={`flex items-center gap-3 border-b border-white/10 ${tv ? "px-10 py-6" : "px-4 py-3"}`}
      style={{ background: `linear-gradient(90deg, ${DEMO_BRAND.primaryDark}22, transparent)` }}
    >
      <div
        className={`grid place-items-center rounded-lg font-black text-slate-950 ${LOGO[size]}`}
        style={{ background: DEMO_BRAND.primary }}
        aria-hidden
      >
        {brandInitials(DEMO_BRAND.sponsorName)}
      </div>
      <div className="min-w-0">
        <p className={`font-semibold leading-tight ${tv ? "text-2xl" : "text-sm"}`}>{DEMO_BRAND.network}</p>
        <p className={`truncate text-slate-400 ${tv ? "text-lg" : "text-xs"}`}>{DEMO_BRAND.broughtBy}</p>
      </div>
      <span
        className={`ml-auto rounded-full px-2 py-0.5 font-medium ${tv ? "text-sm" : "text-[10px]"}`}
        style={{ color: DEMO_BRAND.primary, border: `1px solid ${DEMO_BRAND.primary}55` }}
      >
        Demo
      </span>
    </header>
  );
}

/** Pub + event identity. Pub name must be clearly visible on every surface. */
export function PubEventHeader({
  venue,
  event,
  size = "phone",
}: {
  venue?: string;
  event?: string;
  size?: Size;
}) {
  const tv = size === "tv";
  return (
    <div className={tv ? "px-10 py-6" : "px-4 py-4"}>
      <p
        className={`uppercase tracking-widest ${tv ? "text-xl" : "text-xs"}`}
        style={{ color: DEMO_BRAND.primary }}
      >
        {venue ?? "Venue"}
      </p>
      <h1 className={`font-extrabold leading-tight ${tv ? "text-6xl" : size === "host" ? "text-2xl" : "text-2xl"}`}>
        {event ?? "PubPlay event"}
      </h1>
    </div>
  );
}

/** Offer / campaign badge (responsible-sponsor: non-alcohol example). */
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

/** Bottom sponsor/footer strip (a lower-third on TV; a sponsor card on phone). */
export function SponsorStrip({ size = "phone", showOffer = true }: { size?: Size; showOffer?: boolean }) {
  const tv = size === "tv";
  return (
    <footer
      className={`mt-auto flex flex-wrap items-center gap-3 border-t border-white/10 ${tv ? "px-10 py-6" : "px-4 py-3"}`}
      style={{ background: `linear-gradient(90deg, ${DEMO_BRAND.primaryDark}22, transparent)` }}
    >
      <div className="min-w-0">
        <p className={`font-semibold ${tv ? "text-2xl" : "text-sm"}`} style={{ color: DEMO_BRAND.primary }}>
          {DEMO_BRAND.sponsorName}
        </p>
        <p className={`truncate text-slate-400 ${tv ? "text-base" : "text-xs"}`}>{DEMO_BRAND.tagline}</p>
      </div>
      {showOffer && <div className="ml-auto">{<OfferBadge size={size} />}</div>}
    </footer>
  );
}
