/**
 * /config — hidden presenter control: switch the active brewery preset. Re-skins colours, copy, offer and AI
 * scripts across every surface (persisted in localStorage; reloads to apply the theme). POC: seeded presets only.
 */
import { DemoShell } from "../components/shells";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials } from "../demo/brand";

export default function Config() {
  const active = getActiveBrand();
  const choose = (id: string) => {
    setActiveBrand(id);
    window.location.reload();
  };
  return (
    <DemoShell>
      <div className="mx-auto max-w-2xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: active.primary }}>Presenter · hidden config</p>
        <h1 className="mt-2 text-3xl font-extrabold">Brewery preset</h1>
        <p className="mt-2 text-[var(--ppn-muted)]">
          Switch the demo to a specific brewery — re-skins colours, copy, offer and AI scripts across every surface.
        </p>
        <div className="mt-6 space-y-3">
          {PRESETS.map((p) => {
            const isActive = p.id === active.id;
            return (
              <button
                key={p.id}
                onClick={() => choose(p.id)}
                className="flex w-full items-center gap-3 rounded-xl border bg-[var(--ppn-surface)] p-4 text-left"
                style={{ borderColor: isActive ? p.colours.primary : "var(--ppn-border)" }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg font-black" style={{ background: p.colours.primary, color: p.colours.onBrand }}>
                  {brandInitials(p.sponsorName)}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{p.sponsorName}</p>
                  <p className="text-xs text-[var(--ppn-muted)]">{p.tagline}</p>
                </div>
                <span className="flex gap-1">
                  {[p.colours.primary, p.colours.bg, p.colours.surface, p.colours.text].map((c, i) => (
                    <span key={i} className="h-5 w-5 rounded-full border border-[var(--ppn-border)]" style={{ background: c }} />
                  ))}
                </span>
                {isActive && <span className="ml-2 text-xs font-semibold" style={{ color: p.colours.primary }}>Active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </DemoShell>
  );
}
