/**
 * /setup — Brand asset specification (POC: documentation + slot structure, NOT an upload/asset manager).
 * Shows a PPN operator exactly what brewery assets to prepare, at what sizes/aspect ratios, where each appears,
 * the dynamic text slots, the AI voice/script slots, and optional video. Premium placeholders imply real asset
 * space (no low-res-looking boxes).
 */
import { DemoShell } from "../components/shells";
import { BrandAssetPreview } from "../components/brandZones";
import { Carousel } from "../components/Carousel";
import { VideoSlot } from "../components/VideoSlot";
import { DEMO_BRAND } from "../demo/brand";
import { IMAGE_SLOTS, TEXT_SLOTS, AI_SLOTS, VIDEO_SLOTS, ZONE_MAP, ASSET_USAGE, TRANSPARENCY } from "../demo/brandAssets";
import { MEDIA_ZONES, CAROUSEL_GUIDANCE, COPY_SLOTS, preEventSlides, VIDEO_GUIDANCE, VIDEO_RULES } from "../demo/media";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">{title}</h2>
      {children}
    </section>
  );
}

export default function BrandAssets() {
  return (
    <DemoShell>
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>Operator · asset prep</p>
        <h1 className="mt-2 text-3xl font-extrabold">Prepare a brewery demo — asset checklist</h1>
        <p className="mt-2 max-w-2xl text-[var(--ppn-muted)]">
          What to gather before a brewery demo, and where each asset appears. Paste paths in <span className="font-mono">/config → Brewery asset pack</span>.
          <span className="text-[var(--ppn-muted)]"> POC: URL/path only — no upload or storage yet.</span>
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <p className="text-sm font-semibold">Minimum asset pack</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Logo (or use initials)", "Brand colours (preset or /config theme)", "Sponsor name + offer copy", "One hero / campaign image"].map((t) => <li key={t}>☐ {t}</li>)}</ul>
          </div>
          <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
            <p className="text-sm font-semibold">Recommended asset pack</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Sponsor slide image (TV)", "Phone sponsor card", "Lower-third / offer strip", "Venue image", "Tagline + responsible note"].map((t) => <li key={t}>☐ {t}</li>)}</ul>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
            <p className="text-sm font-semibold">Optional rich media</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Intro video", "Sponsor bumper video", "Closing video", "Per-question picture/video"].map((t) => <li key={t}>☐ {t}</li>)}</ul>
          </div>
          <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
            <p className="text-sm font-semibold">Not built yet (POC)</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Upload / file storage", "Asset CMS / approval workflow", "Real video hosting", "AI voice MP3s (next slice)"].map((t) => <li key={t}>— {t}</li>)}</ul>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
          <p className="font-semibold">How to add assets in this POC</p>
          <p className="mt-1 text-[var(--ppn-muted)]">Place files under <span className="font-mono">public/demo/assets/&lt;preset&gt;/</span> (e.g. <span className="font-mono">/demo/assets/northgate/logo.png</span>) and paste the paths in <span className="font-mono">/config → Brewery asset pack</span>. Blank fields keep the preset default. The slot specs below show exact sizes and where each appears.</p>
        </div>

        <Section title="Image assets">
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_SLOTS.map((s) => (
              <div key={s.key}>
                <BrandAssetPreview aspect={s.aspect} label={`${s.aspect} · ${s.recommended}`} />
                <p className="mt-1.5 font-medium">{s.label}</p>
                <p className="text-xs text-[var(--ppn-muted)]">Appears on: {s.appearsOn.join(" · ")}</p>
                {s.notes && <p className="text-xs text-[var(--ppn-muted)]">{s.notes}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Dynamic text">
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEXT_SLOTS.map((t) => (
              <li key={t} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2 text-sm text-[var(--ppn-text)]">{t}</li>
            ))}
          </ul>
        </Section>

        <Section title="AI host scripts (planning — voiced in the AI slice)">
          <div className="mt-3 space-y-2">
            {AI_SLOTS.map((a) => (
              <div key={a.key} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                <p className="text-sm font-medium text-[var(--ppn-text)]">{a.label}</p>
                <p className="mt-1 text-sm text-[var(--ppn-muted)]">“{DEMO_BRAND.ai[a.key as keyof typeof DEMO_BRAND.ai]}”</p>
              </div>
            ))}
            <p className="text-xs text-[var(--ppn-muted)]">{DEMO_BRAND.responsibleNote}</p>
          </div>
        </Section>

        <Section title="Video (optional for POC)">
          <ul className="mt-3 flex flex-wrap gap-2">
            {VIDEO_SLOTS.map((v) => (
              <li key={v.key} className="rounded-lg border border-dashed border-[var(--ppn-border)] px-3 py-2 text-sm text-[var(--ppn-muted)]">
                {v.label} <span className="text-[var(--ppn-muted)]">— {v.notes}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Brand colour tokens (active preset — re-skins every surface)">
          <div className="mt-3 flex flex-wrap gap-3">
            {Object.entries(DEMO_BRAND.colours).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2 py-1.5">
                <span className="h-6 w-6 rounded border border-[var(--ppn-border)]" style={{ background: v }} />
                <span className="text-xs"><span className="text-[var(--ppn-text)]">{k}</span> <span className="text-[var(--ppn-muted)]">{v}</span></span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--ppn-muted)]">Switch preset at <span className="font-mono">/config</span> — theme applies across player / host / TV / presenter with readability guardrails.</p>
        </Section>

        <Section title="Branding zone map (what appears where + which field controls it)">
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {ZONE_MAP.map((s) => (
              <div key={s.surface} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
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
        </Section>

        <Section title="Asset usage map">
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {ASSET_USAGE.map((a) => (
              <li key={a.asset} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-2 text-sm">
                <span className="font-medium text-[var(--ppn-text)]">{a.asset}</span>
                <span className="text-[var(--ppn-muted)]"> → {a.appears}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Transparency & overlay rules">
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="font-medium text-[var(--ppn-text)]">Transparent preferred:</span> <span className="text-[var(--ppn-muted)]">{TRANSPARENCY.transparentPreferred.join(" · ")}</span></p>
            <p><span className="font-medium text-[var(--ppn-text)]">Non-transparent (photos/backgrounds):</span> <span className="text-[var(--ppn-muted)]">{TRANSPARENCY.nonTransparent.join(" · ")}</span></p>
            <p className="text-[var(--ppn-muted)]">{TRANSPARENCY.overlaySafe}</p>
          </div>
        </Section>

        <Section title="Media zones (single image · carousel · slideshow · video · text)">
          <div className="mt-3 overflow-x-auto">
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
        </Section>

        <Section title="Carousels / slideshows (live example + guidance)">
          <div className="mt-3 max-w-xl"><Carousel slides={preEventSlides(DEMO_BRAND)} size="presenter" aspect="16/9" /></div>
          <ul className="mt-3 grid gap-1 text-xs text-[var(--ppn-muted)] sm:grid-cols-2">
            {CAROUSEL_GUIDANCE.map((g) => <li key={g}>· {g}</li>)}
          </ul>
        </Section>

        <Section title="More dynamic copy slots">
          <ul className="mt-3 flex flex-wrap gap-2">
            {COPY_SLOTS.map((c) => <li key={c} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 text-sm text-[var(--ppn-text)]">{c}</li>)}
          </ul>
        </Section>

        <Section title="Video assets (real URL or local MP4 — slot/player/fallback, no downloader)">
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
        </Section>
      </div>
    </DemoShell>
  );
}
