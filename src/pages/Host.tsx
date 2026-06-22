/**
 * /host — staff host panel in the brand-aware HostShell (laptop/tablet-first, touch-friendly).
 * This slice: live read-only view of teams/players grouped by table, with the captain badge + clean counts and
 * a simple stage/status area. Game controls come later. Defaults to the seeded DEMO session (?token to override).
 */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { resolveJoinToken, listTeams } from "../lib/ppnApi";
import { HostShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";

export default function Host() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "DEMO";

  const resolveQ = useQuery({ queryKey: ["host-resolve", token], queryFn: () => resolveJoinToken(token) });
  const session = resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;

  const teamsQ = useQuery({
    queryKey: ["host-teams", session?.sessionId],
    queryFn: () => listTeams(session!.sessionId),
    enabled: !!session,
    refetchInterval: 2500,
  });

  const teams = teamsQ.data ?? [];
  const totalPlayers = teams.reduce((n, t) => n + t.players.length, 0);

  return (
    <HostShell
      venue={session?.venueName}
      event={session?.eventTitle}
      status={session ? `Lobby · ${teams.length} team${teams.length === 1 ? "" : "s"} · ${totalPlayers} player${totalPlayers === 1 ? "" : "s"}` : undefined}
    >
      {resolveQ.isLoading && <p className="text-slate-400">Loading…</p>}
      {resolveQ.data?.kind === "invalid" && (
        <p className="text-amber-400">No session for token “{token}”. Try /host?token=DEMO.</p>
      )}

      {session && (
        <>
          {/* Stage / status strip */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div>
              <p className="text-sm text-slate-400">Stage</p>
              <p className="text-lg font-semibold">Lobby — teams are forming</p>
            </div>
            <p className="text-sm text-slate-500">
              Join code <span className="font-mono font-bold" style={{ color: DEMO_BRAND.primary }}>{token}</span> · auto‑refresh
            </p>
          </div>

          {teams.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500">
              No teams yet. Players join at <span className="font-mono text-slate-300">/play/{token}</span> (or via the TV QR).
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {teams.map((t) => (
                <div key={t.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{t.name}</span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                      {t.players.length} player{t.players.length === 1 ? "" : "s"} · {t.score} pts
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.players.map((p) => (
                      <span key={p.id} className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-sm">
                        {p.display_name}
                        {p.id === t.captain_player_id && (
                          <span className="rounded bg-amber-500/20 px-1 text-[10px] font-semibold uppercase text-amber-300">Captain</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </HostShell>
  );
}
