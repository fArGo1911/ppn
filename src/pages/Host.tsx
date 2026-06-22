/**
 * /host — the staff control CONSOLE (the only operational surface). Three zones:
 *   A. sticky status bar — what's happening, what players/TV see, answered count.
 *   B. now/next — current question + read-aloud script + audio cues + ONE clear primary action.
 *   C. teams/answers — standings + per-team answered state for the active question.
 * Pre-game setup collapses once live. Human labels only (no internal phase words). Defaults to DEMO (?token).
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  resolveJoinToken, listTeams, getSessionState, getSessionQuestions, getAnsweredTeamIds,
  setSessionSetup, startGame, gotoQuestion, setPhase, revealAndScore, endGame,
  setAiIntroEnabled, startIntro,
  type SetupMode, type HostingMode, type Phase,
} from "../lib/ppnApi";
import { HostShell } from "../components/shells";
import { SETUP_MODES, HOSTING_MODES, questionCompatibility } from "../demo/setup";
import { DEMO_BRAND, questionAudio } from "../demo/brand";
import { AudioCue } from "../components/AudioCue";
import { playCue, pickVariant } from "../lib/audio";

// ── Human labels (never expose internal phase words like qintro / tv_off / live_question) ──
function phaseHeading(phase: Phase, qNum: number, total: number): string {
  switch (phase) {
    case "lobby": return "Not started";
    case "intro": return "AI evening intro";
    case "qintro": return "Question coming up";
    case "question": return `Question ${qNum} of ${total}`;
    case "reveal": return "Answer reveal";
    case "scoreboard": return "Scoreboard";
    case "ended": return "Final standings";
  }
}
function playersSee(phase: Phase): string {
  switch (phase) {
    case "lobby": return "Lobby / waiting";
    case "intro": return "AI intro";
    case "qintro": return "Question coming up";
    case "question": return "Answering now";
    case "reveal": return "Answer reveal";
    case "scoreboard": return "Scoreboard";
    case "ended": return "Winner / final";
  }
}
function tvShows(phase: Phase, setupMode: SetupMode): string {
  if (setupMode !== "tv_audio") return "Phones only (no TV)";
  switch (phase) {
    case "lobby": return "Welcome / QR";
    case "intro": return "AI intro";
    case "qintro": return "Question coming up";
    case "question": return "Question + options";
    case "reveal": return "Answer reveal";
    case "scoreboard": return "Scoreboard";
    case "ended": return "Winner";
  }
}

export default function Host() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "DEMO";
  const qc = useQueryClient();

  const resolveQ = useQuery({ queryKey: ["host-resolve", token], queryFn: () => resolveJoinToken(token) });
  const session = resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;
  const sid = session?.sessionId;

  const stateQ = useQuery({ queryKey: ["host-state", sid], queryFn: () => getSessionState(sid!), enabled: !!sid, refetchInterval: 2500 });
  const questionsQ = useQuery({ queryKey: ["host-questions", sid], queryFn: () => getSessionQuestions(sid!), enabled: !!sid, staleTime: 60_000 });
  const teamsQ = useQuery({ queryKey: ["host-teams", sid], queryFn: () => listTeams(sid!), enabled: !!sid, refetchInterval: 2500 });

  const st = stateQ.data;
  const questions = questionsQ.data ?? [];
  const teams = teamsQ.data ?? [];
  const totalPlayers = teams.reduce((n, t) => n + t.players.length, 0);
  const standings = [...teams].sort((a, b) => b.score - a.score);

  const idx = useMemo(() => questions.findIndex((q) => q.id === st?.currentQuestionId), [questions, st?.currentQuestionId]);
  const q = idx >= 0 ? questions[idx] : null;
  const isLast = idx >= 0 && idx === questions.length - 1;
  const phase: Phase = st?.phase ?? "lobby";
  const setupMode: SetupMode = st?.setupMode ?? "tv_audio";
  const hostingMode: HostingMode = st?.hostingMode ?? "staff";
  const aiIntroEnabled = st?.aiIntroEnabled ?? true;
  const preGame = phase === "lobby" || phase === "intro";
  const compat = q ? questionCompatibility(q.kind, setupMode) : null;
  const setupHuman = SETUP_MODES.find((m) => m.id === setupMode)?.label ?? setupMode;
  const hostingHuman = HOSTING_MODES.find((m) => m.id === hostingMode)?.label ?? hostingMode;

  // Answered count + per-team status for the active question.
  const answerable = phase === "question" || phase === "reveal";
  const answeredQ = useQuery({
    queryKey: ["host-answered", st?.currentQuestionId],
    queryFn: () => getAnsweredTeamIds(st!.currentQuestionId!),
    enabled: !!st?.currentQuestionId && answerable,
    refetchInterval: 2000,
  });
  const answeredSet = useMemo(() => new Set(answeredQ.data ?? []), [answeredQ.data]);
  const answeredCount = teams.filter((t) => answeredSet.has(t.id)).length;

  // ── Audio (playback-only) + presenter chime/intro toggles ──
  const audio = DEMO_BRAND.audio;
  const [chimeOn, setChimeOn] = useState(audio.chimeEnabled);
  const [qIntroOn, setQIntroOn] = useState(audio.questionIntroEnabled);
  const useQIntro = chimeOn || qIntroOn;
  const qa = idx >= 0 ? questionAudio(DEMO_BRAND, idx + 1) : { readout: undefined as string | undefined, reveal: undefined as string | undefined };
  const safeIdx = idx < 0 ? 0 : idx;
  const qIntroLine = `${pickVariant(audio.questionIntroVariants, safeIdx)} ${pickVariant(audio.questionNumberAnnouncementVariants, safeIdx).replace("{n}", String(safeIdx + 1))}`;

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["host-state", sid] }); qc.invalidateQueries({ queryKey: ["host-teams", sid] }); },
  });
  const run = (fn: () => Promise<unknown>) => act.mutate(fn);
  const busy = act.isPending;

  const startFirst = () => { if (chimeOn) playCue(audio.questionChimeAudioUrl); run(() => startGame(sid!, questions[0].id, useQIntro ? "qintro" : "question")); };
  const goNext = () => { if (chimeOn) playCue(audio.questionChimeAudioUrl); run(() => gotoQuestion(sid!, questions[idx + 1].id, useQIntro ? "qintro" : "question")); };
  const showQuestion = () => { playCue(qa.readout); run(() => setPhase(sid!, "question")); };

  // Read-aloud script for the current state.
  const scriptLead = setupMode === "local_host" ? "📢 Read aloud via the pub mic/speaker" : hostingMode === "ai_assisted" ? "🤖 AI voice announces" : "🎤 Host reads aloud";
  const scriptBody =
    phase === "intro" ? DEMO_BRAND.ai.eventIntro
    : phase === "qintro" ? qIntroLine
    : phase === "lobby" ? `Welcome to ${session?.eventTitle ?? "Quiz Night"} at ${session?.venueName ?? "the pub"} — brought to you by ${DEMO_BRAND.sponsorName}. Grab your phones and join your table team!`
    : phase === "reveal" && q ? `The correct answer is ${q.correctAnswer}.`
    : phase === "scoreboard" ? `Here are the current standings${standings[0] ? ` — ${standings[0].name} lead the way.` : "."}`
    : phase === "ended" ? `That's a wrap! ${standings[0]?.name ?? "Our winners"} take it — thanks to ${DEMO_BRAND.sponsorName}, and goodnight!`
    : q ? `Question ${q.roundSeq}.${q.sequence}: ${q.prompt}` : "…";

  // ── Primary + secondary actions per phase (one obvious primary) ──
  type Action = { label: string; onClick: () => void; disabled?: boolean };
  let primary: Action | null = null;
  const secondary: Action[] = [];
  const noQ = questions.length === 0;
  if (phase === "lobby") {
    if (aiIntroEnabled) { primary = { label: "▶ Play AI intro", onClick: () => run(() => startIntro(sid!)), disabled: noQ }; secondary.push({ label: "Skip intro · Start game", onClick: startFirst, disabled: noQ }); }
    else primary = { label: "▶ Start game", onClick: startFirst, disabled: noQ };
  } else if (phase === "intro") {
    primary = { label: "Start first question ▶", onClick: startFirst, disabled: noQ };
    secondary.push({ label: "◀ Back to lobby", onClick: () => run(() => setPhase(sid!, "lobby")) });
  } else if (phase === "qintro") {
    primary = { label: "Show question ▶", onClick: showQuestion };
    if (idx > 0) secondary.push({ label: "◀ Previous", onClick: () => run(() => gotoQuestion(sid!, questions[idx - 1].id, useQIntro ? "qintro" : "question")) });
  } else if (phase === "question") {
    primary = { label: "Reveal & score", onClick: () => run(() => revealAndScore(sid!, q!.id)) };
    if (!isLast) secondary.push({ label: "Skip ▶", onClick: goNext });
    if (idx > 0) secondary.push({ label: "◀ Previous", onClick: () => run(() => gotoQuestion(sid!, questions[idx - 1].id)) });
  } else if (phase === "reveal") {
    if (!isLast) { primary = { label: "Next question ▶", onClick: goNext }; secondary.push({ label: "Show scoreboard", onClick: () => run(() => setPhase(sid!, "scoreboard")) }); }
    else primary = { label: "Show scoreboard", onClick: () => run(() => setPhase(sid!, "scoreboard")) };
  } else if (phase === "scoreboard") {
    if (!isLast) { primary = { label: "Next question ▶", onClick: goNext }; }
    else primary = { label: "⏹ End game", onClick: () => run(() => endGame(sid!)) };
  }
  if (phase !== "lobby" && phase !== "ended" && !(phase === "scoreboard" && isLast)) secondary.push({ label: "End game", onClick: () => run(() => endGame(sid!)) });

  // ── Phase-aware audio cues (quiet secondary row) ──
  const audioCues = (() => {
    switch (phase) {
      case "intro": return <AudioCue url={audio.aiEventIntroAudioUrl} label="Replay intro" />;
      case "qintro": return <><AudioCue url={audio.questionChimeAudioUrl} label="Chime" /><AudioCue url={qa.readout} label="Read question" /></>;
      case "question": return <><AudioCue url={qa.readout} label="Replay question" /><AudioCue url={audio.questionChimeAudioUrl} label="Chime" />{q?.kind === "sponsored" && <AudioCue url={audio.sponsorAudioMessageUrl} label="Sponsor message" />}</>;
      case "reveal": return <AudioCue url={qa.reveal} label="Play reveal" />;
      case "ended": return <AudioCue url={audio.aiWinnerAnnouncementAudioUrl} label="Play winner" />;
      default: return null;
    }
  })();

  // ── Setup selector (used expanded pre-game, collapsed when live) ──
  const setupSelector = (
    <>
      <div className="grid gap-2 md:grid-cols-3">
        {SETUP_MODES.map((m) => {
          const on = setupMode === m.id;
          return (
            <button key={m.id} disabled={phase !== "lobby" || busy} onClick={() => run(() => setSessionSetup(sid!, m.id, hostingMode))}
              className="rounded-xl border p-3 text-left disabled:opacity-60"
              style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", background: on ? "color-mix(in srgb, var(--ppn-brand) 12%, transparent)" : "transparent" }}>
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">{m.supports}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--ppn-muted)]">Hosting:</span>
        {HOSTING_MODES.map((h) => {
          const on = hostingMode === h.id;
          return (
            <button key={h.id} disabled={phase !== "lobby" || busy} onClick={() => run(() => setSessionSetup(sid!, setupMode, h.id))}
              className="rounded-full border px-3 py-1.5 text-xs font-medium disabled:opacity-60"
              style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", color: on ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>
              {h.label}
            </button>
          );
        })}
        {setupMode === "tv_audio"
          ? <span className="text-xs text-[var(--ppn-muted)]">· TV: <span className="font-mono">/tv/{token}</span></span>
          : <span className="text-xs text-[var(--ppn-muted)]">· TV not used — phones carry the game</span>}
      </div>
    </>
  );

  const Pill = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1 text-xs">
      <span className="text-[var(--ppn-muted)]">{label}</span>
      <span className="font-semibold" style={accent ? { color: "var(--ppn-brand)" } : undefined}>{value}</span>
    </span>
  );

  return (
    <HostShell venue={session?.venueName} event={session?.eventTitle}>
      {resolveQ.isLoading && <p className="text-[var(--ppn-muted)]">Loading…</p>}
      {resolveQ.data?.kind === "invalid" && <p className="text-amber-400">No session for token “{token}”. Try /host?token=DEMO.</p>}

      {session && st && (
        <div className="space-y-4">
          {/* ── Zone A: sticky status bar ── */}
          <div className="sticky top-0 z-10 -mx-5 border-b border-[var(--ppn-border)] bg-[var(--ppn-bg)]/95 px-5 py-2.5 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>
                ● {phaseHeading(phase, idx + 1, questions.length)}
              </span>
              <Pill label="Players see:" value={playersSee(phase)} accent />
              <Pill label="TV:" value={tvShows(phase, setupMode)} accent />
              {answerable && <Pill label="Answered:" value={`${answeredCount}/${teams.length} teams`} accent />}
              <Pill label="" value={`${setupHuman}`} />
              <Pill label="" value={hostingHuman} />
              <Pill label="AI intro" value={aiIntroEnabled ? "on" : "off"} />
              <Pill label="" value={`${teams.length} teams · ${totalPlayers} players`} />
            </div>
          </div>

          {/* ── Pre-game setup (expanded) → collapses once live ── */}
          {preGame ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
                <p className="mb-2 text-sm font-semibold">Venue setup</p>
                {setupSelector}
              </div>
              <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">AI evening intro <span className="font-normal text-[var(--ppn-muted)]">· optional</span></p>
                  <span className="flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={aiIntroEnabled ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" } : { background: "var(--ppn-bg)", color: "var(--ppn-muted)" }}>{aiIntroEnabled ? "Enabled" : "Disabled"}</span>
                    <button onClick={() => run(() => setAiIntroEnabled(sid!, !aiIntroEnabled))} disabled={busy} className="rounded-full border border-[var(--ppn-border)] px-3 py-1 text-xs font-medium disabled:opacity-50">{aiIntroEnabled ? "Disable" : "Enable"}</button>
                  </span>
                </div>
                <div className="mt-3 rounded-lg border border-dashed border-[var(--ppn-border)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Intro script + voice (plays if present, else read the script)</p>
                  <p className="mt-1 text-sm text-[var(--ppn-text)]">{DEMO_BRAND.ai.eventIntro}</p>
                  <div className="mt-2"><AudioCue url={audio.aiEventIntroAudioUrl} label="Preview intro audio" /></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--ppn-muted)]">
                <span>Audio:</span>
                <button onClick={() => setChimeOn((v) => !v)} className="rounded-full border px-3 py-1 font-medium" style={{ borderColor: chimeOn ? "var(--ppn-brand)" : "var(--ppn-border)", color: chimeOn ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>Chime {chimeOn ? "on" : "off"}</button>
                <button onClick={() => setQIntroOn((v) => !v)} className="rounded-full border px-3 py-1 font-medium" style={{ borderColor: qIntroOn ? "var(--ppn-brand)" : "var(--ppn-border)", color: qIntroOn ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>“Question coming up” {qIntroOn ? "on" : "off"}</button>
              </div>
            </div>
          ) : (
            <details className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-4 py-3">
              <summary className="cursor-pointer text-sm text-[var(--ppn-muted)]">
                Setup: <span className="font-semibold text-[var(--ppn-text)]">{setupHuman}</span> · {hostingHuman} · AI intro {aiIntroEnabled ? "on" : "off"} <span className="text-[var(--ppn-muted)]">(locked while live)</span>
              </summary>
              <div className="mt-3 opacity-70">{setupSelector}</div>
            </details>
          )}

          {/* ── Zone B: now / next ── */}
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold">{phaseHeading(phase, idx + 1, questions.length)}</p>
              {q && (
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={compat?.ok ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" } : { background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>{q.kind}{compat?.ok ? "" : ` · ${compat?.note}`}</span>
              )}
            </div>
            {q && phase !== "lobby" && phase !== "ended" && (
              <>
                <p className="mt-2 text-xl font-bold">{q.prompt}</p>
                {q.options && <p className="mt-1 text-sm text-[var(--ppn-muted)]">{q.options.join(" · ")}</p>}
                <p className="mt-2 text-sm">Answer (host-only): <span className="font-semibold" style={{ color: "var(--ppn-brand)" }}>{q.correctAnswer}</span></p>
              </>
            )}
            <div className="mt-3 rounded-lg border border-dashed border-[var(--ppn-border)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">{scriptLead}</p>
              <p className="mt-1 text-[var(--ppn-text)]">{scriptBody}</p>
              {audioCues && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--ppn-border)] pt-3">{audioCues}{setupMode === "local_host" && <span className="text-[10px] text-[var(--ppn-muted)]">local-host: audio optional — read via the mic</span>}</div>}
            </div>

            {/* Primary + secondary actions */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {primary && (
                <button onClick={primary.onClick} disabled={primary.disabled || busy} className="rounded-xl px-6 py-3.5 text-base font-bold text-[var(--ppn-on-brand)] shadow disabled:opacity-40" style={{ background: "var(--ppn-brand)" }}>
                  {primary.label}
                </button>
              )}
              {phase === "ended" && <span className="text-sm font-semibold text-[var(--ppn-brand)]">Game ended — final standings below.</span>}
              {secondary.map((s) => (
                <button key={s.label} onClick={s.onClick} disabled={s.disabled || busy} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm text-[var(--ppn-muted)] hover:text-[var(--ppn-text)] disabled:opacity-40">{s.label}</button>
              ))}
            </div>
            {noQ && phase === "lobby" && <p className="mt-2 text-xs text-amber-400">No questions seeded for this session.</p>}
          </div>

          {/* ── Zone C: teams / answers ── */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold">{phase === "ended" ? "Final standings" : "Teams & scores"}</p>
              {answerable && <p className="text-sm text-[var(--ppn-muted)]">Answered <span className="font-bold text-[var(--ppn-text)]">{answeredCount}/{teams.length}</span></p>}
            </div>
            {teams.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--ppn-border)] p-6 text-center text-[var(--ppn-muted)]">No teams yet. Players join at <span className="font-mono text-[var(--ppn-text)]">/play/{token}</span> (or via the TV QR).</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {standings.map((t, i) => {
                  const answered = answeredSet.has(t.id);
                  return (
                    <div key={t.id} className="rounded-xl border bg-[var(--ppn-surface)] p-3" style={{ borderColor: answerable ? (answered ? "color-mix(in srgb, var(--ppn-success) 40%, var(--ppn-border))" : "var(--ppn-border)") : "var(--ppn-border)" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold"><span className="mr-2 font-black text-[var(--ppn-brand)]">{i + 1}</span>{t.name}</span>
                        <span className="flex items-center gap-2">
                          {answerable && (answered
                            ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-success) 20%, transparent)", color: "var(--ppn-success)" }}>✓ answered</span>
                            : <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-[var(--ppn-muted)]" style={{ background: "var(--ppn-bg)" }}>waiting</span>)}
                          <span className="text-sm font-bold">{t.score} pts</span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {t.players.map((p) => (
                          <span key={p.id} className="inline-flex items-center gap-1 rounded-lg bg-[var(--ppn-bg)] px-2 py-0.5 text-xs">
                            {p.display_name}
                            {p.id === t.captain_player_id && <span className="rounded bg-amber-500/20 px-1 text-[9px] font-semibold uppercase text-amber-300">Cap</span>}
                          </span>
                        ))}
                        {t.players.length === 0 && <span className="text-xs text-[var(--ppn-muted)]">no players yet</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </HostShell>
  );
}
