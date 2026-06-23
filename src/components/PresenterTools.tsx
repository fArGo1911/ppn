/**
 * Presenter tools — on-demand demo control, NEVER audience navigation. A subtle top-right pill opens a jump menu
 * + TV/player state switch + preset switch + reset demo + audience-mode toggle.
 *
 * SAFE BY DEFAULT: the pill renders ONLY in an explicit presenter context — the operator gate is unlocked on this
 * device, OR the URL carries ?present (or ?presenter). So public /tv, /play and buyer/client pages show NO
 * presenter chrome by default; an operator (unlocked) keeps full access everywhere. In AUDIENCE mode it renders
 * no visible chrome either — only an invisible corner hotspot to exit.
 */
import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials } from "../demo/brand";
import { resolveJoinToken, resetDemo } from "../lib/ppnApi";
import { useAudienceMode } from "../lib/audience";
import { lockOperator, useOperatorUnlocked } from "../lib/operator";

// Role taxonomy for every link in the helper, so the operator always knows who a surface is safe for.
type Role = "operator" | "client" | "guest" | "tv" | "reference";
const ROLE_LABEL: Record<Role, string> = {
  operator: "Operator-only",
  client: "Client-safe",
  guest: "Guest / player",
  tv: "TV / audience",
  reference: "Reference",
};
const ROLE_TAG: Record<Role, string> = {
  operator: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  client: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  guest: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  tv: "bg-violet-500/15 text-violet-300 border-violet-400/30",
  reference: "bg-slate-500/15 text-slate-300 border-slate-400/30",
};

// Full POC route map, grouped by purpose; each row carries its role so labels never collide (e.g. /config vs
// /setup are distinct, clearly-labelled surfaces). Covers every important POC route incl. /operator/setup-wizard.
const ROUTE_GROUPS: { title: string; items: { to: string; label: string; role: Role }[] }[] = [
  { title: "Operator", items: [
    { to: "/operator", label: "Demo control centre (start here)", role: "operator" },
    { to: "/operator/setup-wizard", label: "Demo setup wizard", role: "operator" },
    { to: "/config", label: "Detailed config / brand & media", role: "operator" },
    { to: "/setup", label: "Asset reference / slot guide", role: "reference" },
  ] },
  { title: "Client / buyer", items: [
    { to: "/presentation", label: "Client presentation", role: "client" },
    { to: "/kpi", label: "KPIs", role: "client" },
    { to: "/report", label: "Report", role: "client" },
    { to: "/rollout", label: "Rollout", role: "client" },
    { to: "/run-sheet", label: "Run sheet", role: "client" },
    { to: "/capabilities", label: "Beyond quiz", role: "client" },
  ] },
  { title: "Live demo", items: [
    { to: "/tv/DEMO", label: "TV display", role: "tv" },
    { to: "/host", label: "Host console", role: "operator" },
    { to: "/play/DEMO", label: "Player phone", role: "guest" },
  ] },
];
const TV_STATES = ["welcome", "slideshow", "intro", "qintro", "question", "media", "audio", "pause", "reveal", "scoreboard", "victory", "closing"];
const PLAYER_STATES = ["question", "sponsored", "submitted", "reveal", "scoreboard"];

export function PresenterTools() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [audience, setAudience] = useAudienceMode();
  const opUnlocked = useOperatorUnlocked();
  const onTv = pathname.startsWith("/tv");
  const onPlay = pathname.startsWith("/play");
  const active = getActiveBrand();

  const sessionQ = useQuery({ queryKey: ["pt-demo-session"], queryFn: () => resolveJoinToken("DEMO") });
  const sid = sessionQ.data && sessionQ.data.kind !== "invalid" ? sessionQ.data.session.sessionId : undefined;
  const doReset = async () => { if (sid) { await resetDemo(sid); } window.location.reload(); };

  // Presenter context = operator unlocked on this device, or an explicit ?present / ?presenter on the URL.
  // Without it, public/audience surfaces (/, /tv, /play, buyer pages) show nothing at all (no pill, no hotspot).
  // Placed after all hooks so the Rules of Hooks hold.
  const presenterContext = opUnlocked || params.has("present") || params.has("presenter");
  if (!presenterContext) return null;

  // Audience mode: presenter chrome is hidden so a presenter-context window looks like a real event — BUT the
  // operator must never be trapped. We render a small, genuinely VISIBLE recovery pill (subtle, hover-bright) so
  // a single click returns to operator controls. Only reachable in presenter context, so guests never see it.
  if (audience) {
    return (
      <div className="fixed bottom-3 right-3 z-50 print:hidden">
        <button
          onClick={() => setAudience(false)}
          aria-label="Exit audience mode"
          title="Return to operator controls"
          className="rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/80 opacity-70 backdrop-blur hover:text-white hover:opacity-100"
        >
          ◉ Exit audience mode
        </button>
      </div>
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
        <div data-testid="presenter-menu" className="mt-2 max-h-[80vh] w-80 overflow-y-auto rounded-xl border border-white/15 bg-slate-900/95 p-3 text-slate-200 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="px-1 text-[10px] uppercase tracking-wide text-slate-500">Jump to (POC route map)</p>
            <button onClick={() => { setAudience(true); setOpen(false); }} className="rounded bg-white/5 px-2 py-0.5 text-[10px] hover:bg-white/10" title="Hide all presenter chrome (a visible Exit control stays available)">▶ Audience mode</button>
          </div>
          {ROUTE_GROUPS.map((g) => (
            <div key={g.title} className="mt-2">
              <p className="px-1 text-[10px] uppercase tracking-wide text-slate-500">{g.title}</p>
              <div className="mt-1 grid gap-1">
                {g.items.map((it) => (
                  <Link key={it.to} to={it.to} onClick={() => setOpen(false)} className="flex items-center justify-between gap-2 rounded px-2 py-1 text-sm hover:bg-white/10">
                    <span className="truncate">{it.label}</span>
                    <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-medium ${ROLE_TAG[it.role]}`} title={`${ROLE_LABEL[it.role]} surface`}>{ROLE_LABEL[it.role]}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
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
          <div className="mt-3 flex items-center justify-end gap-1 border-t border-white/10 pt-2">
            {opUnlocked && <button onClick={() => { lockOperator(); setOpen(false); }} className="rounded bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10" title="Lock /config and /host on this device">🔒 Lock operator</button>}
            <button onClick={doReset} className="rounded bg-white/5 px-2 py-1 text-[10px] hover:bg-white/10" title="Reset the demo session">↺ Reset demo</button>
          </div>
        </div>
      )}
    </div>
  );
}
