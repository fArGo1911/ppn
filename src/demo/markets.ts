/**
 * Per-market demo data (Sweden / Germany / UK) — seeded config, NOT a localisation/analytics engine.
 * Keyed by market code; the active market comes from the active brewery preset (DEMO_BRAND.market).
 * Holds: market context, venue example, demo team/player names, KPI mock numbers, rollout mock data.
 * Brewery identity/colours/copy/AI scripts live on the brand preset (brand.ts); this is the surrounding world.
 */
import { DEMO_BRAND } from "./brand";

export type Market = "SE" | "DE" | "UK";

export interface KpiMock {
  venues: number;
  eventsRun: number;
  playersReached: number;
  teamsCreated: number;
  avgPlayersPerVenue: number;
  sponsoredParticipationPct: number;
  completionPct: number;
  estimatedCampaignReach: number;
  engagementByVenue: { venue: string; players: number; engagementPct: number }[];
  engagementByRound: { round: string; answerRatePct: number }[];
  topVenues: string[];
}

export interface RolloutTier {
  id: "pilot" | "regional" | "campaign";
  label: string;
  venues: number;
  eventsRunPerMonth: number;
  playersReached: number;
  note: string;
}

export interface MarketData {
  market: Market;
  label: string;
  flag: string;
  context: string;
  region: string;
  venueExample: string;
  city: string;
  teamNames: string[];
  playerNames: string[];
  kpi: KpiMock;
  rollout: RolloutTier[];
  pilotVenues: string[];
  nextVenues: string[];
}

export const MARKETS: Record<Market, MarketData> = {
  SE: {
    market: "SE",
    label: "Sweden",
    flag: "🇸🇪",
    context: "Swedish pub/krog culture — social after-work nights, strong football and ice-hockey following, regional pride from Stockholm to Göteborg to Malmö.",
    region: "Stockholm",
    venueExample: "Kvarteret Krog",
    city: "Stockholm",
    teamNames: ["Kvartersmästarna", "Trekronor Trivia", "Surdegsgänget", "Norrsken Nördar"],
    playerNames: ["Erik Andersson", "Anna Lindberg", "Johan Nilsson", "Sara Berg", "Fatima Hassan", "Amir Khan", "Linnea Karlsson", "Elias Pettersson"],
    kpi: {
      venues: 18, eventsRun: 74, playersReached: 5120, teamsCreated: 980, avgPlayersPerVenue: 38,
      sponsoredParticipationPct: 86, completionPct: 91, estimatedCampaignReach: 42000,
      engagementByVenue: [
        { venue: "Kvarteret Krog", players: 56, engagementPct: 94 },
        { venue: "Söder Pub & Kök", players: 48, engagementPct: 90 },
        { venue: "Hamnkrogen Göteborg", players: 41, engagementPct: 88 },
      ],
      engagementByRound: [
        { round: "General", answerRatePct: 96 }, { round: "Local (Stockholm)", answerRatePct: 93 },
        { round: "Music", answerRatePct: 90 }, { round: "Sponsored (Nordström)", answerRatePct: 86 },
      ],
      topVenues: ["Kvarteret Krog", "Söder Pub & Kök", "Hamnkrogen Göteborg"],
    },
    rollout: [
      { id: "pilot", label: "5-pub pilot", venues: 5, eventsRunPerMonth: 20, playersReached: 1400, note: "Stockholm inner-city pilot" },
      { id: "regional", label: "25-pub regional", venues: 25, eventsRunPerMonth: 100, playersReached: 9000, note: "Stockholm + Göteborg + Malmö" },
      { id: "campaign", label: "100-pub campaign", venues: 100, eventsRunPerMonth: 400, playersReached: 38000, note: "National Nordström activation" },
    ],
    pilotVenues: ["Kvarteret Krog", "Söder Pub & Kök", "Vasa Värdshus", "Gamla Stan Taverna", "Kungsholmen Krog"],
    nextVenues: ["Hamnkrogen Göteborg", "Lilla Torg Malmö", "Uppsala Studentkrog"],
  },
  DE: {
    market: "DE",
    label: "Germany",
    flag: "🇩🇪",
    context: "German Kneipe/Wirtshaus culture — Stammtisch regulars, Bundesliga match nights, strong regional beer identity (Bavaria, Rhineland, North).",
    region: "Bayern",
    venueExample: "Zum Goldenen Hirsch",
    city: "München",
    teamNames: ["Die Stammtischhelden", "Bundesliga Brains", "Bierdeckel-Banditen", "Die Schlaubergerei"],
    playerNames: ["Lukas Müller", "Anna Schneider", "Felix Weber", "Laura Fischer", "Mehmet Yılmaz", "Aylin Demir", "Jonas Becker", "Sofia Wagner"],
    kpi: {
      venues: 22, eventsRun: 96, playersReached: 7300, teamsCreated: 1410, avgPlayersPerVenue: 44,
      sponsoredParticipationPct: 88, completionPct: 93, estimatedCampaignReach: 61000,
      engagementByVenue: [
        { venue: "Zum Goldenen Hirsch", players: 64, engagementPct: 95 },
        { venue: "Augustiner Eck", players: 58, engagementPct: 92 },
        { venue: "Rheinterrasse Köln", players: 49, engagementPct: 89 },
      ],
      engagementByRound: [
        { round: "Allgemeinwissen", answerRatePct: 97 }, { round: "Lokal (München)", answerRatePct: 94 },
        { round: "Musik", answerRatePct: 91 }, { round: "Sponsored (Adlerbräu)", answerRatePct: 88 },
      ],
      topVenues: ["Zum Goldenen Hirsch", "Augustiner Eck", "Rheinterrasse Köln"],
    },
    rollout: [
      { id: "pilot", label: "5-Kneipen-Pilot", venues: 5, eventsRunPerMonth: 22, playersReached: 1800, note: "München-Pilot" },
      { id: "regional", label: "25-Kneipen regional", venues: 25, eventsRunPerMonth: 110, playersReached: 12000, note: "Bayern + Rheinland" },
      { id: "campaign", label: "100-Kneipen-Kampagne", venues: 100, eventsRunPerMonth: 440, playersReached: 55000, note: "Bundesweite Adlerbräu-Aktivierung" },
    ],
    pilotVenues: ["Zum Goldenen Hirsch", "Augustiner Eck", "Hofbräu Stüberl", "Schwabinger Wirtshaus", "Isartor Klause"],
    nextVenues: ["Rheinterrasse Köln", "Kiez-Kneipe Hamburg", "Altstadt Brauhaus Düsseldorf"],
  },
  UK: {
    market: "UK",
    label: "United Kingdom",
    flag: "🇬🇧",
    context: "Classic British pub-quiz culture — weeknight footfall, football-pub match days, table-team rivalry and local neighbourhood pride.",
    region: "Greater Manchester",
    venueExample: "The Anchor",
    city: "Manchester",
    teamNames: ["The Anchor Regulars", "Quiz Lightning", "Bar Stool Boffins", "Trivia Newton-John"],
    playerNames: ["James Smith", "Emily Taylor", "Oliver Brown", "Sophie Wilson", "Aisha Khan", "Daniel Patel", "Grace Johnson", "Mohammed Ali"],
    kpi: {
      venues: 20, eventsRun: 88, playersReached: 6400, teamsCreated: 1220, avgPlayersPerVenue: 41,
      sponsoredParticipationPct: 87, completionPct: 92, estimatedCampaignReach: 52000,
      engagementByVenue: [
        { venue: "The Anchor", players: 60, engagementPct: 94 },
        { venue: "The Crown & Anchor", players: 52, engagementPct: 91 },
        { venue: "The Railway Tap", players: 45, engagementPct: 88 },
      ],
      engagementByRound: [
        { round: "General", answerRatePct: 96 }, { round: "Local (Manchester)", answerRatePct: 93 },
        { round: "Music", answerRatePct: 90 }, { round: "Sponsored (Northgate)", answerRatePct: 87 },
      ],
      topVenues: ["The Anchor", "The Crown & Anchor", "The Railway Tap"],
    },
    rollout: [
      { id: "pilot", label: "5-pub pilot", venues: 5, eventsRunPerMonth: 21, playersReached: 1600, note: "Greater Manchester pilot" },
      { id: "regional", label: "25-pub regional", venues: 25, eventsRunPerMonth: 105, playersReached: 10500, note: "North-West England" },
      { id: "campaign", label: "100-pub campaign", venues: 100, eventsRunPerMonth: 420, playersReached: 47000, note: "National Northgate activation" },
    ],
    pilotVenues: ["The Anchor", "The Crown & Anchor", "The Railway Tap", "The Old Wharf", "The Northern Quarter Arms"],
    nextVenues: ["The Bridgewater Tap (Salford)", "The Dockside (Liverpool)", "The Headingley Taps (Leeds)"],
  },
};

/** The market data for the currently active brewery preset. */
export function activeMarket(): MarketData {
  return MARKETS[DEMO_BRAND.market];
}
