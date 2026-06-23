/**
 * /tv/:sessionId — the pub-event DISPLAY. A live sponsored-event screen, not a web app on a TV: distance-readable,
 * theme-aware (works on every preset, light or dark, via --ppn-* tokens), and honest about what's live.
 *
 * STATE SOURCES:
 *  • Live-driven (mirrors the session loop, no ?state): welcome · intro · qintro · live_question · live_reveal ·
 *    scoreboard · victory · tv_off.
 *  • Presenter-only demo (?state= only — NOT driven by the loop): slideshow · pause · media · audio · closing.
 *    These carry a subtle "Presenter demo · not live-driven" badge in presenter mode (hidden in audience mode).
 *  • Presenter previews of live-capable states (?state=question/reveal/etc.) reuse the live layouts with demo data.
 */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import type { ReactNode } from "react";
import { resolveJoinToken, listTeams, getSessionState, getSessionQuestions } from "../lib/ppnApi";
import { DEMO_BRAND } from "../demo/brand";
import { clientFacingIdentity, clientFacingBrand, clientVideoUrl } from "../lib/clientFacingDemo";
import { TvShell } from "../components/shells";
import { OfferBadge, SponsorFeature } from "../components/brandZones";
import { Carousel } from "../components/Carousel";
import { VideoSlot } from "../components/VideoSlot";
import { sponsorSlides, pauseSlides } from "../demo/media";
import { useAudienceMode } from "../lib/audience";
import { safeDisplayName } from "../lib/moderation";

const BASE = import.meta.env.VITE_PPN_BASE_PATH ?? "/";
const PRESENTER_ONLY = ["slideshow", "pause", "media", "audio", "closing"];

export default function Tv() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "DEMO";
  const hasOverride = params.has("state");
  const [audience] = useAudienceMode();
  const joinUrl = `${window.location.origin}${BASE === "/" ? "" : BASE}/play/${token}`;

  const resolveQ = useQuery({ queryKey: ["tv-resolve", token], queryFn: () => resolveJoinToken(token) });
  const session = resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;
  // Controlled POC: a prepared demo brief's client/venue identity takes precedence over the DB session label so
  // a client never sees another brewery's pub/event. Display-only — never mutates the session or join logic.
  const ci = clientFacingIdentity();
  const cb = clientFacingBrand(); // brief-safe brand for seeded slide collections
  const venue = ci.hasBrief ? ci.venueName : (session?.venueName ?? DEMO_BRAND.pubName);
  const event = ci.hasBrief ? ci.eventName : (session?.eventTitle ?? DEMO_BRAND.eventName);

  const liveStateQ = useQuery({ queryKey: ["tv-live", session?.sessionId], queryFn: () => getSessionState(session!.sessionId), enabled: !!session && !hasOverride, refetchInterval: 2500 });
  const liveQsQ = useQuery({ queryKey: ["tv-live-q", session?.sessionId], queryFn: () => getSessionQuestions(session!.sessionId), enabled: !!session && !hasOverride, staleTime: 60_000 });
  const live = hasOverride ? undefined : liveStateQ.data;
  const liveQ = live && liveQsQ.data ? liveQsQ.data.find((x) => x.id === live.currentQuestionId) ?? null : null;

  let state: string;
  if (hasOverride) state = params.get("state") ?? "welcome";
  else if (live) {
    if (live.setupMode !== "tv_audio") state = "tv_off";
    else if (live.phase === "intro") state = "intro";
    else if (live.phase === "qintro") state = "qintro";
    else if (live.phase === "question") state = liveQ ? "live_question" : "welcome";
    else if (live.phase === "reveal") state = liveQ ? "live_reveal" : "welcome";
    else if (live.phase === "scoreboard") state = "scoreboard";
    else if (live.phase === "ended") state = "victory";
    else state = "welcome";
  } else state = "welcome";

  const teamsQ = useQuery({
    queryKey: ["tv-teams", session?.sessionId],
    queryFn: () => listTeams(session!.sessionId),
    enabled: !!session && (state === "scoreboard" || state === "victory"),
  });
  const standings = [...(teamsQ.data ?? [])].sort((a, b) => b.score - a.score);
  const winner = safeDisplayName(standings[0]?.name, "Tonight's winners");

  const showDemoBadge = PRESENTER_ONLY.includes(state) && !audience;

  // ── Reusable TV layout pieces (consistent across states, theme-token driven) ──
  const Kicker = ({ children }: { children: ReactNode }) => (
    <p className="text-2xl font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--ppn-brand)" }}>{children}</p>
  );
  const Title = () => (
    <>
      <h1 className="text-7xl font-black leading-none">{venue}</h1>
      <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--ppn-brand)" }}>{event} · {ci.broughtBy}</p>
    </>
  );
  const Options = ({ options }: { options: string[] }) => (
    <div className="mt-10 grid w-full max-w-5xl grid-cols-2 gap-6 text-4xl">
      {options.map((o, i) => (
        <div key={o} className="flex items-center rounded-2xl border-2 px-7 py-7 text-left font-semibold" style={{ borderColor: "var(--ppn-border)", background: "var(--ppn-surface)", color: "var(--ppn-text)" }}>
          <span className="mr-5 grid h-14 w-14 shrink-0 place-items-center rounded-xl text-3xl font-black" style={{ background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }}>{"ABCD"[i]}</span>{o}
        </div>
      ))}
    </div>
  );
  const QrCard = ({ size = 220, caption = "Scan to join" }: { size?: number; caption?: string }) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-6">
      <div className="rounded-2xl bg-white p-4 shadow-2xl"><QRCodeSVG value={joinUrl} size={size} bgColor="#ffffff" fgColor="#0f172a" level="M" /></div>
      <p className="text-3xl font-bold">{caption}</p>
      <p className="text-xl text-[var(--ppn-muted)]">No app · code <span className="font-mono font-bold text-[var(--ppn-text)]">{token}</span></p>
    </div>
  );
  const wrap = (focus: boolean, body: ReactNode) => (
    <TvShell focus={focus}>
      {showDemoBadge && (
        <div className="fixed left-4 top-4 z-40 rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1 text-xs font-medium text-[var(--ppn-muted)] print:hidden">
          Presenter demo · not live-driven
        </div>
      )}
      {body}
    </TvShell>
  );

  // ── Active question (live or presenter preview). Cleanest state; sponsor only if the question is sponsored. ──
  const QuestionView = (q: { prompt: string; options: string[] | null; kind?: string; roundSeq?: number; sequence?: number }) => {
    const sponsored = q.kind === "sponsored";
    return wrap(!sponsored, (
      <>
        <Kicker>{sponsored ? `Sponsored round · ${ci.sponsorName}` : `Round ${q.roundSeq ?? 1} · Question ${q.sequence ?? 1}`}</Kicker>
        <h1 className="mt-4 max-w-6xl text-6xl font-black leading-tight">{q.prompt}</h1>
        {q.options && <Options options={q.options} />}
        <p className="mt-9 text-3xl text-[var(--ppn-muted)]">⏱ Answer on your phones</p>
      </>
    ));
  };
  const RevealView = (q: { correctAnswer: string | null; explanation?: string | null; kind?: string }) => wrap(q.kind !== "sponsored", (
    <>
      <Kicker>Answer{q.kind === "sponsored" ? ` · ${ci.sponsorName}` : ""}</Kicker>
      <h1 className="mt-4 text-8xl font-black">{q.correctAnswer}</h1>
      {q.explanation && <p className="mt-4 max-w-4xl text-3xl text-[var(--ppn-muted)]">{q.explanation}</p>}
    </>
  ));

  // ════════════ Live-driven states ════════════

  if (state === "qintro")
    return wrap(true, (
      <>
        <Kicker>🔊 Question coming up</Kicker>
        <h1 className="mt-6 text-8xl font-black leading-none">Get ready</h1>
        <p className="mt-5 text-3xl text-[var(--ppn-muted)]">Phones ready — answer on your phones</p>
      </>
    ));

  if (state === "live_question" && liveQ) return QuestionView(liveQ);
  if (state === "live_reveal" && liveQ) return RevealView(liveQ);

  if (state === "intro")
    return wrap(false, (
      <>
        <Kicker>Welcome — brought to you by {ci.sponsorName}</Kicker>
        <Title />
        <div className="mt-8 grid w-full max-w-6xl grid-cols-[1.5fr_1fr] items-center gap-8 text-left">
          <VideoSlot url={clientVideoUrl("intro")} aspect="16/9" fallback={<SponsorFeature caption={ci.tagline} />} />
          <QrCard size={170} caption="Still time to join" />
        </div>
      </>
    ));

  if (state === "scoreboard")
    return wrap(false, (
      <>
        <Title />
        <div className="mt-8 w-full max-w-4xl space-y-3 text-left">
          {(standings.length ? standings : [{ id: "x", name: "The Anchor Regulars", score: 18 }, { id: "y", name: "Quiz Lightning", score: 15 }, { id: "z", name: "Bar Stool Boffins", score: 12 }]).slice(0, 6).map((t, i) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border-2 px-7 py-5 text-4xl" style={{ borderColor: i === 0 ? "var(--ppn-brand)" : "var(--ppn-border)", background: "var(--ppn-surface)" }}>
              <span><span className="mr-5 font-black" style={{ color: "var(--ppn-brand)" }}>{i + 1}</span>{safeDisplayName(t.name, `Team ${i + 1}`)}</span>
              <span className="font-bold">{t.score} pts</span>
            </div>
          ))}
        </div>
      </>
    ));

  if (state === "victory")
    return wrap(false, (
      <>
        <p className="text-3xl uppercase tracking-[0.2em]" style={{ color: "var(--ppn-brand)" }}>🏆 Tonight's champions</p>
        <h1 className="mt-4 text-8xl font-black">{winner}</h1>
        <p className="mt-5 text-3xl">Thanks to <span className="font-bold" style={{ color: "var(--ppn-brand)" }}>{ci.sponsorName}</span></p>
        <div className="mt-6"><OfferBadge size="tv" /></div>
        <p className="mt-8 text-2xl text-[var(--ppn-muted)]">See you next time at {venue}</p>
      </>
    ));

  if (state === "tv_off")
    return wrap(false, (
      <>
        <Title />
        <p className="mt-6 text-3xl text-[var(--ppn-muted)]">This event runs on phones — no TV needed.</p>
        <div className="mt-8"><QrCard size={200} /></div>
      </>
    ));

  // ════════════ Presenter-only demo states (badged above) ════════════

  if (state === "slideshow")
    return wrap(false, (
      <div className="grid w-full max-w-6xl gap-6">
        <VideoSlot url={clientVideoUrl("bumper")} aspect="16/9" fallback={<SponsorFeature caption="Sponsor moment" />} />
        <Carousel slides={sponsorSlides(cb)} auto size="tv" />
      </div>
    ));

  if (state === "pause")
    return wrap(false, (
      <>
        <p className="mb-4 text-4xl font-bold">Back in a moment…</p>
        <div className="w-full max-w-6xl"><Carousel slides={pauseSlides(cb)} auto size="tv" /></div>
        <div className="mt-6"><QrCard size={150} caption="Join anytime" /></div>
      </>
    ));

  if (state === "media")
    return wrap(false, (
      <>
        <Kicker>Picture / video round</Kicker>
        <h1 className="mt-2 text-5xl font-black">What's happening in this clip?</h1>
        <div className="mt-6 grid w-full max-w-6xl grid-cols-[1.5fr_1fr] items-center gap-8 text-left">
          <VideoSlot aspect="16/9" label="Picture / video round media" />
          <div className="grid gap-3 text-3xl">
            {["Brewing day", "Match day", "Quiz night", "Delivery run"].map((o, i) => (
              <div key={o} className="rounded-2xl border-2 px-6 py-5 font-semibold" style={{ borderColor: "var(--ppn-border)", background: "var(--ppn-surface)", color: "var(--ppn-text)" }}>
                <span className="mr-3 font-black" style={{ color: "var(--ppn-brand)" }}>{"ABCD"[i]}</span>{o}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 text-2xl text-[var(--ppn-muted)]">Answer on your phones · the phone always shows the question + options</p>
      </>
    ));

  if (state === "audio")
    return wrap(false, (
      <>
        <Kicker>Music / audio round</Kicker>
        <div className="mt-6 flex items-center justify-center gap-4 text-6xl"><span className="animate-pulse" style={{ color: "var(--ppn-brand)" }}>🎵</span><span className="text-3xl text-[var(--ppn-muted)]">Now playing… (host triggers audio)</span></div>
        <h1 className="mt-6 text-7xl font-black">Name the artist</h1>
        <p className="mt-5 text-3xl text-[var(--ppn-muted)]">🔊 Listen carefully — answer on your phones</p>
      </>
    ));

  if (state === "closing")
    return wrap(false, (
      <>
        <h1 className="text-7xl font-black">Thanks for playing!</h1>
        <p className="mt-4 text-3xl" style={{ color: "var(--ppn-brand)" }}>{cb.cta}</p>
        <p className="mt-2 text-2xl text-[var(--ppn-muted)]">Brought to you by {ci.sponsorName}</p>
        <div className="mt-6 w-full max-w-3xl"><VideoSlot url={clientVideoUrl("closing")} aspect="16/9" fallback={<SponsorFeature caption={cb.cta} />} /></div>
        <div className="mt-6"><OfferBadge size="tv" /></div>
      </>
    ));

  // ════════════ Presenter previews of live-capable states (demo data) ════════════

  if (state === "question") return QuestionView({ prompt: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Mercury"], roundSeq: 1, sequence: 1 });
  if (state === "reveal") return RevealView({ correctAnswer: "Mars", explanation: "The Red Planet — its colour comes from iron oxide (rust)." });

  // ── Default: welcome / QR (room-facing start screen) — audience-safe, no host script ──
  return wrap(false, (
    <>
      <Title />
      <div className="mt-4"><OfferBadge size="tv" /></div>
      <div className="mt-7 grid w-full max-w-6xl grid-cols-[1.4fr_1fr] items-center gap-8 text-left">
        <VideoSlot url={clientVideoUrl("intro")} aspect="16/9" fallback={<SponsorFeature caption="Tonight's quiz starts soon" />} />
        <QrCard size={220} />
      </div>
      <p className="mt-8 text-3xl font-semibold text-[var(--ppn-muted)]">Tonight's quiz starts soon — grab a team and scan to join</p>
    </>
  ));
}
