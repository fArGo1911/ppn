/**
 * VideoSlot — slot/player/fallback for real brewery video assets, by SOURCE TYPE:
 *   "embed"    → YouTube/Vimeo embed (iframe)
 *   "external" → external hosted MP4/WebM (HTML <video>)
 *   "local"    → local MP4/WebM in public/demo/ (HTML <video>)
 * POC capability proof only: NO downloader/scraper/ripping. Rules: no autoplay-with-sound (presenter presses
 * play), always a still-image fallback, never blocks the QR/answer flow, swappable per brewery preset.
 */
import { useState } from "react";
import { BrandAssetPreview } from "./brandZones";

type SourceType = "embed" | "local" | "external";

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
  sourceType,
  fallbackImage,
  sourceNote,
  aspect = "16/9",
  label,
}: {
  url?: string;
  sourceType?: SourceType;
  fallbackImage?: string;
  sourceNote?: string;
  aspect?: string;
  label?: string;
}) {
  const [errored, setErrored] = useState(false);

  const Fallback = (
    <div>
      <BrandAssetPreview aspect={aspect} image={fallbackImage} label={label ?? "Video slot"}>
        <span className="rounded-full bg-black/50 px-4 py-2 text-white">▶ Brewery video</span>
      </BrandAssetPreview>
      {sourceNote && <p className="mt-1 text-xs text-[var(--ppn-muted)]">{sourceNote}</p>}
    </div>
  );

  if (!url || errored) return Fallback;

  const yt = youtubeId(url);
  const vm = vimeoId(url);
  // Embed when the source says so, or when it's clearly a YouTube/Vimeo link.
  const useEmbed = sourceType === "embed" || (sourceType === undefined && (yt || vm));
  const embedSrc = yt ? `https://www.youtube.com/embed/${yt}` : vm ? `https://player.vimeo.com/video/${vm}` : null;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-[var(--ppn-border)] bg-black" style={{ aspectRatio: aspect }}>
        {useEmbed && embedSrc ? (
          <iframe className="h-full w-full" src={embedSrc} title={label ?? "Brewery video"} allow="picture-in-picture" allowFullScreen />
        ) : (
          // local / external MP4|WebM — controls, NO autoplay; poster = fallback; on error → still image.
          <video className="h-full w-full" src={url} poster={fallbackImage} controls preload="metadata" playsInline onError={() => setErrored(true)} />
        )}
      </div>
      <p className="mt-1 text-xs text-[var(--ppn-muted)]">
        {sourceType ? <span className="font-mono">{sourceType}</span> : null}
        {sourceType && sourceNote ? " · " : null}
        {sourceNote}
      </p>
    </div>
  );
}
