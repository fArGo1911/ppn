/**
 * Presenter tools — on-demand demo control (NOT audience navigation). A small top-right pill that opens a
 * jump menu + TV-state switch + brewery-preset switch. Kept deliberately subtle so audience-facing player/TV
 * screens still look like a real sponsored event. Neutral chrome (not themed) since it's presenter-only.
 */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials } from "../demo/brand";

const SECTIONS = [
  { to: "/", label: "Campaign" },
  { to: "/play/DEMO", label: "Player" },
  { to: "/host", label: "Host" },
  { to: "/tv/demo", label: "TV" },
  { to: "/setup", label: "Brand assets" },
  { to: "/kpi", label: "KPIs" },
  { to: "/rollout", label: "Rollout" },
  { to: "/capabilities", label: "Beyond quiz" },
];
const TV_STATES = ["welcome", "slideshow", "question", "pause", "reveal", "scoreboard", "victory", "closing"];

export function PresenterTools() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const onTv = pathname.startsWith("/tv");
  const active = getActiveBrand();

  return (
    <div className="fixed right-3 top-3 z-50 print:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur hover:text-white"
        title="Presenter tools (demo only)"
      >
        ⋯ Demo
      </button>
      {open && (
        <div className="mt-2 w-64 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-slate-200 shadow-2xl backdrop-blur">
          <p className="px-1 text-[10px] uppercase tracking-wide text-slate-500">Jump to</p>
          <div className="mt-1 grid grid-cols-2 gap-1 text-sm">
            {SECTIONS.map((s) => (
              <Link key={s.to} to={s.to} onClick={() => setOpen(false)} className="rounded px-2 py-1 hover:bg-white/10">{s.label}</Link>
            ))}
          </div>
          {onTv && (
            <>
              <p className="mt-3 px-1 text-[10px] uppercase tracking-wide text-slate-500">TV state</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {TV_STATES.map((st) => (
                  <Link key={st} to={`/tv/demo?state=${st}`} onClick={() => setOpen(false)} className="rounded bg-white/5 px-2 py-0.5 text-xs hover:bg-white/10">{st}</Link>
                ))}
              </div>
            </>
          )}
          <p className="mt-3 px-1 text-[10px] uppercase tracking-wide text-slate-500">Brewery preset</p>
          <div className="mt-1 flex gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setActiveBrand(p.id); window.location.reload(); }}
                className={`flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-xs hover:bg-white/10 ${p.id === active.id ? "ring-1 ring-white/40" : ""}`}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: p.colours.primary }} />
                {brandInitials(p.sponsorName)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
