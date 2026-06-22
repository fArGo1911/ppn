/**
 * PPN demo brand config (SEEDED/static for this slice — not the full brand studio).
 * Drives the brand-aware layout zones across player / host / TV / presenter surfaces. Later this becomes the
 * swappable brewery preset; for now it's one tasteful default so the zones show where branding belongs.
 *
 * Responsible-sponsor default: the "offer" is a NON-alcohol example (food discount).
 */
export interface DemoBrand {
  network: string;
  sponsorName: string;
  broughtBy: string;
  tagline: string;
  offer: string;
  market: "SE" | "DE" | "UK";
  primary: string; // brand accent (CSS color)
  primaryDark: string;
}

export const DEMO_BRAND: DemoBrand = {
  network: "PubPlay Network",
  sponsorName: "Northgate Brewing Co.",
  broughtBy: "Brought to you by Northgate Brewing Co.",
  tagline: "Good beer · good craic · good quiz",
  offer: "Tonight: 20% off the kitchen for every team",
  market: "UK",
  primary: "#f59e0b", // amber
  primaryDark: "#b45309",
};

/** Two initials for a simple logo placeholder (until real logo upload in the brand studio). */
export function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
