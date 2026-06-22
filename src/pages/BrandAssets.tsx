/**
 * /setup — Brand asset specification (POC: documentation + slot structure, NOT an upload/asset manager).
 * Shows a PPN operator exactly what brewery assets to prepare, at what sizes/aspect ratios, where each appears,
 * the dynamic text slots, the AI voice/script slots, and optional video. Premium placeholders imply real asset
 * space (no low-res-looking boxes).
 */
import { DemoShell } from "../components/shells";
import { BrandAssetPreview } from "../components/brandZones";
import { DEMO_BRAND } from "../demo/brand";
import { IMAGE_SLOTS, TEXT_SLOTS, AI_SLOTS, VIDEO_SLOTS } from "../demo/brandAssets";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
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
        <p className="mt-2 max-w-2xl text-slate-400">
          Drop in a brewery's logo, colours, copy and imagery and the demo becomes theirs. Below are the asset
          slots, sizes, and exactly where each appears across TV, phone, host and presenter surfaces.
          <span className="text-slate-500"> (POC: documented slots + placeholders — no upload system yet.)</span>
        </p>

        <Section title="Image assets">
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_SLOTS.map((s) => (
              <div key={s.key}>
                <BrandAssetPreview aspect={s.aspect} label={`${s.aspect} · ${s.recommended}`} />
                <p className="mt-1.5 font-medium">{s.label}</p>
                <p className="text-xs text-slate-500">Appears on: {s.appearsOn.join(" · ")}</p>
                {s.notes && <p className="text-xs text-slate-600">{s.notes}</p>}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Dynamic text">
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEXT_SLOTS.map((t) => (
              <li key={t} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">{t}</li>
            ))}
          </ul>
        </Section>

        <Section title="AI host scripts (planning — voiced in the AI slice)">
          <div className="mt-3 space-y-2">
            {AI_SLOTS.map((a) => (
              <div key={a.key} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-medium text-slate-200">{a.label}</p>
                <p className="mt-1 text-sm text-slate-400">“{DEMO_BRAND.ai[a.key as keyof typeof DEMO_BRAND.ai]}”</p>
              </div>
            ))}
            <p className="text-xs text-slate-500">{DEMO_BRAND.responsibleNote}</p>
          </div>
        </Section>

        <Section title="Video (optional for POC)">
          <ul className="mt-3 flex flex-wrap gap-2">
            {VIDEO_SLOTS.map((v) => (
              <li key={v.key} className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-sm text-slate-400">
                {v.label} <span className="text-slate-600">— {v.notes}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </DemoShell>
  );
}
