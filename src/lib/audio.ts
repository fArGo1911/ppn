/**
 * PPN audio playback — PLAYBACK ONLY. Plays pre-generated local MP3 assets (e.g. generated manually with
 * ElevenLabs OUTSIDE the app and dropped into public/demo/audio/<preset>/). The app NEVER generates audio,
 * stores TTS keys, or calls any TTS API. Missing files degrade cleanly (the demo never breaks on absent audio).
 */
import { useEffect, useState } from "react";

let current: HTMLAudioElement | null = null;

export type CueResult = "played" | "missing" | "nourl";

/** Play one audio cue. Stops any cue already playing. Resolves how it went (never throws). */
export function playCue(url?: string): Promise<CueResult> {
  return new Promise((resolve) => {
    if (!url) return resolve("nourl");
    try { if (current) { current.pause(); current = null; } } catch { /* ignore */ }
    let settled = false;
    const done = (r: CueResult) => { if (!settled) { settled = true; resolve(r); } };
    try {
      const a = new Audio(url);
      current = a;
      a.onerror = () => done("missing");
      a.play().then(() => done("played")).catch(() => done("missing"));
    } catch {
      done("missing");
    }
  });
}

export function stopCue() {
  try { current?.pause(); } catch { /* ignore */ }
  current = null;
}

export type AudioState = "none" | "unknown" | "present" | "missing";

/** Probe whether a configured audio file actually exists AND is decodable audio. We load it into an <audio>
 * element rather than fetch()ing — a dev-server SPA fallback returns index.html with HTTP 200, so only the
 * decoder can tell real audio from an HTML fallback. Demo files are NOT committed, so the expected default
 * state is "missing" → surfaces fall back to the on-screen script (never pretends audio exists). */
export function useAudioExists(url?: string): AudioState {
  const [state, setState] = useState<AudioState>(url ? "unknown" : "none");
  useEffect(() => {
    if (!url) { setState("none"); return; }
    setState("unknown");
    let done = false;
    const a = new Audio();
    const settle = (s: AudioState) => { if (!done) { done = true; cleanup(); setState(s); } };
    const timer = setTimeout(() => settle("missing"), 4000);
    function cleanup() {
      clearTimeout(timer);
      a.onloadedmetadata = null; a.oncanplay = null; a.onerror = null;
      try { a.src = ""; } catch { /* ignore */ }
    }
    a.preload = "metadata";
    a.onloadedmetadata = () => settle("present");
    a.oncanplay = () => settle("present");
    a.onerror = () => settle("missing");
    a.src = url;
    return () => { done = true; cleanup(); };
  }, [url]);
  return state;
}

/** Deterministic variant picker (no Math.random → stable per index, avoids a robotic feel across questions). */
export function pickVariant(variants: string[], index: number): string {
  if (!variants.length) return "";
  return variants[((index % variants.length) + variants.length) % variants.length];
}
