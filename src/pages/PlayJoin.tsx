/**
 * /play/:joinToken — player QR-join + onboarding (functional, real DB), now in the brand-aware PlayerShell.
 *
 * Pub-table flow: scan the pub QR → correct game → enter name → CREATE a team or JOIN one. Two join methods:
 * (1) tap a team in the visible list; (2) invite link /play/:token?team=<code> preselects the team.
 * The team creator is the (visual) captain. Mobile-first; branding zones via PlayerShell.
 * States: loading · invalid · ended · ok · joined.
 */
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resolveJoinToken, listTeams, createTeamAndJoin, addPlayer, type ResolvedSession, type TeamRow } from "../lib/ppnApi";
import { PlayerShell } from "../components/shells";
import { AiAnnouncementSlot } from "../components/brandZones";
import { Carousel } from "../components/Carousel";
import { playerHeroSlides } from "../demo/media";
import { DEMO_BRAND } from "../demo/brand";

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
        /* cancelled */
      }
    } else copy();
  };
  return (
    <div className="mt-6 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
      <p className="text-sm font-medium text-[var(--ppn-text)]">Invite teammates</p>
      <p className="mt-1 text-xs text-[var(--ppn-muted)]">They scan the same pub QR, or open this link — your team is preselected.</p>
      <code className="mt-2 block truncate rounded bg-[var(--ppn-bg)] px-2 py-1 text-xs text-[var(--ppn-brand)]">{link}</code>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={copy} className="rounded-lg bg-[var(--ppn-surface)] px-3 py-2 text-sm text-[var(--ppn-text)] active:scale-95">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
        <button onClick={share} className="rounded-lg bg-[var(--ppn-surface)] px-3 py-2 text-sm text-[var(--ppn-text)] active:scale-95">Share</button>
        <span className="ml-auto text-sm text-[var(--ppn-muted)]">
          Code <span className="font-mono font-bold tracking-widest text-[var(--ppn-text)]">{joinCode}</span>
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
  const inputCls =
    "mt-1 w-full rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-4 py-3 text-base outline-none focus:border-[color:var(--ppn-brand)]";

  // ── Demo-only in-play preview states (presenter inspection; ?preview=…). Not the live game loop. ──
  const preview = params.get("preview");
  if (preview) {
    const venue = session?.venueName ?? DEMO_BRAND.pubName;
    const event = session?.eventTitle ?? DEMO_BRAND.eventName;
    const Opt = ({ k, t, state }: { k: string; t: string; state?: "right" | "chosen" }) => (
      <button
        className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left font-medium"
        style={{
          borderColor: state === "right" ? "var(--ppn-success)" : "var(--ppn-border)",
          background: state === "chosen" ? "color-mix(in srgb, var(--ppn-brand) 14%, transparent)" : "var(--ppn-surface)",
        }}
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black" style={{ background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }}>{k}</span>
        {t}
      </button>
    );
    return (
      <PlayerShell venue={venue} event={event}>
        {preview === "question" && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ppn-brand)]">Round 1 · General knowledge</p>
            <h2 className="mt-1 text-xl font-bold">Which planet is known as the Red Planet?</h2>
            <p className="mt-1 text-xs text-[var(--ppn-muted)]">⏱ 20s · tap your team's answer</p>
            <div className="mt-4 space-y-2">{["Mars", "Venus", "Jupiter", "Mercury"].map((o, i) => <Opt key={o} k={"ABCD"[i]} t={o} />)}</div>
          </>
        )}
        {preview === "sponsored" && (
          <>
            <div className="rounded-xl p-3" style={{ background: "color-mix(in srgb, var(--ppn-brand) 14%, transparent)" }}>
              <p className="text-xs font-semibold text-[var(--ppn-brand)]">Sponsored round · {DEMO_BRAND.sponsorName}</p>
              <p className="text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.offer}</p>
            </div>
            <h2 className="mt-3 text-xl font-bold">Which city is {DEMO_BRAND.sponsorName} brewed in?</h2>
            <div className="mt-4 space-y-2">{["Manchester", "London", "Leeds", "Bristol"].map((o, i) => <Opt key={o} k={"ABCD"[i]} t={o} state={i === 0 ? "chosen" : undefined} />)}</div>
          </>
        )}
        {preview === "submitted" && (
          <div className="pt-10 text-center">
            <p className="text-6xl" style={{ color: "var(--ppn-brand)" }}>✓</p>
            <h2 className="mt-2 text-2xl font-bold">Answer locked in</h2>
            <p className="mt-1 text-[var(--ppn-muted)]">Waiting for the other teams…</p>
          </div>
        )}
        {preview === "reveal" && (
          <div className="pt-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ppn-brand)]">Answer reveal</p>
            <p className="mt-2 text-5xl">🎉</p>
            <h2 className="mt-1 text-2xl font-bold">Correct! +5 pts</h2>
            <p className="mt-1 text-[var(--ppn-muted)]">The answer was <span className="font-semibold text-[var(--ppn-text)]">Mars</span>.</p>
          </div>
        )}
        {preview === "scoreboard" && (
          <>
            <h2 className="text-xl font-bold">Standings</h2>
            <div className="mt-3 space-y-2">
              {[...(teamsQ.data ?? [])].sort((a, b) => b.score - a.score).slice(0, 5).map((t, i) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2.5">
                  <span><span className="mr-2 font-black text-[var(--ppn-brand)]">{i + 1}</span>{t.name}</span>
                  <span className="font-bold">{t.score} pts</span>
                </div>
              ))}
              {(teamsQ.data ?? []).length === 0 && <p className="text-sm text-[var(--ppn-muted)]">No teams yet.</p>}
            </div>
          </>
        )}
        {!["question", "sponsored", "submitted", "reveal", "scoreboard"].includes(preview) && (
          <p className="pt-6 text-[var(--ppn-muted)]">Unknown preview state “{preview}”.</p>
        )}
      </PlayerShell>
    );
  }

  // ── Non-OK states (still branded) ──
  if (resolveQ.isLoading) return <PlayerShell><p className="pt-6 text-[var(--ppn-muted)]">Loading…</p></PlayerShell>;
  if (resolveQ.isError)
    return <PlayerShell><div className="pt-6"><h2 className="text-xl font-semibold text-red-400">Something went wrong</h2><p className="mt-2 text-[var(--ppn-muted)]">Couldn't reach the game. Please try again.</p></div></PlayerShell>;
  if (resolveQ.data?.kind === "invalid")
    return <PlayerShell><div className="pt-6"><h2 className="text-xl font-semibold text-amber-400">This game isn't available</h2><p className="mt-2 text-[var(--ppn-muted)]">It may have ended, or the code is wrong — ask staff for the current QR.</p></div></PlayerShell>;
  if (resolveQ.data?.kind === "ended")
    return (
      <PlayerShell venue={session?.venueName} event={session?.eventTitle}>
        <p className="mt-2 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4 text-[var(--ppn-muted)]">This game has ended — joining is closed.</p>
      </PlayerShell>
    );

  if (joined)
    return (
      <PlayerShell venue={session?.venueName} event={session?.eventTitle}>
        <p className="text-xs uppercase tracking-wide text-[var(--ppn-brand)]">You're in</p>
        <h2 className="mt-1 text-2xl font-bold">{joined.teamName}</h2>
        <p className="mt-2 text-[var(--ppn-muted)]">Waiting for the host to start…</p>
        <div className="mt-4"><Carousel slides={playerHeroSlides(DEMO_BRAND)} size="phone" aspect="16/9" auto /></div>
        <div className="mt-4"><AiAnnouncementSlot scriptKey="eventIntro" size="phone" /></div>
        {joined.joinCode && <InviteBox joinCode={joined.joinCode} />}
      </PlayerShell>
    );

  // ── OK: onboarding ──
  return (
    <PlayerShell venue={session?.venueName} event={session?.eventTitle}>
      <p className="text-sm text-[var(--ppn-muted)]">You've joined the right game — enter your name to play.</p>

      <label className="mt-5 block text-sm text-[var(--ppn-text)]">Your name</label>
      <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sam" maxLength={40} />

      {teamCode &&
        (preselected ? (
          <div className="mt-5 rounded-xl border p-3" style={{ borderColor: "var(--ppn-brand)", background: "color-mix(in srgb, var(--ppn-brand) 12%, transparent)" }}>
            <p className="text-sm text-[var(--ppn-text)]">You're joining</p>
            <p className="text-lg font-semibold">{preselected.name}</p>
            <button disabled={busy} onClick={() => joinMut.mutate(preselected)} className="mt-2 w-full rounded-xl px-4 py-3 font-semibold text-[var(--ppn-on-brand)] disabled:opacity-50" style={{ background: "var(--ppn-brand)" }}>
              {busy ? "Joining…" : `Join ${preselected.name}`}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-400">That team invite wasn't found — pick a team below or create one.</p>
        ))}

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <button className={`rounded-xl px-3 py-2.5 font-medium ${mode === "create" ? "text-[var(--ppn-on-brand)]" : "bg-[var(--ppn-surface)] text-[var(--ppn-text)]"}`} style={mode === "create" ? { background: "var(--ppn-brand)" } : undefined} onClick={() => setMode("create")}>Create a team</button>
        <button className={`rounded-xl px-3 py-2.5 font-medium ${mode === "join" ? "text-[var(--ppn-on-brand)]" : "bg-[var(--ppn-surface)] text-[var(--ppn-text)]"}`} style={mode === "join" ? { background: "var(--ppn-brand)" } : undefined} onClick={() => setMode("join")}>Join a team</button>
      </div>

      {mode === "create" ? (
        <>
          <label className="mt-4 block text-sm text-[var(--ppn-text)]">Team name</label>
          <input className={inputCls} value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Table 7" maxLength={40} />
          <button className="mt-4 w-full rounded-xl px-4 py-3.5 font-semibold text-[var(--ppn-on-brand)] disabled:opacity-50" style={{ background: "var(--ppn-brand)" }} disabled={busy} onClick={() => createMut.mutate()}>
            {busy ? "Creating…" : "Create team & join (you'll be captain)"}
          </button>
        </>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-[var(--ppn-muted)]">Tap your table's team:</p>
          {(teamsQ.data ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4 text-sm text-[var(--ppn-muted)]">No teams yet — create one above.</p>
          ) : (
            (teamsQ.data ?? []).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-3">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-[var(--ppn-muted)]">{t.players.length} player{t.players.length === 1 ? "" : "s"}</p>
                </div>
                <button disabled={busy} onClick={() => joinMut.mutate(t)} className="rounded-xl bg-[var(--ppn-surface)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50" style={{ color: "var(--ppn-brand)" }}>
                  Join this team
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
    </PlayerShell>
  );
}
