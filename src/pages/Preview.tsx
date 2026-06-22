/**
 * Branded preview for commercial surfaces not built in this slice (brand studio / KPI / rollout / capabilities
 * / config). Keeps the demo presentation-grade — no raw "route not found" or dev placeholder.
 */
import { Link } from "react-router-dom";
import { DEMO_BRAND } from "../demo/brand";
import { DemoShell } from "../components/shells";

export default function Preview({ title, blurb }: { title: string; blurb: string }) {
  return (
    <DemoShell>
      <section className="mx-auto max-w-2xl px-5 py-16 text-center">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>
          Guided demo · preview
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">{title}</h1>
        <p className="mt-3 text-slate-400">{blurb}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link to="/play/DEMO" className="rounded-lg px-4 py-2 font-semibold text-slate-950" style={{ background: DEMO_BRAND.primary }}>
            See the player join
          </Link>
          <Link to="/host" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:bg-white/5">
            Open host panel
          </Link>
        </div>
      </section>
    </DemoShell>
  );
}
