/**
 * Brand asset SPECIFICATION for the POC (documentation + slot structure, not an upload/asset-management system).
 * Lets a PPN operator prepare a brewery-specific demo quickly: what assets, what sizes/aspect ratios, and WHERE
 * each one appears across TV / phone / host / presenter surfaces. Rendered by the /setup spec page.
 */

export interface ImageSlot {
  key: string;
  label: string;
  aspect: string; // CSS aspect-ratio, e.g. "16/9"
  recommended: string; // recommended pixel size
  appearsOn: string[]; // surfaces
  notes?: string;
}

export const IMAGE_SLOTS: ImageSlot[] = [
  { key: "logo", label: "Brewery logo", aspect: "1/1", recommended: "SVG / transparent PNG", appearsOn: ["Phone", "Host", "TV", "Presenter", "KPI"], notes: "Light + dark variants; transparent background preferred." },
  { key: "tvHero", label: "TV hero / campaign background", aspect: "16/9", recommended: "1920×1080", appearsOn: ["TV welcome", "Presenter"], notes: "Must support a dark overlay for text readability." },
  { key: "tvSponsorSlide", label: "TV sponsor slide", aspect: "16/9", recommended: "1920×1080", appearsOn: ["TV between-round", "TV pause"] },
  { key: "tvLowerThird", label: "TV lower-third / banner", aspect: "8/1", recommended: "1920×240", appearsOn: ["TV offer strip", "TV sponsored question"] },
  { key: "phoneCard", label: "Phone sponsor card", aspect: "4/5", recommended: "1080×1350 (or 1080×1080)", appearsOn: ["Phone waiting", "Phone sponsored question"], notes: "Crops safely on small screens." },
  { key: "phoneBanner", label: "Phone banner", aspect: "3/1", recommended: "1200×400", appearsOn: ["Phone header"] },
  { key: "campaignHero", label: "Campaign hero", aspect: "16/9", recommended: "1920×1080 (or 3:2)", appearsOn: ["Presenter landing"] },
  { key: "venue", label: "Pub / venue image", aspect: "16/9", recommended: "1600×900 (or 4:3)", appearsOn: ["Presenter venue profile"] },
  { key: "rollout", label: "Rollout / network graphic", aspect: "16/9", recommended: "1920×1080", appearsOn: ["Rollout view"] },
  { key: "questionMedia", label: "Picture/video question media", aspect: "16/9", recommended: "1920×1080 (+ phone-safe crop)", appearsOn: ["TV question", "Phone question"], notes: "Video: short controlled 16:9 clip only (optional)." },
];

export const VIDEO_SLOTS = [
  { key: "tvIntro", label: "TV intro clip", notes: "Optional, short." },
  { key: "sponsorBumper", label: "Sponsor bumper", notes: "Optional." },
  { key: "videoQuestion", label: "Video question clip", notes: "Optional, 16:9 short." },
];

/** Dynamic text slots (filled from the brewery preset). */
export const TEXT_SLOTS = [
  "Brewery name",
  "Campaign name",
  "Sponsor tagline",
  "“Brought to you by” message",
  "Responsible-sponsor wording",
  "Offer / prize message",
  "CTA / next-event message",
  "TV pause/intermission copy",
  "Phone sponsor card copy",
  "KPI report header text",
];

/** AI voice/script slots (planning only — generated/spoken in the later AI slice). */
export const AI_SLOTS: { key: string; label: string }[] = [
  { key: "eventIntro", label: "Event intro (welcome + how to play + sponsor)" },
  { key: "roundIntro", label: "Round intro" },
  { key: "sponsoredIntro", label: "Sponsored-round intro" },
  { key: "questionReadout", label: "Question readout" },
  { key: "answerReveal", label: "Answer reveal" },
  { key: "intermission", label: "Pause / intermission announcement" },
  { key: "winner", label: "Winner announcement" },
];
