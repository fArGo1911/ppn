/**
 * Venue setup modes + simple content compatibility (POC labels/warnings — not a recommendation engine).
 * One event engine, different OUTPUT modes. Hosting mode (staff vs AI-assisted) is separate from output.
 */
import type { SetupMode, HostingMode } from "../lib/ppnApi";

export const SETUP_MODES: { id: SetupMode; label: string; supports: string; tv: boolean; audio: boolean }[] = [
  { id: "tv_audio", label: "TV + audio", supports: "TV shows questions, media, QR, scoreboard, reveal & sponsor surfaces; AI/host audio announces; phones answer.", tv: true, audio: true },
  { id: "audio_only", label: "Audio-only", supports: "No TV. AI/host reads questions aloud; phones show question/options/submitted/reveal/scoreboard.", tv: false, audio: true },
  { id: "local_host", label: "Local host · mic/speaker · phones-only", supports: "Staff reads from the host panel via the pub mic/speaker; phones carry everything. No TV or AI needed — the low-friction setup.", tv: false, audio: false },
];

export const HOSTING_MODES: { id: HostingMode; label: string; note: string }[] = [
  { id: "staff", label: "Staff-hosted", note: "Staff reads & controls the flow." },
  { id: "ai_assisted", label: "AI-assisted", note: "AI scripts shown; staff still in control." },
];

export function setupLabel(id: SetupMode): string {
  return SETUP_MODES.find((m) => m.id === id)?.label ?? id;
}

/** Simple per-question compatibility for a setup mode. */
export function questionCompatibility(kind: string, mode: SetupMode): { ok: boolean; note?: string } {
  const needsVisual = kind === "picture" || kind === "video";
  const needsAudio = kind === "music";
  if (needsVisual && mode !== "tv_audio") return { ok: false, note: "Needs TV (or phone image/video fallback)" };
  if (needsAudio && mode === "local_host") return { ok: false, note: "Needs audio (or phone audio fallback)" };
  return { ok: true };
}
