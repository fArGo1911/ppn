/**
 * /setup — Asset reference / slot guide (POC: documentation + slot structure ONLY; NOT an upload/asset manager).
 * Tells a PPN operator what brewery assets to prepare, at what sizes/aspect ratios, where each appears, and whether
 * each is live / preview-only / optional / not built yet. Actual setup + upload stays in /config#brand-media.
 * Top = the practical guide (minimum pack · asset slots · where assets appear); deep technical maps sit lower
 * under #advanced-reference. No uploads, no generated graphics, no AI asset creation here.
 */
import { DemoShell } from "../components/shells";
import { Carousel } from "../components/Carousel";
import { VideoSlot } from "../components/VideoSlot";
import { DEMO_BRAND } from "../demo/brand";
import { anyOverrideActive, overrideStatus, clearClientOverrides } from "../lib/demoStatus";
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

/** Plain, honest spec placeholder — a bordered slot labelled with size/aspect. NOT a decorative/generated picture:
 * the operator supplies real brewery assets in /config#brand-media; here we only show the slot spec. */
function SpecSlot({ aspect, label }: { aspect: string; label: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 text-center" style={{ aspectRatio: aspect }}>
      <span className="text-[10px] font-medium text-[var(--ppn-muted)]">Asset slot · {label}</span>
    </div>
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
  const visualCount = Object.values(img).filter(Boolean).length;
  const isVideoType = (key: string) => key === "questionMedia";
  return (
    <DemoShell>
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>Operator · asset reference</p>
        <h1 className="mt-2 text-3xl font-extrabold">Asset reference / slot guide</h1>
        <p className="mt-2 max-w-2xl text-[var(--ppn-muted)]">
          A reference for what brewery assets to gather, their sizes, and which screen each appears on. This page does not set or upload anything — it is a slot guide only. Actual setup + upload stays in <span className="font-semibold text-[var(--ppn-text)]">detailed config / brand &amp; media setup</span>.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 bg-[var(--ppn-surface)] p-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
          <p className="text-[var(--ppn-muted)]">To actually set the brand or upload assets, use <span className="font-semibold text-[var(--ppn-text)]">Detailed config / brand &amp; media setup</span>.</p>
          <a href="/config#brand-media" className="shrink-0 rounded-lg px-3 py-1.5 font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Open brand &amp; media setup →</a>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-xs">
          <span className="rounded-full px-2 py-1 font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>{DEMO_BRAND.sponsorName} · {DEMO_BRAND.market}</span>
          <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Client assets: <span className="font-semibold" style={{ color: overrideStatus().asset ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{overrideStatus().asset ? "custom" : "default"}</span></span>
          <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Theme: <span className="font-semibold" style={{ color: overrideStatus().theme ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{overrideStatus().theme ? "custom" : "default"}</span></span>
          {anyOverrideActive() && <button onClick={() => { clearClientOverrides(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1 font-semibold">Clear client overrides</button>}
        </div>

        {/* On this page — stable anchors */}
        <nav aria-label="Asset reference sections" className="mt-4 flex flex-wrap gap-2 text-xs">
          <a href="#minimum-pack" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Minimum asset pack</a>
          <a href="#asset-slots" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Asset slots</a>
          <a href="#where-assets-appear" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Where assets appear</a>
          <a href="#advanced-reference" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Advanced reference</a>
        </nav>

        {/* ── #minimum-pack ───────────────────────────────────────────────────────────── */}
        <section id="minimum-pack" className="scroll-mt-4">
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Minimum asset pack</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">The smallest set for a credible brewery / client demo. Everything else is optional polish.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
              <p className="text-sm font-semibold">Minimum (credible demo)</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Brewery / client logo (or use initials)", "TV welcome / hero image", "Brand colours (preset or detailed-config theme)", "Sponsor name + offer copy"].map((t) => <li key={t}>☐ {t}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
              <p className="text-sm font-semibold">Recommended (more polished)</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Sponsor / offer card (TV)", "Player phone header image or brand banner", "Lower-third / offer strip", "Venue / background image", "Tagline + responsible note"].map((t) => <li key={t}>☐ {t}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
              <p className="text-sm font-semibold">Optional rich media</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Intro video", "Sponsor bumper video", "Closing video", "Per-question picture/video (slot referenced, not built yet)"].map((t) => <li key={t}>☐ {t}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-4">
              <p className="text-sm font-semibold">Not built yet (POC)</p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--ppn-muted)]">{["Upload / file storage on this page", "Asset approval workflow", "Real video hosting", "Voice MP3s (file-based playback only — not generated)"].map((t) => <li key={t}>— {t}</li>)}</ul>
            </div>
          </div>
        </section>

        {/* ── #asset-slots ────────────────────────────────────────────────────────────── */}
        <section id="asset-slots" className="scroll-mt-4">
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Asset slots</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">Each slot: recommended size, aspect ratio, file type, where it appears, current status, and where to configure it. Configure them all in <a href="/config#brand-media" className="text-[var(--ppn-brand)]">detailed config / brand &amp; media setup</a>.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_SLOTS.map((s) => {
              const status = SLOT_STATUS[s.key] ?? "optional";
              return (
                <div key={s.key} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
                  <SpecSlot aspect={s.aspect} label={`${s.aspect} · ${s.recommended}`} />
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{s.label}</p>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase" style={statusTone(status)}>{status}</span>
                  </div>
                  <dl className="mt-1.5 space-y-0.5 text-[11px] text-[var(--ppn-muted)]">
                    <div><span className="text-[var(--ppn-text)]">Size:</span> {s.recommended}</div>
                    <div><span className="text-[var(--ppn-text)]">Aspect:</span> {s.aspect}</div>
                    <div><span className="text-[var(--ppn-text)]">Type:</span> {isVideoType(s.key) ? "Image (PNG/JPG) or short 16:9 MP4 URL" : "PNG / SVG / JPG"}</div>
                    <div><span className="text-[var(--ppn-text)]">Appears:</span> {s.appearsOn.join(" · ")}</div>
                    <div><span className="text-[var(--ppn-text)]">Configure:</span> <a href="/config#brand-media" className="text-[var(--ppn-brand)]">detailed config</a></div>
                  </dl>
                  {s.notes && <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">{s.notes}</p>}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs font-semibold text-[var(--ppn-muted)]">Video slots (optional)</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {VIDEO_SLOTS.map((v) => (
              <li key={v.key} className="rounded-lg border border-dashed border-[var(--ppn-border)] px-3 py-2 text-xs text-[var(--ppn-muted)]">
                <span className="font-semibold text-[var(--ppn-text)]">{v.label}</span> — 16:9 MP4 URL / embed · optional · {v.notes}
              </li>
            ))}
          </ul>
        </section>

        {/* ── #where-assets-appear ──────────────────────────────────────────────────────── */}
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

        {/* ── #advanced-reference — deep technical maps, secondary ──────────────────────── */}
        <section id="advanced-reference" className="scroll-mt-4">
          <h2 className="mt-10 border-t border-[var(--ppn-border)] pt-6 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Advanced reference</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">Deep slot/zone maps, copy slots, host-script reference and per-slot video detail. Reference material — not needed for a basic demo.</p>

          <div className="mt-3 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
            <p className="font-semibold">How to add assets in this POC</p>
            <p className="mt-1 text-[var(--ppn-muted)]">Place files under <span className="font-mono">public/demo/assets/&lt;preset&gt;/</span> (e.g. <span className="font-mono">/demo/assets/northgate/logo.png</span>) and paste the paths in <span className="font-mono">detailed config → Brewery asset pack</span>. Blank fields keep the preset default. (Uploads happen in detailed config, not here.)</p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-sm">
              <p className="font-semibold">POC manual path mode</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">Paste paths or URLs in <span className="font-mono">detailed config → Quick manual paths</span>. Quickest for a controlled demo; no upload needed.</p>
            </div>
            <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-3 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
              <p className="font-semibold">Beta storage-backed mode</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">Upload client files in <span className="font-mono">detailed config → Upload asset pack</span> → PPN storage + asset registry. Needs the local PPN database running.</p>
            </div>
            <div className="rounded-xl border border-dashed border-[var(--ppn-border)] p-3 text-sm">
              <p className="font-semibold">Not built yet</p>
              <p className="mt-1 text-xs text-[var(--ppn-muted)]">Approvals, image editing/cropping, brewery self-service, file transformation/CDN, customer portal.</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border-2 bg-[var(--ppn-surface)] p-4 text-sm" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <p className="font-semibold">Demo asset readiness · {DEMO_BRAND.sponsorName}</p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--ppn-muted)]">
              <li><span style={{ color: visualCount >= 6 ? "var(--ppn-success)" : "var(--ppn-warning)" }}>●</span> Visual asset pack: <span className="text-[var(--ppn-text)]">{visualCount >= 6 ? "present" : "partial"}</span> ({visualCount}/6 image slots wired — fictional in-repo SVGs).</li>
              <li><span style={{ color: "var(--ppn-warning)" }}>●</span> Audio: <span className="text-[var(--ppn-text)]">file-based playback</span> — MP3s expected under <span className="font-mono">public/demo/audio/{DEMO_BRAND.audio.audioBaseDir?.split("/").pop()}/</span>. Missing files fall back to <span className="text-[var(--ppn-text)]">script-only</span> (honest).</li>
              <li>Expected MP3s: <span className="font-mono text-[10px]">{AUDIO_FILES.join(" · ")}</span></li>
              <li>Scripts to record: <span className="font-mono">docs/demo-assets/NORTHGATE_AUDIO_SCRIPT_PACK.md</span>. After dropping MP3s in, re-open <span className="font-mono">/host</span> — the audio cues show "audio ready" instead of "no file".</li>
              <li className="text-[var(--ppn-muted)]">This is file-based playback, <span className="text-[var(--ppn-text)]">not an AI voice generation system</span>. Fictional demo brewery — no real brewery, no production campaign.</li>
            </ul>
          </div>

          <Section title="Image assets (preview + spec)">
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {IMAGE_SLOTS.map((s) => (
                <div key={s.key}>
                  <SpecSlot aspect={s.aspect} label={`${s.aspect} · ${s.recommended}`} />
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

          <Section title="Host scripts — reference text only (no AI-generated assets)">
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Pre-written host-narration text from the active preset, shown so you can review the spoken copy. This is reference text only — nothing is generated here.</p>
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
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Switch preset in <span className="font-mono">detailed config</span> — theme applies across player / host / TV / presenter with readability guardrails.</p>
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
        </section>
      </div>
    </DemoShell>
  );
}
