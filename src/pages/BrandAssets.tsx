/**
 * /setup — Brand asset specification (POC: documentation + slot structure, NOT an upload/asset manager).
 * Shows a PPN operator exactly what brewery assets to prepare, at what sizes/aspect ratios, where each appears,
 * the dynamic text slots, the AI voice/script slots, and optional video. Premium placeholders imply real asset
 * space (no low-res-looking boxes).
 */
import { DemoShell } from "../components/shells";
import { BrandAssetPreview } from "../components/brandZones";
import { DEMO_BRAND } from "../demo/brand";
import { IMAGE_SLOTS, TEXT_SLOTS, AI_SLOTS, VIDEO_SLOTS, ZONE_MAP, ASSET_USAGE, TRANSPARENCY } from "../demo/brandAssets";

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
        <p className="text-sm uppercase tracking-widest" style={{ color: DEMO_BRAND.primary }}>Guided demo · brand assets</p>
        <h1 className="mt-2 text-3xl font-extrabold">Prepare a brewery-specific demo</h1>
        <p className="mt-2 max-w-2xl text-[var(--ppn-muted)]">
          Drop in a brewery's logo, colours, copy and imagery and the demo becomes theirs. Below are the asset
          slots, sizes, and exactly where each appears across TV, phone, host and presenter surfaces.
          <span className="text-[var(--ppn-muted)]"> (POC: documented slots + placeholders — no upload system yet.)</span>
        </p>

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
      </div>
    </DemoShell>
  );
}
