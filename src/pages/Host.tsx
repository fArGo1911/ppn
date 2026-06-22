/**
 * /host — staff host panel (this slice: read-only live view of joined teams/players from the real DB).
 * Defaults to the seeded DEMO session; override with ?token=XXXX. Polls so teams appear as players join.
 * Game controls (start/reveal/score…) come in later POC build-order steps.
 */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { resolveJoinToken, listTeams } from "../lib/ppnApi";

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

  const totalPlayers = (teamsQ.data ?? []).reduce((n, t) => n + t.players.length, 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-emerald-400">Host panel</h1>

      {resolveQ.isLoading && <p className="mt-4 text-slate-400">Loading…</p>}
      {resolveQ.isError && <p className="mt-4 text-red-400">Couldn't load the session.</p>}
      {resolveQ.data?.kind === "invalid" && (
        <p className="mt-4 text-amber-400">No session for token “{token}”. Try /host?token=DEMO.</p>
      )}

      {session && (
        <>
          <p className="mt-1 text-slate-400">
            {session.venueName} · {session.eventTitle} ·{" "}
            <span className="text-slate-300">{session.status}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Join token <span className="font-mono text-slate-300">{token}</span> ·{" "}
            {teamsQ.data?.length ?? 0} team{(teamsQ.data?.length ?? 0) === 1 ? "" : "s"} · {totalPlayers} player
            {totalPlayers === 1 ? "" : "s"} · live (auto‑refresh)
          </p>

          <section className="mt-6 space-y-2">
            {(teamsQ.data ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-slate-500">
                No teams yet. Open <span className="font-mono text-slate-300">/play/{token}</span> on a phone to join.
              </p>
            ) : (
              (teamsQ.data ?? []).map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t.name}</span>
                    <span className="text-xs text-slate-500">
                      {t.players.length} player{t.players.length === 1 ? "" : "s"} · {t.score} pts
                    </span>
                  </div>
                  {t.players.length > 0 && (
                    <p className="mt-1 text-sm text-slate-400">{t.players.map((p) => p.display_name).join(" · ")}</p>
                  )}
                </div>
              ))
            )}
          </section>
        </>
      )}
    </main>
  );
}
