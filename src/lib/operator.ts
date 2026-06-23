/**
 * Operator gate (POC only — NOT production authentication). A local unlock so a stray user can't open the
 * dangerous operator/control surfaces (/config, /host) during a demo. Code from VITE_PPN_OPERATOR_CODE if set,
 * else the documented local fallback "demo". localStorage-only; no accounts, no server check, no real security.
 */
import { useEffect, useState } from "react";

const KEY = "ppn_operator_unlocked";
const EVENT = "ppn-operator-change";

export const OPERATOR_CODE: string = (import.meta.env.VITE_PPN_OPERATOR_CODE as string | undefined)?.trim() || "demo";

export function isOperatorUnlocked(): boolean {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function unlockOperator(code: string): boolean {
  if (code.trim() !== OPERATOR_CODE) return false;
  try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* ignore */ }
  return true;
}
export function lockOperator() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  try { window.dispatchEvent(new Event(EVENT)); } catch { /* ignore */ }
}

/** Reactive unlock flag (syncs across components/tabs). */
export function useOperatorUnlocked(): boolean {
  const [on, setOn] = useState(isOperatorUnlocked);
  useEffect(() => {
    const sync = () => setOn(isOperatorUnlocked());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  return on;
}
