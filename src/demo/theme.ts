/**
 * Theme application — turns a brewery preset's colour TOKENS into CSS variables on :root so the whole app
 * re-skins (dark amber ↔ light red, etc.). Includes a simple readability guardrail so brand colours can't
 * destroy contrast (falls back to a neutral surface/text where a brand pairing is too low-contrast).
 */
import type { DemoBrand } from "./brand";

/** Relative luminance from a hex or rgb(a)/hex color (best-effort; ignores alpha). */
function luminance(color: string): number {
  let r = 0, g = 0, b = 0;
  const hex = color.trim().match(/^#([0-9a-f]{6})$/i);
  const rgb = color.trim().match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (hex) {
    const n = parseInt(hex[1], 16);
    r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
  } else if (rgb) {
    r = +rgb[1]; g = +rgb[2]; b = +rgb[3];
  } else {
    return 0.5; // unknown (e.g. rgba over a surface) — treat as mid
  }
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Readable text colour for a given background (guardrail: never white-on-light / dark-on-dark). */
export function readableOn(bg: string): string {
  return luminance(bg) > 0.5 ? "#0f172a" : "#ffffff";
}

export function applyTheme(brand: DemoBrand): { warnings: string[] } {
  const c = brand.colours;
  const warnings: string[] = [];

  // Guardrail: ensure on-brand text is readable on the brand colour.
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
