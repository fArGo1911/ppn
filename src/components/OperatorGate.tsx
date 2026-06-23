/**
 * OperatorGate — wraps a dangerous operator/control surface (/config, /host). If the device is locked, it shows
 * a POC code gate instead of the controls. NOT production authentication (clearly labelled). /play and /tv are
 * never gated.
 */
import { useState, type ReactNode } from "react";
import { DemoShell } from "./shells";
import { unlockOperator, useOperatorUnlocked } from "../lib/operator";

export function OperatorGate({ children }: { children: ReactNode }) {
  const unlocked = useOperatorUnlocked();
  const [code, setCode] = useState("");
  const [bad, setBad] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = () => { if (!unlockOperator(code)) setBad(true); };

  return (
    <DemoShell>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: "var(--ppn-brand)" }}>Operator</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight">PPN Demo Control Centre</h1>
        <p className="mt-2 text-[var(--ppn-muted)]">Enter the operator code to prepare or run the demo.</p>
        <input
          type="password" value={code} autoFocus
          onChange={(e) => { setCode(e.target.value); setBad(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="operator code"
          className="mt-6 w-full rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-4 py-3.5 text-base outline-none focus:border-[color:var(--ppn-brand)]"
        />
        {bad && <p className="mt-2 text-sm text-red-400">That code didn't match — try again.</p>}
        <button onClick={submit} className="mt-3 w-full rounded-xl px-4 py-3.5 text-base font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Unlock</button>
        <p className="mt-4 text-[11px] text-[var(--ppn-muted)]">Remembered on this device. Player and TV screens are never gated. <span className="opacity-80">POC gate — not production authentication.</span></p>
      </div>
    </DemoShell>
  );
}
