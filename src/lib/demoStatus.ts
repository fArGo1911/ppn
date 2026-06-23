/**
 * Demo override status + wrong-client protection. The asset/theme/scenario overrides are global localStorage
 * keys, so a previous client's branding can bleed into the next preset. These helpers expose the status and a
 * one-click clear, and a guarded preset switch that asks before carrying overrides across a brewery change.
 */
import { hasAssetPackOverride, clearAssetPackOverride } from "../demo/assetPack";
import { hasThemeOverride, clearThemeOverride } from "../demo/theme";
import { hasScenario, clearScenario } from "../demo/kpiModel";
import { setActiveBrand } from "../demo/brand";

export interface OverrideStatus { asset: boolean; theme: boolean; scenario: boolean }

export function overrideStatus(): OverrideStatus {
  return { asset: hasAssetPackOverride(), theme: hasThemeOverride(), scenario: hasScenario() };
}
export function anyOverrideActive(): boolean {
  const s = overrideStatus();
  return s.asset || s.theme || s.scenario;
}
export function clearClientOverrides() {
  clearAssetPackOverride();
  clearThemeOverride();
  clearScenario();
}

/** Switch brewery preset; if client overrides are active, confirm whether to keep or clear them first. */
export function switchPresetGuarded(id: string) {
  if (anyOverrideActive()) {
    const keep = window.confirm(
      "You have custom assets / theme / scenario active from another client.\n\nOK = keep them for this preset\nCancel = clear them first (recommended when switching brewery).",
    );
    if (!keep) clearClientOverrides();
  }
  setActiveBrand(id);
  window.location.reload();
}
