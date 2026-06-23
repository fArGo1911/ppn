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
  venueMix?: VenueMixEntry[]; // when set, drives venues/events/players (weighted) for /kpi + /rollout
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
  // A venue mix is authoritative for the activation aggregates (so /kpi reconciles to the mix totals).
  if (sc.venueMix && sc.venueMix.length) {
    const d = deriveVenueMix(sc.venueMix, sc.campaignReachMultiplier ?? out.campaignReachMultiplier, sc.avgPlayersPerTeam ?? out.avgPlayersPerTeam);
    out.venuesActivated = d.totalVenues;
    out.avgEventsPerVenue = d.totalEvents / Math.max(1, d.totalVenues);
    out.avgPlayersPerEvent = d.weightedPlayersPerEvent;
    out.avgPlayersPerTeam = d.weightedPlayersPerTeam;
  }
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
  { id: "mixed", name: "Mixed venue campaign", tone: "Standard", assumes: "Blend of neighbourhood pubs, sports bars, large venues & small pubs across TV/audio/manual setups.",
    scenario: { venueProfile: "mixed", completionRate: 0.91, sponsoredAnswerRate: 0.87, campaignReachMultiplier: 1.5, valuePerVisit: 6, pilotVenues: 5, regionalVenues: 25, campaignVenues: 100, templateId: "mixed",
      venueMix: [
        { categoryId: "neighbourhood", venues: 8, eventsPerVenue: 4, avgPlayersPerEvent: 45, avgPlayersPerTeam: 4.5, setupMode: "audio_only" },
        { categoryId: "sports", venues: 6, eventsPerVenue: 4, avgPlayersPerEvent: 75, avgPlayersPerTeam: 5, setupMode: "tv_audio" },
        { categoryId: "large", venues: 3, eventsPerVenue: 4, avgPlayersPerEvent: 110, avgPlayersPerTeam: 5, setupMode: "tv_audio" },
        { categoryId: "small", venues: 3, eventsPerVenue: 4, avgPlayersPerEvent: 30, avgPlayersPerTeam: 4, setupMode: "phones_hosted" },
      ] } },
  { id: "popup", name: "Large pop-up / event activation", tone: "Ambitious", assumes: "Special-event only: pop-up/festival + student venues, ~150+ players/event. Not normal pubs.",
    scenario: { venueProfile: "popup", completionRate: 0.88, sponsoredAnswerRate: 0.85, campaignReachMultiplier: 1.8, valuePerVisit: 8, pilotVenues: 3, regionalVenues: 12, campaignVenues: 40, templateId: "popup",
      venueMix: [
        { categoryId: "popup", venues: 4, eventsPerVenue: 2, avgPlayersPerEvent: 180, avgPlayersPerTeam: 5, setupMode: "tv_audio" },
        { categoryId: "student", venues: 2, eventsPerVenue: 2, avgPlayersPerEvent: 110, avgPlayersPerTeam: 5, setupMode: "tv_audio" },
      ] } },
  { id: "reach6500", name: "~6,500 reach scenario", tone: "Standard", assumes: "Mixed venues over ~3 events → ~6,500 estimated reach (target, not guaranteed).",
    scenario: { venueProfile: "mixed", completionRate: 0.90, sponsoredAnswerRate: 0.86, campaignReachMultiplier: 1.5, valuePerVisit: 6, pilotVenues: 6, regionalVenues: 24, campaignVenues: 100, templateId: "reach6500",
      venueMix: [
        { categoryId: "neighbourhood", venues: 4, eventsPerVenue: 3, avgPlayersPerEvent: 45, avgPlayersPerTeam: 4.5, setupMode: "audio_only" },
        { categoryId: "neighbourhood", venues: 4, eventsPerVenue: 3, avgPlayersPerEvent: 45, avgPlayersPerTeam: 4.5, setupMode: "phones_hosted" },
        { categoryId: "sports", venues: 8, eventsPerVenue: 3, avgPlayersPerEvent: 75, avgPlayersPerTeam: 5, setupMode: "tv_audio" },
        { categoryId: "large", venues: 4, eventsPerVenue: 3, avgPlayersPerEvent: 120, avgPlayersPerTeam: 5, setupMode: "tv_audio" },
      ] } },
];

// ── Setup / output mode REPORTING model (decoupled from the live-session SetupMode in setup.ts) ──
export type SetupModeId = "tv_audio" | "audio_only" | "phones_hosted";
export const SETUP_MODE_INFO: Record<SetupModeId, { label: string; meaning: string }> = {
  tv_audio: { label: "TV + audio", meaning: "Laptop/room engine on TV/projector + sound where possible: TV shows QR, questions, reveal, scoreboard, sponsor moments; audio/chimes/AI voice through room output; host on a tablet." },
  audio_only: { label: "Audio-only", meaning: "No TV dependency. Audio/AI/host readout supports the room; phones carry questions/options/reveal/scoreboard; sponsor surfaces mainly phone/audio/reporting." },
  phones_hosted: { label: "Manual live / phones-only", meaning: "Staff/host reads from the host panel; phones carry questions/options/reveal/scoreboard. No TV and no platform audio required." },
};
export const setupModeLabel = (id: SetupModeId) => SETUP_MODE_INFO[id].label;

// ── Venue category model (richer than the broad VenueProfile; for believable venue MIX) ──
export type VenueCategoryId = "small" | "neighbourhood" | "sports" | "large" | "taproom" | "corporate" | "popup" | "student";
export interface VenueCategory {
  id: VenueCategoryId; label: string;
  ppeLo: number; ppeHi: number; tpeLo: number; tpeHi: number;
  recommendedSetup: SetupModeId[]; note: string;
  special?: boolean; // pop-up/festival — not a normal pub
  oneOff?: boolean;  // hotel/corporate — private/one-off, not core pub-network scale
}
export const VENUE_CATEGORIES: VenueCategory[] = [
  { id: "small", label: "Small local pub", ppeLo: 20, ppeHi: 40, tpeLo: 5, tpeHi: 10, recommendedSetup: ["phones_hosted", "tv_audio"], note: "Phones-only / manual live; TV optional." },
  { id: "neighbourhood", label: "Neighbourhood pub", ppeLo: 35, ppeHi: 65, tpeLo: 8, tpeHi: 16, recommendedSetup: ["phones_hosted", "audio_only", "tv_audio"], note: "Phones + host; TV optional." },
  { id: "sports", label: "Sports bar", ppeLo: 60, ppeHi: 100, tpeLo: 12, tpeHi: 24, recommendedSetup: ["tv_audio"], note: "TV + audio strongly preferred." },
  { id: "large", label: "Large city pub / venue", ppeLo: 90, ppeHi: 160, tpeLo: 18, tpeHi: 35, recommendedSetup: ["tv_audio"], note: "TV + audio." },
  { id: "taproom", label: "Brewery taproom", ppeLo: 40, ppeHi: 90, tpeLo: 8, tpeHi: 20, recommendedSetup: ["tv_audio", "phones_hosted"], note: "TV + audio, or manual live host." },
  { id: "corporate", label: "Hotel bar / corporate venue", ppeLo: 25, ppeHi: 60, tpeLo: 6, tpeHi: 14, recommendedSetup: ["phones_hosted", "audio_only"], note: "One-off / private / company event — not core pub-network model.", oneOff: true },
  { id: "popup", label: "Pop-up / festival / special event", ppeLo: 120, ppeHi: 250, tpeLo: 25, tpeHi: 60, recommendedSetup: ["tv_audio"], note: "Special event — not a normal pub. TV + audio required.", special: true },
  { id: "student", label: "Student bar / campus venue", ppeLo: 70, ppeHi: 140, tpeLo: 15, tpeHi: 35, recommendedSetup: ["tv_audio"], note: "TV + audio preferred." },
];
export const venueCategory = (id: VenueCategoryId) => VENUE_CATEGORIES.find((c) => c.id === id)!;

export interface VenueMixEntry {
  categoryId: VenueCategoryId;
  venues: number;
  eventsPerVenue: number;
  avgPlayersPerEvent: number;
  avgPlayersPerTeam?: number;
  setupMode: SetupModeId;
}

export interface SetupMixRow { mode: SetupModeId; label: string; venues: number; events: number; players: number; pctVenues: number; pctEvents: number; pctPlayers: number }
export interface CategoryMixRow { categoryId: VenueCategoryId; label: string; venues: number; events: number; players: number; special?: boolean; oneOff?: boolean }
export interface VenueMixDerived {
  totalVenues: number; totalEvents: number; totalPlayers: number; totalTeams: number;
  weightedPlayersPerEvent: number; weightedPlayersPerTeam: number; reach: number;
  setupMix: SetupMixRow[]; categoryMix: CategoryMixRow[];
}

const DEFAULT_PPT = 4.5;

export function deriveVenueMix(mix: VenueMixEntry[], reachMultiplier: number, defaultPpt = DEFAULT_PPT): VenueMixDerived {
  let totalVenues = 0, totalEvents = 0, totalPlayers = 0, totalTeams = 0;
  const setup = new Map<SetupModeId, { venues: number; events: number; players: number }>();
  const cat = new Map<VenueCategoryId, { venues: number; events: number; players: number }>();
  for (const e of mix) {
    const events = e.venues * e.eventsPerVenue;
    const players = events * e.avgPlayersPerEvent;
    const teams = players / (e.avgPlayersPerTeam ?? defaultPpt);
    totalVenues += e.venues; totalEvents += events; totalPlayers += players; totalTeams += teams;
    const su = setup.get(e.setupMode) ?? { venues: 0, events: 0, players: 0 };
    su.venues += e.venues; su.events += events; su.players += players; setup.set(e.setupMode, su);
    const cm = cat.get(e.categoryId) ?? { venues: 0, events: 0, players: 0 };
    cm.venues += e.venues; cm.events += events; cm.players += players; cat.set(e.categoryId, cm);
  }
  const p = (x: number, t: number) => (t > 0 ? Math.round((x / t) * 100) : 0);
  const setupMix: SetupMixRow[] = [...setup.entries()].map(([mode, v]) => ({
    mode, label: setupModeLabel(mode), venues: v.venues, events: Math.round(v.events), players: Math.round(v.players),
    pctVenues: p(v.venues, totalVenues), pctEvents: p(v.events, totalEvents), pctPlayers: p(v.players, totalPlayers),
  })).sort((a, b) => b.pctVenues - a.pctVenues);
  const categoryMix: CategoryMixRow[] = [...cat.entries()].map(([categoryId, v]) => {
    const c = venueCategory(categoryId);
    return { categoryId, label: c.label, venues: v.venues, events: Math.round(v.events), players: Math.round(v.players), special: c.special, oneOff: c.oneOff };
  }).sort((a, b) => b.venues - a.venues);
  return {
    totalVenues, totalEvents: Math.round(totalEvents), totalPlayers: Math.round(totalPlayers), totalTeams: Math.round(totalTeams),
    weightedPlayersPerEvent: totalEvents > 0 ? totalPlayers / totalEvents : 0,
    weightedPlayersPerTeam: totalTeams > 0 ? totalPlayers / totalTeams : DEFAULT_PPT,
    reach: Math.round(totalPlayers * reachMultiplier),
    setupMix, categoryMix,
  };
}

/** The active scenario's venue mix (null if none). Pages read this to show venue/setup mix. */
export function getEffectiveVenueMix(): VenueMixEntry[] | null {
  const mix = getScenario().venueMix;
  return mix && mix.length ? mix : null;
}

/** Operator-only realism warnings for a venue MIX (per-category bounds + setup suitability). */
export function venueMixWarnings(mix: VenueMixEntry[]): string[] {
  const w: string[] = [];
  for (const e of mix) {
    const c = venueCategory(e.categoryId);
    const ppt = e.avgPlayersPerTeam ?? DEFAULT_PPT;
    const tpe = e.avgPlayersPerEvent / ppt;
    if (e.avgPlayersPerEvent < c.ppeLo || e.avgPlayersPerEvent > c.ppeHi) w.push(`${c.label}: ${e.avgPlayersPerEvent} players/event is outside its ${c.ppeLo}–${c.ppeHi} range.`);
    if (tpe < c.tpeLo || tpe > c.tpeHi) w.push(`${c.label}: ~${tpe.toFixed(1)} teams/event is outside its ${c.tpeLo}–${c.tpeHi} range.`);
    if (e.avgPlayersPerEvent >= 120 && !c.special) w.push(`${c.label}: ${e.avgPlayersPerEvent} players/event is special-event scale — use the Pop-up / festival category.`);
    if (c.special && e.setupMode !== "tv_audio") w.push(`${c.label} requires TV + audio — current setup is ${setupModeLabel(e.setupMode)}.`);
    else if (!c.recommendedSetup.includes(e.setupMode)) w.push(`${c.label}: ${setupModeLabel(e.setupMode)} isn't a recommended setup (prefer ${c.recommendedSetup.map(setupModeLabel).join(" / ")}).`);
    if (c.oneOff && e.venues >= 8) w.push(`${c.label}: ${e.venues} venues treats a one-off/private format as core pub-network scale.`);
  }
  return w;
}

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
