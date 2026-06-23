/**
 * /setup — Asset reference / slot guide (POC: documentation + slot structure ONLY; NOT an upload/asset manager).
 * A professional operator asset guide: which assets are required vs optional, their size/aspect, where each appears,
 * each one's status (live / preview-only / optional / not built yet), and where to configure/upload it
 * (/config#brand-media). Deep technical maps are collapsed under #advanced-reference. No uploads, no generated
 * graphics, no AI asset creation here.
 */
import type { ReactNode } from "react";
import { DemoShell } from "../components/shells";
import { DEMO_BRAND } from "../demo/brand";
import { anyOverrideActive, overrideStatus, clearClientOverrides } from "../lib/demoStatus";
import { IMAGE_SLOTS, AI_SLOTS, ZONE_MAP } from "../demo/brandAssets";
import { CUE_FAMILIES, AUDIO_CUES } from "../demo/audioCues";

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
const PACK_OPTIONAL = ["Intro / sponsor-bumper / closing video clips", "Per-question picture/video media (not built yet)", "Script & audio cues (operator MP3s, file-based — uploaded in brand & media setup; not generated)"];

// Where assets appear, grouped by UX surface (curated from the slot data — for the operator-readable overview).
const SURFACE_MAP: { surface: string; assets: string[] }[] = [
  { surface: "TV / audience display", assets: ["Brewery logo", "TV hero / campaign background", "TV sponsor slide", "TV lower-third / banner", "Picture/video question media", "Brand colours / theme"] },
  { surface: "Player phone", assets: ["Brewery logo", "Phone banner", "Phone sponsor card", "Picture/video question media", "Brand colours / theme"] },
  { surface: "Host / operator", assets: ["Brewery logo", "Pub + event + sponsor text", "Brand colours / theme"] },
  { surface: "Client presentation", assets: ["Brewery logo", "Campaign hero", "Pub / venue image", "Brand colours / theme"] },
  { surface: "Report / KPI", assets: ["Brewery logo", "Brand colours / theme"] },
  { surface: "Rollout / supporting material", assets: ["Rollout / network graphic"] },
];

export default function BrandAssets() {
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
          <a href="#advanced-reference" className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-3 py-1.5 font-semibold hover:text-[var(--ppn-brand)]">Technical appendix</a>
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
                    <div><span className="text-[var(--ppn-text)]">Media:</span> {["tvHero", "campaignHero", "venue"].includes(s.key) ? "image / GIF / video (renders on the surface)" : s.key === "questionMedia" ? "image or short video (not wired yet)" : "image / GIF (no video on this slot)"}</div>
                    <div><span className="text-[var(--ppn-text)]">Appears:</span> {s.appearsOn.join(" · ")}</div>
                  </dl>
                  {s.notes && <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">{s.notes}</p>}
                  <a href={CONFIG_HREF} className="mt-2 inline-block text-[11px] font-semibold text-[var(--ppn-brand)]">Configure in detailed config →</a>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-xl border border-dashed border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3">
            <p className="text-xs font-semibold text-[var(--ppn-muted)]">Video slots — live on TV</p>
            <ul className="mt-1.5 space-y-1.5">
              {[
                { label: "TV intro video", live: true, where: "TV welcome / intro" },
                { label: "Sponsor bumper video", live: true, where: "TV sponsor slideshow" },
                { label: "Closing video", live: true, where: "TV closing" },
                { label: "Picture / video question media", live: false, where: "question example only" },
              ].map((v) => (
                <li key={v.label} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-1.5 text-[11px] text-[var(--ppn-muted)]">
                  <span className="font-semibold text-[var(--ppn-text)]">{v.label}</span> · 16:9 · MP4 / WebM · cover · host presses play (no autoplay) · appears: {v.where}
                  <span className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase" style={statusTone(v.live ? "live in demo" : "not built yet")}>{v.live ? "live (TV)" : "not built"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[10px] text-[var(--ppn-muted)]">Upload video <span className="font-semibold text-[var(--ppn-text)]">and script/audio cue MP3s</span> in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">brand &amp; media setup</a> — see the audio cue reference below.</p>
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
          <h2 className="mt-10 border-t border-[var(--ppn-border)] pt-6 text-sm font-semibold uppercase tracking-wider text-[var(--ppn-muted)]">Technical appendix</h2>
          <p className="mt-1 text-xs text-[var(--ppn-muted)]">Operator-useful detail only — which field controls each on-screen zone, and the host-script copy. Everything is uploaded/configured in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">brand &amp; media setup</a>.</p>

          <Details title="Branding zone map (which field controls each on-screen zone)">
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

          <Details title="Audio cue families (reference)">
            <p className="text-xs text-[var(--ppn-muted)]">Pub-quiz cue structure — operator-supplied MP3s (file type: MP3 / WAV / M4A / OGG). Reference only; upload &amp; preview in <a href={CONFIG_HREF} className="text-[var(--ppn-brand)]">brand &amp; media setup</a>. The host reads all questions first; answers are revealed later in the answer-review phase.</p>
            <div className="mt-2 space-y-2">
              {CUE_FAMILIES.filter((fam) => AUDIO_CUES.some((c) => c.family === fam.id)).map((fam) => (
                <div key={fam.id} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                  <p className="text-sm font-medium text-[var(--ppn-text)]">{fam.label}</p>
                  <p className="text-[11px] text-[var(--ppn-muted)]">{fam.blurb}</p>
                  <ul className="mt-1 space-y-0.5">
                    {AUDIO_CUES.filter((c) => c.family === fam.id).map((c) => (
                      <li key={c.key} className="flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--ppn-muted)]">
                        <span className="text-[var(--ppn-text)]">{c.label}</span>
                        <span className="rounded-full border border-[var(--ppn-border)] px-1.5 py-0.5 text-[9px] uppercase">{c.status === "live" ? "live (host)" : c.status === "stored-only" ? "stored-only" : "not wired"}</span>
                        <span>· {c.where}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-[11px] text-[var(--ppn-muted)]">Winner cues announce the table/team number, not the entered team name. No upload controls live on this reference page.</p>
            </div>
          </Details>

        </section>
      </div>
    </DemoShell>
  );
}
