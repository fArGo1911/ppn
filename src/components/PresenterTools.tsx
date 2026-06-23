/**
 * Presenter tools — on-demand demo control, NEVER audience navigation. A subtle top-right pill opens a jump menu
 * + TV/player state switch + preset switch + reset demo + audience-mode toggle. In AUDIENCE mode it renders no
 * visible chrome at all (so /play and /tv look like a real event) — only an invisible corner hotspot to exit.
 */
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials } from "../demo/brand";
import { resolveJoinToken, resetDemo } from "../lib/ppnApi";
import { useAudienceMode } from "../lib/audience";

const SECTIONS = [
  { to: "/", label: "Campaign" },
  { to: "/play/DEMO", label: "Player" },
  { to: "/host", label: "Host" },
  { to: "/tv/DEMO", label: "TV" },
  { to: "/setup", label: "Brand assets" },
  { to: "/kpi", label: "KPIs" },
  { to: "/report", label: "Report" },
  { to: "/rollout", label: "Rollout" },
  { to: "/run-sheet", label: "Run sheet" },
  { to: "/capabilities", label: "Beyond quiz" },
  { to: "/config", label: "Operator" },
];
const TV_STATES = ["welcome", "slideshow", "intro", "qintro", "question", "media", "audio", "pause", "reveal", "scoreboard", "victory", "closing"];
const PLAYER_STATES = ["question", "sponsored", "submitted", "reveal", "scoreboard"];

export function PresenterTools() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [audience, setAudience] = useAudienceMode();
  const onTv = pathname.startsWith("/tv");
  const onPlay = pathname.startsWith("/play");
  const active = getActiveBrand();

  const sessionQ = useQuery({ queryKey: ["pt-demo-session"], queryFn: () => resolveJoinToken("DEMO") });
  const sid = sessionQ.data && sessionQ.data.kind !== "invalid" ? sessionQ.data.session.sessionId : undefined;
  const doReset = async () => { if (sid) { await resetDemo(sid); } window.location.reload(); };

  // Audience mode: zero visible chrome. Only an invisible bottom-right hotspot to exit (for touch demos).
  if (audience) {
    return (
      <button
        onClick={() => setAudience(false)}
        aria-label="Exit audience mode"
        className="fixed bottom-0 right-0 z-50 h-8 w-8 opacity-0 print:hidden"
        style={{ background: "transparent" }}
      />
    );
  }

  return (
    <div className="fixed right-3 top-3 z-50 print:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/70 backdrop-blur hover:text-white"
        title="Presenter tools (on demand)"
      >
        Presenter
      </button>
      {open && (
        <div className="mt-2 w-64 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-slate-200 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="px-1 text-[10px] uppercase tracking-wide text-slate-500">Jump to</p>
            <button onClick={() => { setAudience(true); setOpen(false); }} className="rounded bg-white/5 px-2 py-0.5 text-[10px] hover:bg-white/10" title="Hide all presenter chrome">▶ Audience mode</button>
          </div>
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
                  <Link key={st} to={`/tv/DEMO?state=${st}`} onClick={() => setOpen(false)} className="rounded bg-white/5 px-2 py-0.5 text-xs hover:bg-white/10">{st}</Link>
                ))}
              </div>
            </>
          )}
          {onPlay && (
            <>
              <p className="mt-3 px-1 text-[10px] uppercase tracking-wide text-slate-500">Player state</p>
              <div className="mt-1 flex flex-wrap gap-1">
                <Link to="/play/DEMO" onClick={() => setOpen(false)} className="rounded bg-white/5 px-2 py-0.5 text-xs hover:bg-white/10">join</Link>
                {PLAYER_STATES.map((st) => (
                  <Link key={st} to={`/play/DEMO?preview=${st}`} onClick={() => setOpen(false)} className="rounded bg-white/5 px-2 py-0.5 text-xs hover:bg-white/10">{st}</Link>
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
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
            <Link to="/config" onClick={() => setOpen(false)} className="text-[10px] text-slate-400 hover:text-white">Operator prep →</Link>
            <button onClick={doReset} className="rounded bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10" title="Reset the demo session">↺ Reset demo</button>
          </div>
        </div>
      )}
    </div>
  );
}
