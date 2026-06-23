/**
 * Client-facing demo identity — the safe, client-visible identity for journey-2 surfaces (presentation, TV,
 * player, KPI/report/rollout/run-sheet, landing). When a demo brief is prepared, the client/campaign/venue/region
 * from the brief take over the visible identity so a "Harbourline Brewery" deck never shows another brewery's
 * name, logo, offer, tagline or responsible-note.
 *
 * Brand/LOGO + COPY SAFETY: when the brief's client differs from the active preset and there is no custom
 * asset-pack copy/logo, we do NOT borrow the preset's mark or marketing copy (that would be the wrong brewery).
 * We fall back to neutral initials and neutral, truthful copy ("Reward to be confirmed with the venue", etc).
 * Display-only: reads on-device brief + active brand; never mutates DB/session/game state.
 */
import { getActiveBrand, brandInitials, type DemoBrand } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { getAssetPackOverride } from "../demo/assetPack";
import { getDemoBrief } from "./demoBrief";

export interface ClientFacingIdentity {
  hasBrief: boolean;
  /** brief exists AND its client name differs from the active brand/preset sponsor name */
  mismatch: boolean;
  sponsorName: string;
  campaignName: string;
  eventName: string;
  venueName: string;
  region: string;
  broughtBy: string;
  tagline: string;
  offer: string;
  responsibleNote: string;
  /** undefined → caller should render `initials` (logo-safe: never the wrong brewery's mark) */
  logoUrl?: string;
  initials: string;
}

const trimmed = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export function clientFacingIdentity(): ClientFacingIdentity {
  const brand = getActiveBrand();
  const market = activeMarket();
  const brief = getDemoBrief();
  const presetRegion = `${market.label} · ${market.region}`;

  if (!brief) {
    return {
      hasBrief: false, mismatch: false,
      sponsorName: brand.sponsorName, campaignName: brand.campaignName, eventName: brand.eventName,
      venueName: brand.pubName, region: presetRegion, broughtBy: brand.broughtBy, tagline: brand.tagline,
      offer: brand.offer, responsibleNote: brand.responsibleNote,
      logoUrl: brand.images.logoUrl, initials: brandInitials(brand.sponsorName),
    };
  }

  const client = brief.clientName?.trim() || brand.sponsorName;
  const mismatch = client.toLowerCase() !== brand.sponsorName.toLowerCase();
  const pack = (() => { try { return getAssetPackOverride(); } catch { return {}; } })();
  // Logo safety: a custom asset-pack logo is the client's own; otherwise on mismatch fall back to initials.
  const logoUrl = mismatch && !trimmed(pack.logoUrl) ? undefined : brand.images.logoUrl;
  // Copy safety: prefer client-specific asset-pack copy; on mismatch use neutral, truthful fallbacks (never the
  // preset's brewery-specific offer/tagline/note); when aligned, keep the preset copy.
  const offer = trimmed(pack.offer) ?? (mismatch ? "Reward to be confirmed with the venue" : brand.offer);
  const tagline = trimmed(pack.tagline) ?? (mismatch ? "Sponsored pub quiz night" : brand.tagline);
  const responsibleNote = trimmed(pack.responsibleNote)
    ?? (mismatch ? "Please drink responsibly. 18+. Rewards are subject to venue and local rules." : brand.responsibleNote);
  const broughtBy = mismatch ? `Brought to you by ${client}` : brand.broughtBy;

  return {
    hasBrief: true, mismatch,
    sponsorName: client,
    campaignName: brief.campaignName?.trim() || brand.campaignName,
    eventName: brand.eventName, // generic event type ("Quiz Night") — not brewery-specific
    venueName: brief.exampleVenueName?.trim() || brand.pubName,
    region: brief.marketRegion?.trim() || presetRegion,
    broughtBy, tagline, offer, responsibleNote,
    logoUrl, initials: brandInitials(client),
  };
}

/** A DemoBrand re-skinned with the client-facing identity — for seeded slide collections (media.ts) so TV
 * carousels/slideshows never render the wrong brewery's name/offer/image. On mismatch, preset imagery is dropped
 * (gradient fallback) so no wrong-client photo/logo appears. Display-only. */
export function clientFacingBrand(): DemoBrand {
  const brand = getActiveBrand();
  const id = clientFacingIdentity();
  return {
    ...brand,
    sponsorName: id.sponsorName,
    campaignName: id.campaignName,
    pubName: id.venueName,
    tagline: id.tagline,
    offer: id.offer,
    broughtBy: id.broughtBy,
    responsibleNote: id.responsibleNote,
    cta: id.mismatch ? "See you next time!" : brand.cta,
    images: id.mismatch
      ? { logoUrl: id.logoUrl } // drop preset hero/sponsor/venue imagery on mismatch → safe brand gradient
      : brand.images,
  };
}

/** Client-safe video URL for a TV slot: ONLY a client-supplied (asset-pack) video plays on the client TV path —
 * shared sample clips (e.g. Big Buck Bunny) are suppressed so the slot falls back to a branded image/gradient.
 * Video capability is preserved: drop a real asset-pack video URL in and it plays. */
export function clientVideoUrl(slot: "intro" | "bumper" | "closing"): string | undefined {
  try {
    const p = getAssetPackOverride();
    const v = slot === "intro" ? p.tvIntroVideoUrl : slot === "bumper" ? p.sponsorBumperVideoUrl : p.closingVideoUrl;
    return trimmed(v);
  } catch {
    return undefined;
  }
}
