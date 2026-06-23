/**
 * Operator asset-pack override (POC: localStorage only — NO upload, NO storage, NO backend).
 * Lets a PPN operator prepare a brewery-specific demo by pasting real URLs / local public paths
 * (e.g. /demo/assets/northgate/logo.png) + copy overrides in /config, without editing TypeScript.
 * Empty/blank fields fall back to the active preset, so an override can never blank the page.
 */
import type { DemoBrand } from "./brand";

export interface AssetPack {
  // copy
  sponsorName?: string;
  campaignName?: string;
  pubName?: string;
  eventName?: string;
  offer?: string;
  tagline?: string;
  responsibleNote?: string;
  // image paths
  logoUrl?: string;
  heroUrl?: string;
  sponsorSlideUrl?: string;
  phoneCardUrl?: string;
  lowerThirdUrl?: string;
  venueUrl?: string;
  // video paths
  tvIntroVideoUrl?: string;
  sponsorBumperVideoUrl?: string;
  closingVideoUrl?: string;
  // audio cue files (MP3/etc.) — operator-supplied playback only; mapped onto brand.audio so host/TV cues use them.
  eventIntroAudioUrl?: string;
  roundIntroAudioUrl?: string;
  sponsoredIntroAudioUrl?: string;
  questionReadoutAudioUrl?: string;
  answerRevealAudioUrl?: string;
  winnerAudioUrl?: string;
  sponsorMessageAudioUrl?: string;
}

const KEY = "ppn_asset_pack";

export function getAssetPackOverride(): AssetPack {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as AssetPack) : {}; } catch { return {}; }
}
export function setAssetPackOverride(a: AssetPack) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* ignore */ } }
export function clearAssetPackOverride() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
export function hasAssetPackOverride(): boolean {
  const a = getAssetPackOverride();
  return Object.values(a).some((v) => typeof v === "string" && v.trim() !== "");
}

const use = (override: string | undefined, fallback: string): string => (override && override.trim() ? override.trim() : fallback);
const useOpt = (override: string | undefined, fallback: string | undefined): string | undefined => (override && override.trim() ? override.trim() : fallback);

/** Merge the operator asset pack over a preset. Blank fields keep the preset value (never blanks a page). */
export function applyAssetPackToBrand(brand: DemoBrand): DemoBrand {
  const a = getAssetPackOverride();
  if (!Object.keys(a).length) return brand;
  const sponsorName = use(a.sponsorName, brand.sponsorName);
  // Keep the "brought to you by / Präsentiert von / Presenteras av" wording, just swap the brewery name.
  const broughtBy = a.sponsorName && a.sponsorName.trim() ? brand.broughtBy.replace(brand.sponsorName, sponsorName) : brand.broughtBy;
  return {
    ...brand,
    sponsorName,
    broughtBy,
    campaignName: use(a.campaignName, brand.campaignName),
    pubName: use(a.pubName, brand.pubName),
    eventName: use(a.eventName, brand.eventName),
    offer: use(a.offer, brand.offer),
    tagline: use(a.tagline, brand.tagline),
    responsibleNote: use(a.responsibleNote, brand.responsibleNote),
    images: {
      ...brand.images,
      logoUrl: useOpt(a.logoUrl, brand.images.logoUrl),
      heroUrl: useOpt(a.heroUrl, brand.images.heroUrl),
      sponsorSlideUrl: useOpt(a.sponsorSlideUrl, brand.images.sponsorSlideUrl),
      phoneCardUrl: useOpt(a.phoneCardUrl, brand.images.phoneCardUrl),
      lowerThirdUrl: useOpt(a.lowerThirdUrl, brand.images.lowerThirdUrl),
      venueUrl: useOpt(a.venueUrl, brand.images.venueUrl),
    },
    video: {
      ...brand.video,
      tvIntroVideoUrl: useOpt(a.tvIntroVideoUrl, brand.video.tvIntroVideoUrl),
      sponsorBumperVideoUrl: useOpt(a.sponsorBumperVideoUrl, brand.video.sponsorBumperVideoUrl),
      closingVideoUrl: useOpt(a.closingVideoUrl, brand.video.closingVideoUrl),
    },
    // Operator-uploaded cue audio overrides the fixed public/demo/audio path; host/TV AudioCue then plays it.
    audio: {
      ...brand.audio,
      aiEventIntroAudioUrl: useOpt(a.eventIntroAudioUrl, brand.audio.aiEventIntroAudioUrl),
      aiRoundIntroAudioUrl: useOpt(a.roundIntroAudioUrl, brand.audio.aiRoundIntroAudioUrl),
      aiSponsoredRoundIntroAudioUrl: useOpt(a.sponsoredIntroAudioUrl, brand.audio.aiSponsoredRoundIntroAudioUrl),
      aiQuestionReadoutAudioUrl: useOpt(a.questionReadoutAudioUrl, brand.audio.aiQuestionReadoutAudioUrl),
      aiAnswerRevealAudioUrl: useOpt(a.answerRevealAudioUrl, brand.audio.aiAnswerRevealAudioUrl),
      aiWinnerAnnouncementAudioUrl: useOpt(a.winnerAudioUrl, brand.audio.aiWinnerAnnouncementAudioUrl),
      sponsorAudioMessageUrl: useOpt(a.sponsorMessageAudioUrl, brand.audio.sponsorAudioMessageUrl),
    },
  };
}
