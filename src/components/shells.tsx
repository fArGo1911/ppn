/**
 * Brand-aware shells — CUSTOMER-FIRST + THEME-TOKEN driven. One structure, adapted per device.
 * Brewery/pub/event lead; PubPlay Network is only a subtle bottom-right "powered by" mark. Colours come from
 * var(--ppn-*) tokens so each brewery preset re-skins every surface (e.g. white/red).
 */
import type { ReactNode } from "react";
import { DEMO_BRAND, brandInitials } from "../demo/brand";
import { BrandBanner, BrandAssetPreview, SponsorStrip, PoweredByPpnMark, PubEventHeader, BrandLogo } from "./brandZones";

const onBrand = { background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" };

function BreweryChip() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2 py-1">
      <span className="grid h-6 w-6 place-items-center rounded-md text-[10px] font-black" style={onBrand}>
        {brandInitials(DEMO_BRAND.sponsorName)}
      </span>
      <span className="text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.sponsorName}</span>
    </span>
  );
}

// ── Player (phone) ──────────────────────────────────────────────────────────
// `focus` trims the hero + sponsor strip for gameplay states (active question / qintro / reveal) so the
// player's action is the only thing on screen — sponsor stays only as the subtle top brewery banner.
export function PlayerShell({ venue, event, focus = false, children }: { venue?: string; event?: string; focus?: boolean; children: ReactNode }) {
  const pub = venue ?? DEMO_BRAND.pubName;
  const ev = event ?? DEMO_BRAND.eventName;
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-[var(--ppn-bg)] text-[var(--ppn-text)]">
      <BrandBanner size="phone" />
      {!focus && (
        <div className="px-4">
          <BrandAssetPreview aspect="16/9" overlay="dark" image={DEMO_BRAND.images.heroUrl} alt={DEMO_BRAND.heroImageAltText} className="max-h-44 w-full">
            <div>
              <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow">{pub}</h1>
              <p className="text-sm font-semibold text-white/90 drop-shadow">{ev} · {DEMO_BRAND.sponsorName}</p>
            </div>
          </BrandAssetPreview>
        </div>
      )}
      <div className="flex-1 px-4 pt-4">{children}</div>
      {focus ? <div className="h-3" /> : <SponsorStrip size="phone" />}
    </div>
  );
}

// ── Host (laptop/tablet, touch-friendly): pub/event PRIMARY, brewery context secondary ──
export function HostShell({ venue, event, status, children }: { venue?: string; event?: string; status?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ppn-bg)] text-[var(--ppn-text)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ppn-border)] px-5 py-4">
        <PubEventHeader venue={venue} event={event} size="host" />
        <div className="flex items-center gap-2">
          <BreweryChip />
          {status && <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1 text-sm text-[var(--ppn-muted)]">{status}</span>}
        </div>
      </div>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-4">{children}</main>
      <SponsorStrip size="host" />
    </div>
  );
}

// ── TV / display (large-screen): brewery banner → immersive content → lower-third ──
// `focus` strips the brewery banner + sponsor strip for clean gameplay states (active question / qintro /
// non-sponsored reveal) so the question is the only thing on the big screen.
export function TvShell({ children, focus = false }: { children: ReactNode; focus?: boolean }) {
  return (
    <div
      className="flex min-h-screen flex-col text-[var(--ppn-text)]"
      style={{ background: "radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--ppn-brand-dark) 30%, transparent), transparent 55%), var(--ppn-bg)" }}
    >
      {!focus && <BrandBanner size="tv" />}
      <main className="flex flex-1 flex-col items-center justify-center px-10 py-6 text-center">{children}</main>
      {!focus && <SponsorStrip size="tv" />}
    </div>
  );
}

// ── Presentation shell (buyer + operator pages): brewery header + subtle powered-by. NO operator route bar —
// operator navigation lives in /operator and the Presenter Tools pill, so buyer/client pages stay presentation-
// clean and never show Host/Brand-assets/Config-style links. (data-testid="demo-shell" for the e2e smoke.)
export function DemoShell({ children }: { children: ReactNode }) {
  return (
    <div data-testid="demo-shell" className="flex min-h-screen flex-col bg-[var(--ppn-bg)] text-[var(--ppn-text)]">
      <div className="flex items-center gap-3 border-b border-[var(--ppn-border)] px-4 py-3">
        <BrandLogo size="host" />
        <span className="font-semibold">{DEMO_BRAND.sponsorName}</span>
        <div className="ml-auto"><PoweredByPpnMark /></div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  );
}
