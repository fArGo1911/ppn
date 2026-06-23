/**
 * /setup — Asset reference / slot guide (POC: documentation + slot structure ONLY; NOT an upload/asset manager).
 * A professional operator asset guide: which assets are required vs optional, their size/aspect, where each appears,
 * each one's status (live / preview-only / optional / not built yet), and where to configure/upload it
 * (/config#brand-media). Deep technical maps are collapsed under #advanced-reference. No uploads, no generated
 * graphics, no AI asset creation here.
 */
import type { ReactNode } from "react";
import { DemoShell } from "../components/shells";
import { Carousel } from "../components/Carousel";
import { VideoSlot } from "../components/VideoSlot";
import { DEMO_BRAND } from "../demo/brand";
import { anyOverrideActive, overrideStatus, clearClientOverrides } from "../lib/demoStatus";
import { IMAGE_SLOTS, TEXT_SLOTS, AI_SLOTS, VIDEO_SLOTS, ZONE_MAP, ASSET_USAGE, TRANSPARENCY } from "../demo/brandAssets";
import { MEDIA_ZONES, CAROUSEL_GUIDANCE, COPY_SLOTS, preEventSlides, VIDEO_GUIDANCE, VIDEO_RULES } from "../demo/media";

const CONFIG_HREF = "/config#brand-media";

/** Collapsible advanced block — keeps deep technical reference secondary (closed by default). */
function Details({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="mt-2 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)]">
      <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold text-[var(--ppn-text)]">{title}</summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

/** Tiny proportional aspect cue (a neutral functional chip, NOT a picture / not a giant empty box). */
function AspectChip({ aspect }: { aspect: string }) {
  const [w, h] = aspect.split("/").map(Number);
  const ratio = w && h ? w / h : 1;
  const height = 26;
  const width = Math.min(76, Math.max(16, Math.round(height * ratio)));
  return (
    <span className="inline-grid shrink-0 place-items-center rounded border border-[var(--ppn-border)] bg-[var(--ppn-bg)] text-[8px] font-medium text-[var(--ppn-muted)]" style={{ width, height }} aria-hidden>{aspect}</span>
  );
}

// Per-slot status — how each asset currently behaves in the POC. Truthful: not everything is live in gameplay.
const SLOT_STATUS: Record<string, "live in demo" | "preview-only" | "optional" | "not built yet"> = {
  logo: "live in demo", tvHero: "live in demo", tvSponsorSlide: "live in demo", campaignHero: "live in demo",
  tvLowerThird: "preview-only", phoneCard: "preview-only", phoneBanner: "preview-only", venue: "preview-only",
  rollout: "optional", questionMedia: "not built yet",
};
function statusTone(s: string): React.CSSProperties {
  if (s === "live in demo") return { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" };
  if (s === "not built yet") return { background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" };
  return { background: "var(--ppn-bg)", color: "var(--ppn-muted)" };
}

// Asset groups for the minimum-pack overview (required / recommended / optional).
const PACK_REQUIRED = ["Brewery / client logo", "TV hero / campaign background", "Sponsor / offer card", "Campaign / offer text", "Brand colours"];
const PACK_RECOMMENDED = ["Player phone banner", "Venue / background image", "Lower-third / offer strip", "Rollout / network graphic (if used)", "Tagline + responsible note"];
const PACK_OPTIONAL = ["Intro / sponsor-bumper / closing video clips", "Per-question picture/video media (not built yet)", "Audio / MP3 voice (file-based, not generated)"];

// Where assets appear, grouped by UX surface (curated from the slot data — for the operator-readable overview).
const SURFACE_MAP: { surface: string; assets: string[] }[] = [
  { surface: "TV / audience display", assets: ["Brewery logo", "TV hero / campaign background", "TV sponsor slide", "TV lower-third / banner", "Picture/video question media", "Brand colours / theme"] },
  { surface: "Player phone", assets: ["Brewery logo", "Phone banner", "Phone sponsor card", "Picture/video question media", "Brand colours / theme"] },
  { surface: "Host / operator", assets: ["Brewery logo", "Pub + event + sponsor text", "Brand colours / theme"] },
  { surface: "Client presentation", assets: ["Brewery logo", "Campaign hero", "Pub / venue image", "Brand colours / theme"] },
  { surface: "Report / KPI", assets: ["Brewery logo", "Brand colours / theme"] },
  { surface: "Rollout / supporting material", assets: ["Rollout / network graphic"] },
];

const AUDIO_FILES = [
  "event-intro.mp3", "round-intro.mp3", "sponsored-round-intro.mp3", "question-readout.mp3", "answer-reveal.mp3",
  "winner.mp3", "question-chime.mp3", "sponsor-message.mp3", "question-01.mp3 … question-10.mp3", "reveal-01.mp3 … reveal-10.mp3",
];

export default function BrandAssets() {
  const img = DEMO_BRAND.images;
  const suppliedCount = Object.values(img).filter(Boolean).length;
  const fileType = (key: string) => (key === "questionMedia" ? "Image (PNG/JPG) or short 16:9 MP4 URL" : "PNG / SVG / JPG (transparent where possible)");
  return (
    <DemoShell>
      <div className="mx-auto max-w-5xl px-5 py-8">
        {/* ── Top summary ── */}
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>Operator · asset reference</p>
        <h1 className="mt-2 text-3xl font-extrabold">Asset reference / slot guide</h1>
        <p className="mt-2 max-w-2xl text-[var(--ppn-muted)]">
          What brewery assets to gather, their sizes, where each appears, and whether each is live. This page does not set or upload anything — it is a slot guide only. Actual brand/media setup and upload happen in <a href={CONFIG_HREF} className="font-semibold text-[var(--ppn-brand)]">detailed config / brand &amp; media setup</a>.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a href={CONFIG_HREF} className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Configure / upload assets in detailed config →</a>
          <span className="rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>{DEMO_BRAND.sponsorName} · {DEMO_BRAND.market}</span>
          <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2.5 py-1 text-xs">Client assets: <span className="font-semibold" style={{ color: overrideStatus().asset ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{overrideStatus().asset ? "custom" : "default"}</span></span>
          <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2.5 py-1 text-xs">Theme: <span className="font-semibold" style={{ color: overrideStatus().theme ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{overrideStatus().theme ? "custom" : "default"}</span></span>
          {anyOverrideActive() && <button onClick={() => { clearClientOverrides(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold">Clear client overrides</button>}
        </div>

        <nav aria-label="Asset reference sections" className="mt-4 flex flex-wrap gap-2 text-xs">
          <a href="#minimum-pack" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Minimum asset pack</a>
          <a href="#asset-slots" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Asset slots</a>
          <a href="#where-assets-appear" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Where assets appear</a>
          <a href="#advanced-reference" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Advanced reference</a>
        </nav>

        {/* ── #minimum-pack ── */}
        <section id="minimum-pack" className="scroll-mt-4">
          <h2 className="mt-7 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Minimum asset pack</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">What to gather for a credible brewery / client demo — required first, then polish.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 35%, var(--ppn-border))" }}>
              <p className="text-sm font-semibold">Required for a credible demo</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{PACK_REQUIRED.map((t) => <li key={t}>✓ {t}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-sm font-semibold">Recommended polish</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{PACK_RECOMMENDED.map((t) => <li key={t}>＋ {t}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
              <p className="text-sm font-semibold">Optional / later</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{PACK_OPTIONAL.map((t) => <li key={t}>· {t}</li>)}</ul>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Upload / file storage, approvals and self-service are not on this page — assets are set in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">detailed config</a>.</p>
        </section>

        {/* ── #asset-slots — compact, scannable cards (spec-first, no giant boxes) ── */}
        <section id="asset-slots" className="scroll-mt-4">
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Asset slots</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">Size, aspect ratio, file type, where it appears and current status for each slot. Configure them all in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">detailed config / brand &amp; media setup</a>.</p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_SLOTS.map((s) => {
              const status = SLOT_STATUS[s.key] ?? "optional";
              return (
                <div key={s.key} className="flex flex-col rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <AspectChip aspect={s.aspect} />
                      <p className="truncate text-sm font-semibold">{s.label}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase" style={statusTone(status)}>{status}</span>
                  </div>
                  <dl className="mt-2 space-y-0.5 text-[11px] text-[var(--ppn-muted)]">
                    <div><span className="text-[var(--ppn-text)]">Size:</span> {s.recommended}</div>
                    <div><span className="text-[var(--ppn-text)]">Aspect:</span> {s.aspect}</div>
                    <div><span className="text-[var(--ppn-text)]">Type:</span> {fileType(s.key)}</div>
                    <div><span className="text-[var(--ppn-text)]">Appears:</span> {s.appearsOn.join(" · ")}</div>
                  </dl>
                  {s.notes && <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">{s.notes}</p>}
                  <a href={CONFIG_HREF} className="mt-2 inline-block text-[11px] font-semibold text-[var(--ppn-brand)]">Configure in detailed config →</a>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-xl border border-dashed border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
            <p className="text-xs font-semibold text-[var(--ppn-muted)]">Video slots (optional)</p>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {VIDEO_SLOTS.map((v) => (
                <li key={v.key} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-1.5 text-[11px] text-[var(--ppn-muted)]">
                  <span className="font-semibold text-[var(--ppn-text)]">{v.label}</span> · 16:9 MP4 URL / embed · optional · {v.notes}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── #where-assets-appear ── */}
        <section id="where-assets-appear" className="scroll-mt-4">
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Where assets appear</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">By UX surface — which prepared assets show up where.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SURFACE_MAP.map((s) => (
              <div key={s.surface} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                <p className="text-sm font-semibold">{s.surface}</p>
                <ul className="mt-1.5 space-y-1 text-[11px] text-[var(--ppn-muted)]">
                  {s.assets.map((a) => <li key={a}>· {a}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── #advanced-reference — deep technical maps, collapsed by default (secondary) ── */}
        <section id="advanced-reference" className="scroll-mt-4">
          <h2 className="mt-10 border-t border-[var(--ppn-border)] pt-6 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Advanced reference</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">Deep slot/zone maps, copy slots, host-script reference text and per-slot video detail. Expand only if you need it — not required for a basic demo.</p>

          <Details title="How assets get into the demo (manual paths / storage-backed)">
            <p className="text-xs text-[var(--ppn-muted)]">Place files under <span className="font-mono">public/demo/assets/&lt;preset&gt;/</span> and paste the paths in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">detailed config → Quick manual paths</a> (no upload needed), or upload client files in <span className="font-mono">detailed config → Upload asset pack</span> (PPN storage + registry; needs the local PPN database). Uploads happen in detailed config, not here. Blank fields keep the preset default.</p>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Not built yet: approvals, image editing/cropping, brewery self-service, CDN, customer portal.</p>
          </Details>

          <Details title="Demo asset readiness">
            <ul className="space-y-1 text-xs text-[var(--ppn-muted)]">
              <li><span style={{ color: suppliedCount >= 1 ? "var(--ppn-success)" : "var(--ppn-warning)" }}>●</span> Visual asset pack: <span className="text-[var(--ppn-text)]">{suppliedCount} supplied</span> — no bundled pictures; add the client's logo/hero/etc. in detailed config (until then, surfaces use brand initials + a neutral panel).</li>
              <li><span style={{ color: "var(--ppn-warning)" }}>●</span> Audio: <span className="text-[var(--ppn-text)]">file-based playback</span> — MP3s expected under <span className="font-mono">public/demo/audio/{DEMO_BRAND.audio.audioBaseDir?.split("/").pop()}/</span>; missing files fall back to <span className="text-[var(--ppn-text)]">script-only</span> (honest).</li>
              <li>Expected MP3s: <span className="font-mono text-[10px]">{AUDIO_FILES.join(" · ")}</span></li>
              <li className="text-[var(--ppn-muted)]">File-based playback only — <span className="text-[var(--ppn-text)]">no audio or generated asset is created here</span>. Fictional demo brewery.</li>
            </ul>
          </Details>

          <Details title="Dynamic text & copy slots">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[...TEXT_SLOTS, ...COPY_SLOTS].map((t) => (
                <li key={t} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-2 text-xs text-[var(--ppn-text)]">{t}</li>
              ))}
            </ul>
          </Details>

          <Details title="Host script reference (text only)">
            <p className="text-xs text-[var(--ppn-muted)]">Pre-written host-narration text from the active preset, shown so you can review the spoken copy. Reference text only; no audio or generated asset is created here.</p>
            <div className="mt-2 space-y-2">
              {AI_SLOTS.map((a) => (
                <div key={a.key} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                  <p className="text-sm font-medium text-[var(--ppn-text)]">{a.label}</p>
                  <p className="mt-1 text-sm text-[var(--ppn-muted)]">“{DEMO_BRAND.ai[a.key as keyof typeof DEMO_BRAND.ai]}”</p>
                </div>
              ))}
              <p className="text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.responsibleNote}</p>
            </div>
          </Details>

          <Details title="Brand colour tokens (active preset)">
            <div className="flex flex-wrap gap-3">
              {Object.entries(DEMO_BRAND.colours).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5">
                  <span className="h-6 w-6 rounded border border-[var(--ppn-border)]" style={{ background: v }} />
                  <span className="text-xs"><span className="text-[var(--ppn-text)]">{k}</span> <span className="text-[var(--ppn-muted)]">{v}</span></span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Switch preset / colours in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">detailed config</a> — theme applies across player / host / TV / presenter with readability guardrails.</p>
          </Details>

          <Details title="Branding zone map (what appears where + which field controls it)">
            <div className="grid gap-3 lg:grid-cols-2">
              {ZONE_MAP.map((s) => (
                <div key={s.surface} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                  <p className="font-semibold">{s.surface}</p>
                  <ul className="mt-1 space-y-1">
                    {s.zones.map((z) => (
                      <li key={z.zone} className="text-xs">
                        <span className="font-mono" style={{ color: DEMO_BRAND.primary }}>{z.zone}</span>
                        <span className="text-[var(--ppn-text)]"> — {z.shows}</span>
                        <span className="text-[var(--ppn-muted)]"> · {z.field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Details>

          <Details title="Asset usage map">
            <ul className="grid gap-2 sm:grid-cols-2">
              {ASSET_USAGE.map((a) => (
                <li key={a.asset} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-2 text-sm">
                  <span className="font-medium text-[var(--ppn-text)]">{a.asset}</span>
                  <span className="text-[var(--ppn-muted)]"> → {a.appears}</span>
                </li>
              ))}
            </ul>
          </Details>

          <Details title="Transparency & overlay rules">
            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-[var(--ppn-text)]">Transparent preferred:</span> <span className="text-[var(--ppn-muted)]">{TRANSPARENCY.transparentPreferred.join(" · ")}</span></p>
              <p><span className="font-medium text-[var(--ppn-text)]">Non-transparent (photos/backgrounds):</span> <span className="text-[var(--ppn-muted)]">{TRANSPARENCY.nonTransparent.join(" · ")}</span></p>
              <p className="text-[var(--ppn-muted)]">{TRANSPARENCY.overlaySafe}</p>
            </div>
          </Details>

          <Details title="Media zones table">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[var(--ppn-muted)]">
                  <tr>{["zone id", "surface", "state", "allowed", "aspect", "sponsor", "+action"].map((h) => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {MEDIA_ZONES.map((z) => (
                    <tr key={z.id} className="border-t border-[var(--ppn-border)]">
                      <td className="py-1.5 pr-3 font-mono" style={{ color: DEMO_BRAND.primary }}>{z.id}</td>
                      <td className="py-1.5 pr-3">{z.surface}</td>
                      <td className="py-1.5 pr-3">{z.screenState}</td>
                      <td className="py-1.5 pr-3 text-[var(--ppn-muted)]">{z.allowed.join(", ")}</td>
                      <td className="py-1.5 pr-3">{z.aspect}</td>
                      <td className="py-1.5 pr-3">{z.sponsorAllowed ? "✓" : "—"}</td>
                      <td className="py-1.5 pr-3">{z.playerActionVisible ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Details>

          <Details title="Carousels / slideshows (live example + guidance)">
            <div className="max-w-xl"><Carousel slides={preEventSlides(DEMO_BRAND)} size="presenter" aspect="16/9" /></div>
            <ul className="mt-3 grid gap-1 text-xs text-[var(--ppn-muted)] sm:grid-cols-2">
              {CAROUSEL_GUIDANCE.map((g) => <li key={g}>· {g}</li>)}
            </ul>
          </Details>

          <Details title="Video assets & guidance (real URL or local MP4 — slot/player/fallback)">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <VideoSlot url={DEMO_BRAND.video.videoQuestionUrl} sourceType={DEMO_BRAND.video.videoQuestionSourceType} fallbackImage={DEMO_BRAND.video.fallbackImage} sourceNote={DEMO_BRAND.video.sourceNote} aspect="16/9" label="external MP4 (plays)" />
                <VideoSlot url={DEMO_BRAND.video.sponsorBumperVideoUrl} sourceType={DEMO_BRAND.video.sponsorBumperVideoSourceType} fallbackImage={DEMO_BRAND.video.fallbackImage} sourceNote={DEMO_BRAND.video.sourceNote} aspect="16/9" label="local (missing → fallback)" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-[var(--ppn-text)]">Per-slot source type</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--ppn-muted)]">
                  {([
                    ["TV intro", DEMO_BRAND.video.tvIntroVideoSourceType, DEMO_BRAND.video.tvIntroVideoUrl],
                    ["Sponsor bumper", DEMO_BRAND.video.sponsorBumperVideoSourceType, DEMO_BRAND.video.sponsorBumperVideoUrl],
                    ["Video question", DEMO_BRAND.video.videoQuestionSourceType, DEMO_BRAND.video.videoQuestionUrl],
                    ["Closing", DEMO_BRAND.video.closingVideoSourceType, DEMO_BRAND.video.closingVideoUrl],
                  ] as [string, string | undefined, string | undefined][]).map(([name, st, url]) => (
                    <li key={name}>
                      <span className="text-[var(--ppn-text)]">{name}</span> · <span className="font-mono" style={{ color: DEMO_BRAND.primary }}>{st ?? "—"}</span> · {url ? "set" : "empty → fallback"}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 font-medium text-[var(--ppn-text)]">Guidance</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--ppn-muted)]">{VIDEO_GUIDANCE.map((g) => <li key={g}>· {g}</li>)}</ul>
                <p className="mt-3 font-medium text-[var(--ppn-text)]">Playback rules</p>
                <ul className="mt-1 space-y-0.5 text-xs text-[var(--ppn-muted)]">{VIDEO_RULES.map((r) => <li key={r}>· {r}</li>)}</ul>
              </div>
            </div>
          </Details>
        </section>
      </div>
    </DemoShell>
  );
}
