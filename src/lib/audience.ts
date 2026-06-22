/**
 * Audience vs presenter mode. Audience mode hides ALL presenter chrome (the pill, jump menus, state switches)
 * so /play and /tv look like a real event, not a demo. Persisted in localStorage; a window event keeps every
 * mounted component in sync. Default = presenter mode (chrome available) so the operator can discover controls.
 */
import { useEffect, useState } from "react";

const KEY = "ppn_audience";
const EVENT = "ppn-audience-change";

function read(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function setAudienceMode(on: boolean) {
  try { localStorage.setItem(KEY, on ? "1" : "0"); } catch { /* ignore */ }
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* ignore */ }
}

/** Reactive audience-mode flag + setter. */
export function useAudienceMode(): readonly [boolean, (on: boolean) => void] {
  const [on, setOn] = useState(read);
  useEffect(() => {
    const sync = () => setOn(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return [on, (v: boolean) => { setAudienceMode(v); setOn(v); }] as const;
}
