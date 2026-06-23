/**
 * /config — hidden OPERATOR prep room (presenter only; never part of the buyer journey). Lightweight demo prep:
 * brewery preset, market, setup mode, reset demo, seed/clear teams, audience-mode toggle. Richer profile pickers
 * are labelled stubs. NOT an admin/CMS/portal — just enough to prepare a demo run.
 */
import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { PRESETS, getActiveBrand, setActiveBrand, brandInitials, type ThemeColours } from "../demo/brand";
import { activeMarket } from "../demo/markets";
import { SETUP_MODES } from "../demo/setup";
import { useAudienceMode } from "../lib/audience";
import { BrandAssetPreview } from "../components/brandZones";
import { applyTheme, getThemeOverride, setThemeOverride, clearThemeOverride, themeWarnings, type ColourOverride } from "../demo/theme";
import { getAssetPackOverride, setAssetPackOverride, clearAssetPackOverride, hasAssetPackOverride, type AssetPack } from "../demo/assetPack";
import { listAssetPacks, listAssets, createAssetPack, updateAssetPack, uploadAssetFile, setAssetActive, getAssetUrl, buildBrandOverrideFromAssetPack, type AssetType } from "../lib/ppnAssets";
import {
  deriveKpi, applyScenarioToSeed, getScenario, setScenario, clearScenario, scenarioWarnings,
  SCENARIO_TEMPLATES, deriveVenueMix, venueMixWarnings, venueCategory, setupModeLabel,
  type Scenario, type VenueProfile,
} from "../demo/kpiModel";
import { resolveJoinToken, getSessionState, setSessionSetup, resetDemo, clearTeams, seedDemoTeams, listTeams } from "../lib/ppnApi";

const THEME_FIELDS: { key: keyof ThemeColours; label: string }[] = [
  { key: "primary", label: "Primary / brand" }, { key: "primaryDark", label: "Brand dark" }, { key: "accent", label: "Accent" },
  { key: "bg", label: "Background" }, { key: "surface", label: "Surface / card" }, { key: "border", label: "Border" },
  { key: "text", label: "Main text" }, { key: "muted", label: "Muted text" }, { key: "onBrand", label: "Button text" },
  { key: "success", label: "Success" }, { key: "warning", label: "Warning" },
];
const SCENARIO_FIELDS: { key: keyof Scenario; label: string; step: number }[] = [
  { key: "venuesActivated", label: "Campaign venues", step: 1 }, { key: "avgEventsPerVenue", label: "Events / venue", step: 0.1 },
  { key: "avgPlayersPerEvent", label: "Players / event", step: 1 }, { key: "avgPlayersPerTeam", label: "Players / team", step: 0.1 },
  { key: "completionRate", label: "Completion (0–1)", step: 0.01 }, { key: "sponsoredAnswerRate", label: "Sponsored answer (0–1)", step: 0.01 },
  { key: "campaignReachMultiplier", label: "Reach multiplier", step: 0.1 }, { key: "valuePerVisit", label: "Value / visit", step: 1 },
  { key: "pilotVenues", label: "Pilot venues", step: 1 }, { key: "regionalVenues", label: "Regional venues", step: 1 }, { key: "campaignVenues", label: "Wider venues", step: 1 },
];
const PROFILE_OPTS: VenueProfile[] = ["small", "neighbourhood", "sports", "large", "popup", "mixed"];
const ASSET_COPY: { key: keyof AssetPack; label: string }[] = [
  { key: "sponsorName", label: "Sponsor / brewery name" }, { key: "campaignName", label: "Campaign name" }, { key: "pubName", label: "Pub / venue name" },
  { key: "eventName", label: "Event name" }, { key: "offer", label: "Offer" }, { key: "tagline", label: "Tagline" }, { key: "responsibleNote", label: "Responsible note" },
];
const ASSET_MEDIA: { key: keyof AssetPack; label: string }[] = [
  { key: "logoUrl", label: "Logo URL/path" }, { key: "heroUrl", label: "Hero image" }, { key: "sponsorSlideUrl", label: "Sponsor slide" },
  { key: "phoneCardUrl", label: "Phone card" }, { key: "lowerThirdUrl", label: "Lower third" }, { key: "venueUrl", label: "Venue image" },
  { key: "tvIntroVideoUrl", label: "Intro video" }, { key: "sponsorBumperVideoUrl", label: "Sponsor bumper video" }, { key: "closingVideoUrl", label: "Closing video" },
];
const SEED_SIZES = [{ n: 3, label: "Small (3)" }, { n: 6, label: "Medium (6)" }, { n: 12, label: "Busy (12)" }];
const UPLOAD_TYPES: { type: AssetType; label: string; video?: boolean }[] = [
  { type: "logo", label: "Logo" }, { type: "hero", label: "Hero" }, { type: "sponsor_slide", label: "Sponsor slide" },
  { type: "phone_card", label: "Phone card" }, { type: "lower_third", label: "Lower third" }, { type: "venue_image", label: "Venue image" },
  { type: "intro_video", label: "Intro video", video: true }, { type: "sponsor_bumper_video", label: "Sponsor bumper", video: true }, { type: "closing_video", label: "Closing video", video: true },
];
const IMAGE_ASSET_TYPES = new Set<AssetType>(["logo", "hero", "sponsor_slide", "phone_card", "lower_third", "venue_image"]);
const PACK_COPY_FIELDS: { key: string; label: string }[] = [
  { key: "sponsor_name", label: "Sponsor name" }, { key: "campaign_name", label: "Campaign name" }, { key: "pub_name", label: "Pub name" },
  { key: "event_name", label: "Event name" }, { key: "offer", label: "Offer" }, { key: "tagline", label: "Tagline" }, { key: "responsible_note", label: "Responsible note" },
];

function buildSpecs(mk: { teamNames: string[]; playerNames: string[] }, count: number) {
  const tn = mk.teamNames, pn = mk.playerNames, out: { name: string; players: string[] }[] = [];
  for (let i = 0; i < count; i++) {
    const base = tn[i % tn.length];
    const name = i < tn.length ? base : `${base} ${Math.floor(i / tn.length) + 1}`;
    const per = 2 + (i % 3); // 2–4 players
    const players: string[] = [];
    for (let j = 0; j < per; j++) players.push(pn[(i * 3 + j) % pn.length]);
    out.push({ name, players });
  }
  return out;
}

export default function Config() {
  const active = getActiveBrand();
  const market = activeMarket();
  const qc = useQueryClient();
  const [audience, setAudience] = useAudienceMode();

  const sessQ = useQuery({ queryKey: ["config-session"], queryFn: () => resolveJoinToken("DEMO") });
  const sid = sessQ.data && sessQ.data.kind !== "invalid" ? sessQ.data.session.sessionId : undefined;
  const stateQ = useQuery({ queryKey: ["config-state", sid], queryFn: () => getSessionState(sid!), enabled: !!sid });
  const teamsQ = useQuery({ queryKey: ["config-teams", sid], queryFn: () => listTeams(sid!), enabled: !!sid, refetchInterval: 4000 });
  const st = stateQ.data;

  const act = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["config-state", sid] }); qc.invalidateQueries({ queryKey: ["config-teams", sid] }); },
  });
  const run = (fn: () => Promise<unknown>) => act.mutate(fn);
  const busy = act.isPending;

  // ── Demo team seeding size (small/medium/busy — uses existing seedDemoTeams helper) ──
  const [seedSize, setSeedSize] = useState(3);
  const specs = buildSpecs(market, seedSize);

  // ── Internal scenario assumptions (operator-only; localStorage; /kpi + /rollout derive from these) ──
  const [scenario, setScenarioState] = useState<Scenario>(getScenario());
  const stageDefaults: Record<string, number> = {
    pilotVenues: market.rollout.find((r) => r.id === "pilot")?.venues ?? 5,
    regionalVenues: market.rollout.find((r) => r.id === "regional")?.venues ?? 25,
    campaignVenues: market.rollout.find((r) => r.id === "campaign")?.venues ?? 100,
  };
  const fieldDefault = (key: keyof Scenario): number => key in stageDefaults ? stageDefaults[key] : Number((market.kpiSeed as unknown as Record<string, unknown>)[key] ?? 0);
  const updateScenario = (key: keyof Scenario, value: number) => { const next = { ...scenario, [key]: value }; setScenarioState(next); setScenario(next); };
  const applyTemplate = (sc: Scenario) => { setScenarioState(sc); setScenario(sc); };
  const resetScenario = () => { clearScenario(); setScenarioState({}); };
  const effSeed = applyScenarioToSeed(market.kpiSeed, scenario);
  const effD = deriveKpi(effSeed);
  const profile: VenueProfile = scenario.venueProfile ?? "mixed";
  const mix = scenario.venueMix ?? null;
  const mixD = mix ? deriveVenueMix(mix, scenario.campaignReachMultiplier ?? effSeed.campaignReachMultiplier, scenario.avgPlayersPerTeam ?? effSeed.avgPlayersPerTeam) : null;
  const sWarns = mix ? venueMixWarnings(mix) : scenarioWarnings(effSeed, profile);
  const hasScenarioOver = Object.keys(scenario).length > 0;

  // ── Internal theme studio (operator-only colour override; localStorage; applies live) ──
  const [over, setOver] = useState<ColourOverride>(getThemeOverride());
  const update = (key: keyof ThemeColours, value: string) => {
    const next = { ...over, [key]: value };
    setOver(next); setThemeOverride(next); applyTheme(active);
  };
  const resetTheme = () => { clearThemeOverride(); setOver({}); applyTheme(active); };
  const effective = { ...active.colours, ...over } as ThemeColours;
  const warns = themeWarnings(effective);
  const hasOver = Object.keys(over).length > 0;

  // ── Operator asset pack (URL/path only — no upload; apply reloads so DEMO_BRAND re-merges) ──
  const [pack, setPack] = useState<AssetPack>(getAssetPackOverride());
  const updatePack = (key: keyof AssetPack, value: string) => setPack((p) => ({ ...p, [key]: value }));
  const applyPack = () => { setAssetPackOverride(pack); window.location.reload(); };
  const resetPack = () => { clearAssetPackOverride(); window.location.reload(); };
  const packActive = hasAssetPackOverride();
  const previewLogo = pack.logoUrl?.trim() || active.images.logoUrl;
  const previewHero = pack.heroUrl?.trim() || active.images.heroUrl;
  const previewOffer = pack.offer?.trim() || active.offer;
  const previewSponsor = pack.sponsorName?.trim() || active.sponsorName;

  // ── DB-backed asset packs (operator beta: Supabase Storage + registry; degrades to manual/preset) ──
  const packsQ = useQuery({ queryKey: ["asset-packs"], queryFn: listAssetPacks, retry: false });
  const [selPackId, setSelPackId] = useState<string | undefined>(undefined);
  const activePackId = selPackId ?? packsQ.data?.[0]?.id;
  const activePack = packsQ.data?.find((p) => p.id === activePackId) ?? null;
  const assetsQ = useQuery({ queryKey: ["assets", activePackId], queryFn: () => listAssets(activePackId!), enabled: !!activePackId, retry: false });
  const [newLabel, setNewLabel] = useState("");
  const [assetErr, setAssetErr] = useState<string | null>(null);
  const [packCopy, setPackCopy] = useState<Record<string, string>>({});
  useEffect(() => {
    if (activePack) setPackCopy(Object.fromEntries(PACK_COPY_FIELDS.map((f) => [f.key, (activePack as unknown as Record<string, string | null>)[f.key] ?? ""])));
  }, [activePackId, activePack?.updated_at]);
  const assetMut = useMutation({
    mutationFn: (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => { setAssetErr(null); qc.invalidateQueries({ queryKey: ["asset-packs"] }); qc.invalidateQueries({ queryKey: ["assets", activePackId] }); },
    onError: (e) => setAssetErr((e as Error).message),
  });
  const runA = (fn: () => Promise<unknown>) => assetMut.mutate(fn);
  const assetBusy = assetMut.isPending;
  const applyDbPack = () => { if (activePack) { setAssetPackOverride(buildBrandOverrideFromAssetPack(activePack, assetsQ.data ?? [])); window.location.reload(); } };

  const choose = (id: string) => { setActiveBrand(id); window.location.reload(); };
  const Card = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );

  return (
    <DemoShell>
      <div className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-sm uppercase tracking-widest" style={{ color: active.primary }}>Presenter · operator prep room</p>
        <h1 className="mt-2 text-3xl font-extrabold">Demo setup</h1>
        <p className="mt-2 text-[var(--ppn-muted)]">Prepare a run before a brewery sees it. Hidden from the buyer journey.</p>

        <div className="mt-6 space-y-4">
          <Card title="Brewery preset · market">
            <div className="space-y-2">
              {PRESETS.map((p) => {
                const on = p.id === active.id;
                return (
                  <button key={p.id} onClick={() => choose(p.id)} className="flex w-full items-center gap-3 rounded-xl border bg-[var(--ppn-bg)] p-3 text-left" style={{ borderColor: on ? p.colours.primary : "var(--ppn-border)" }}>
                    <span className="grid h-9 w-9 place-items-center rounded-lg font-black" style={{ background: p.colours.primary, color: p.colours.onBrand }}>{brandInitials(p.sponsorName)}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{p.sponsorName} <span className="ml-1 rounded bg-[var(--ppn-surface)] px-1.5 py-0.5 text-[10px] text-[var(--ppn-muted)]">{p.market}</span></p>
                      <p className="text-xs text-[var(--ppn-muted)]">{p.tagline} · {p.pubName}</p>
                    </div>
                    {on && <span className="text-xs font-semibold" style={{ color: p.colours.primary }}>Active</span>}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Brewery asset pack (operator only)">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--ppn-muted)]">Active preset: <span className="font-semibold text-[var(--ppn-text)]">{active.sponsorName}</span></p>
              {packActive
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Asset override active</span>
                : <span className="text-[10px] text-[var(--ppn-muted)]">preset defaults</span>}
            </div>
            <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">POC asset pack: URL/path only — no upload or storage yet. Place files under <span className="font-mono">public/demo/assets/&lt;preset&gt;/</span> and paste the paths. See <Link to="/setup" className="text-[var(--ppn-brand)]">/setup</Link> for where each appears.</p>

            <p className="mt-3 text-xs font-semibold text-[var(--ppn-muted)]">Copy</p>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {ASSET_COPY.map((f) => (
                <label key={f.key} className="text-xs text-[var(--ppn-muted)]">{f.label}
                  <input value={(pack[f.key] as string) ?? ""} placeholder={String((active as unknown as Record<string, unknown>)[f.key] ?? "")} onChange={(e) => updatePack(f.key, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" />
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-[var(--ppn-muted)]">Image / video paths</p>
            <div className="mt-1 grid gap-2 sm:grid-cols-3">
              {ASSET_MEDIA.map((f) => (
                <label key={f.key} className="text-xs text-[var(--ppn-muted)]">{f.label}
                  <input value={(pack[f.key] as string) ?? ""} placeholder="/demo/assets/…" onChange={(e) => updatePack(f.key, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 font-mono text-xs text-[var(--ppn-text)]" />
                </label>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Preview</p>
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
              {previewLogo
                ? <img src={previewLogo} alt="logo" className="h-12 w-12 rounded-lg object-contain" style={{ background: "var(--ppn-surface)" }} />
                : <span className="grid h-12 w-12 place-items-center rounded-lg font-black" style={{ background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }}>{brandInitials(previewSponsor)}</span>}
              <div className="flex-1">
                <p className="text-sm font-semibold">{previewSponsor}</p>
                <p className="text-xs text-[var(--ppn-muted)]">🎁 {previewOffer}</p>
              </div>
              <div className="w-28"><BrandAssetPreview aspect="16/9" image={previewHero} className="w-full" /></div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={applyPack} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Apply asset pack</button>
              <button onClick={resetPack} disabled={!packActive} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">↺ Reset to preset defaults</button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Apply reloads so every surface re-merges the pack. Blank fields keep the preset value — an override can never blank a page.</p>
          </Card>

          <Card title="Stored asset packs (operator beta)">
            <p className="text-[11px] text-[var(--ppn-muted)]">Beta foundation: files are uploaded to Supabase Storage and registered in the asset registry. Still not a full CMS or brewery self-service portal.</p>
            {packsQ.isError ? (
              <p className="mt-2 rounded-lg border border-dashed border-[var(--ppn-border)] p-3 text-xs text-amber-400">Asset registry not reachable (Supabase offline?) — the manual asset pack above and preset defaults still work.</p>
            ) : (
              <>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New pack label" className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5 text-sm" />
                  <button disabled={assetBusy || !newLabel.trim()} onClick={() => { runA(() => createAssetPack({ label: newLabel.trim(), status: "active" })); setNewLabel(""); }} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--ppn-on-brand)] disabled:opacity-40" style={{ background: "var(--ppn-brand)" }}>＋ Create pack</button>
                  {(packsQ.data ?? []).length > 0 && (
                    <select value={activePackId ?? ""} onChange={(e) => setSelPackId(e.target.value)} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5 text-sm">
                      {(packsQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.label} · {p.status}</option>)}
                    </select>
                  )}
                </div>

                {activePack ? (
                  <>
                    <p className="mt-3 text-xs font-semibold text-[var(--ppn-muted)]">Pack copy</p>
                    <div className="mt-1 grid gap-2 sm:grid-cols-3">
                      {PACK_COPY_FIELDS.map((f) => (
                        <label key={f.key} className="text-xs text-[var(--ppn-muted)]">{f.label}
                          <input value={packCopy[f.key] ?? ""} onChange={(e) => setPackCopy((c) => ({ ...c, [f.key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" />
                        </label>
                      ))}
                    </div>
                    <button disabled={assetBusy} onClick={() => runA(() => updateAssetPack(activePack.id, packCopy))} className="mt-2 rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Save copy</button>

                    <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Upload files (→ Supabase Storage + registry)</p>
                    <div className="mt-1 grid gap-2 sm:grid-cols-3">
                      {UPLOAD_TYPES.map((u) => (
                        <label key={u.type} className="flex flex-col gap-1 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 text-xs text-[var(--ppn-muted)]">
                          {u.label}
                          <input type="file" accept={u.video ? "video/*" : "image/*"} disabled={assetBusy}
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) runA(() => uploadAssetFile(activePack.id, u.type, f)); e.currentTarget.value = ""; }}
                            className="text-[10px] file:mr-2 file:rounded file:border-0 file:bg-[var(--ppn-surface)] file:px-2 file:py-1" />
                        </label>
                      ))}
                    </div>

                    <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Stored assets ({(assetsQ.data ?? []).length})</p>
                    <div className="mt-1 space-y-1.5">
                      {(assetsQ.data ?? []).length === 0 && <p className="text-xs text-[var(--ppn-muted)]">No files yet.</p>}
                      {(assetsQ.data ?? []).map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 text-xs">
                          {IMAGE_ASSET_TYPES.has(a.asset_type) && <img src={getAssetUrl(a)} alt={a.asset_type} className="h-8 w-8 rounded object-contain" style={{ background: "var(--ppn-surface)" }} />}
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-[var(--ppn-text)]">{a.asset_type}</span> <span className="text-[var(--ppn-muted)]">· {a.status} · {a.original_filename ?? a.storage_path}</span>
                          </div>
                          {a.status !== "active" && <button disabled={assetBusy} onClick={() => runA(() => setAssetActive(a.id))} className="rounded border border-[var(--ppn-border)] px-2 py-0.5 text-[10px] disabled:opacity-40">Set active</button>}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={applyDbPack} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Apply this pack to the demo</button>
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Apply writes the pack's copy + active files into the local demo override (reloads). Read priority: DB pack → manual override → preset.</p>
                  </>
                ) : <p className="mt-2 text-xs text-[var(--ppn-muted)]">Create a pack to start uploading brewery assets.</p>}
                {assetErr && <p className="mt-2 text-xs text-red-400">{assetErr}</p>}
              </>
            )}
          </Card>

          <Card title="Internal theme studio (operator only)">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--ppn-muted)]">Base preset: <span className="font-semibold text-[var(--ppn-text)]">{active.sponsorName}</span> <span className="ml-1 rounded bg-[var(--ppn-bg)] px-1.5 py-0.5 text-[10px]">{active.market}</span></p>
              {hasOver
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Custom colours active</span>
                : <span className="text-[10px] text-[var(--ppn-muted)]">preset defaults</span>}
            </div>
            <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Predesign a brewery look before the pitch. Internal only — applies to all demo surfaces; never shown to the brewery.</p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {THEME_FIELDS.map((f) => {
                const val = (over[f.key] ?? active.colours[f.key]) as string;
                const isHex = /^#([0-9a-f]{6})$/i.test(val);
                return (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="h-7 w-7 shrink-0 rounded border border-[var(--ppn-border)]" style={{ background: val }} />
                    {isHex && <input type="color" value={val} onChange={(e) => update(f.key, e.target.value)} className="h-7 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" aria-label={`${f.label} picker`} />}
                    <label className="w-24 shrink-0 text-xs text-[var(--ppn-muted)]">{f.label}</label>
                    <input value={val} onChange={(e) => update(f.key, e.target.value)} className="min-w-0 flex-1 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 font-mono text-xs" />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={resetTheme} disabled={!hasOver} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">↺ Reset to preset defaults</button>
            </div>

            {warns.length > 0 ? (
              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, transparent)", background: "color-mix(in srgb, var(--ppn-warning) 12%, transparent)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--ppn-warning)" }}>⚠ Readability warnings (operator-only)</p>
                <ul className="mt-1 list-disc pl-5 text-xs text-[var(--ppn-muted)]">{warns.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            ) : <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Contrast looks readable.</p>}

            {/* Live preview */}
            <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Live preview</p>
            <div className="mt-2 rounded-xl border border-[var(--ppn-border)] p-3" style={{ background: "var(--ppn-bg)" }}>
              <div className="rounded-lg p-3" style={{ background: "var(--ppn-surface)", border: "1px solid var(--ppn-border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--ppn-text)" }}>Sample card · {active.sponsorName}</p>
                <p className="text-xs" style={{ color: "var(--ppn-muted)" }}>Muted text reads here.</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ background: "var(--ppn-brand)", color: "var(--ppn-on-brand)" }}>Primary</button>
                  <button className="rounded-lg px-3 py-1.5 text-xs font-semibold" style={{ border: "1px solid var(--ppn-border)", color: "var(--ppn-text)" }}>Secondary</button>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-success) 20%, transparent)", color: "var(--ppn-success)" }}>success</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>warning</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg px-3 py-2" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--ppn-brand-dark) 14%, transparent), transparent)", borderTop: "1px solid var(--ppn-border)" }}>
                <span className="text-xs" style={{ color: "var(--ppn-muted)" }}><span className="font-semibold" style={{ color: "var(--ppn-brand)" }}>{active.sponsorName}</span> · {active.broughtBy}</span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-brand) 18%, transparent)", color: "var(--ppn-brand)" }}>🎁 {active.offer}</span>
                <span className="ml-auto text-[10px]" style={{ color: "var(--ppn-muted)" }}>⚡ {active.poweredBy}</span>
              </div>
            </div>
          </Card>

          <Card title="Demo scenario assumptions (operator only)">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--ppn-muted)]">Prepare a believable scenario — /kpi and /rollout derive from these. Internal only.</p>
              {hasScenarioOver
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Custom scenario active</span>
                : <span className="text-[10px] text-[var(--ppn-muted)]">market defaults</span>}
            </div>

            <p className="mt-3 text-xs font-semibold text-[var(--ppn-muted)]">Templates</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {SCENARIO_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => applyTemplate(t.scenario)} title={t.assumes}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ borderColor: scenario.templateId === t.id ? "var(--ppn-brand)" : "var(--ppn-border)", color: scenario.templateId === t.id ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>
                  {t.name} <span className="opacity-70">· {t.tone}</span>
                </button>
              ))}
            </div>
            {scenario.templateId && <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">{SCENARIO_TEMPLATES.find((t) => t.id === scenario.templateId)?.assumes}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[var(--ppn-muted)]">Venue profile:</span>
              {PROFILE_OPTS.map((p) => (
                <button key={p} onClick={() => { const next = { ...scenario, venueProfile: p }; setScenarioState(next); setScenario(next); }}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium"
                  style={{ borderColor: profile === p ? "var(--ppn-brand)" : "var(--ppn-border)", color: profile === p ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>{p}</button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {SCENARIO_FIELDS.map((f) => (
                <label key={f.key} className="text-xs text-[var(--ppn-muted)]">
                  {f.label}
                  <input type="number" step={f.step} value={(scenario[f.key] ?? fieldDefault(f.key)) as number} onChange={(e) => updateScenario(f.key, Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" />
                </label>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3 text-xs">
              <p className="font-semibold text-[var(--ppn-text)]">Across the campaign (derived, estimated):</p>
              <p className="mt-1 text-[var(--ppn-muted)]">{effD.eventsRun.toLocaleString()} events · {effD.playersJoined.toLocaleString()} player visits · {effD.teamsCreated.toLocaleString()} teams · ~{effSeed.avgPlayersPerEvent}/event · {effD.avgTeamsPerEvent} teams/event · est. reach ~{effD.campaignReachEstimate.toLocaleString()}</p>
            </div>

            {mixD && (
              <div className="mt-3 space-y-2">
                <div>
                  <p className="text-xs font-semibold text-[var(--ppn-muted)]">Venue mix</p>
                  <div className="mt-1 grid gap-1 sm:grid-cols-2">
                    {mix!.map((e, i) => (
                      <div key={i} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-3 py-2 text-xs">
                        <span className="font-semibold text-[var(--ppn-text)]">{e.venues}× {venueCategory(e.categoryId).label}</span>
                        <span className="text-[var(--ppn-muted)]"> · {e.avgPlayersPerEvent}/event · {e.eventsPerVenue} events · {setupModeLabel(e.setupMode)}</span>
                        {venueCategory(e.categoryId).special && <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>special event</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 text-xs">
                    <p className="font-semibold text-[var(--ppn-text)]">Category mix</p>
                    <p className="mt-1 text-[var(--ppn-muted)]">{mixD.categoryMix.map((c) => `${c.venues}× ${c.label}`).join(" · ")}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 text-xs">
                    <p className="font-semibold text-[var(--ppn-text)]">Setup / output mix (by venues)</p>
                    <p className="mt-1 text-[var(--ppn-muted)]">{mixD.setupMix.map((su) => `${su.pctVenues}% ${su.label}`).join(" · ")}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--ppn-muted)]">Venue mix drives venues/events/players (weighted) — clear the scenario to edit those scalars directly.</p>
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={resetScenario} disabled={!hasScenarioOver} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">↺ Reset to market defaults</button>
            </div>

            {sWarns.length > 0 ? (
              <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "color-mix(in srgb, var(--ppn-warning) 45%, transparent)", background: "color-mix(in srgb, var(--ppn-warning) 12%, transparent)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--ppn-warning)" }}>⚠ Realism warnings (operator-only)</p>
                <ul className="mt-1 list-disc pl-5 text-xs text-[var(--ppn-muted)]">{sWarns.map((w) => <li key={w}>{w}</li>)}</ul>
              </div>
            ) : <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Scenario looks realistic.</p>}
          </Card>

          <Card title="Setup mode (output)">
            {!st ? <p className="text-sm text-[var(--ppn-muted)]">Loading session…</p> : (
              <div className="grid gap-2 sm:grid-cols-3">
                {SETUP_MODES.map((m) => {
                  const on = st.setupMode === m.id;
                  return (
                    <button key={m.id} disabled={busy} onClick={() => run(() => setSessionSetup(sid!, m.id, st.hostingMode))}
                      className="rounded-xl border p-3 text-left text-sm disabled:opacity-60"
                      style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", background: on ? "color-mix(in srgb, var(--ppn-brand) 12%, transparent)" : "transparent" }}>
                      <p className="font-semibold">{m.label}</p>
                    </button>
                  );
                })}
              </div>
            )}
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Hosting mode + AI intro are toggled live on the host panel.</p>
          </Card>

          <Card title="Demo session">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[var(--ppn-muted)]">Demo size:</span>
              {SEED_SIZES.map((sz) => (
                <button key={sz.n} onClick={() => setSeedSize(sz.n)} className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{ borderColor: seedSize === sz.n ? "var(--ppn-brand)" : "var(--ppn-border)", color: seedSize === sz.n ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>{sz.label}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button disabled={busy || !sid} onClick={() => run(() => resetDemo(sid!))} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)] disabled:opacity-50" style={{ background: "var(--ppn-brand)" }}>↺ Reset demo (clean lobby)</button>
              <button disabled={busy || !sid} onClick={() => run(async () => { await clearTeams(sid!); await seedDemoTeams(sid!, specs); })} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">＋ Seed {seedSize} demo teams</button>
              <button disabled={busy || !sid} onClick={() => run(() => clearTeams(sid!))} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">✕ Clear teams</button>
            </div>
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">
              {teamsQ.data ? `${teamsQ.data.length} team${teamsQ.data.length === 1 ? "" : "s"} in session · ` : ""}
              Seeds {seedSize} {market.label} teams (local demo only). Live session normally shows a few sample teams; KPI/rollout numbers are campaign-level totals across many events, not this session.
            </p>
          </Card>

          <Card title="Presentation mode">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setAudience(true)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>▶ Enter audience mode (hide all chrome)</button>
              <button onClick={() => setAudience(false)} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold">Exit audience mode</button>
              <span className="text-xs text-[var(--ppn-muted)]">Currently: {audience ? "audience (clean)" : "presenter (chrome on)"}</span>
            </div>
          </Card>

          <Card title="Content / KPI / rollout profiles">
            <div className="flex flex-wrap gap-2 text-xs text-[var(--ppn-muted)]">
              {["Content-mix profile", "KPI profile", "Rollout profile"].map((s) => (
                <span key={s} className="rounded-full border border-dashed border-[var(--ppn-border)] px-3 py-1.5">{s} · operator stub</span>
              ))}
            </div>
            <p className="mt-3 text-xs"><Link to="/setup" className="text-[var(--ppn-brand)]">Brand asset spec →</Link> <span className="text-[var(--ppn-muted)]">(operator reference — not shown to the buyer)</span></p>
          </Card>
        </div>
      </div>
    </DemoShell>
  );
}
