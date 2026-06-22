/**
 * /tv/:sessionId — TV / projector display. Brewery/pub/event-first, readable from a distance.
 * Welcome screen: pub + event identity, a large campaign hero area, a sponsor-identified join QR, and the
 * (planning) AI host intro. Future question/scoreboard/winner zones stay reserved. PPN is subtle (in the shell).
 */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { resolveJoinToken } from "../lib/ppnApi";
import { DEMO_BRAND } from "../demo/brand";
import { TvShell } from "../components/shells";
import { BrandAssetPreview, OfferBadge, AiAnnouncementSlot } from "../components/brandZones";

const BASE = import.meta.env.VITE_PPN_BASE_PATH ?? "/";

export default function Tv() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "DEMO";
  const joinUrl = `${window.location.origin}${BASE === "/" ? "" : BASE}/play/${token}`;

  const resolveQ = useQuery({ queryKey: ["tv-resolve", token], queryFn: () => resolveJoinToken(token) });
  const session = resolveQ.data && resolveQ.data.kind !== "invalid" ? resolveQ.data.session : undefined;

  return (
    <TvShell>
      <p className="text-2xl uppercase tracking-[0.3em]" style={{ color: DEMO_BRAND.primary }}>
        {session?.venueName ?? (resolveQ.isLoading ? "Loading…" : "The Pub")}
      </p>
      <h1 className="mt-2 text-7xl font-black leading-none">{session?.eventTitle ?? "PubPlay Quiz Night"}</h1>

      <div className="mt-8 grid w-full max-w-6xl grid-cols-[1.4fr_1fr] gap-8">
        {/* Large campaign hero/image area (real brewery asset goes here) */}
        <BrandAssetPreview aspect="16/9" className="w-full">
          <div className="max-w-lg text-left">
            <p className="text-3xl font-extrabold text-white drop-shadow">{DEMO_BRAND.sponsorName}</p>
            <p className="mt-2 text-xl text-slate-200">{DEMO_BRAND.tagline}</p>
            <div className="mt-4"><OfferBadge size="tv" /></div>
          </div>
        </BrandAssetPreview>

        {/* Join QR with sponsor/pub/event identity */}
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="rounded-2xl bg-white p-4 shadow-2xl">
            <QRCodeSVG value={joinUrl} size={220} bgColor="#ffffff" fgColor="#0f172a" level="M" />
          </div>
          <p className="text-3xl font-bold">Scan to join</p>
          <p className="text-xl text-slate-400">No app · code <span className="font-mono font-bold text-slate-200">{token}</span></p>
        </div>
      </div>

      {/* AI host intro (planning slot) */}
      <div className="mt-8 w-full max-w-6xl text-left">
        <AiAnnouncementSlot scriptKey="eventIntro" size="tv" />
      </div>

      {/* Reserved future-state zones */}
      <div className="mt-6 grid w-full max-w-6xl grid-cols-3 gap-4 opacity-40">
        {["Question", "Scoreboard", "Winner"].map((z) => (
          <div key={z} className="rounded-2xl border border-dashed border-white/15 py-5 text-xl text-slate-500">{z}</div>
        ))}
      </div>
    </TvShell>
  );
}
