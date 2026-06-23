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
