/**
 * /play/:joinToken — player QR-join + onboarding (functional, real DB).
 *
 * Pub-table flow: scan the pub QR → correct game → enter name → CREATE a team or JOIN an existing one.
 * Two join methods (POC-simple): (1) tap a team in the visible list; (2) open an invite link
 * /play/:token?team=<code> that preselects the team. The team creator is the (visual) captain.
 * States: loading · invalid · ended · ok · joined.
 */
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveJoinToken, listTeams, createTeamAndJoin, addPlayer, type ResolvedSession, type TeamRow } from "../lib/ppnApi";

function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-md px-5 py-10">{children}</main>;
}

function InviteBox({ joinCode }: { joinCode: string }) {
  const link = `${window.location.origin}${window.location.pathname}?team=${joinCode}`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the code below is the fallback */
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Join my team", text: "Join my PubPlay team:", url: link });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };
  return (
    <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="text-sm font-medium text-slate-200">Invite teammates</p>
      <p className="mt-1 text-xs text-slate-500">
        They scan the same pub QR, or open this link — your team is preselected.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-slate-950 px-2 py-1 text-xs text-emerald-300">{link}</code>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={copy} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <button onClick={share} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
          Share
        </button>
        <span className="ml-auto text-sm text-slate-400">
          Code <span className="font-mono font-bold tracking-widest text-slate-200">{joinCode}</span>
        </span>
      </div>
    </div>
  );
}

export default function PlayJoin() {
  const { joinToken = "" } = useParams();
  const [params] = useSearchParams();
  const teamCode = params.get("team");
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [mode, setMode] = useState<"create" | "join">(teamCode ? "join" : "create");
  const [teamName, setTeamName] = useState("");
  const [joined, setJoined] = useState<{ teamName: string; joinCode: string | null } | null>(null);

  const resolveQ = useQuery({ queryKey: ["join", joinToken], queryFn: () => resolveJoinToken(joinToken) });
  const session: ResolvedSession | undefined =
    resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;

  const teamsQ = useQuery({
    queryKey: ["teams", session?.sessionId],
    queryFn: () => listTeams(session!.sessionId),
    enabled: !!session,
    refetchInterval: 4000,
  });

  const preselected: TeamRow | undefined = useMemo(
    () => (teamCode ? teamsQ.data?.find((t) => t.join_code === teamCode) : undefined),
    [teamCode, teamsQ.data],
  );

  const createMut = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("no session");
      if (!name.trim()) throw new Error("Enter your name");
      if (!teamName.trim()) throw new Error("Enter a team name");
      const { joinCode } = await createTeamAndJoin(session.sessionId, teamName.trim(), name.trim());
      return { teamName: teamName.trim(), joinCode };
    },
    onSuccess: (r) => {
      setJoined(r);
      qc.invalidateQueries({ queryKey: ["teams", session?.sessionId] });
    },
  });

  const joinMut = useMutation({
    mutationFn: async (team: TeamRow) => {
      if (!session) throw new Error("no session");
      if (!name.trim()) throw new Error("Enter your name first");
      await addPlayer(session.sessionId, team.id, name.trim());
      return { teamName: team.name, joinCode: team.join_code };
    },
    onSuccess: (r) => {
      setJoined(r);
      qc.invalidateQueries({ queryKey: ["teams", session?.sessionId] });
    },
  });

  const busy = createMut.isPending || joinMut.isPending;
  const err = (createMut.error as Error | null)?.message ?? (joinMut.error as Error | null)?.message;

  // ── States ──
  if (resolveQ.isLoading) return <Screen><p className="text-slate-400">Loading…</p></Screen>;
  if (resolveQ.isError)
    return <Screen><h1 className="text-xl font-semibold text-red-400">Something went wrong</h1><p className="mt-2 text-slate-400">Couldn't reach the game. Please try again.</p></Screen>;
  if (resolveQ.data?.kind === "invalid")
    return <Screen><h1 className="text-xl font-semibold text-amber-400">This game isn't available</h1><p className="mt-2 text-slate-400">It may have ended, or the code is wrong — ask staff for the current QR.</p></Screen>;
  if (resolveQ.data?.kind === "ended")
    return <Screen><p className="text-xs uppercase tracking-wide text-slate-500">{session?.venueName}</p><h1 className="mt-1 text-xl font-semibold">{session?.eventTitle}</h1><p className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4 text-slate-400">This game has ended — joining is closed.</p></Screen>;

  if (joined)
    return (
      <Screen>
        <p className="text-xs uppercase tracking-wide text-emerald-400">You're in</p>
        <h1 className="mt-1 text-2xl font-bold">{joined.teamName}</h1>
        <p className="mt-2 text-slate-400">Waiting for the host at <span className="text-slate-200">{session?.venueName}</span>…</p>
        {joined.joinCode && <InviteBox joinCode={joined.joinCode} />}
        <p className="mt-6 text-sm text-slate-500">{session?.eventTitle}</p>
      </Screen>
    );

  // ── OK: onboarding ──
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

      {/* Preselected via invite link */}
      {teamCode && (
        preselected ? (
          <div className="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3">
            <p className="text-sm text-slate-300">You're joining</p>
            <p className="text-lg font-semibold">{preselected.name}</p>
            <button
              disabled={busy}
              onClick={() => joinMut.mutate(preselected)}
              className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50"
            >
              {busy ? "Joining…" : `Join ${preselected.name}`}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-400">That team invite wasn't found — pick a team below or create one.</p>
        )
      )}

      <div className="mt-5 flex gap-2 text-sm">
        <button className={`rounded-lg px-3 py-1.5 ${mode === "create" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`} onClick={() => setMode("create")}>Create a team</button>
        <button className={`rounded-lg px-3 py-1.5 ${mode === "join" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300"}`} onClick={() => setMode("join")}>Join a team</button>
      </div>

      {mode === "create" ? (
        <>
          <label className="mt-4 block text-sm text-slate-300">Team name</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Table 7"
            maxLength={40}
          />
          <button
            className="mt-4 w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-slate-950 disabled:opacity-50"
            disabled={busy}
            onClick={() => createMut.mutate()}
          >
            {busy ? "Creating…" : "Create team & join (you'll be captain)"}
          </button>
        </>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-400">Tap your table's team:</p>
          {(teamsQ.data ?? []).length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-800 p-4 text-sm text-slate-500">No teams yet — create one above.</p>
          ) : (
            (teamsQ.data ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.players.length} player{t.players.length === 1 ? "" : "s"}</p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => joinMut.mutate(t)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-emerald-300 disabled:opacity-50"
                >
                  Join this team
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
    </Screen>
  );
}
