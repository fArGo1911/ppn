/**
 * Internal demo brief (operator-only, on-device). Captures the COMMERCIAL setup of a client/brewery demo —
 * client, campaign, desired outcome, scale/reach assumptions, venue mix profile, setup mode, notes — BEFORE any
 * graphics. The numeric assumptions map onto the existing KPI Scenario model so /kpi /report /rollout reconcile.
 * On-device only: no schema, no hosted persistence, no Supabase. This is journey 1 (internal setup) — it is never
 * shown to the client and never drives the client-facing presentation flow.
 */
import type { Scenario, VenueProfile, SetupModeId } from "../demo/kpiModel";

export interface DemoBrief {
  // ── Who / what (Step 1) ──
  clientName: string;
  campaignName: string;
  exampleVenueName: string;
  marketRegion: string;
  // ── Desired outcome (Step 2) ──
  objectiveIds: string[];
  desiredOutcomeText: string;
  // ── Scale & reach (Step 3) ──
  targetVenues: number;
  eventsPerVenue: number;
  expectedPlayersPerEvent: number;
  expectedPlayersPerTeam: number;
  completionRate: number;
  sponsoredAnswerRate: number;
  reachMultiplier: number;
  valuePerVisit: number;
  pilotVenues: number;
  regionalVenues: number;
  campaignVenues: number;
  // ── Venue mix (Step 4) + setup mode (Step 5) ──
  venueProfile: VenueProfile;
  setupMode: SetupModeId;
  // ── Operator notes ──
  internalNotes?: string;
}

const KEY = "ppn_demo_brief";

export function getDemoBrief(): DemoBrief | null {
  try {
    const r = localStorage.getItem(KEY);
    return r ? (JSON.parse(r) as DemoBrief) : null;
  } catch {
    return null;
  }
}
export function setDemoBrief(b: DemoBrief) {
  try { localStorage.setItem(KEY, JSON.stringify(b)); } catch { /* ignore */ }
}
export function updateDemoBrief(patch: Partial<DemoBrief>): DemoBrief | null {
  const cur = getDemoBrief();
  if (!cur) return null;
  const next = { ...cur, ...patch };
  setDemoBrief(next);
  return next;
}
export function clearDemoBrief() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
export function hasDemoBrief(): boolean {
  return getDemoBrief() !== null;
}

/** Map the brief's commercial assumptions onto the existing KPI Scenario (drives /kpi /report /rollout). */
export function briefToScenario(b: DemoBrief): Scenario {
  return {
    venuesActivated: b.targetVenues,
    avgEventsPerVenue: b.eventsPerVenue,
    avgPlayersPerEvent: b.expectedPlayersPerEvent,
    avgPlayersPerTeam: b.expectedPlayersPerTeam,
    completionRate: b.completionRate,
    sponsoredAnswerRate: b.sponsoredAnswerRate,
    campaignReachMultiplier: b.reachMultiplier,
    valuePerVisit: b.valuePerVisit,
    pilotVenues: b.pilotVenues,
    regionalVenues: b.regionalVenues,
    campaignVenues: b.campaignVenues,
    venueProfile: b.venueProfile,
  };
}
