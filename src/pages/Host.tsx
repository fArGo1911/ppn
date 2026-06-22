/**
 * /host — the staff host control panel (the ONLY operational surface). One session-control model drives every
 * venue setup: pick the OUTPUT setup (TV+audio / audio-only / local-host) and HOSTING mode (staff / AI-assisted),
 * then run the loop: Start → (read question) → Reveal & score → Scoreboard → Next → … → End & final standings.
 *
 * The panel always shows a staff-readable script + the current question/answer, so a non-dev can run the whole
 * event with no TV and no AI (local-host mode). Defaults to the seeded DEMO session (?token to override).
 */
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  resolveJoinToken, listTeams, getSessionState, getSessionQuestions,
  setSessionSetup, startGame, gotoQuestion, setPhase, revealAndScore, endGame,
  setAiIntroEnabled, startIntro,
  type SetupMode, type HostingMode,
} from "../lib/ppnApi";
import { HostShell } from "../components/shells";
import { SETUP_MODES, HOSTING_MODES, questionCompatibility } from "../demo/setup";
import { DEMO_BRAND, questionAudio } from "../demo/brand";
import { AudioCue } from "../components/AudioCue";
import { playCue, pickVariant } from "../lib/audio";

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
  const phase = st?.phase ?? "lobby";
  const setupMode: SetupMode = st?.setupMode ?? "tv_audio";
  const hostingMode: HostingMode = st?.hostingMode ?? "staff";
  const aiIntroEnabled = st?.aiIntroEnabled ?? true;
  const preGame = phase === "lobby" || phase === "intro";
  const compat = q ? questionCompatibility(q.kind, setupMode) : null;

  // ── Audio layer (playback-only, pre-generated MP3s). Chime + question-intro are presenter settings. ──
  const audio = DEMO_BRAND.audio;
  const [chimeOn, setChimeOn] = useState(audio.chimeEnabled);
  const [qIntroOn, setQIntroOn] = useState(audio.questionIntroEnabled);
  const useQIntro = chimeOn || qIntroOn; // route Next/Start through a "question coming up" pre-roll
  const qa = idx >= 0 ? questionAudio(DEMO_BRAND, idx + 1) : { readout: undefined, reveal: undefined };
  const qIntroLine = `${pickVariant(audio.questionIntroVariants, idx < 0 ? 0 : idx)} ${pickVariant(audio.questionNumberAnnouncementVariants, idx < 0 ? 0 : idx).replace("{n}", String((idx < 0 ? 0 : idx) + 1))}`;

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["host-state", sid] });
      qc.invalidateQueries({ queryKey: ["host-teams", sid] });
    },
  });
  const run = (fn: () => Promise<unknown>) => act.mutate(fn);
  const busy = act.isPending;

  // Control handlers that also fire audio cues (within the click gesture → playback allowed).
  const startFirst = () => {
    if (chimeOn) playCue(audio.questionChimeAudioUrl);
    run(() => startGame(sid!, questions[0].id, useQIntro ? "qintro" : "question"));
  };
  const goNext = () => {
    if (chimeOn) playCue(audio.questionChimeAudioUrl);
    run(() => gotoQuestion(sid!, questions[idx + 1].id, useQIntro ? "qintro" : "question"));
  };
  const showQuestion = () => {
    playCue(qa.readout); // reads the question if a clip exists; silent fallback otherwise
    run(() => setPhase(sid!, "question"));
  };

  // Staff-readable script — the same line the AI would voice; in local-host mode staff reads it via the pub mic.
  const scriptLead = setupMode === "local_host"
    ? "📢 Read aloud via the pub mic/speaker"
    : hostingMode === "ai_assisted"
      ? "🤖 AI voice announces"
      : "🎤 Host reads aloud";
  const scriptBody =
    phase === "intro" ? DEMO_BRAND.ai.eventIntro
    : phase === "qintro" ? qIntroLine
    : phase === "lobby" ? `Welcome to ${session?.eventTitle ?? "Quiz Night"} at ${session?.venueName ?? "the pub"} — brought to you by ${DEMO_BRAND.sponsorName}. Grab your phones and join your table team!`
    : phase === "reveal" && q ? `The correct answer is ${q.correctAnswer}.`
    : phase === "scoreboard" ? `Here are the current standings${standings[0] ? ` — ${standings[0].name} lead the way.` : "."}`
    : phase === "ended" ? `That's a wrap! ${standings[0]?.name ?? "Our winners"} take it — thanks to ${DEMO_BRAND.sponsorName}, and goodnight!`
    : q ? `Question ${q.roundSeq}.${q.sequence}: ${q.prompt}` : "…";

  const Btn = ({ label, onClick, disabled, primary }: { label: string; onClick: () => void; disabled?: boolean; primary?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className="rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-40"
      style={primary
        ? { background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }
        : { background: "var(--ppn-surface)", color: "var(--ppn-text)", border: "1px solid var(--ppn-border)" }}
    >
      {label}
    </button>
  );

  const statusLine = st
    ? `${SETUP_MODES.find((m) => m.id === setupMode)?.label} · ${phase} · ${teams.length} team${teams.length === 1 ? "" : "s"} · ${totalPlayers} player${totalPlayers === 1 ? "" : "s"}`
    : undefined;

  return (
    <HostShell venue={session?.venueName} event={session?.eventTitle} status={statusLine}>
      {resolveQ.isLoading && <p className="text-[var(--ppn-muted)]">Loading…</p>}
      {resolveQ.data?.kind === "invalid" && <p className="text-amber-400">No session for token “{token}”. Try /host?token=DEMO.</p>}

      {session && st && (
        <div className="space-y-4">
          {/* ── Setup: output mode + hosting mode (locked once the game starts) ── */}
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Venue setup</p>
              {phase !== "lobby" && <span className="text-xs text-[var(--ppn-muted)]">locked while live</span>}
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-3">
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
                ? <span className="text-xs text-[var(--ppn-muted)]">· TV: <span className="font-mono">/tv/{sid}</span></span>
                : <span className="text-xs text-[var(--ppn-muted)]">· TV not used for this setup (phones carry the game)</span>}
            </div>
          </div>

          {/* ── Optional AI evening intro (first-class, include/skip) ── */}
          {preGame && (
            <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">AI evening intro <span className="font-normal text-[var(--ppn-muted)]">· optional</span></p>
                <span className="flex items-center gap-2">
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={aiIntroEnabled
                      ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" }
                      : { background: "var(--ppn-bg)", color: "var(--ppn-muted)" }}>
                    {aiIntroEnabled ? "Available · enabled" : "Disabled"}
                  </span>
                  <button onClick={() => run(() => setAiIntroEnabled(sid!, !aiIntroEnabled))} disabled={busy}
                    className="rounded-full border border-[var(--ppn-border)] px-3 py-1 text-xs font-medium disabled:opacity-50">
                    {aiIntroEnabled ? "Disable" : "Enable"}
                  </button>
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">
                A polished opening before questions start. {setupMode === "local_host" ? "Local-host mode: staff reads it via the mic, or skip it." : hostingMode === "ai_assisted" ? "AI voice will welcome the room (planned voice — text preview below)." : "Read by staff, or skip and introduce the evening yourself."}
              </p>
              <div className="mt-3 rounded-lg border border-dashed border-[var(--ppn-border)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">Intro script + voice (pre-generated MP3 · plays if present, else read the script)</p>
                <p className="mt-1 text-sm text-[var(--ppn-text)]">{DEMO_BRAND.ai.eventIntro}</p>
                <div className="mt-2"><AudioCue url={audio.aiEventIntroAudioUrl} label={phase === "intro" ? "Replay intro" : "Preview intro audio"} primary={phase === "intro"} /></div>
              </div>
              {phase === "lobby" && aiIntroEnabled && <p className="mt-2 text-xs text-[var(--ppn-brand)]">▶ Play intro puts the room into the intro screen before the first question.</p>}
              {phase === "intro" && <p className="mt-2 text-xs text-[var(--ppn-brand)]">Intro is live on the player/TV surfaces — hand over to the first question when ready.</p>}
            </div>
          )}

          {/* ── Current question + read-aloud script (host-only answer) ── */}
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{phase === "lobby" ? "Not started" : phase === "intro" ? "AI evening intro" : phase === "qintro" ? "Question coming up" : q ? `Question ${q.roundSeq}.${q.sequence} of ${questions.length}` : phase}</p>
              {q && (
                <span className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={compat?.ok
                    ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" }
                    : { background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>
                  {q.kind}{compat?.ok ? "" : ` · ${compat?.note}`}
                </span>
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

              {/* Phase-aware audio cues — playback only, fall back to the script when a file is missing. */}
              {phase !== "lobby" && phase !== "intro" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--ppn-border)] pt-3">
                  {phase === "qintro" && <AudioCue url={audio.questionChimeAudioUrl} label="Chime" />}
                  {phase === "qintro" && <AudioCue url={qa.readout} label="Read question" />}
                  {phase === "question" && <AudioCue url={qa.readout} label="Replay question" primary />}
                  {phase === "question" && <AudioCue url={audio.questionChimeAudioUrl} label="Chime" />}
                  {phase === "question" && q?.kind === "sponsored" && <AudioCue url={audio.sponsorAudioMessageUrl} label="Sponsor message" />}
                  {phase === "reveal" && <AudioCue url={qa.reveal} label="Play reveal" primary />}
                  {phase === "scoreboard" && <AudioCue url={audio.aiRoundIntroAudioUrl} label="Round/standings VO" />}
                  {phase === "ended" && <AudioCue url={audio.aiWinnerAnnouncementAudioUrl} label="Play winner" primary />}
                  {(setupMode === "local_host") && <span className="text-[10px] text-[var(--ppn-muted)]">local-host: audio optional — read the script via the mic</span>}
                </div>
              )}
            </div>

            {/* Audio settings (presenter): chime + question-intro pre-roll */}
            {preGame && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--ppn-muted)]">
                <span>Audio:</span>
                <button onClick={() => setChimeOn((v) => !v)} className="rounded-full border px-3 py-1 font-medium"
                  style={{ borderColor: chimeOn ? "var(--ppn-brand)" : "var(--ppn-border)", color: chimeOn ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>
                  Chime {chimeOn ? "on" : "off"}
                </button>
                <button onClick={() => setQIntroOn((v) => !v)} className="rounded-full border px-3 py-1 font-medium"
                  style={{ borderColor: qIntroOn ? "var(--ppn-brand)" : "var(--ppn-border)", color: qIntroOn ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>
                  “Question coming up” {qIntroOn ? "on" : "off"}
                </button>
                <span>· cues play through the host device / pub PA</span>
              </div>
            )}
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-wrap gap-2">
            {phase === "lobby" && aiIntroEnabled && <Btn primary label="▶ Play AI intro" disabled={questions.length === 0} onClick={() => run(() => startIntro(sid!))} />}
            {phase === "lobby" && <Btn primary={!aiIntroEnabled} label={aiIntroEnabled ? "Skip intro · Start game" : "▶ Start game"} disabled={questions.length === 0} onClick={startFirst} />}
            {phase === "intro" && <Btn primary label="Start first question ▶" disabled={questions.length === 0} onClick={startFirst} />}
            {phase === "intro" && <Btn label="◀ Back to lobby" onClick={() => run(() => setPhase(sid!, "lobby"))} />}
            {phase === "qintro" && <Btn primary label="Show question ▶" onClick={showQuestion} />}
            {idx > 0 && phase !== "ended" && phase !== "qintro" && <Btn label="◀ Previous" onClick={() => run(() => gotoQuestion(sid!, questions[idx - 1].id))} />}
            {phase === "question" && <Btn primary label="Reveal & score" onClick={() => run(() => revealAndScore(sid!, q!.id))} />}
            {(phase === "reveal" || phase === "scoreboard") && <Btn label="Scoreboard" onClick={() => run(() => setPhase(sid!, "scoreboard"))} />}
            {(phase === "reveal" || phase === "scoreboard") && !isLast && <Btn primary label="Next question ▶" onClick={goNext} />}
            {phase === "question" && <Btn label="Skip ▶" disabled={isLast} onClick={goNext} />}
            {phase !== "lobby" && phase !== "ended" && <Btn label="⏹ End game" onClick={() => run(() => endGame(sid!))} />}
            {phase === "ended" && <span className="text-sm text-[var(--ppn-brand)]">Game ended — final standings below.</span>}
          </div>

          {/* ── Live teams + scores ── */}
          <div>
            <p className="mb-2 text-sm font-semibold">{phase === "ended" ? "Final standings" : "Teams & scores"}</p>
            {teams.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--ppn-border)] p-6 text-center text-[var(--ppn-muted)]">
                No teams yet. Players join at <span className="font-mono text-[var(--ppn-text)]">/play/{token}</span> (or via the TV QR).
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {standings.map((t, i) => (
                  <div key={t.id} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold"><span className="mr-2 font-black text-[var(--ppn-brand)]">{i + 1}</span>{t.name}</span>
                      <span className="text-sm font-bold">{t.score} pts</span>
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </HostShell>
  );
}
