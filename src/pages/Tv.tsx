/**
 * /tv/:sessionId — TV / projector display foundation. Large-screen-first, readable from a distance.
 * This slice: welcome + pub/event identity + a real join QR + sponsor banner zones, plus placeholders for the
 * future question / scoreboard / winner states. No small controls, no dense text.
 */
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { resolveJoinToken } from "../lib/ppnApi";
import { DEMO_BRAND } from "../demo/brand";
import { TvShell } from "../components/shells";

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
      <h1 className="mt-3 text-7xl font-black leading-none">{session?.eventTitle ?? "PubPlay Quiz Night"}</h1>

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="rounded-3xl bg-white p-6 shadow-2xl">
          <QRCodeSVG value={joinUrl} size={280} bgColor="#ffffff" fgColor="#0f172a" level="M" />
        </div>
        <div>
          <p className="text-4xl font-bold">Scan to join the game</p>
          <p className="mt-2 text-2xl text-slate-400">
            No app — just your phone · code <span className="font-mono font-bold text-slate-200">{token}</span>
          </p>
        </div>
      </div>

      {/* Future-state zones (foundation only) — kept visually reserved so the layout doesn't jump later. */}
      <div className="mt-12 grid w-full max-w-5xl grid-cols-3 gap-4 opacity-40">
        {["Question", "Scoreboard", "Winner"].map((z) => (
          <div key={z} className="rounded-2xl border border-dashed border-white/15 py-8 text-2xl text-slate-500">
            {z}
          </div>
        ))}
      </div>
    </TvShell>
  );
}
