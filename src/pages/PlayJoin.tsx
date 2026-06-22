/**
 * /play/:joinToken — player QR-join + onboarding (functional, real DB).
 * Scan → resolve the correct venue/event → enter name → create or join a team → "you're in" waiting state.
 * States: loading · invalid token · ended · ok. Writes ppn_teams/ppn_players rows to the PPN local Supabase.
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveJoinToken, listTeams, createTeamAndJoin, addPlayer, type ResolvedSession } from "../lib/ppnApi";

function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-md px-5 py-10">{children}</main>;
}

export default function PlayJoin() {
  const { joinToken = "" } = useParams();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [teamName, setTeamName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [joined, setJoined] = useState<{ teamName: string } | null>(null);

  const resolveQ = useQuery({
    queryKey: ["join", joinToken],
    queryFn: () => resolveJoinToken(joinToken),
  });

  const session: ResolvedSession | undefined =
    resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;

  // Existing teams (so the player can JOIN one). Light polling so new teams show up.
  const teamsQ = useQuery({
    queryKey: ["teams", session?.sessionId],
    queryFn: () => listTeams(session!.sessionId),
    enabled: !!session,
    refetchInterval: 4000,
  });

  const joinMut = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("no session");
      const display = name.trim();
      if (!display) throw new Error("Enter your name");
      if (mode === "create") {
        const tn = teamName.trim();
        if (!tn) throw new Error("Enter a team name");
        await createTeamAndJoin(session.sessionId, tn, display);
        return tn;
      } else {
        if (!selectedTeam) throw new Error("Pick a team");
        await addPlayer(session.sessionId, selectedTeam, display);
        return teamsQ.data?.find((t) => t.id === selectedTeam)?.name ?? "your team";
      }
    },
    onSuccess: (tn) => {
      setJoined({ teamName: tn });
      qc.invalidateQueries({ queryKey: ["teams", session?.sessionId] });
    },
  });

  if (resolveQ.isLoading) return <Screen><p className="text-slate-400">Loading…</p></Screen>;
  if (resolveQ.isError)
    return (
      <Screen>
        <h1 className="text-xl font-semibold text-red-400">Something went wrong</h1>
        <p className="mt-2 text-slate-400">Couldn't reach the game. Please try again.</p>
      </Screen>
    );
  if (resolveQ.data?.kind === "invalid")
    return (
      <Screen>
        <h1 className="text-xl font-semibold text-amber-400">This game isn't available</h1>
        <p className="mt-2 text-slate-400">It may have ended, or the code is wrong — ask staff for the current QR.</p>
      </Screen>
    );
  if (resolveQ.data?.kind === "ended")
    return (
      <Screen>
        <p className="text-xs uppercase tracking-wide text-slate-500">{session?.venueName}</p>
        <h1 className="mt-1 text-xl font-semibold">{session?.eventTitle}</h1>
        <p className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4 text-slate-400">
          This game has ended — joining is closed.
        </p>
      </Screen>
    );

  // OK
  if (joined)
    return (
      <Screen>
        <p className="text-xs uppercase tracking-wide text-emerald-400">You're in</p>
        <h1 className="mt-1 text-2xl font-bold">{joined.teamName}</h1>
        <p className="mt-2 text-slate-400">
          Waiting for the host at <span className="text-slate-200">{session?.venueName}</span>…
        </p>
        <p className="mt-6 text-sm text-slate-500">{session?.eventTitle}</p>
      </Screen>
    );

  return (
    <Screen>
      <p className="text-xs uppercase tracking-wide text-emerald-400">{session?.venueName}</p>
      <h1 className="mt-1 text-2xl font-bold">{session?.eventTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">You've joined the right game — enter your name to play.</p>

      <label className="mt-6 block text-sm text-slate-300">Your name</label>
      <input
        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Sam"
        maxLength={40}
      />

      <div className="mt-5 flex gap-2 text-sm">
        <button
          className={`rounded-lg px-3 py-1.5 ${mode === "create" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}
          onClick={() => setMode("create")}
        >
          Create a team
        </button>
        <button
          className={`rounded-lg px-3 py-1.5 ${mode === "join" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}
          onClick={() => setMode("join")}
        >
          Join a team
        </button>
      </div>

      {mode === "create" ? (
        <>
          <label className="mt-4 block text-sm text-slate-300">Team name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. The Regulars"
            maxLength={40}
          />
        </>
      ) : (
        <div className="mt-4">
          <label className="block text-sm text-slate-300">Pick a team</label>
          {teamsQ.data && teamsQ.data.length > 0 ? (
            <div className="mt-1 space-y-1">
              {teamsQ.data.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeam(t.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${
                    selectedTeam === t.id ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-xs text-slate-500">{t.players.length} player{t.players.length === 1 ? "" : "s"}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500">No teams yet — create one instead.</p>
          )}
        </div>
      )}

      {joinMut.isError && (
        <p className="mt-3 text-sm text-red-400">{(joinMut.error as Error).message}</p>
      )}

      <button
        className="mt-6 w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-50"
        disabled={joinMut.isPending}
        onClick={() => joinMut.mutate()}
      >
        {joinMut.isPending ? "Joining…" : mode === "create" ? "Create team & join" : "Join team"}
      </button>
    </Screen>
  );
}
