/**
 * Pub-audience content-mix presets (item 5) — seeded/config only, NO recommendation engine.
 * Shows how the same 10-question capability pack can be STEERED to a venue's crowd or a brewery campaign.
 * Mix values are percentages that sum to 100 across the content categories.
 */
export interface ContentMix {
  general: number;
  sport: number;
  football: number;
  music: number;
  geography: number;
  local: number;
  sponsor: number;
}

export interface AudiencePreset {
  id: string;
  label: string;
  steeredBy: "pub" | "brewery";
  description: string;
  mix: ContentMix;
}

export const AUDIENCE_PRESETS: AudiencePreset[] = [
  { id: "sports_bar", label: "Sports bar", steeredBy: "pub", description: "More sport and football for a match-day crowd.", mix: { general: 15, sport: 25, football: 30, music: 5, geography: 10, local: 10, sponsor: 5 } },
  { id: "music_pub", label: "Music pub", steeredBy: "pub", description: "More music/audio rounds for a live-music crowd.", mix: { general: 20, sport: 5, football: 5, music: 35, geography: 10, local: 15, sponsor: 5 } },
  { id: "neighbourhood", label: "Neighbourhood pub", steeredBy: "pub", description: "More local/regional questions for the regulars.", mix: { general: 20, sport: 10, football: 10, music: 10, geography: 10, local: 30, sponsor: 5 } },
  { id: "general_pub", label: "General pub", steeredBy: "pub", description: "Balanced mix — the default night.", mix: { general: 25, sport: 15, football: 15, music: 15, geography: 10, local: 15, sponsor: 5 } },
  { id: "brewery_campaign", label: "Brewery campaign", steeredBy: "brewery", description: "Sponsored/branded round inserted across selected venues.", mix: { general: 20, sport: 15, football: 15, music: 10, geography: 10, local: 10, sponsor: 20 } },
  { id: "match_day", label: "Match-day event", steeredBy: "brewery", description: "Football-heavy night tied to a live fixture.", mix: { general: 10, sport: 20, football: 40, music: 5, geography: 5, local: 10, sponsor: 10 } },
  { id: "regional_campaign", label: "Regional campaign", steeredBy: "brewery", description: "Local/regional content across pubs in one region.", mix: { general: 15, sport: 10, football: 10, music: 10, geography: 10, local: 30, sponsor: 15 } },
];
