/**
 * Carousel / slideshow — POC, config-driven. 2–5 seeded slides with headline/subtitle/CTA + offer/logo overlays,
 * manual prev/next, optional auto-advance, dots. Degrades to a single static slide. No media engine/tracking.
 */
import { useEffect, useState } from "react";
import { DEMO_BRAND, brandInitials } from "../demo/brand";
import type { Slide } from "../demo/media";
import { BrandAssetPreview, OfferBadge } from "./brandZones";

const onBrand = { background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" };

export function Carousel({
  slides,
  aspect = "16/9",
  size = "tv",
  auto = false,
  intervalMs = 4000,
}: {
  slides: Slide[];
  aspect?: string;
  size?: "phone" | "tv" | "presenter";
  auto?: boolean;
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);
  const n = slides.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);

  useEffect(() => {
    if (!auto || n <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), intervalMs);
    return () => clearInterval(t);
  }, [auto, n, intervalMs]);

  if (n === 0) return null;
  const s = slides[i];
  const tv = size === "tv";

  return (
    <div className="relative w-full">
      <BrandAssetPreview aspect={s.aspect ?? aspect} overlay={s.overlay ?? "dark"} image={s.image} alt={s.headline} className="w-full">
        <div className={`max-w-2xl ${tv ? "" : "text-left"}`}>
          {s.logo && (
            <span className={`mb-2 inline-grid place-items-center rounded-lg font-black ${tv ? "h-12 w-12 text-xl" : "h-8 w-8 text-sm"}`} style={onBrand}>
              {brandInitials(DEMO_BRAND.sponsorName)}
            </span>
          )}
          {s.headline && <p className={`font-extrabold text-white drop-shadow ${tv ? "text-5xl" : "text-xl"}`}>{s.headline}</p>}
          {s.subtitle && <p className={`mt-1 text-white/90 drop-shadow ${tv ? "text-2xl" : "text-sm"}`}>{s.subtitle}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {s.offer && <OfferBadge size={tv ? "tv" : "phone"} />}
            {s.cta && <span className={`rounded-full font-semibold ${tv ? "px-4 py-1.5 text-lg" : "px-3 py-1 text-xs"}`} style={onBrand}>{s.cta}</span>}
          </div>
          {s.responsible && <p className={`mt-2 text-white/70 ${tv ? "text-base" : "text-[11px]"}`}>{DEMO_BRAND.responsibleNote}</p>}
        </div>
      </BrandAssetPreview>

      {n > 1 && (
        <>
          <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white">‹</button>
          <button aria-label="Next" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white">›</button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {slides.map((sl, idx) => (
              <button key={sl.id} aria-label={`Slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? "w-5" : "w-2"}`} style={{ background: idx === i ? "var(--ppn-brand)" : "rgba(255,255,255,0.5)" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
