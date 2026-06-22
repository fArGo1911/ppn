/**
 * AudioCue — a host-tappable play/replay button for one pre-generated MP3 cue, with a clear audio-state chip.
 * Shows whether the configured file is present or missing (script-only fallback). Playback only — no generation.
 */
import { useState } from "react";
import { playCue, useAudioExists, type CueResult } from "../lib/audio";

export function AudioCue({ url, label, primary }: { url?: string; label: string; primary?: boolean }) {
  const exists = useAudioExists(url);
  const [last, setLast] = useState<CueResult | "">("");

  const onClick = async () => {
    const r = await playCue(url);
    setLast(r);
  };

  const chip =
    exists === "present" ? { text: "audio ready", color: "var(--ppn-success)", bg: "color-mix(in srgb, var(--ppn-success) 16%, transparent)" }
    : exists === "unknown" ? { text: "checking…", color: "var(--ppn-muted)", bg: "var(--ppn-bg)" }
    : { text: "no file · script only", color: "var(--ppn-muted)", bg: "var(--ppn-bg)" };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={onClick}
        className="rounded-xl px-3 py-2 text-sm font-semibold"
        style={primary
          ? { background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }
          : { background: "var(--ppn-surface)", color: "var(--ppn-text)", border: "1px solid var(--ppn-border)" }}
        title={url ?? "no audio configured"}
      >
        🔊 {label}
      </button>
      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: chip.bg, color: chip.color }}>{chip.text}</span>
      {last === "missing" && <span className="text-[10px] text-[var(--ppn-muted)]">file not found — read the script</span>}
    </span>
  );
}
