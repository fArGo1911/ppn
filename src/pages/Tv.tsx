/**
 * /tv/:sessionId — TV / projector display with MULTIPLE branded states (choose via ?state=, e.g. from the
 * presenter tools): welcome · slideshow · question · pause · reveal · scoreboard · victory · closing.
 * Brewery/pub/event-first, distance-readable. Config-driven placeholders + carousels (no media engine).
 */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { resolveJoinToken, listTeams } from "../lib/ppnApi";
import { DEMO_BRAND } from "../demo/brand";
import { TvShell } from "../components/shells";
import { BrandAssetPreview, OfferBadge, AiAnnouncementSlot } from "../components/brandZones";
import { Carousel } from "../components/Carousel";
import { sponsorSlides, pauseSlides, victorySlides } from "../demo/media";

const BASE = import.meta.env.VITE_PPN_BASE_PATH ?? "/";

export default function Tv() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "DEMO";
  const state = params.get("state") ?? "welcome";
  const joinUrl = `${window.location.origin}${BASE === "/" ? "" : BASE}/play/${token}`;

  const resolveQ = useQuery({ queryKey: ["tv-resolve", token], queryFn: () => resolveJoinToken(token) });
  const session = resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;
  const venue = session?.venueName ?? DEMO_BRAND.pubName;
  const event = session?.eventTitle ?? DEMO_BRAND.eventName;

  const teamsQ = useQuery({
    queryKey: ["tv-teams", session?.sessionId],
    queryFn: () => listTeams(session!.sessionId),
    enabled: !!session && (state === "scoreboard" || state === "victory"),
  });
  const standings = [...(teamsQ.data ?? [])].sort((a, b) => b.score - a.score);
  const winner = standings[0]?.name ?? "The Anchor Regulars";

  // Big pub/event title used across most states.
  const Title = () => (
    <>
      <h1 className="text-7xl font-black leading-none">{venue}</h1>
      <p className="mt-2 text-3xl font-semibold" style={{ color: DEMO_BRAND.primary }}>{event} · {DEMO_BRAND.broughtBy}</p>
    </>
  );

  if (state === "slideshow")
    return <TvShell><div className="w-full max-w-6xl"><Carousel slides={sponsorSlides(DEMO_BRAND)} auto size="tv" /></div></TvShell>;

  if (state === "pause")
    return (
      <TvShell>
        <p className="mb-4 text-3xl font-bold">Back in a moment…</p>
        <div className="w-full max-w-6xl"><Carousel slides={pauseSlides(DEMO_BRAND)} auto size="tv" /></div>
      </TvShell>
    );

  if (state === "question")
    return (
      <TvShell>
        <p className="text-2xl uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>Round 1 · General knowledge</p>
        <h1 className="mt-3 max-w-5xl text-6xl font-black leading-tight">Which planet is known as the Red Planet?</h1>
        <div className="mt-10 grid w-full max-w-5xl grid-cols-2 gap-5 text-3xl">
          {["Mars", "Venus", "Jupiter", "Mercury"].map((o, i) => (
            <div key={o} className="rounded-2xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] py-6">
              <span className="mr-3 font-black" style={{ color: DEMO_BRAND.primary }}>{"ABCD"[i]}</span>{o}
            </div>
          ))}
        </div>
        <p className="mt-8 text-2xl text-[var(--ppn-muted)]">⏱ Answer on your phones</p>
      </TvShell>
    );

  if (state === "reveal")
    return (
      <TvShell>
        <p className="text-2xl uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>Answer reveal</p>
        <h1 className="mt-3 text-7xl font-black">Mars</h1>
        <p className="mt-3 text-2xl text-[var(--ppn-muted)]">The Red Planet — its colour comes from iron oxide (rust).</p>
        <div className="mt-6"><AiAnnouncementSlot scriptKey="answerReveal" size="tv" /></div>
      </TvShell>
    );

  if (state === "scoreboard")
    return (
      <TvShell>
        <Title />
        <div className="mt-8 w-full max-w-3xl space-y-3 text-left">
          {(standings.length ? standings : [{ id: "x", name: "The Anchor Regulars", score: 18 }, { id: "y", name: "Quiz Lightning", score: 15 }]).slice(0, 5).map((t, i) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-6 py-4 text-3xl">
              <span><span className="mr-4 font-black" style={{ color: DEMO_BRAND.primary }}>{i + 1}</span>{t.name}</span>
              <span className="font-bold">{t.score} pts</span>
            </div>
          ))}
        </div>
      </TvShell>
    );

  if (state === "victory")
    return (
      <TvShell>
        <div className="w-full max-w-5xl"><Carousel slides={victorySlides(DEMO_BRAND).map((s) => ({ ...s, subtitle: s.subtitle === "{team}" ? winner : s.subtitle }))} auto size="tv" /></div>
        <div className="mt-6 w-full max-w-5xl"><AiAnnouncementSlot scriptKey="winner" size="tv" /></div>
      </TvShell>
    );

  if (state === "closing")
    return (
      <TvShell>
        <h1 className="text-6xl font-black">Thanks for playing!</h1>
        <p className="mt-3 text-3xl" style={{ color: DEMO_BRAND.primary }}>{DEMO_BRAND.cta}</p>
        <p className="mt-2 text-2xl text-[var(--ppn-muted)]">Brought to you by {DEMO_BRAND.sponsorName}</p>
        <div className="mt-6"><OfferBadge size="tv" /></div>
      </TvShell>
    );

  // Default: welcome / QR
  return (
    <TvShell>
      <Title />
      <div className="mt-8 grid w-full max-w-6xl grid-cols-[1.4fr_1fr] gap-8">
        <BrandAssetPreview aspect="16/9" alt={DEMO_BRAND.heroImageAltText} className="w-full">
          <div className="max-w-lg text-left">
            <p className="text-3xl font-extrabold text-white drop-shadow">{DEMO_BRAND.sponsorName}</p>
            <p className="mt-2 text-xl text-white/90">{DEMO_BRAND.tagline}</p>
            <div className="mt-4"><OfferBadge size="tv" /></div>
          </div>
        </BrandAssetPreview>
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-6">
          <div className="rounded-2xl bg-white p-4 shadow-2xl"><QRCodeSVG value={joinUrl} size={220} bgColor="#ffffff" fgColor="#0f172a" level="M" /></div>
          <p className="text-3xl font-bold">Scan to join</p>
          <p className="text-xl text-[var(--ppn-muted)]">No app · code <span className="font-mono font-bold text-[var(--ppn-text)]">{token}</span></p>
        </div>
      </div>
      <div className="mt-8 w-full max-w-6xl text-left"><AiAnnouncementSlot scriptKey="eventIntro" size="tv" /></div>
    </TvShell>
  );
}
