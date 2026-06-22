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

/** Branding zone map — for each surface, the named zones + what shows + which config field controls it. */
export const ZONE_MAP: { surface: string; zones: { zone: string; shows: string; field: string }[] }[] = [
  { surface: "Player (phone)", zones: [
    { zone: "sponsorHeader", shows: "brewery logo · name · tagline", field: "breweryLogo · breweryName · breweryTagline" },
    { zone: "campaignHero", shows: "campaign/venue image · pub name · event name", field: "campaignHeroImage · pubName · eventName" },
    { zone: "joinAction", shows: "name / team entry", field: "—" },
    { zone: "offerStrip", shows: "offer / prize message", field: "offerText" },
    { zone: "poweredBy", shows: "subtle PPN mark (bottom-right)", field: "poweredByText" },
  ] },
  { surface: "Host", zones: [
    { zone: "eventHeader", shows: "pub name · event name · session status", field: "pubName · eventName" },
    { zone: "sponsorContext", shows: "brewery name · campaign · offer", field: "breweryName · campaignName · offerText" },
    { zone: "teamPanel", shows: "teams / players / captains", field: "—" },
    { zone: "poweredBy", shows: "subtle PPN mark", field: "poweredByText" },
  ] },
  { surface: "TV / display", zones: [
    { zone: "sponsorTop", shows: "brewery logo / name", field: "breweryLogo · breweryName" },
    { zone: "heroVisual", shows: "campaign / venue image", field: "campaignHeroImage · venueImage" },
    { zone: "eventTitle", shows: "pub name + event name", field: "pubName · eventName" },
    { zone: "qrBlock", shows: "QR + join instruction", field: "—" },
    { zone: "lowerThird", shows: "offer / prize / sponsor message", field: "offerText · sponsorSlideImage" },
    { zone: "poweredBy", shows: "bottom-right PPN mark", field: "poweredByText" },
  ] },
  { surface: "Presenter / demo", zones: [
    { zone: "campaignHero", shows: "brewery campaign story", field: "campaignHeroImage · campaignName" },
    { zone: "demoNav", shows: "guided / free click-through", field: "—" },
    { zone: "previewCards", shows: "player / host / TV / KPI", field: "—" },
    { zone: "commercialClose", shows: "sponsor pilot package", field: "—" },
    { zone: "poweredBy", shows: "subtle PPN mark", field: "poweredByText" },
  ] },
];

/** Asset usage map — where each prepared asset appears. */
export const ASSET_USAGE: { asset: string; appears: string }[] = [
  { asset: "primary logo", appears: "TV welcome · player header · KPI report" },
  { asset: "square / icon logo", appears: "phone sponsor card · compact banners" },
  { asset: "TV hero image", appears: "TV welcome · presenter campaign landing" },
  { asset: "TV sponsor slide", appears: "TV pause / intermission · between rounds" },
  { asset: "phone sponsor card image", appears: "waiting screen · sponsored question" },
  { asset: "lower-third banner", appears: "TV offer strip" },
  { asset: "campaign colour theme", appears: "ALL player / TV / host / presenter surfaces" },
  { asset: "AI event intro script", appears: "first event announcement (TV + player waiting)" },
  { asset: "responsible wording", appears: "offer badge · sponsor note" },
];

/** Transparency + overlay rules. */
export const TRANSPARENCY = {
  transparentPreferred: ["logos", "icons", "sponsor marks", "overlay badges", "powered-by marks"],
  nonTransparent: ["hero images", "campaign backgrounds", "sponsor slides", "venue photos", "question images", "pause/intermission images"],
  overlaySafe: "For images used behind text: declare supportsTextOverlay (yes/no), darkOverlayNeeded (yes/no), safeTextArea (top/centre/bottom/left/right), and flag 'image too busy' if applicable.",
};
