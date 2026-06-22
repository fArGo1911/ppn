/**
 * VideoSlot — a slot/player/fallback for real brewery video assets (external URL or local/hosted MP4).
 * POC capability proof only: NO downloader/scraper/ripping. Rules: no autoplay-with-sound (presenter presses
 * play), always a still-image fallback, never blocks the QR/answer flow, swappable per brewery preset.
 */
import { BrandAssetPreview } from "./brandZones";

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  return m ? m[1] : null;
}
function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

export function VideoSlot({
  url,
  fallbackImage,
  sourceNote,
  aspect = "16/9",
  label,
}: {
  url?: string;
  fallbackImage?: string;
  sourceNote?: string;
  aspect?: string;
  label?: string;
}) {
  // No URL → premium fallback slot (where a brewery clip would go).
  if (!url) {
    return (
      <div>
        <BrandAssetPreview aspect={aspect} image={fallbackImage} label={label ?? "Video slot"}>
          <span className="rounded-full bg-black/50 px-4 py-2 text-white">▶ Brewery video</span>
        </BrandAssetPreview>
        {sourceNote && <p className="mt-1 text-xs text-[var(--ppn-muted)]">{sourceNote}</p>}
      </div>
    );
  }

  const yt = youtubeId(url);
  const vm = vimeoId(url);
  const embed = yt ? `https://www.youtube.com/embed/${yt}` : vm ? `https://player.vimeo.com/video/${vm}` : null;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-[var(--ppn-border)] bg-black" style={{ aspectRatio: aspect }}>
        {embed ? (
          // External embed (no autoplay) — for demo only; swappable per brewery.
          <iframe className="h-full w-full" src={embed} title={label ?? "Brewery video"} allow="picture-in-picture" allowFullScreen />
        ) : (
          // Local/hosted MP4 — controls, NO autoplay, poster = fallback image.
          <video className="h-full w-full" src={url} poster={fallbackImage} controls preload="metadata" playsInline />
        )}
      </div>
      {sourceNote && <p className="mt-1 text-xs text-[var(--ppn-muted)]">{sourceNote}</p>}
    </div>
  );
}
