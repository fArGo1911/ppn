/**
 * Client-facing demo identity — the safe, client-visible identity for journey-2 surfaces (presentation, TV,
 * player, KPI/report/rollout/run-sheet). When a demo brief is prepared, the client/campaign/venue/region from the
 * brief take over the visible identity so a "Harbourline Brewery" deck never shows another brewery's name.
 *
 * Brand/LOGO SAFETY: if the brief's client differs from the active preset and there is NO custom asset-pack logo,
 * we DO NOT show the preset's logo (that would be the wrong brewery's mark) — we fall back to neutral initials.
 * Display-only: reads on-device brief + active brand; never mutates DB/session/game state.
 */
import { getActiveBrand, brandInitials } from "../demo/brand";
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
  const packLogo = (() => { try { return getAssetPackOverride().logoUrl?.trim() || undefined; } catch { return undefined; } })();
  // Logo safety: a custom asset-pack logo is the client's own; otherwise on mismatch fall back to initials.
  const logoUrl = mismatch && !packLogo ? undefined : brand.images.logoUrl;
  const broughtBy = mismatch ? brand.broughtBy.replace(brand.sponsorName, client) : brand.broughtBy;

  return {
    hasBrief: true, mismatch,
    sponsorName: client,
    campaignName: brief.campaignName?.trim() || brand.campaignName,
    eventName: brand.eventName, // generic event type ("Quiz Night") — not brewery-specific
    venueName: brief.exampleVenueName?.trim() || brand.pubName,
    region: brief.marketRegion?.trim() || presetRegion,
    broughtBy, tagline: brand.tagline, offer: brand.offer, responsibleNote: brand.responsibleNote,
    logoUrl, initials: brandInitials(client),
  };
}
