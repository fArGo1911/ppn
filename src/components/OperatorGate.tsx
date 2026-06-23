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
      <div className="mx-auto max-w-md px-5 py-16">
        <p className="text-sm uppercase tracking-widest" style={{ color: "var(--ppn-brand)" }}>Operator tools</p>
        <h1 className="mt-2 text-2xl font-extrabold">Enter the demo operator code</h1>
        <p className="mt-2 text-sm text-[var(--ppn-muted)]">These control surfaces can change or reset the demo, so they're behind a code. <span className="text-[var(--ppn-text)]">POC gate only — not production authentication.</span></p>
        <input
          type="password" value={code} autoFocus
          onChange={(e) => { setCode(e.target.value); setBad(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="operator code"
          className="mt-5 w-full rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-4 py-3 text-base outline-none focus:border-[color:var(--ppn-brand)]"
        />
        {bad && <p className="mt-2 text-sm text-red-400">Wrong code.</p>}
        <button onClick={submit} className="mt-3 w-full rounded-xl px-4 py-3 font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Unlock</button>
        <p className="mt-3 text-[11px] text-[var(--ppn-muted)]">Unlock is remembered on this device only. Player and TV screens are never gated.</p>
      </div>
    </DemoShell>
  );
}
