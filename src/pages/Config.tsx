/**
 * /config — hidden OPERATOR prep room (presenter only; never part of the buyer journey). Lightweight demo prep:
 * brewery preset, market, setup mode, reset demo, seed/clear teams, audience-mode toggle. Richer profile pickers
 * are labelled stubs. NOT an admin/CMS/portal — just enough to prepare a demo run.
 */
import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { PRESETS, getActiveBrand, brandInitials, type ThemeColours } from "../demo/brand";
import { switchPresetGuarded, overrideStatus, anyOverrideActive, clearClientOverrides } from "../lib/demoStatus";
import { activeMarket } from "../demo/markets";
import { SETUP_MODES } from "../demo/setup";
import { useAudienceMode } from "../lib/audience";
import { applyTheme, getThemeOverride, setThemeOverride, clearThemeOverride, themeWarnings, type ColourOverride } from "../demo/theme";
import { getAssetPackOverride, setAssetPackOverride, clearAssetPackOverride, hasAssetPackOverride, type AssetPack } from "../demo/assetPack";
import { listAssetPacks, listAssets, createAssetPack, updateAssetPack, uploadAssetFile, setAssetActive, updateAssetStatus, getAssetUrl, buildBrandOverrideFromAssetPack, type AssetType } from "../lib/ppnAssets";
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
const SEED_SIZES = [{ n: 3, label: "Small (3)" }, { n: 6, label: "Medium (6)" }, { n: 12, label: "Busy (12)" }];
const IMAGE_ASSET_TYPES = new Set<AssetType>(["logo", "hero", "sponsor_slide", "phone_card", "lower_third", "venue_image"]);
const PACK_COPY_FIELDS: { key: string; label: string }[] = [
  { key: "sponsor_name", label: "Sponsor name" }, { key: "campaign_name", label: "Campaign name" }, { key: "pub_name", label: "Pub name" },
  { key: "event_name", label: "Event name" }, { key: "offer", label: "Offer" }, { key: "tagline", label: "Tagline" }, { key: "responsible_note", label: "Responsible note" },
];

// Slot-based asset manager catalogue. Each media slot maps to an AssetPack override field (manual path) AND an
// AssetType (storage upload), so each slot gets its own upload/replace/clear — reusing the existing primitives.
type SlotGroup = "Required" | "Recommended" | "Optional";
interface MediaSlot { group: SlotGroup; field: keyof AssetPack; type: AssetType; label: string; size: string; aspect: string; fileType: string; accept: string; appears: string; kind: "image" | "video"; live: "live" | "preview-only" }
const MEDIA_SLOTS: MediaSlot[] = [
  { group: "Required", field: "logoUrl", type: "logo", label: "Brewery / client logo", size: "≥512px · transparent", aspect: "1/1", fileType: "PNG · SVG · JPG · GIF", accept: "image/*", appears: "TV banner · player header · KPI", kind: "image", live: "live" },
  { group: "Required", field: "heroUrl", type: "hero", label: "TV hero / campaign background", size: "1920×1080", aspect: "16/9", fileType: "JPG · PNG · GIF", accept: "image/*", appears: "TV welcome · presentation landing", kind: "image", live: "live" },
  { group: "Required", field: "sponsorSlideUrl", type: "sponsor_slide", label: "TV sponsor slide / offer card", size: "1920×1080", aspect: "16/9", fileType: "JPG · PNG · GIF", accept: "image/*", appears: "TV sponsor slideshow / pause", kind: "image", live: "live" },
  { group: "Recommended", field: "phoneCardUrl", type: "phone_card", label: "Phone sponsor card", size: "1080×1350", aspect: "4/5", fileType: "JPG · PNG · GIF", accept: "image/*", appears: "player waiting / sponsored Q", kind: "image", live: "preview-only" },
  { group: "Recommended", field: "lowerThirdUrl", type: "lower_third", label: "TV lower-third / offer strip", size: "1920×240", aspect: "8/1", fileType: "PNG (transparent)", accept: "image/*", appears: "TV offer strip", kind: "image", live: "preview-only" },
  { group: "Recommended", field: "venueUrl", type: "venue_image", label: "Venue / background image", size: "1600×900", aspect: "16/9", fileType: "JPG · PNG", accept: "image/*", appears: "presentation venue", kind: "image", live: "preview-only" },
  { group: "Optional", field: "tvIntroVideoUrl", type: "intro_video", label: "Intro video", size: "16:9 short clip", aspect: "16/9", fileType: "MP4 · WebM", accept: "video/*", appears: "TV intro", kind: "video", live: "live" },
  { group: "Optional", field: "sponsorBumperVideoUrl", type: "sponsor_bumper_video", label: "Sponsor bumper video", size: "16:9 short clip", aspect: "16/9", fileType: "MP4 · WebM", accept: "video/*", appears: "TV sponsor bumper", kind: "video", live: "live" },
  { group: "Optional", field: "closingVideoUrl", type: "closing_video", label: "Closing video", size: "16:9 short clip", aspect: "16/9", fileType: "MP4 · WebM", accept: "video/*", appears: "TV closing", kind: "video", live: "live" },
];
// Read-only preview surfaces (link to the real route; no iframe, no preview engine, no generated graphics).
const PREVIEW_SURFACES: { to: string; label: string; icon: string }[] = [
  { to: "/tv/DEMO", label: "TV / audience display", icon: "TV" },
  { to: "/play/DEMO", label: "Player phone", icon: "PH" },
  { to: "/presentation", label: "Client presentation", icon: "PR" },
  { to: "/report", label: "Report", icon: "RP" },
  { to: "/kpi", label: "KPI summary", icon: "KP" },
];

// Hash-controlled in-page section tabs: only the active section's work area renders, so /config#brand-media,
// /config#demo-numbers and /config#session each show a clearly DIFFERENT working section (not just a scroll).
const SECTIONS = [
  { id: "brand-media", label: "Brand & media", icon: "🎨" },
  { id: "demo-numbers", label: "Campaign assumptions / demo numbers", icon: "📊" },
  { id: "session", label: "Session & run", icon: "▶" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

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
  const { hash } = useLocation();
  const activeSection: SectionId = (SECTIONS.some((s) => s.id === hash.slice(1)) ? hash.slice(1) : "brand-media") as SectionId;

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

  // ── Per-slot state for the slot manager (uploaded → manual path → preset → missing) ──
  const dbAssetByType = (t: AssetType) => (assetsQ.data ?? []).find((a) => a.asset_type === t && a.status === "active");
  const presetUrlFor = (s: MediaSlot): string | undefined =>
    s.kind === "image" ? (active.images as Record<string, string | undefined>)[s.field] : (active.video as Record<string, string | undefined>)[s.field];
  const slotState = (s: MediaSlot): { status: "uploaded" | "manual path" | "preset" | "missing"; url?: string } => {
    const manual = (pack[s.field] as string | undefined)?.trim();
    const db = dbAssetByType(s.type);
    if (db) return { status: "uploaded", url: getAssetUrl(db) };
    if (manual) return { status: "manual path", url: manual };
    const preset = presetUrlFor(s);
    if (preset) return { status: "preset", url: preset };
    return { status: "missing" };
  };
  const clearSlot = (s: MediaSlot) => { updatePack(s.field, ""); const db = dbAssetByType(s.type); if (db) runA(() => updateAssetStatus(db.id, "archived")); };
  const requiredReady = MEDIA_SLOTS.filter((s) => s.group === "Required" && slotState(s).status !== "missing").length + 2; // + identity copy + brand colours (always preset)
  const slotTone = (st: string): React.CSSProperties =>
    st === "uploaded" ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" }
    : st === "missing" ? { background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" }
    : { background: "var(--ppn-bg)", color: "var(--ppn-muted)" };

  const choose = (id: string) => switchPresetGuarded(id);
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
        <h1 className="mt-2 text-3xl font-extrabold">Detailed config · brand &amp; media setup</h1>
        <p className="mt-2 text-[var(--ppn-muted)]">Prepare a run before a brewery sees it. Hidden from the buyer journey.</p>

        {/* Section tabs — the hash selects the active working section (one /config page, not three routes). */}
        <nav aria-label="Config sections" className="mt-4 flex flex-wrap gap-2 text-xs">
          {SECTIONS.map((s) => {
            const on = activeSection === s.id;
            return (
              <Link key={s.id} to={`/config#${s.id}`} aria-current={on ? "page" : undefined}
                className="rounded-full border px-3 py-1.5 font-semibold"
                style={on
                  ? { borderColor: "var(--ppn-brand)", background: "color-mix(in srgb, var(--ppn-brand) 16%, transparent)", color: "var(--ppn-brand)" }
                  : { borderColor: "var(--ppn-border)", background: "var(--ppn-surface)", color: "var(--ppn-muted)" }}>
                {s.icon} {s.label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-2 text-xs text-[var(--ppn-muted)]">Pick a section above. The <Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link> is reference only — it shows which asset appears on which screen.</p>

        <div className="mt-6 space-y-4">
          <Card title="Run the demo">
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Open the TV: <span className="font-mono">/tv/DEMO</span></li>
              <li>Open the Host: <span className="font-mono">/host</span></li>
              <li>Open a Player: <span className="font-mono">/play/DEMO</span></li>
              <li>Start the quiz from the <span className="font-semibold">Host</span>.</li>
            </ol>
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Players wait on their phones; the host starts the quiz. (The player page intentionally has no "start" button.)</p>
          </Card>

          <Card title="Current demo">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full px-2 py-1 font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>{active.sponsorName} · {active.market}</span>
              {([["Client assets", overrideStatus().asset], ["Brand colours", overrideStatus().theme], ["Demo numbers", overrideStatus().scenario]] as [string, boolean][]).map(([label, on]) => (
                <span key={label} className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2.5 py-1">{label}: <span className="font-semibold" style={{ color: on ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{on ? "custom" : "default"}</span></span>
              ))}
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2.5 py-1">Storage upload: <span className="font-semibold">{packsQ.isError ? "unavailable" : packsQ.isSuccess ? "available" : "checking…"}</span></span>
            </div>
            {anyOverrideActive()
              ? <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs" style={{ color: "var(--ppn-warning)" }}>⚠ Custom client overrides are active — clear them before prepping a different brewery.</span><button onClick={() => { clearClientOverrides(); window.location.reload(); }} className="rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold">Clear client overrides</button></div>
              : <p className="mt-2 text-xs text-[var(--ppn-muted)]">Showing preset defaults — no custom client branding applied. Switching brewery below will ask before carrying any overrides over.</p>}
          </Card>

          {activeSection === "brand-media" && (<>
          <div id="brand-media" className="scroll-mt-20 pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Media asset manager</h2>
            <p className="mt-1 text-xs text-[var(--ppn-muted)]"><span className="font-semibold text-[var(--ppn-text)]">CMS-lite media asset manager for the POC.</span> Upload real files from your machine, assign each to a demo slot, then apply to the active demo and open a surface to see it in place. Manual URLs are an advanced fallback, not the main workflow. Spec / sizes: <Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link>.</p>
            {/* What's actually dynamic vs fixed vs not-built in this controlled POC */}
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-[11px]">
                <p className="text-xs font-semibold" style={{ color: "var(--ppn-success)" }}>Dynamic (you set these)</p>
                <p className="mt-1 text-[var(--ppn-muted)]">Uploaded logo, TV hero, sponsor slide, phone card, lower-third, venue image, intro/bumper/closing video, identity / offer copy, brand colours, demo numbers.</p>
              </div>
              <div className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] p-3 text-[11px]">
                <p className="text-xs font-semibold text-[var(--ppn-text)]">Static (fixed in this POC)</p>
                <p className="mt-1 text-[var(--ppn-muted)]">Layout templates, game flow, scoring/reveal, routes, slot definitions, required sizes/aspect ratios, placement rules.</p>
              </div>
              <div className="rounded-lg border border-dashed border-[var(--ppn-border)] p-3 text-[11px]">
                <p className="text-xs font-semibold" style={{ color: "var(--ppn-warning)" }}>Not built yet</p>
                <p className="mt-1 text-[var(--ppn-muted)]">Approval workflow, venue self-service, full production CMS, media library, MP3/audio via the pack (file-based only), picture/video question media, rollout image, auto-cropping.</p>
              </div>
            </div>
          </div>

          <Card title="Active preset · change preset">
            {/* Active preset summary first; the full 12-preset catalogue is collapsed so it doesn't dominate
                ( /operator already lists available presets). Switching uses the existing guarded behaviour. */}
            <div className="flex items-center gap-3 rounded-xl border bg-[var(--ppn-bg)] p-3" style={{ borderColor: active.primary }}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg font-black" style={{ background: active.colours.primary, color: active.colours.onBrand }}>{brandInitials(active.sponsorName)}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{active.sponsorName} <span className="ml-1 rounded bg-[var(--ppn-surface)] px-1.5 py-0.5 text-[10px] text-[var(--ppn-muted)]">{active.market}</span></p>
                <p className="truncate text-xs text-[var(--ppn-muted)]">{active.tagline} · {active.pubName}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold" style={{ color: active.primary }}>Active</span>
            </div>
            <details className="mt-2 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)]">
              <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold text-[var(--ppn-muted)]">Change preset — show all {PRESETS.length} branded presets</summary>
              <div className="space-y-2 p-3 pt-0">
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
            </details>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Switching applies immediately and asks before carrying client overrides across. The full catalogue also appears on <Link to="/operator" className="text-[var(--ppn-brand)]">the operator hub</Link>.</p>
          </Card>

          {/* Asset readiness summary */}
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Asset readiness</p>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={slotTone(requiredReady >= 5 ? "uploaded" : "missing")}>{requiredReady}/5 required assets ready</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Active preset: <span className="font-semibold text-[var(--ppn-text)]">{active.sponsorName}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Client assets: <span className="font-semibold" style={{ color: packActive ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{packActive ? "custom applied" : "preset default"}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Active pack: <span className="font-semibold text-[var(--ppn-text)]">{activePack?.label ?? "none"}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Storage: <span className="font-semibold">{packsQ.isError ? "unavailable" : packsQ.isSuccess ? "available" : "checking…"}</span></span>
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Required = logo, TV hero, sponsor slide, identity/offer copy and brand colours. Full spec: <Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link>.</p>
          </div>

          {/* Step 1 — asset pack (needed to upload files; manual paths work without one) */}
          <Card title="Step 1 · asset pack (for uploads)">
            <p className="text-xs text-[var(--ppn-muted)]">Create or select a pack to upload files into. Manual paths / URLs work without a pack. Storage upload: <span className="font-semibold">{packsQ.isError ? "unavailable — start the local PPN database" : packsQ.isSuccess ? "available" : "checking…"}</span>.</p>
            {!packsQ.isError && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New pack label" className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5 text-sm" />
                <button disabled={assetBusy || !newLabel.trim()} onClick={() => { runA(() => createAssetPack({ label: newLabel.trim(), status: "active" })); setNewLabel(""); }} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--ppn-on-brand)] disabled:opacity-40" style={{ background: "var(--ppn-brand)" }}>＋ Create pack</button>
                {(packsQ.data ?? []).length > 0 && (
                  <select value={activePackId ?? ""} onChange={(e) => setSelPackId(e.target.value)} className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5 text-sm">
                    {(packsQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.label} · {p.status}</option>)}
                  </select>
                )}
              </div>
            )}
            {assetErr && <p className="mt-2 text-xs text-red-400">{assetErr}</p>}
          </Card>

          {/* Step 2 — slot manager: each slot has its own preview + manual path + upload + clear */}
          <Card title="Step 2 · upload &amp; assign per slot">
            <p className="text-xs text-[var(--ppn-muted)]">Upload a real file into each slot — it's stored on the Step-1 pack and assigned to that slot. The <span className="font-semibold text-[var(--ppn-text)]">live</span> / <span className="font-semibold text-[var(--ppn-text)]">preview-only</span> badge says whether that slot renders on the live demo surfaces or only in preview. Manual URL/path is an advanced fallback. Per-slot spec: <Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link>.</p>
            {(["Required", "Recommended", "Optional"] as SlotGroup[]).map((g) => (
              <div key={g} className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">{g}</p>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {MEDIA_SLOTS.filter((s) => s.group === g).map((s) => {
                    const ss = slotState(s);
                    return (
                      <div key={s.field} className="flex flex-col rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{s.label}</p>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase" style={slotTone(ss.status)}>{ss.status}</span>
                            <span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase" style={slotTone(s.live === "live" ? "uploaded" : "preview")}>{s.live}</span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {ss.url && s.kind === "image"
                            ? <img src={ss.url} alt={s.label} className="h-10 w-14 shrink-0 rounded border border-[var(--ppn-border)] object-contain" style={{ background: "var(--ppn-surface)" }} />
                            : <span className="grid h-10 w-14 shrink-0 place-items-center rounded border border-dashed border-[var(--ppn-border)] text-[8px] text-[var(--ppn-muted)]" aria-hidden>{ss.url ? "video set" : "no file"}</span>}
                          <div className="min-w-0 text-[10px] text-[var(--ppn-muted)]">
                            <p>{s.size} · {s.aspect}</p>
                            <p className="truncate">Files: {s.fileType}</p>
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">Appears: {s.appears}</p>
                        {/* Primary action: upload a real file from the machine */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <label className="cursor-pointer" title={activePack ? "Upload a file to this slot" : "Create/select a pack in Step 1 first"}>
                            <span className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[var(--ppn-on-brand)]" style={{ background: activePack ? "var(--ppn-brand)" : "var(--ppn-border)", opacity: activePack ? 1 : 0.6 }}>⬆ {ss.status === "uploaded" ? "Replace file" : "Upload file"}</span>
                            <input type="file" accept={s.accept} disabled={assetBusy || !activePack}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f && activePack) runA(() => uploadAssetFile(activePack.id, s.type, f).then((row) => updatePack(s.field, getAssetUrl(row)))); e.currentTarget.value = ""; }}
                              className="hidden" />
                          </label>
                          <button onClick={() => clearSlot(s)} disabled={ss.status === "preset" || ss.status === "missing"} className="text-[10px] font-semibold text-[var(--ppn-muted)] hover:text-[var(--ppn-text)] disabled:opacity-40">Clear</button>
                        </div>
                        {!activePack && <p className="mt-1 text-[9px] text-[var(--ppn-muted)]">Create/select an asset pack (Step 1) to upload.</p>}
                        <details className="mt-1">
                          <summary className="cursor-pointer text-[9px] text-[var(--ppn-muted)]">Advanced fallback: manual path / URL</summary>
                          <input value={(pack[s.field] as string) ?? ""} placeholder="paste path / URL" onChange={(e) => updatePack(s.field, e.target.value)} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-surface)] px-2 py-1 font-mono text-[11px] text-[var(--ppn-text)]" />
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>

          {/* Brand identity & offer copy (a required "slot") */}
          <Card title="Brand identity &amp; offer copy">
            <p className="text-xs text-[var(--ppn-muted)]">Brewery / client name, campaign, venue, offer, tagline, responsible note. Blank keeps the preset value. Brand colours are a required slot too — set them in the Operator theme preview below.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ASSET_COPY.map((f) => (
                <label key={f.key} className="text-xs text-[var(--ppn-muted)]">{f.label}
                  <input value={(pack[f.key] as string) ?? ""} placeholder={String((active as unknown as Record<string, unknown>)[f.key] ?? "")} onChange={(e) => updatePack(f.key, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" />
                </label>
              ))}
            </div>
          </Card>

          {/* Step 3 — apply / reset */}
          <Card title="Step 3 · apply / reset">
            <div className="flex flex-wrap gap-2">
              <button onClick={applyPack} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Apply to demo</button>
              <button onClick={applyDbPack} disabled={!activePack} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">Apply uploaded pack</button>
              <button onClick={resetPack} disabled={!packActive} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">↺ Reset to preset defaults</button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Apply reloads so every surface re-merges. Uploaded files auto-fill the matching slot path; “Apply uploaded pack” rebuilds the override from the selected pack's active files + copy. Blank fields keep the preset value — an override can never blank a page.</p>
          </Card>

          {/* Advanced — raw asset-pack copy + stored files (the per-slot UI above is the primary path) */}
          {!packsQ.isError && activePack && (
            <details className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)]">
              <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold">Asset pack — copy &amp; stored files (advanced)</summary>
              <div className="px-4 pb-4">
                <p className="text-xs font-semibold text-[var(--ppn-muted)]">Pack copy (stored on the pack; used by “Apply uploaded pack”)</p>
                <div className="mt-1 grid gap-2 sm:grid-cols-3">
                  {PACK_COPY_FIELDS.map((f) => (
                    <label key={f.key} className="text-xs text-[var(--ppn-muted)]">{f.label}
                      <input value={packCopy[f.key] ?? ""} onChange={(e) => setPackCopy((c) => ({ ...c, [f.key]: e.target.value }))} className="mt-1 w-full rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-sm text-[var(--ppn-text)]" />
                    </label>
                  ))}
                </div>
                <button disabled={assetBusy} onClick={() => runA(() => updateAssetPack(activePack.id, packCopy))} className="mt-2 rounded-lg border border-[var(--ppn-border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-40">Save copy</button>

                <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Stored files ({(assetsQ.data ?? []).length})</p>
                <div className="mt-1 space-y-1.5">
                  {(assetsQ.data ?? []).length === 0 && <p className="text-xs text-[var(--ppn-muted)]">No files yet — upload per slot above.</p>}
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
              </div>
            </details>
          )}

          <Card title="Where assets appear">
            <div className="space-y-1.5 text-xs">
              {([
                ["Logo", "Used on TV/audience screen + player phone (brewery banner / header)", "live"],
                ["Hero image", "Used on client preview + player phone (landing / splash)", "live"],
                ["Sponsor slide", "Used on TV/audience screen (sponsor slideshow)", "live"],
                ["Phone card", "Used on client preview only — not in live player gameplay yet", "preview"],
                ["Lower third", "Used on client preview only — not in live TV gameplay yet", "preview"],
                ["Venue image", "Used on client preview only — not in live gameplay yet", "preview"],
                ["Videos", "Used on TV/audience screen (intro / sponsor-bumper / closing) where a real URL is set", "where wired"],
                ["Audio (MP3)", "Script pack ready; MP3s not added — host/TV use the on-screen script", "not yet"],
              ] as [string, string, string][]).map(([a, where, tag]) => (
                <div key={a} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1.5">
                  <span><span className="font-semibold text-[var(--ppn-text)]">{a}</span> <span className="text-[var(--ppn-muted)]">— {where}</span></span>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase" style={tag === "live" ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" } : { background: "var(--ppn-surface)", color: "var(--ppn-muted)" }}>{tag}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Uploaded assets are stored even if not shown live — only the surfaces marked "live" appear during a run. Full spec: <Link to="/setup#where-assets-appear" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link>.</p>
          </Card>

          <Card title="Operator theme preview">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--ppn-muted)]">Base preset: <span className="font-semibold text-[var(--ppn-text)]">{active.sponsorName}</span> <span className="ml-1 rounded bg-[var(--ppn-bg)] px-1.5 py-0.5 text-[10px]">{active.market}</span></p>
              {hasOver
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Custom colours active</span>
                : <span className="text-[10px] text-[var(--ppn-muted)]">preset defaults</span>}
            </div>
            <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">Predesign a brewery look before the pitch (operator-only — never shown to the brewery). Colours apply app-wide via theme tokens, but each surface picks them up on its <span className="text-[var(--ppn-text)]">next page load</span> — an already-open TV/player must be reloaded to repaint. The sample below is representative of the player / host / TV / presenter surfaces; it is not a live mirror of those pages.</p>

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

            {/* Representative preview (not a live mirror of TV/player/presentation) */}
            <p className="mt-4 text-xs font-semibold text-[var(--ppn-muted)]">Representative preview · operator surfaces</p>
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

          {/* Preview active demo — read-only surface previews that link to the real routes (no iframe / no engine) */}
          <Card title="Preview active demo">
            <p className="text-xs text-[var(--ppn-muted)]">What {active.sponsorName} looks like on the key surfaces with the current asset state — open any to see the real page (read-only). Apply changes first to see uploads live.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PREVIEW_SURFACES.map((s) => (
                <a key={s.to} href={s.to} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2.5 hover:border-[var(--ppn-brand)]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[10px] font-black" style={{ background: active.colours.primary, color: active.colours.onBrand }}>{s.icon}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{s.label}</span>
                  <span className="shrink-0 text-[var(--ppn-brand)]">↗</span>
                </a>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Previews use the current asset state (uploaded → manual → preset → neutral placeholder) — no generated or decorative images.</p>
          </Card>

          </>)}

          {activeSection === "demo-numbers" && (<>
          <div id="demo-numbers" className="scroll-mt-20 pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Campaign assumptions / demo numbers</h2>
            <p className="mt-1 text-xs text-[var(--ppn-muted)]">The venue-mix numbers that feed the KPI and rollout pages. Operator-only — never shown to the buyer.</p>
          </div>

          <Card title="Campaign assumptions / demo numbers (operator only)">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--ppn-muted)]">Prepare believable demo numbers — /kpi and /rollout derive from these. Internal only.</p>
              {hasScenarioOver
                ? <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "color-mix(in srgb, var(--ppn-warning) 22%, transparent)", color: "var(--ppn-warning)" }}>Custom demo numbers active</span>
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
                <p className="text-[11px] text-[var(--ppn-muted)]">Venue mix drives venues/events/players (weighted) — clear the demo numbers to edit those scalars directly.</p>
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
            ) : <p className="mt-2 text-xs" style={{ color: "var(--ppn-success)" }}>✓ Demo numbers look realistic.</p>}
          </Card>

          </>)}

          {activeSection === "session" && (<>
          <div id="session" className="scroll-mt-20 pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--ppn-brand)" }}>Session &amp; run</h2>
            <p className="mt-1 text-xs text-[var(--ppn-muted)]">Output mode, the live demo session (reset / demo teams) and presentation mode.</p>
          </div>

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
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">Hosting mode is toggled live on the host panel.</p>
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
              <button disabled={busy || !sid} onClick={() => run(async () => { await clearTeams(sid!); await seedDemoTeams(sid!, specs); })} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">＋ Add {seedSize} demo teams</button>
              <button disabled={busy || !sid} onClick={() => run(() => clearTeams(sid!))} className="rounded-xl border border-[var(--ppn-border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">✕ Clear teams</button>
            </div>
            <p className="mt-2 text-xs text-[var(--ppn-muted)]">
              {teamsQ.data ? `${teamsQ.data.length} team${teamsQ.data.length === 1 ? "" : "s"} in session · ` : ""}
              Adds {seedSize} {market.label} demo teams (local demo only). Live session normally shows a few sample teams; KPI/rollout numbers are campaign-level totals across many events, not this session.
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
            <p className="mt-3 text-xs"><Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">Asset reference / slot guide →</Link> <span className="text-[var(--ppn-muted)]">(operator reference — not shown to the buyer)</span></p>
          </Card>
          </>)}
        </div>
      </div>
    </DemoShell>
  );
}
