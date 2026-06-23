/**
 * Per-market demo data (Sweden / Germany / UK) — seeded config, NOT a localisation/analytics engine.
 * Keyed by market code; the active market comes from the active brewery preset (DEMO_BRAND.market).
 * Holds: market context, venue example, demo team/player names, KPI mock numbers, rollout mock data.
 * Brewery identity/colours/copy/AI scripts live on the brand preset (brand.ts); this is the surrounding world.
 */
import { DEMO_BRAND } from "./brand";
import type { KpiSeed } from "./kpiModel";

export type Market = "SE" | "DE" | "UK";

/** Seeded EXAMPLE of what a venue reports back after an event (manual in the POC; POS optional later).
 * These are venue-REPORTED outcomes — NOT measured by PubPlay and never presented as PPN-measured sales. */
export interface VenueReport {
  attendanceEstimate: number;
  sponsorUnitsSold: number;
  offerRedemptions: number;
  busierThanUsual: boolean;
  stockOut: boolean;
  wouldRunAgain: boolean;
  staffComment: string;
  posEvidenceStatus: string;
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
  kpiSeed: KpiSeed;
  rollout: RolloutTier[];
  pilotVenues: string[];
  nextVenues: string[];
  venueReport: VenueReport;
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
    kpiSeed: {
      venuesActivated: 18, avgEventsPerVenue: 4.2, avgPlayersPerEvent: 70, avgPlayersPerTeam: 4.4,
      completionRate: 0.91, sponsoredAnswerRate: 0.86, questionsPerEvent: 10, avgMinutesPerQuestion: 4.5,
      bufferMinutes: 12, repeatBookingRate: 0.62, campaignReachMultiplier: 1.5, currency: "kr", valuePerVisit: 70,
      venues: [
        { name: "Kvarteret Krog", events: 5 }, { name: "Söder Pub & Kök", events: 4 }, { name: "Hamnkrogen Göteborg", events: 4 },
      ],
      rounds: [
        { name: "Allmänbildning", answerRate: 0.95 }, { name: "Lokal (Stockholm)", answerRate: 0.93 },
        { name: "Musik", answerRate: 0.90 }, { name: "Sponsrad (Nordström)", sponsor: true, answerRate: 0.86 },
      ],
    },
    rollout: [
      { id: "pilot", label: "5-pub pilot", venues: 5, eventsRunPerMonth: 20, playersReached: 1400, note: "Stockholm inner-city pilot" },
      { id: "regional", label: "25-pub regional", venues: 25, eventsRunPerMonth: 100, playersReached: 9000, note: "Stockholm + Göteborg + Malmö" },
      { id: "campaign", label: "100-pub campaign", venues: 100, eventsRunPerMonth: 400, playersReached: 38000, note: "National Nordström activation" },
    ],
    pilotVenues: ["Kvarteret Krog", "Söder Pub & Kök", "Vasa Värdshus", "Gamla Stan Taverna", "Kungsholmen Krog"],
    nextVenues: ["Hamnkrogen Göteborg", "Lilla Torg Malmö", "Uppsala Studentkrog"],
    venueReport: {
      attendanceEstimate: 84, sponsorUnitsSold: 66, offerRedemptions: 15, busierThanUsual: true, stockOut: false, wouldRunAgain: true,
      staffComment: "Quizkvällen höll borden längre och gav personalen ett tydligt sponsormoment.",
      posEvidenceStatus: "Manuell rapport i POC; POS-bevis valfritt senare.",
    },
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
    kpiSeed: {
      venuesActivated: 22, avgEventsPerVenue: 4.5, avgPlayersPerEvent: 78, avgPlayersPerTeam: 4.6,
      completionRate: 0.93, sponsoredAnswerRate: 0.88, questionsPerEvent: 10, avgMinutesPerQuestion: 4.5,
      bufferMinutes: 12, repeatBookingRate: 0.68, campaignReachMultiplier: 1.6, currency: "€", valuePerVisit: 7,
      venues: [
        { name: "Zum Goldenen Hirsch", events: 5 }, { name: "Augustiner Eck", events: 5 }, { name: "Rheinterrasse Köln", events: 4 },
      ],
      rounds: [
        { name: "Allgemeinwissen", answerRate: 0.97 }, { name: "Lokal (München)", answerRate: 0.94 },
        { name: "Musik", answerRate: 0.91 }, { name: "Sponsored (Adlerbräu)", sponsor: true, answerRate: 0.88 },
      ],
    },
    rollout: [
      { id: "pilot", label: "5-Kneipen-Pilot", venues: 5, eventsRunPerMonth: 22, playersReached: 1800, note: "München-Pilot" },
      { id: "regional", label: "25-Kneipen regional", venues: 25, eventsRunPerMonth: 110, playersReached: 12000, note: "Bayern + Rheinland" },
      { id: "campaign", label: "100-Kneipen-Kampagne", venues: 100, eventsRunPerMonth: 440, playersReached: 55000, note: "Bundesweite Adlerbräu-Aktivierung" },
    ],
    pilotVenues: ["Zum Goldenen Hirsch", "Augustiner Eck", "Hofbräu Stüberl", "Schwabinger Wirtshaus", "Isartor Klause"],
    nextVenues: ["Rheinterrasse Köln", "Kiez-Kneipe Hamburg", "Altstadt Brauhaus Düsseldorf"],
    venueReport: {
      attendanceEstimate: 110, sponsorUnitsSold: 88, offerRedemptions: 22, busierThanUsual: true, stockOut: false, wouldRunAgain: true,
      staffComment: "Der Quizabend hat die Gäste länger gehalten und Adlerbräu klar in Szene gesetzt.",
      posEvidenceStatus: "Manuelle Rückmeldung im POC; POS-Beleg später optional.",
    },
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
    kpiSeed: {
      venuesActivated: 20, avgEventsPerVenue: 4.4, avgPlayersPerEvent: 72, avgPlayersPerTeam: 4.5,
      completionRate: 0.92, sponsoredAnswerRate: 0.87, questionsPerEvent: 10, avgMinutesPerQuestion: 4.5,
      bufferMinutes: 12, repeatBookingRate: 0.65, campaignReachMultiplier: 1.5, currency: "£", valuePerVisit: 6,
      venues: [
        { name: "The Anchor", events: 5 }, { name: "The Crown & Anchor", events: 5 }, { name: "The Railway Tap", events: 4 },
      ],
      rounds: [
        { name: "General", answerRate: 0.96 }, { name: "Local (Manchester)", answerRate: 0.93 },
        { name: "Music", answerRate: 0.90 }, { name: "Sponsored (Northgate)", sponsor: true, answerRate: 0.87 },
      ],
    },
    rollout: [
      { id: "pilot", label: "5-pub pilot", venues: 5, eventsRunPerMonth: 21, playersReached: 1600, note: "Greater Manchester pilot" },
      { id: "regional", label: "25-pub regional", venues: 25, eventsRunPerMonth: 105, playersReached: 10500, note: "North-West England" },
      { id: "campaign", label: "100-pub campaign", venues: 100, eventsRunPerMonth: 420, playersReached: 47000, note: "National Northgate activation" },
    ],
    pilotVenues: ["The Anchor", "The Crown & Anchor", "The Railway Tap", "The Old Wharf", "The Northern Quarter Arms"],
    nextVenues: ["The Bridgewater Tap (Salford)", "The Dockside (Liverpool)", "The Headingley Taps (Leeds)"],
    venueReport: {
      attendanceEstimate: 92, sponsorUnitsSold: 74, offerRedemptions: 18, busierThanUsual: true, stockOut: false, wouldRunAgain: true,
      staffComment: "Quiz night kept tables in longer and gave staff a clear sponsor moment.",
      posEvidenceStatus: "Manual venue report in POC; POS proof optional later.",
    },
  },
};

/** The market data for the currently active brewery preset. */
export function activeMarket(): MarketData {
  return MARKETS[DEMO_BRAND.market];
}
