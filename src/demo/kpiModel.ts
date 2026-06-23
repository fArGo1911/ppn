/**
 * Seeded KPI model (pure, deterministic). The brewery dashboard is a SEEDED PROJECTION, not analytics:
 * we store a few honest ASSUMPTIONS per market and DERIVE every headline number from them, so the funnel
 * visibly reconciles (players ≈ events × players/event; teams = players ÷ players/team; etc.).
 * No tracking, no DB reads, no charts library — just arithmetic a buyer can check in their head.
 */
export interface KpiSeed {
  // ── Activation assumptions ──
  venuesActivated: number;
  avgEventsPerVenue: number;
  avgPlayersPerEvent: number;
  avgPlayersPerTeam: number;
  // ── Engagement assumptions (0..1, each with a clear denominator) ──
  completionRate: number; // share of joined players who reach the final question
  sponsoredAnswerRate: number; // share of teams that answer the sponsored question
  // ── Event-shape assumptions ──
  questionsPerEvent: number;
  avgMinutesPerQuestion: number;
  bufferMinutes: number; // intro + intermission + scoreboard buffer
  // ── Scale / reach assumptions ──
  repeatBookingRate: number; // share of venues booking 2+ events
  campaignReachMultiplier: number; // players + estimated onlookers (ESTIMATE, not measured)
  // ── Optional commercial proxy (planning assumption only — never measured bar sales) ──
  currency: string;
  valuePerVisit?: number;
  // ── Per-venue + per-round seeds (scaled by the same rates so they reconcile) ──
  venues: { name: string; events: number }[];
  rounds: { name: string; sponsor?: boolean; answerRate: number }[];
}

export interface KpiDerived {
  eventsRun: number;
  playersJoined: number;
  teamsCreated: number;
  avgTeamsPerEvent: number;
  avgPlayersPerVenue: number;
  playersCompleted: number;
  sponsoredTeamsAnswered: number;
  campaignReachEstimate: number;
  eventDurationEstimate: number;
  repeatVenuesEstimate: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function deriveKpi(s: KpiSeed): KpiDerived {
  const eventsRun = Math.round(s.venuesActivated * s.avgEventsPerVenue);
  const playersJoined = Math.round(eventsRun * s.avgPlayersPerEvent);
  const teamsCreated = Math.round(playersJoined / s.avgPlayersPerTeam);
  return {
    eventsRun,
    playersJoined,
    teamsCreated,
    avgTeamsPerEvent: r1(teamsCreated / eventsRun),
    avgPlayersPerVenue: Math.round(playersJoined / s.venuesActivated),
    playersCompleted: Math.round(playersJoined * s.completionRate),
    sponsoredTeamsAnswered: Math.round(teamsCreated * s.sponsoredAnswerRate),
    campaignReachEstimate: Math.round(playersJoined * s.campaignReachMultiplier),
    eventDurationEstimate: Math.round(s.questionsPerEvent * s.avgMinutesPerQuestion + s.bufferMinutes),
    repeatVenuesEstimate: Math.round(s.venuesActivated * s.repeatBookingRate),
  };
}

export interface VenueRow {
  name: string;
  events: number;
  avgPlayersPerEvent: number;
  playersJoined: number;
  teams: number;
  completionRate: number;
  sponsoredAnswerRate: number;
}

/** Per-venue rows — scaled from the same per-event + per-team assumptions, so each venue reconciles too. */
export function perVenue(s: KpiSeed): VenueRow[] {
  return s.venues.map((v) => {
    const playersJoined = Math.round(v.events * s.avgPlayersPerEvent);
    return {
      name: v.name,
      events: v.events,
      avgPlayersPerEvent: s.avgPlayersPerEvent,
      playersJoined,
      teams: Math.round(playersJoined / s.avgPlayersPerTeam),
      completionRate: s.completionRate,
      sponsoredAnswerRate: s.sponsoredAnswerRate,
    };
  });
}

export interface RoundRow {
  name: string;
  sponsor: boolean;
  teamsShown: number;
  teamsAnswered: number;
  answerRate: number;
}

/** Per-round rows — every team is shown each round; answered = round answer-rate × teams. */
export function perRound(s: KpiSeed, teamsCreated: number): RoundRow[] {
  return s.rounds.map((rnd) => ({
    name: rnd.name,
    sponsor: !!rnd.sponsor,
    teamsShown: teamsCreated,
    teamsAnswered: Math.round(teamsCreated * rnd.answerRate),
    answerRate: rnd.answerRate,
  }));
}

export const pct = (n: number) => `${Math.round(n * 100)}%`;

// ── Rollout stage metrics — derived from the SAME KPI seed so a pilot/regional/wider plan reconciles ──
export interface StageMetrics {
  events: number;
  players: number;
  teams: number;
  sponsoredTeams: number;
  completed: number;
  reach: number;
}
export function deriveStage(s: KpiSeed, venues: number): StageMetrics {
  const events = Math.round(venues * s.avgEventsPerVenue);
  const players = Math.round(events * s.avgPlayersPerEvent);
  const teams = Math.round(players / s.avgPlayersPerTeam);
  return {
    events,
    players,
    teams,
    sponsoredTeams: Math.round(teams * s.sponsoredAnswerRate),
    completed: Math.round(players * s.completionRate),
    reach: Math.round(players * s.campaignReachMultiplier),
  };
}

// ── Internal scenario assumptions (operator-only; localStorage) — let the presenter prepare a believable,
//    market-specific brewery scenario. /kpi and /rollout read the EFFECTIVE seed (market default + override). ──
export type VenueProfile = "small" | "neighbourhood" | "sports" | "large" | "popup" | "mixed";

export const PROFILE_BOUNDS: Record<VenueProfile, { lo: number; hi: number; label: string }> = {
  small: { lo: 20, hi: 45, label: "small pub" },
  neighbourhood: { lo: 35, hi: 65, label: "neighbourhood pub" },
  sports: { lo: 60, hi: 100, label: "sports bar" },
  large: { lo: 90, hi: 160, label: "large venue" },
  popup: { lo: 120, hi: 250, label: "pop-up / event venue" },
  mixed: { lo: 35, hi: 110, label: "mixed venues" },
};

/** Operator scenario override. Numeric KpiSeed assumptions + rollout stage venue counts + a venue profile. */
export interface Scenario {
  venuesActivated?: number;
  avgEventsPerVenue?: number;
  avgPlayersPerEvent?: number;
  avgPlayersPerTeam?: number;
  completionRate?: number;
  sponsoredAnswerRate?: number;
  campaignReachMultiplier?: number;
  valuePerVisit?: number;
  pilotVenues?: number;
  regionalVenues?: number;
  campaignVenues?: number;
  venueProfile?: VenueProfile;
  templateId?: string;
}

const SCENARIO_KEY = "ppn_scenario";
const SEED_KEYS = ["venuesActivated", "avgEventsPerVenue", "avgPlayersPerEvent", "avgPlayersPerTeam", "completionRate", "sponsoredAnswerRate", "campaignReachMultiplier", "valuePerVisit"] as const;

export function getScenario(): Scenario {
  try { const r = localStorage.getItem(SCENARIO_KEY); return r ? (JSON.parse(r) as Scenario) : {}; } catch { return {}; }
}
export function setScenario(s: Scenario) { try { localStorage.setItem(SCENARIO_KEY, JSON.stringify(s)); } catch { /* ignore */ } }
export function clearScenario() { try { localStorage.removeItem(SCENARIO_KEY); } catch { /* ignore */ } }
export function hasScenario(): boolean { return Object.keys(getScenario()).length > 0; }

/** KpiSeed with the scenario's numeric assumptions applied over the market default (used by /kpi + /rollout). */
export function applyScenarioToSeed(seed: KpiSeed, sc: Scenario): KpiSeed {
  const out: KpiSeed = { ...seed };
  for (const k of SEED_KEYS) { const v = sc[k]; if (v != null) (out as unknown as Record<string, number>)[k] = v; }
  return out;
}
export function getEffectiveKpiSeed(seed: KpiSeed): KpiSeed {
  return applyScenarioToSeed(seed, getScenario());
}
/** Effective pilot/regional/wider venue counts (scenario override → market defaults). */
export function getEffectiveStageVenues(defaults: { pilot: number; regional: number; campaign: number }) {
  const sc = getScenario();
  return { pilot: sc.pilotVenues ?? defaults.pilot, regional: sc.regionalVenues ?? defaults.regional, campaign: sc.campaignVenues ?? defaults.campaign };
}

export interface ScenarioTemplate { id: string; name: string; tone: "Conservative" | "Standard" | "Ambitious"; assumes: string; scenario: Scenario }

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  { id: "conservative", name: "Conservative pub pilot", tone: "Conservative", assumes: "Small pubs, ~32 players/event, 3 events each — realistic early proof.",
    scenario: { venueProfile: "small", venuesActivated: 8, avgEventsPerVenue: 3, avgPlayersPerEvent: 32, avgPlayersPerTeam: 4, completionRate: 0.90, sponsoredAnswerRate: 0.85, campaignReachMultiplier: 1.3, valuePerVisit: 6, pilotVenues: 5, regionalVenues: 15, campaignVenues: 40, templateId: "conservative" } },
  { id: "neighbourhood", name: "Neighbourhood quiz campaign", tone: "Standard", assumes: "Balanced pubs, ~48 players/event, weekly repeatable event.",
    scenario: { venueProfile: "neighbourhood", venuesActivated: 16, avgEventsPerVenue: 4, avgPlayersPerEvent: 48, avgPlayersPerTeam: 4.5, completionRate: 0.92, sponsoredAnswerRate: 0.87, campaignReachMultiplier: 1.4, valuePerVisit: 6, pilotVenues: 5, regionalVenues: 20, campaignVenues: 80, templateId: "neighbourhood" } },
  { id: "sports", name: "Sports bar activation", tone: "Ambitious", assumes: "Higher attendance, ~80 players/event, football/sports focus.",
    scenario: { venueProfile: "sports", venuesActivated: 14, avgEventsPerVenue: 4, avgPlayersPerEvent: 80, avgPlayersPerTeam: 5, completionRate: 0.90, sponsoredAnswerRate: 0.88, campaignReachMultiplier: 1.6, valuePerVisit: 7, pilotVenues: 6, regionalVenues: 24, campaignVenues: 90, templateId: "sports" } },
  { id: "mixed", name: "Mixed venue campaign", tone: "Standard", assumes: "Blend of small pubs, sports bars & larger venues, ~58 players/event.",
    scenario: { venueProfile: "mixed", venuesActivated: 20, avgEventsPerVenue: 4, avgPlayersPerEvent: 58, avgPlayersPerTeam: 4.5, completionRate: 0.91, sponsoredAnswerRate: 0.87, campaignReachMultiplier: 1.5, valuePerVisit: 6, pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, templateId: "mixed" } },
  { id: "popup", name: "Large pop-up / event activation", tone: "Ambitious", assumes: "Special-event only: ~150 players/event across a few large venues.",
    scenario: { venueProfile: "popup", venuesActivated: 6, avgEventsPerVenue: 2, avgPlayersPerEvent: 150, avgPlayersPerTeam: 5, completionRate: 0.88, sponsoredAnswerRate: 0.85, campaignReachMultiplier: 1.8, valuePerVisit: 8, pilotVenues: 3, regionalVenues: 12, campaignVenues: 40, templateId: "popup" } },
  { id: "reach6500", name: "~6,500 reach scenario", tone: "Standard", assumes: "Mixed venues, ~60 players/event over ~3 events × 24 venues → ~6,500 estimated reach (target).",
    scenario: { venueProfile: "mixed", venuesActivated: 24, avgEventsPerVenue: 3, avgPlayersPerEvent: 60, avgPlayersPerTeam: 4.5, completionRate: 0.90, sponsoredAnswerRate: 0.86, campaignReachMultiplier: 1.5, valuePerVisit: 6, pilotVenues: 6, regionalVenues: 24, campaignVenues: 100, templateId: "reach6500" } },
];

/** Operator-only realism warnings for a scenario (demo guardrails, not market research). */
export function scenarioWarnings(seed: KpiSeed, profile: VenueProfile = "mixed"): string[] {
  const w: string[] = [];
  const b = PROFILE_BOUNDS[profile];
  const ppe = seed.avgPlayersPerEvent, ppt = seed.avgPlayersPerTeam, tpe = ppe / ppt;
  if (ppe > b.hi) w.push(`${ppe} players/event is high for a ${b.label} (${b.lo}–${b.hi}).`);
  if (ppe < b.lo) w.push(`${ppe} players/event is low for a ${b.label} (${b.lo}–${b.hi}).`);
  if (ppt < 2.5 || ppt > 6) w.push(`Average team size ${ppt} is outside the realistic 2.5–6 range.`);
  if (tpe < 6) w.push(`~${tpe.toFixed(1)} teams/event is low — most pub events run 6–25 teams.`);
  if (tpe > 25) w.push(`~${tpe.toFixed(1)} teams/event is high — usually 6–25.`);
  if (seed.avgEventsPerVenue > 8) w.push(`${seed.avgEventsPerVenue} events/venue is high for a short campaign.`);
  if (seed.campaignReachMultiplier > 2.5) w.push(`Reach multiplier ${seed.campaignReachMultiplier} is high — keep it conservative.`);
  if (profile !== "popup" && profile !== "large" && ppe > 100) w.push(`${ppe} players in one event reads like a large/pop-up venue — label it as such or lower it.`);
  return w;
}
