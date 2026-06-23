/**
 * Theme application — turns a brewery preset's colour TOKENS into CSS variables on :root so the whole app
 * re-skins (dark amber ↔ light red, etc.). An OPERATOR colour override (localStorage) can be merged on top for
 * internal demo prep in /config. Includes a simple readability guardrail + exported contrast helpers (operator-only).
 */
import type { DemoBrand, ThemeColours } from "./brand";

/** Relative luminance from a hex or rgb(a) color (best-effort; ignores alpha → returns 0.5 if unresolvable). */
export function luminance(color: string): number {
  let r = 0, g = 0, b = 0;
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i);
  const rgb = color.trim().match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
  } else if (rgb) {
    r = +rgb[1]; g = +rgb[2]; b = +rgb[3];
  } else {
    return 0.5;
  }
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Whether a colour string can be luminance-resolved (hex / rgb). rgba surfaces over a parent can't, reliably. */
export function resolvable(color: string): boolean {
  return /^#([0-9a-f]{6})$/i.test(color.trim()) || /rgba?\(\s*\d+[,\s]+\d+[,\s]+\d+/i.test(color.trim());
}

/** Readable text colour for a given background (guardrail: never white-on-light / dark-on-dark). */
export function readableOn(bg: string): string {
  return luminance(bg) > 0.5 ? "#0f172a" : "#ffffff";
}

// ── Operator colour override (internal demo prep — localStorage only, never a backend) ──
const OVERRIDE_KEY = "ppn_theme_override";
export type ColourOverride = Partial<ThemeColours>;

export function getThemeOverride(): ColourOverride {
  try { const r = localStorage.getItem(OVERRIDE_KEY); return r ? (JSON.parse(r) as ColourOverride) : {}; } catch { return {}; }
}
export function setThemeOverride(o: ColourOverride) {
  try { localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o)); } catch { /* ignore */ }
}
export function clearThemeOverride() {
  try { localStorage.removeItem(OVERRIDE_KEY); } catch { /* ignore */ }
}
export function hasThemeOverride(): boolean {
  return Object.keys(getThemeOverride()).length > 0;
}
/** Effective colours = preset defaults merged with any operator override. */
export function effectiveColours(brand: DemoBrand): ThemeColours {
  return { ...brand.colours, ...getThemeOverride() };
}

export function applyTheme(brand: DemoBrand): { warnings: string[] } {
  const c = effectiveColours(brand);
  const warnings: string[] = [];

  let onBrand = c.onBrand;
  if (contrast(onBrand, c.primary) < 3) {
    onBrand = readableOn(c.primary);
    warnings.push(`onBrand colour had low contrast on primary — using ${onBrand}.`);
  }
  if (contrast(c.text, c.bg) < 3.5) warnings.push("text/background contrast is low — check readability.");

  const root = document.documentElement.style;
  const set = (k: string, v: string) => root.setProperty(k, v);
  set("--ppn-bg", c.bg);
  set("--ppn-surface", c.surface);
  set("--ppn-border", c.border);
  set("--ppn-text", c.text);
  set("--ppn-muted", c.muted);
  set("--ppn-brand", c.primary);
  set("--ppn-brand-dark", c.primaryDark);
  set("--ppn-brand-2", c.secondary);
  set("--ppn-accent", c.accent);
  set("--ppn-on-brand", onBrand);
  set("--ppn-success", c.success);
  set("--ppn-warning", c.warning);
  document.documentElement.style.colorScheme = luminance(c.bg) > 0.5 ? "light" : "dark";

  if (warnings.length && import.meta.env.DEV) console.warn("[ppn theme]", brand.id, warnings);
  return { warnings };
}

/** Operator-only readability audit for the EFFECTIVE colours (used in /config; never on buyer surfaces). */
export function themeWarnings(c: ThemeColours): string[] {
  const w: string[] = [];
  if (contrast(c.text, c.bg) < 4.5) w.push("Main text on background is low-contrast — hard to read.");
  if (resolvable(c.surface) && contrast(c.text, c.surface) < 4.5) w.push("Main text on cards/surface is low-contrast.");
  if (contrast(c.onBrand, c.primary) < 3) w.push("Button text on the primary colour is low-contrast.");
  if (contrast(c.muted, c.bg) < 2.2) w.push("Muted text is too faint against the background.");
  if (resolvable(c.border) && contrast(c.border, c.bg) < 1.12) w.push("Border is nearly invisible against the background.");
  return w;
}
