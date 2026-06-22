/**
 * PlayerLive — the running mini-game on the player's phone. Polls session phase and renders the
 * setup-appropriate state: waiting · question (submit shared team answer) · reveal · scoreboard · ended.
 * The phone carries question text + options so the player can play with NO TV (audio-only / local-host modes).
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSessionState, getSessionQuestions, listTeams, getTeamAnswer, submitTeamAnswer,
  type ResolvedSession,
} from "../lib/ppnApi";
import { PlayerShell } from "./shells";
import { AiAnnouncementSlot, OfferBadge } from "./brandZones";
import { Carousel } from "./Carousel";
import { playerHeroSlides } from "../demo/media";
import { setupLabel } from "../demo/setup";
import { DEMO_BRAND } from "../demo/brand";

export function PlayerLive({ session, team }: { session: ResolvedSession; team: { teamId: string; playerId: string; teamName: string; joinCode?: string | null } }) {
  const qc = useQueryClient();
  const sid = session.sessionId;

  const stateQ = useQuery({ queryKey: ["sess", sid], queryFn: () => getSessionState(sid), refetchInterval: 2000 });
  const questionsQ = useQuery({ queryKey: ["questions", sid], queryFn: () => getSessionQuestions(sid), staleTime: 60_000 });
  const teamsQ = useQuery({ queryKey: ["live-teams", sid], queryFn: () => listTeams(sid), refetchInterval: 3000 });

  const st = stateQ.data;
  const cqId = st?.currentQuestionId ?? null;
  const q = questionsQ.data?.find((x) => x.id === cqId) ?? null;

  const answerQ = useQuery({
    queryKey: ["answer", cqId, team.teamId],
    queryFn: () => getTeamAnswer(cqId!, team.teamId),
    enabled: !!cqId,
    refetchInterval: 2000,
  });

  const submit = useMutation({
    mutationFn: (value: string) => submitTeamAnswer(cqId!, team.teamId, value, team.playerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["answer", cqId, team.teamId] }),
  });

  const standings = [...(teamsQ.data ?? [])].sort((a, b) => b.score - a.score);
  const myRank = standings.findIndex((t) => t.id === team.teamId) + 1;
  const myScore = standings.find((t) => t.id === team.teamId)?.score ?? 0;
  const chosen = answerQ.data?.submitted_value ?? null;

  const phase = st?.phase ?? "lobby";

  return (
    <PlayerShell venue={session.venueName} event={session.eventTitle}>
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--ppn-muted)]">
        <span>Team <span className="font-semibold text-[var(--ppn-text)]">{team.teamName}</span></span>
        {st && <span>{setupLabel(st.setupMode)}</span>}
      </div>

      {(phase === "lobby" || phase === "intro") && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-brand)]">{phase === "intro" ? "Welcome" : "You're in"}</p>
          <h2 className="mt-1 text-2xl font-bold">{team.teamName}</h2>
          <p className="mt-1 text-[var(--ppn-muted)]">{phase === "intro" ? "🔊 Intro starting soon — listen up, first question next." : "Waiting for the host to start…"}</p>
          {team.joinCode && (
            <button
              onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${window.location.pathname}?team=${team.joinCode}`)}
              className="mt-4 w-full rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-4 py-2.5 text-sm"
            >
              Copy invite link · code <span className="font-mono font-bold">{team.joinCode}</span>
            </button>
          )}
          <div className="mt-4"><Carousel slides={playerHeroSlides(DEMO_BRAND)} size="phone" aspect="16/9" auto /></div>
          <div className="mt-4"><AiAnnouncementSlot scriptKey="eventIntro" size="phone" /></div>
        </>
      )}

      {phase === "qintro" && (
        <div className="pt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-brand)]">Get ready</p>
          <p className="mt-2 text-5xl">🎲</p>
          <h2 className="mt-1 text-2xl font-bold">Question coming up…</h2>
          <p className="mt-1 text-[var(--ppn-muted)]">Phones ready — answer here as soon as it appears.</p>
        </div>
      )}

      {phase === "question" && q && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-brand)]">
            {q.kind === "sponsored" ? `Sponsored · ${DEMO_BRAND.sponsorName}` : `Question ${q.roundSeq}.${q.sequence}`}
          </p>
          <h2 className="mt-1 text-xl font-bold">{q.prompt}</h2>
          <div className="mt-4 space-y-2">
            {(q.options ?? []).map((o, i) => {
              const sel = chosen === o;
              return (
                <button
                  key={o}
                  disabled={submit.isPending}
                  onClick={() => submit.mutate(o)}
                  className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left font-medium disabled:opacity-60"
                  style={{ borderColor: sel ? "var(--ppn-brand)" : "var(--ppn-border)", background: sel ? "color-mix(in srgb, var(--ppn-brand) 16%, transparent)" : "var(--ppn-surface)" }}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-lg text-sm font-black" style={{ background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }}>{"ABCD"[i]}</span>
                  {o}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-[var(--ppn-muted)]">
            {chosen ? `Your team's answer: ${chosen} — any teammate can change it before reveal.` : "Tap your team's answer."}
          </p>
        </>
      )}

      {phase === "reveal" && q && (
        <div className="pt-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-brand)]">Answer reveal</p>
          <p className="mt-2 text-5xl">{answerQ.data?.is_correct ? "🎉" : "🙈"}</p>
          <h2 className="mt-1 text-2xl font-bold">{answerQ.data?.is_correct ? `Correct! +${answerQ.data?.awarded_points ?? 1}` : "Not this time"}</h2>
          <p className="mt-1 text-[var(--ppn-muted)]">Correct answer: <span className="font-semibold text-[var(--ppn-text)]">{q.correctAnswer}</span></p>
          {chosen && <p className="mt-1 text-sm text-[var(--ppn-muted)]">Your team answered “{chosen}”.</p>}
          <p className="mt-4 text-sm">Score: <span className="font-bold">{myScore} pts</span></p>
        </div>
      )}

      {(phase === "scoreboard" || phase === "ended") && (
        <>
          <h2 className="text-xl font-bold">{phase === "ended" ? "Final standings" : "Scoreboard"}</h2>
          {phase === "ended" && standings[0] && (
            <p className="mt-1 text-[var(--ppn-brand)]">🏆 {standings[0].name} win — thanks to {DEMO_BRAND.sponsorName}!</p>
          )}
          <div className="mt-3 space-y-2">
            {standings.slice(0, 8).map((t, i) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5" style={{ borderColor: t.id === team.teamId ? "var(--ppn-brand)" : "var(--ppn-border)", background: "var(--ppn-surface)" }}>
                <span><span className="mr-2 font-black text-[var(--ppn-brand)]">{i + 1}</span>{t.name}{t.id === team.teamId ? " (you)" : ""}</span>
                <span className="font-bold">{t.score} pts</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--ppn-muted)]">Your team: #{myRank} · {myScore} pts</p>
          {phase === "ended" && <div className="mt-4"><OfferBadge size="phone" /></div>}
        </>
      )}

      {phase === "question" && !q && <p className="pt-6 text-[var(--ppn-muted)]">Loading question…</p>}
    </PlayerShell>
  );
}
