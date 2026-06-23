/**
 * /config — hidden OPERATOR prep room (presenter only; never part of the buyer journey). Lightweight demo prep:
 * brewery preset, market, setup mode, reset demo, seed/clear teams, audience-mode toggle. Richer profile pickers
 * are labelled stubs. NOT an admin/CMS/portal — just enough to prepare a demo run.
 */
import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DemoShell } from "../components/shells";
import { isVideoUrl } from "../components/brandZones";
import { PRESETS, getActiveBrand, brandInitials, type ThemeColours } from "../demo/brand";
import { switchPresetGuarded, overrideStatus, anyOverrideActive, clearClientOverrides } from "../lib/demoStatus";
import { activeMarket } from "../demo/markets";
import { SETUP_MODES } from "../demo/setup";
import { useAudienceMode } from "../lib/audience";
import { applyTheme, getThemeOverride, setThemeOverride, clearThemeOverride, themeWarnings, type ColourOverride } from "../demo/theme";
import { getAssetPackOverride, setAssetPackOverride, clearAssetPackOverride, hasAssetPackOverride, type AssetPack } from "../demo/assetPack";
import { listAssetPacks, listAssets, createAssetPack, updateAssetPack, uploadAssetFile, setAssetActive, updateAssetStatus, getAssetUrl, type AssetType } from "../lib/ppnAssets";
import {
  deriveKpi, applyScenarioToSeed, getScenario, setScenario, clearScenario, scenarioWarnings,
  SCENARIO_TEMPLATES, deriveVenueMix, venueMixWarnings, venueCategory, setupModeLabel,
  type Scenario, type VenueProfile,
} from "../demo/kpiModel";
import { resolveJoinToken, getSessionState, setSessionSetup, resetDemo, clearTeams, seedDemoTeams, listTeams } from "../lib/ppnApi";
import {
  CUE_FAMILIES, AUDIO_CUES, SCRIPT_STYLE_RULES, REPEAT_PHRASE_EXAMPLES, WINNER_SCRIPT_REF, TEAM_NUMBER_FOLLOWUP,
  QUESTION_FILE_CONVENTION, type AudioCueDef,
} from "../demo/audioCues";
import { QUESTION_POOL } from "../demo/questionPool";
import { CONTENT_CATEGORIES, categoryLabel, type ContentCategoryId } from "../lib/contentMix";
import {
  DEMO_PLAYLIST, buildRunOrder, HOST_RUN_MODES, SCRIPT_STYLES, DEMO_EVENT_CONTEXT, eventOpenerReference,
  type RunStatus, type HostRunModeId,
} from "../demo/quizPlaylist";
import {
  bankCategoryCounts, QUESTION_BANK, MIX_PROFILES, DEMO_COMPILE_OPTIONS, buildAnswerReviewScript,
  buildProductionList, ANSWER_REVIEW_TONE, ANSWER_REVIEW_EXAMPLES, type ProductionStatus,
} from "../demo/questionBank";
import { VARIANT_BANKS, VARIETY_RECORDING_TIPS, type VariantColour } from "../demo/scriptVariants";

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
type SlotMedia = "image" | "image+video" | "video";
interface MediaSlot { group: SlotGroup; field: keyof AssetPack; type: AssetType; label: string; size: string; aspect: string; fileType: string; accept: string; appears: string; kind: "image" | "video"; media: SlotMedia; fit: "contain" | "cover"; live: "live" | "preview-only" }
const MEDIA_SLOTS: MediaSlot[] = [
  { group: "Required", field: "logoUrl", type: "logo", label: "Brewery / client logo", size: "≥512px · transparent", aspect: "1/1", fileType: "PNG · SVG · JPG · GIF", accept: "image/*", appears: "TV banner · player header · KPI", kind: "image", media: "image", fit: "contain", live: "live" },
  { group: "Required", field: "heroUrl", type: "hero", label: "TV hero / campaign background", size: "1920×1080", aspect: "16/9", fileType: "JPG · PNG · GIF · MP4 · WebM", accept: "image/*,video/*", appears: "presentation landing · player splash", kind: "image", media: "image+video", fit: "cover", live: "live" },
  { group: "Required", field: "sponsorSlideUrl", type: "sponsor_slide", label: "TV sponsor slide / offer card", size: "1920×1080", aspect: "16/9", fileType: "JPG · PNG · GIF", accept: "image/*", appears: "TV sponsor slideshow / pause", kind: "image", media: "image", fit: "cover", live: "live" },
  { group: "Recommended", field: "phoneCardUrl", type: "phone_card", label: "Phone sponsor card", size: "1080×1350", aspect: "4/5", fileType: "JPG · PNG · GIF", accept: "image/*", appears: "player waiting / sponsored Q", kind: "image", media: "image", fit: "cover", live: "preview-only" },
  { group: "Recommended", field: "lowerThirdUrl", type: "lower_third", label: "TV lower-third / offer strip", size: "1920×240", aspect: "8/1", fileType: "PNG (transparent)", accept: "image/*", appears: "TV offer strip", kind: "image", media: "image", fit: "contain", live: "preview-only" },
  { group: "Recommended", field: "venueUrl", type: "venue_image", label: "Venue / background visual", size: "1600×900", aspect: "16/9", fileType: "JPG · PNG · GIF · MP4 · WebM", accept: "image/*,video/*", appears: "presentation venue", kind: "image", media: "image+video", fit: "cover", live: "preview-only" },
  { group: "Optional", field: "tvIntroVideoUrl", type: "intro_video", label: "Intro video", size: "16:9 short clip", aspect: "16/9", fileType: "MP4 · WebM", accept: "video/*", appears: "TV intro", kind: "video", media: "video", fit: "cover", live: "live" },
  { group: "Optional", field: "sponsorBumperVideoUrl", type: "sponsor_bumper_video", label: "Sponsor bumper video", size: "16:9 short clip", aspect: "16/9", fileType: "MP4 · WebM", accept: "video/*", appears: "TV sponsor bumper", kind: "video", media: "video", fit: "cover", live: "live" },
  { group: "Optional", field: "closingVideoUrl", type: "closing_video", label: "Closing video", size: "16:9 short clip", aspect: "16/9", fileType: "MP4 · WebM", accept: "video/*", appears: "TV closing", kind: "video", media: "video", fit: "cover", live: "live" },
];
const mediaCapabilityLabel = (m: SlotMedia): string =>
  m === "video" ? "video (MP4/WebM) · host presses play · muted, no autoplay"
  : m === "image+video" ? "image / GIF / video — video renders on the surface (cover, muted, looping)"
  : "image / GIF (no video on this slot)";
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
  const [assetErr, setAssetErr] = useState<string | null>(null);
  const [dims, setDims] = useState<Record<string, { w: number; h: number }>>({}); // client-side natural sizes per slot
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
  // The currently-APPLIED override (what the live demo is using) — to show per-slot applied vs not-applied.
  const appliedOverride = getAssetPackOverride();
  // Upload one file to a slot. Auto-creates a "<brewery> custom assets" set the first time, so the operator never
  // has to think about an asset set first; the uploaded file's URL is assigned to the slot's override field.
  const uploadToSlot = async (s: MediaSlot, file: File) => {
    let packId = activePack?.id;
    if (!packId) { const created = await createAssetPack({ label: `${active.sponsorName} custom assets`, status: "active" }); packId = created.id; setSelPackId(packId); }
    const row = await uploadAssetFile(packId, s.type, file);
    updatePack(s.field, getAssetUrl(row));
  };

  // ── Per-slot state (uploaded → manual path → preset → missing) + applied-to-live flag ──
  const dbAssetByType = (t: AssetType) => (assetsQ.data ?? []).find((a) => a.asset_type === t && a.status === "active");
  const presetUrlFor = (s: MediaSlot): string | undefined =>
    s.kind === "image" ? (active.images as Record<string, string | undefined>)[s.field] : (active.video as Record<string, string | undefined>)[s.field];
  const slotState = (s: MediaSlot): { status: "uploaded" | "manual path" | "preset" | "missing"; url?: string; applied: boolean } => {
    const manual = (pack[s.field] as string | undefined)?.trim();
    const db = dbAssetByType(s.type);
    const cur = manual || (db ? getAssetUrl(db) : undefined);
    const appliedVal = (appliedOverride[s.field] as string | undefined)?.trim();
    const applied = !!cur && !!appliedVal && cur === appliedVal;
    if (db) return { status: "uploaded", url: getAssetUrl(db), applied };
    if (manual) return { status: "manual path", url: manual, applied };
    const preset = presetUrlFor(s);
    if (preset) return { status: "preset", url: preset, applied: true };
    return { status: "missing", applied: false };
  };
  const clearSlot = (s: MediaSlot) => { updatePack(s.field, ""); const db = dbAssetByType(s.type); if (db) runA(() => updateAssetStatus(db.id, "archived")); };
  // Effective asset state for the visual preview cards (uploaded → manual → preset → missing).
  const logoSlot = MEDIA_SLOTS.find((s) => s.field === "logoUrl")!;
  const heroSlot = MEDIA_SLOTS.find((s) => s.field === "heroUrl")!;
  const introVidSlot = MEDIA_SLOTS.find((s) => s.field === "tvIntroVideoUrl")!;
  // ── Audio cue state (uploaded → preset fixed file → missing) + upload (operator-supplied MP3, no generation).
  // Cues without a `field`/`type` are reference-only (no in-app upload); a brand.audio fallback may still exist. ──
  const cueFallback = (c: AudioCueDef): string | undefined =>
    c.audioField ? (active.audio as unknown as Record<string, string | undefined>)[c.audioField] : undefined;
  const cueUrl = (c: AudioCueDef): string | undefined =>
    (c.field ? (pack[c.field] as string | undefined)?.trim() : undefined)
    || (c.type && dbAssetByType(c.type) ? getAssetUrl(dbAssetByType(c.type)!) : cueFallback(c));
  const cueState = (c: AudioCueDef): "uploaded" | "preset" | "missing" => {
    if (c.field && ((pack[c.field] as string | undefined)?.trim() || (c.type && dbAssetByType(c.type)))) return "uploaded";
    return cueFallback(c) ? "preset" : "missing";
  };
  const cueApplied = (c: AudioCueDef): boolean => {
    if (!c.field) return false;
    const app = (appliedOverride[c.field] as string | undefined)?.trim();
    const cur = (pack[c.field] as string | undefined)?.trim() || (c.type && dbAssetByType(c.type) ? getAssetUrl(dbAssetByType(c.type)!) : undefined);
    return !!cur && !!app && cur === app;
  };
  const uploadCue = async (c: AudioCueDef, file: File) => {
    if (!c.field || !c.type) return; // reference-only cue: not uploadable in-app
    let packId = activePack?.id;
    if (!packId) { const created = await createAssetPack({ label: `${active.sponsorName} custom assets`, status: "active" }); packId = created.id; setSelPackId(packId); }
    const row = await uploadAssetFile(packId, c.type, file);
    updatePack(c.field, getAssetUrl(row));
  };
  const clearCue = (c: AudioCueDef) => { if (!c.field) return; updatePack(c.field, ""); const db = c.type && dbAssetByType(c.type); if (db) runA(() => updateAssetStatus(db.id, "archived")); };
  const cueStatusLabel: Record<AudioCueDef["status"], string> = { live: "live (host)", "stored-only": "stored-only", "not-wired": "not wired" };
  const liveCuesReady = AUDIO_CUES.filter((c) => c.status === "live" && cueState(c) === "uploaded").length;
  const liveCuesTotal = AUDIO_CUES.filter((c) => c.status === "live").length;
  // Question-audio library (per category/question) — real seeded pool data, scales to N categories × N questions.
  const [libCat, setLibCat] = useState<ContentCategoryId>("general");
  const [libSearch, setLibSearch] = useState("");
  const libRows = QUESTION_POOL
    .filter((q) => q.category === libCat)
    .filter((q) => !libSearch.trim() || q.prompt.toLowerCase().includes(libSearch.trim().toLowerCase()));
  // Tonight's playlist / run order (planning model) + host-run-mode + script-style concept selectors.
  const runOrder = buildRunOrder();
  const [runMode, setRunMode] = useState<HostRunModeId>("manual");
  const [scriptStyle, setScriptStyle] = useState(SCRIPT_STYLES[0].id);
  const runTone = (s: RunStatus): React.CSSProperties => slotTone(s === "live" ? "uploaded" : "preview");
  const runStatusLabel: Record<RunStatus, string> = { live: "live (host)", "stored-only": "stored-only · file-drop", "not-wired": "not wired" };
  // Bank authority + answer-review + ElevenLabs production list for the compiled demo playlist.
  const catCounts = bankCategoryCounts();
  const reviewScript = buildAnswerReviewScript();
  const productionCues = buildProductionList();
  const demoMixLabel = MIX_PROFILES.find((p) => p.id === DEMO_COMPILE_OPTIONS.mix)?.label ?? "Mixed";
  const [bankBrowseCat, setBankBrowseCat] = useState<ContentCategoryId>("general");
  const prodTone = (s: ProductionStatus): React.CSSProperties => slotTone(s === "ready to record" ? "uploaded" : s === "placeholder" ? "missing" : "preview");

  const previewLogoUrl = slotState(logoSlot).url;
  const previewHeroUrl = slotState(heroSlot).url;
  const logoStatus = slotState(logoSlot).status;
  const heroStatus = slotState(heroSlot).status;
  const introVidStatus = slotState(introVidSlot).status;
  const effSponsor = (pack.sponsorName as string | undefined)?.trim() || active.sponsorName;
  const effCampaign = (pack.campaignName as string | undefined)?.trim() || active.campaignName;
  const requiredReady = MEDIA_SLOTS.filter((s) => s.group === "Required" && slotState(s).status !== "missing").length + 2; // + identity copy + brand colours (always preset)
  const slotTone = (st: string): React.CSSProperties =>
    st === "uploaded" ? { background: "color-mix(in srgb, var(--ppn-success) 18%, transparent)", color: "var(--ppn-success)" }
    : st === "missing" ? { background: "color-mix(in srgb, var(--ppn-warning) 20%, transparent)", color: "var(--ppn-warning)" }
    : { background: "var(--ppn-bg)", color: "var(--ppn-muted)" };
  // Fit behaviour matches the real surfaces: logo + lower-third render object-contain (no crop); the rest cover.
  const slotFitLabel = (s: MediaSlot): string => (s.fit === "contain" ? "contain · letterbox, no crop (transparent recommended)" : "cover · crops to fill");
  // Aspect status from client-side natural dimensions vs the slot's preferred aspect ratio.
  const aspectStatus = (s: MediaSlot, w: number, h: number): { label: string; tone: string } => {
    const [aw, ah] = s.aspect.split("/").map(Number);
    const want = aw && ah ? aw / ah : 1;
    const got = h ? w / h : 1;
    const diff = Math.abs(got - want) / want;
    if (diff <= 0.03) return { label: "aspect: ideal", tone: "uploaded" };
    if (diff <= 0.15) return { label: "aspect: acceptable", tone: "preset" };
    return { label: `aspect: warning (${got.toFixed(2)}:1, want ${s.aspect})`, tone: "missing" };
  };

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
            <p className="mt-1 text-xs text-[var(--ppn-muted)]"><span className="font-semibold text-[var(--ppn-text)]">CMS-lite media asset manager for the POC.</span> Upload one file per slot, then apply to the demo and open a surface to see it in place. Manual URLs are an advanced fallback. Spec / sizes: <Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link>.</p>
            {/* Concise dynamic vs static vs not-built distinction */}
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">
              <span className="font-semibold" style={{ color: "var(--ppn-success)" }}>Dynamic:</span> uploaded slot media (image / GIF / video) + MP3 audio cues where wired, identity/offer copy, colours, demo numbers ·
              <span className="font-semibold text-[var(--ppn-text)]"> Static:</span> layout, game flow, scoring, routes, placement rules ·
              <span className="font-semibold" style={{ color: "var(--ppn-warning)" }}> Not built / not wired:</span> picture/video question media, rollout/network image, some audio cues (pause/closing/how-to), approval workflow, venue self-service, full media library, auto-cropping/editing.
            </p>
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

          {/* Current demo assets — plain summary; the underlying "asset set" is folded into a small disclosure */}
          <div className="rounded-xl border-2 bg-[var(--ppn-surface)] p-4" style={{ borderColor: "color-mix(in srgb, var(--ppn-brand) 30%, var(--ppn-border))" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Current demo assets</p>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={slotTone(requiredReady >= 5 ? "uploaded" : "missing")}>{requiredReady}/5 required ready</span>
            </div>
            <p className="mt-1 text-xs text-[var(--ppn-muted)]">Upload one file per slot below — they're grouped into this demo's client asset set automatically. Then <span className="font-semibold text-[var(--ppn-text)]">Apply</span> and open a surface to see them in place.</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Active preset: <span className="font-semibold text-[var(--ppn-text)]">{active.sponsorName}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Client assets: <span className="font-semibold" style={{ color: packActive ? "var(--ppn-warning)" : "var(--ppn-muted)" }}>{packActive ? "custom applied" : "preset default"}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Asset set: <span className="font-semibold text-[var(--ppn-text)]">{activePack?.label ?? "auto-creates on first upload"}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Storage: <span className="font-semibold">{packsQ.isError ? "unavailable — use manual fallback" : packsQ.isSuccess ? "available" : "checking…"}</span></span>
            </div>
            {(packsQ.data ?? []).length > 1 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-[11px] text-[var(--ppn-muted)]">Use a different client asset set</summary>
                <select value={activePackId ?? ""} onChange={(e) => setSelPackId(e.target.value)} className="mt-1 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1.5 text-sm">
                  {(packsQ.data ?? []).map((p) => <option key={p.id} value={p.id}>{p.label} · {p.status}</option>)}
                </select>
              </details>
            )}
            {assetErr && <p className="mt-2 text-xs text-red-400">{assetErr}</p>}
          </div>

          {/* Preview active demo — compact VISUAL mini-mocks built from the current effective assets (uploaded →
              preset → neutral structural placeholder). No iframe / no preview engine / no generated artwork. */}
          <Card title="Preview active demo">
            <p className="text-xs text-[var(--ppn-muted)]">A visual preview built from your current assets (uploaded → preset → neutral placeholder). Open any surface to see the real page; apply changes to push uploads live.</p>
            {(() => {
              const Logo = ({ size = "h-7 w-7" }: { size?: string }) => previewLogoUrl
                ? <img src={previewLogoUrl} alt="logo" className={`${size} shrink-0 rounded border border-[var(--ppn-border)] object-contain`} style={{ background: "var(--ppn-surface)" }} />
                : <span className={`grid ${size} shrink-0 place-items-center rounded text-[9px] font-black`} style={{ background: active.colours.primary, color: active.colours.onBrand }}>{brandInitials(effSponsor)}</span>;
              const Tag = ({ s }: { s: string }) => <span className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase" style={slotTone(s)}>{s}</span>;
              return (
                <div data-testid="preview-active-demo" className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* TV / audience — 16:9 mock: hero (cover) + logo banner + sponsor + intro-video state */}
                  <a href="/tv/DEMO" target="_blank" rel="noreferrer" className="group rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 hover:border-[var(--ppn-brand)]">
                    <div className="relative overflow-hidden rounded" style={{ aspectRatio: "16/9", background: "var(--ppn-surface)" }}>
                      {previewHeroUrl && (isVideoUrl(previewHeroUrl)
                        ? <video src={previewHeroUrl} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-90" />
                        : <img src={previewHeroUrl} alt="hero" className="absolute inset-0 h-full w-full object-cover opacity-90" />)}
                      <div className="absolute left-1.5 top-1.5 flex items-center gap-1.5"><Logo size="h-6 w-6" /><span className="truncate rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-semibold text-white">{effSponsor}</span></div>
                      <div className="absolute bottom-1.5 left-1.5 rounded bg-black/40 px-1.5 py-0.5 text-[8px] text-white">Scan to join</div>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-1 text-[10px] font-semibold">TV / audience display <span className="text-[var(--ppn-brand)]">↗</span></p>
                    <p className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-[var(--ppn-muted)]">logo <Tag s={logoStatus} /> hero <Tag s={heroStatus} /> intro video <Tag s={introVidStatus} /></p>
                  </a>
                  {/* Player phone — header (logo + sponsor) + hero strip */}
                  <a href="/play/DEMO" target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 hover:border-[var(--ppn-brand)]">
                    <div className="overflow-hidden rounded border border-[var(--ppn-border)]">
                      <div className="flex items-center gap-1.5 p-1.5" style={{ background: "var(--ppn-surface)" }}><Logo size="h-6 w-6" /><span className="truncate text-[10px] font-semibold">{effSponsor}</span></div>
                      {previewHeroUrl && isVideoUrl(previewHeroUrl)
                        ? <video src={previewHeroUrl} autoPlay muted loop playsInline className="h-12 w-full object-cover" />
                        : <div className="h-12" style={{ background: previewHeroUrl ? `center/cover url(${previewHeroUrl})` : "var(--ppn-surface)" }} />}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold">Player phone <span className="text-[var(--ppn-brand)]">↗</span></p>
                    <p className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-[var(--ppn-muted)]">logo <Tag s={logoStatus} /> hero <Tag s={heroStatus} /></p>
                  </a>
                  {/* Client presentation — logo + campaign header */}
                  <a href="/presentation" target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 hover:border-[var(--ppn-brand)]">
                    <div className="flex items-center gap-1.5 rounded border border-[var(--ppn-border)] p-2" style={{ background: "var(--ppn-surface)" }}><Logo /><div className="min-w-0"><p className="truncate text-[10px] font-semibold">{effSponsor}</p><p className="truncate text-[9px] text-[var(--ppn-muted)]">{effCampaign}</p></div></div>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold">Client presentation <span className="text-[var(--ppn-brand)]">↗</span></p>
                    <p className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-[var(--ppn-muted)]">logo <Tag s={logoStatus} /> hero <Tag s={heroStatus} /></p>
                  </a>
                  {/* Report + KPI — header badge (logo + sponsor) */}
                  {[{ to: "/report", label: "Report" }, { to: "/kpi", label: "KPI summary" }].map((r) => (
                    <a key={r.to} href={r.to} target="_blank" rel="noreferrer" className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-2 hover:border-[var(--ppn-brand)]">
                      <div className="flex items-center gap-1.5 rounded border border-[var(--ppn-border)] p-2" style={{ background: "var(--ppn-surface)" }}><Logo size="h-6 w-6" /><span className="truncate text-[10px] font-semibold">{effSponsor}</span></div>
                      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold">{r.label} <span className="text-[var(--ppn-brand)]">↗</span></p>
                      <p className="mt-0.5 flex flex-wrap gap-1 text-[9px] text-[var(--ppn-muted)]">logo <Tag s={logoStatus} /></p>
                    </a>
                  ))}
                </div>
              );
            })()}
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Structural mock from real assets only — neutral placeholders where missing, no generated/decorative images. Apply first to see uploads on the live surfaces.</p>
          </Card>

          {/* Upload by slot — the primary workflow */}
          <Card title="Upload by slot">
            <p className="text-xs text-[var(--ppn-muted)]">Click <span className="font-semibold text-[var(--ppn-text)]">Upload file</span> on any slot and pick a file from your machine — no setup first. The <span className="font-semibold text-[var(--ppn-text)]">live</span> / <span className="font-semibold text-[var(--ppn-text)]">preview-only</span> badge says whether that slot renders on the live demo or only in preview. Manual URL/path is an advanced fallback. Spec: <Link to="/setup#asset-slots" className="text-[var(--ppn-brand)]">asset reference / slot guide</Link>.</p>
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
                        {(ss.status === "uploaded" || ss.status === "manual path") && (
                          <p className="mt-1 text-[9px] font-semibold uppercase" style={{ color: ss.applied ? "var(--ppn-success)" : "var(--ppn-warning)" }}>{ss.applied ? "● applied" : "● uploaded · not applied"}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {ss.url && isVideoUrl(ss.url)
                            ? <video src={ss.url} muted playsInline preload="metadata" className="h-10 w-14 shrink-0 rounded border border-[var(--ppn-border)] object-cover" style={{ background: "var(--ppn-surface)" }} />
                            : ss.url
                            ? <img src={ss.url} alt={s.label} onLoad={(e) => { const t = e.currentTarget; if (t.naturalWidth) setDims((d) => ({ ...d, [s.field]: { w: t.naturalWidth, h: t.naturalHeight } })); }} className="h-10 w-14 shrink-0 rounded border border-[var(--ppn-border)]" style={{ background: "var(--ppn-surface)", objectFit: s.fit }} />
                            : <span className="grid h-10 w-14 shrink-0 place-items-center rounded border border-dashed border-[var(--ppn-border)] text-[8px] text-[var(--ppn-muted)]" aria-hidden>no file</span>}
                          <div className="min-w-0 text-[10px] text-[var(--ppn-muted)]">
                            <p>{s.size} · {s.aspect}</p>
                            <p className="truncate">Files: {s.fileType}</p>
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">Appears: {s.appears}</p>
                        <p className="text-[10px] text-[var(--ppn-muted)]">Media: {mediaCapabilityLabel(s.media)}</p>
                        <p className="text-[10px] text-[var(--ppn-muted)]">Fit: {slotFitLabel(s)}</p>
                        {s.kind === "image" && !isVideoUrl(ss.url) && (dims[s.field]
                          ? (() => { const d = dims[s.field]; const st = aspectStatus(s, d.w, d.h); return <p className="text-[10px] font-medium" style={{ color: slotTone(st.tone).color }}>Uploaded {d.w}×{d.h} · {st.label}</p>; })()
                          : <p className="text-[10px] text-[var(--ppn-muted)]">Dimensions: shown after a file loads · status: unknown</p>)}
                        {/* Primary action: upload a real file from the machine */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <label className="cursor-pointer" title={packsQ.isError ? "Storage unavailable — use the manual fallback below" : "Upload a file to this slot"}>
                            <span className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[var(--ppn-on-brand)]" style={{ background: packsQ.isError ? "var(--ppn-border)" : "var(--ppn-brand)", opacity: packsQ.isError ? 0.6 : 1 }}>⬆ {ss.status === "uploaded" ? "Replace file" : "Upload file"}</span>
                            <input type="file" accept={s.accept} disabled={assetBusy || packsQ.isError}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) runA(() => uploadToSlot(s, f)); e.currentTarget.value = ""; }}
                              className="hidden" />
                          </label>
                          <button onClick={() => clearSlot(s)} disabled={ss.status === "preset" || ss.status === "missing"} className="text-[10px] font-semibold text-[var(--ppn-muted)] hover:text-[var(--ppn-text)] disabled:opacity-40">Clear</button>
                        </div>
                        {packsQ.isError && <p className="mt-1 text-[9px] text-[var(--ppn-muted)]">Storage unavailable — start the local PPN database, or use the manual fallback.</p>}
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

          {/* Tonight's demo playlist & run order — 5 selected questions, then answer-review, then winner/outro.
              Planning/script model only (does NOT drive the live game loop). Keeps the main view small + honest. */}
          <Card title="Tonight's demo playlist &amp; run order">
            <p className="text-xs text-[var(--ppn-muted)]">A small POC evening: <span className="font-semibold text-[var(--ppn-text)]">5 selected questions</span> compiled from the authoritative question bank, read in the question phase, then revealed later in a single combined answer-review, then the winner &amp; outro. This is a <span className="font-semibold text-[var(--ppn-text)]">script/run-order plan</span> — it doesn't change the live game loop. The full bank stays collapsed below.</p>
            {/* Playlist compiler / source summary */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Source: <span className="font-semibold text-[var(--ppn-text)]">authoritative bank ({QUESTION_BANK.length} Q)</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Compiler mix: <span className="font-semibold text-[var(--ppn-text)]">{demoMixLabel}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Count: <span className="font-semibold text-[var(--ppn-text)]">{DEMO_COMPILE_OPTIONS.count}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Sponsor: <span className="font-semibold text-[var(--ppn-text)]">{DEMO_COMPILE_OPTIONS.includeSponsor ? "included" : "excluded"}</span></span>
              <span className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1">Selection: <span className="font-semibold text-[var(--ppn-text)]">deterministic (stable)</span></span>
            </div>
            {/* Namespace-collision warning — resolved: playlist cues are namespaced, distinct from live-game files */}
            <p className="mt-2 rounded-lg border px-2.5 py-1.5 text-[10px]" style={{ borderColor: "color-mix(in srgb, var(--ppn-success) 40%, var(--ppn-border))", color: "var(--ppn-muted)" }}>✓ No filename collision: playlist cues use the namespaced <span className="font-mono">playlist-demo-…</span> keys, separate from the live game's fixed <span className="font-mono">question-NN.mp3</span> files.</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--ppn-border)] text-[10px] uppercase tracking-wide text-[var(--ppn-muted)]">
                    <th className="py-1.5 pr-2 font-semibold">Step</th>
                    <th className="py-1.5 pr-2 font-semibold">Phase</th>
                    <th className="py-1.5 pr-2 font-semibold">Category</th>
                    <th className="py-1.5 pr-2 font-semibold">Script / audio cue</th>
                    <th className="py-1.5 pr-2 font-semibold">Cue file</th>
                    <th className="py-1.5 pr-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runOrder.map((s) => (
                    <tr key={s.step} className="border-b border-[var(--ppn-border)] align-top">
                      <td className="py-1.5 pr-2 font-semibold">{s.step}</td>
                      <td className="py-1.5 pr-2 text-[var(--ppn-muted)]">{s.phaseLabel}</td>
                      <td className="py-1.5 pr-2 text-[var(--ppn-muted)]">{s.category ?? "—"}</td>
                      <td className="py-1.5 pr-2"><span className="font-semibold text-[var(--ppn-text)]">{s.label}</span><span className="block max-w-[260px] truncate text-[10px] text-[var(--ppn-muted)]" title={s.detail ?? s.cue}>{s.detail ?? s.cue}</span></td>
                      <td className="py-1.5 pr-2 font-mono text-[10px] text-[var(--ppn-muted)]">{s.file ?? "—"}</td>
                      <td className="py-1.5 pr-2"><span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase" style={runTone(s.status)}>{runStatusLabel[s.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-[var(--ppn-muted)]">The host reads <span className="font-semibold text-[var(--ppn-text)]">all five questions first</span>; answers are revealed later in a single combined answer-review — never straight after each question. Global cues (intro / winner) are host-triggered today; playlist readout + answer-review files are <span className="font-semibold text-[var(--ppn-text)]">stored-only · file-drop</span> (in-app per-question upload is parked — needs a keyed asset set).</p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--ppn-muted)]">The 5 selected questions</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DEMO_PLAYLIST.map((q) => (
                <div key={q.id} className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Q{q.order} · {q.categoryLabel}{q.sponsor && <span className="ml-1 rounded bg-[var(--ppn-surface)] px-1.5 py-0.5 text-[9px] text-[var(--ppn-muted)]">sponsor</span>}</p>
                    <span className="font-mono text-[9px] text-[var(--ppn-muted)]">{q.id}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--ppn-text)]">{q.prompt}</p>
                  <p className="text-[11px] text-[var(--ppn-muted)]">Answer (review phase): <span className="font-semibold text-[var(--ppn-text)]">{q.answer}</span></p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[9px]">
                    <span className="rounded-full px-2 py-0.5 font-semibold uppercase" style={runTone("stored-only")}>readout: {q.readoutFile}</span>
                    {q.mediaSlot && <span className="rounded-full border border-[var(--ppn-border)] px-2 py-0.5 text-[var(--ppn-muted)]">media: {q.mediaSlot}</span>}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">Answers are revealed together in the combined answer-review (<span className="font-mono">{reviewScript.file}</span>), not per question — see the answer-review model below.</p>
            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] text-[var(--ppn-muted)]">Browse the question bank ({QUESTION_BANK.length} questions · {catCounts.length} categories) — selection source</summary>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {catCounts.map((c) => (
                  <button key={c.id} onClick={() => setBankBrowseCat(c.id)} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: bankBrowseCat === c.id ? "var(--ppn-brand)" : "var(--ppn-border)", color: bankBrowseCat === c.id ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>{c.label} · {c.count}</button>
                ))}
              </div>
              <ul className="mt-2 max-h-40 space-y-0.5 overflow-y-auto text-[10px] text-[var(--ppn-muted)]">
                {QUESTION_BANK.filter((q) => q.category === bankBrowseCat).map((q) => (
                  <li key={q.id} className="flex gap-2"><span className="font-mono">{q.id}</span><span className="truncate text-[var(--ppn-text)]">{q.prompt}</span></li>
                ))}
              </ul>
            </details>
          </Card>

          {/* Answer-review model — ONE combined reveal (Option 1, preferred POC) in playlist order */}
          <Card title="Answer-review model">
            <p className="text-xs text-[var(--ppn-muted)]">Answers are revealed <span className="font-semibold text-[var(--ppn-text)]">together, in playlist order</span>, in a single combined answer-review — <span className="font-semibold text-[var(--ppn-text)]">not after each question</span>. One natural-sounding MP3 (<span className="font-mono">{reviewScript.file}</span>) is easier to record and sounds less robotic; per-question reveal keys stay available for later.</p>
            <div className="mt-2 rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
              <p className="text-[11px] font-semibold text-[var(--ppn-text)]">Combined answer-review script (generated from the playlist — text only, no audio)</p>
              <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">{reviewScript.intro}</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-[11px] text-[var(--ppn-muted)]">
                {reviewScript.lines.map((l) => (
                  <li key={l.order}><span className="text-[var(--ppn-text)]">{l.line}</span> <span className="text-[9px]">({l.categoryLabel})</span></li>
                ))}
              </ol>
            </div>
            <p className="mt-2 text-[11px] font-semibold text-[var(--ppn-text)]">Answer-review tone</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[10px] text-[var(--ppn-muted)]">
              {ANSWER_REVIEW_TONE.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ANSWER_REVIEW_EXAMPLES.map((e) => <span key={e} className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-0.5 text-[10px] text-[var(--ppn-muted)]">“{e}”</span>)}
            </div>
          </Card>

          {/* ElevenLabs production list — exactly the cues to record for the selected 5-question demo */}
          <Card title="ElevenLabs production list (demo)">
            <p className="text-xs text-[var(--ppn-muted)]">The cues to record for tonight's 5-question demo. Operator records these MP3s externally (<span className="font-semibold text-[var(--ppn-text)]">recorded by the operator, not generated in-app</span>) and drops them in. Filenames are authoritative — namespaced so nothing collides.</p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--ppn-border)] text-[10px] uppercase tracking-wide text-[var(--ppn-muted)]">
                    <th className="py-1.5 pr-2 font-semibold">Cue</th>
                    <th className="py-1.5 pr-2 font-semibold">Filename</th>
                    <th className="py-1.5 pr-2 font-semibold">Phase</th>
                    <th className="py-1.5 pr-2 font-semibold">Script / purpose</th>
                    <th className="py-1.5 pr-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productionCues.map((c) => (
                    <tr key={c.cueId} className="border-b border-[var(--ppn-border)] align-top">
                      <td className="py-1.5 pr-2 font-semibold">{c.cueId}</td>
                      <td className="py-1.5 pr-2 font-mono text-[10px] text-[var(--ppn-muted)]">{c.filename}</td>
                      <td className="py-1.5 pr-2 text-[var(--ppn-muted)]">{c.phase}</td>
                      <td className="py-1.5 pr-2"><span className="block max-w-[280px] truncate text-[var(--ppn-text)]" title={c.script}>{c.purpose}</span><span className="block max-w-[280px] truncate text-[10px] text-[var(--ppn-muted)]" title={c.script}>{c.script}</span></td>
                      <td className="py-1.5 pr-2"><span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase" style={prodTone(c.status)}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-[var(--ppn-muted)]">Winner uses <span className="font-semibold text-[var(--ppn-text)]">Team {"{number}"}</span> (not a team name). Cues marked <span className="font-semibold text-[var(--ppn-text)]">needs copy</span> / <span className="font-semibold text-[var(--ppn-text)]">placeholder</span> need script text written before recording.</p>
          </Card>

          {/* Host run mode — manual / semi-automatic / automatic (concept + honest live status) */}
          <Card title="Host run mode">
            <p className="text-xs text-[var(--ppn-muted)]">How the run order is driven on the night. Only <span className="font-semibold text-[var(--ppn-text)]">Manual</span> is live today (the host already controls every cue from the host console); the rest are modelled, not wired.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {HOST_RUN_MODES.map((m) => {
                const on = runMode === m.id;
                return (
                  <button key={m.id} onClick={() => setRunMode(m.id)} className="rounded-xl border bg-[var(--ppn-bg)] p-3 text-left" style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)" }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{m.label}</p>
                      <span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase" style={slotTone(m.status === "live now" ? "uploaded" : "preview")}>{m.status}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">{m.blurb}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-[var(--ppn-muted)]">What changes today: nothing in the game loop. Manual run is the existing host console; semi-automatic &amp; automatic are concept-only models for a later slice (no timers/auto-advance wired).</p>
          </Card>

          {/* Event & tournament context — POC reference placeholders that feed scripts (NOT scoring) */}
          <Card title="Event &amp; tournament context">
            <p className="text-xs text-[var(--ppn-muted)]">Imaginary POC context so scripts can reference the evening. Reference placeholders only — feeds script copy, not scoring or any tournament engine.</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2 text-[11px]">
              {([
                ["Event date", DEMO_EVENT_CONTEXT.eventDate], ["Venue", DEMO_EVENT_CONTEXT.venue],
                ["Quiz series", DEMO_EVENT_CONTEXT.series], ["Event in series", DEMO_EVENT_CONTEXT.eventNumberInMonth],
                ["Stage", DEMO_EVENT_CONTEXT.stage], ["Winner advances to", DEMO_EVENT_CONTEXT.advancesTo],
                ["Sponsor / brewery", active.sponsorName], ["Host", DEMO_EVENT_CONTEXT.hostName],
                ["Next event", DEMO_EVENT_CONTEXT.nextEventDate],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1.5"><span className="text-[var(--ppn-muted)]">{k}</span><span className="font-semibold text-[var(--ppn-text)]">{v}</span></div>
              ))}
            </div>
            <p className="mt-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1.5 text-[11px] text-[var(--ppn-muted)]"><span className="font-semibold text-[var(--ppn-text)]">Opener reference:</span> “{eventOpenerReference()}”</p>
          </Card>

          {/* Script & audio cue library — scalable pub-quiz cue taxonomy (operator-supplied MP3s; NO generation).
              Grouped by cue family; uploadable cues upload/preview/clear here, reference cues are structure only. */}
          <Card title="Script &amp; audio cue library">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[var(--ppn-muted)]">A scalable pub-quiz cue library — operator supplies the script text and uploads the MP3s (<span className="font-semibold text-[var(--ppn-text)]">no AI voice, no generation, no TTS</span>). Uploadable cues upload + preview here; reference cues are structure + script only.</p>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={slotTone(liveCuesReady >= liveCuesTotal ? "uploaded" : "missing")}>{liveCuesReady}/{liveCuesTotal} live cues ready</span>
            </div>
            {/* UK-style flow: read ALL questions first; reveal answers later in the answer-review phase. */}
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              <p className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1.5 text-[11px] text-[var(--ppn-muted)]"><span className="font-semibold text-[var(--ppn-text)]">Question readout phase:</span> the host reads every question in the round. Teams answer. No answers are revealed yet.</p>
              <p className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1.5 text-[11px] text-[var(--ppn-muted)]"><span className="font-semibold text-[var(--ppn-text)]">Answer review phase:</span> later, the host reveals answers question by question. <span className="font-semibold" style={{ color: "var(--ppn-text)" }}>Answer-reveal cues are used here — not after each question.</span></p>
            </div>

            {CUE_FAMILIES.filter((fam) => AUDIO_CUES.some((c) => c.family === fam.id)).map((fam) => (
              <div key={fam.id} className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ppn-brand)" }}>{fam.label}</p>
                <p className="text-[10px] text-[var(--ppn-muted)]">{fam.blurb}</p>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {AUDIO_CUES.filter((c) => c.family === fam.id).map((c) => {
                    const st = cueState(c); const url = cueUrl(c); const uploadable = !!c.field && !!c.type;
                    const script = c.scriptKey ? active.ai[c.scriptKey] : c.scriptHint;
                    return (
                      <div key={c.key} className="flex flex-col rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-bg)] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold">{c.label}</p>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {uploadable && <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase" style={slotTone(st)}>{st}</span>}
                            <span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase" style={slotTone(c.status === "live" ? "uploaded" : "preview")}>{cueStatusLabel[c.status]}</span>
                          </div>
                        </div>
                        <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">Tone: {c.tone}</p>
                        <p className="text-[10px] text-[var(--ppn-muted)]">Where: {c.where}</p>
                        {uploadable && (st === "uploaded") && <p className="text-[9px] font-semibold uppercase" style={{ color: cueApplied(c) ? "var(--ppn-success)" : "var(--ppn-warning)" }}>{cueApplied(c) ? "● applied" : "● uploaded · not applied"}</p>}
                        {url && <audio controls preload="none" src={url} className="mt-2 h-8 w-full" />}
                        {c.key === "winner" && <p className="mt-1.5 rounded bg-[var(--ppn-surface)] px-2 py-1 text-[10px] text-[var(--ppn-muted)]">Record as “<span className="font-semibold text-[var(--ppn-text)]">{WINNER_SCRIPT_REF}</span>” — use the table number, not the entered team name.</p>}
                        {script && (
                          <details className="mt-1.5">
                            <summary className="cursor-pointer text-[10px] text-[var(--ppn-muted)]">Script (reference copy)</summary>
                            <p className="mt-1 text-[11px] text-[var(--ppn-muted)]">“{script}”</p>
                          </details>
                        )}
                        {uploadable ? (
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <label className="cursor-pointer" title={packsQ.isError ? "Storage unavailable" : "Upload an MP3 for this cue"}>
                              <span className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-[var(--ppn-on-brand)]" style={{ background: packsQ.isError ? "var(--ppn-border)" : "var(--ppn-brand)", opacity: packsQ.isError ? 0.6 : 1 }}>🔊 {st === "uploaded" ? "Replace MP3" : "Upload MP3"}</span>
                              <input type="file" accept="audio/*" disabled={assetBusy || packsQ.isError}
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) runA(() => uploadCue(c, f)); e.currentTarget.value = ""; }}
                                className="hidden" />
                            </label>
                            <button onClick={() => clearCue(c)} disabled={st !== "uploaded"} className="text-[10px] font-semibold text-[var(--ppn-muted)] hover:text-[var(--ppn-text)] disabled:opacity-40">Clear</button>
                          </div>
                        ) : (
                          <p className="mt-2 text-[10px] text-[var(--ppn-muted)]">Reference structure — no in-app upload yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className="mt-3 text-[11px] text-[var(--ppn-muted)]">Accepted: MP3 (and any browser-playable audio: WAV/M4A/OGG). After uploading, <span className="font-semibold text-[var(--ppn-text)]">Apply</span> — host/TV use the uploaded cue first, falling back to the fixed <span className="font-mono">public/demo/audio/…</span> file. Reference cues (how-to-play, pause, outro, category/review intros, sponsor-special) have no host trigger yet (not wired).</p>
          </Card>

          {/* Question audio library — per category/question table; scales to N categories × N questions (seeded pool data). */}
          <Card title="Question audio library">
            <p className="text-xs text-[var(--ppn-muted)]">Per-question readout &amp; answer-review audio, organised by category. Built from the seeded question pool — the structure scales to a full {CONTENT_CATEGORIES.length}-category × 10-question night. Per-question files follow a naming convention and are deployed to the preset audio folder (file-drop); in-app per-question upload is parked (needs a keyed asset set).</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="text-[11px] text-[var(--ppn-muted)]">Category
                <select value={libCat} onChange={(e) => setLibCat(e.target.value as ContentCategoryId)} className="ml-1 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-xs text-[var(--ppn-text)]">
                  {CONTENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </label>
              <input value={libSearch} onChange={(e) => setLibSearch(e.target.value)} placeholder="Search question…" className="rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-1 text-xs text-[var(--ppn-text)]" />
              <span className="text-[10px] text-[var(--ppn-muted)]">{libRows.length} question{libRows.length === 1 ? "" : "s"} in {categoryLabel(libCat)}</span>
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[var(--ppn-border)] text-[10px] uppercase tracking-wide text-[var(--ppn-muted)]">
                    <th className="py-1.5 pr-2 font-semibold">Category</th>
                    <th className="py-1.5 pr-2 font-semibold">Q#</th>
                    <th className="py-1.5 pr-2 font-semibold">Question</th>
                    <th className="py-1.5 pr-2 font-semibold">Readout audio</th>
                    <th className="py-1.5 pr-2 font-semibold">Repeat / read-again</th>
                    <th className="py-1.5 pr-2 font-semibold">Answer-review audio</th>
                    <th className="py-1.5 pr-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {libRows.map((q, i) => (
                    <tr key={q.id} className="border-b border-[var(--ppn-border)] align-top">
                      <td className="py-1.5 pr-2 text-[var(--ppn-muted)]">{categoryLabel(libCat)}</td>
                      <td className="py-1.5 pr-2 font-semibold">{i + 1}</td>
                      <td className="py-1.5 pr-2"><span className="block max-w-[220px] truncate" title={q.prompt}>{q.prompt}</span></td>
                      <td className="py-1.5 pr-2 font-mono text-[10px] text-[var(--ppn-muted)]">{QUESTION_FILE_CONVENTION.readout}</td>
                      <td className="py-1.5 pr-2 text-[10px] text-[var(--ppn-muted)]">vary phrasing</td>
                      <td className="py-1.5 pr-2 font-mono text-[10px] text-[var(--ppn-muted)]">{QUESTION_FILE_CONVENTION.reveal}</td>
                      <td className="py-1.5 pr-2"><span className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase" style={slotTone("preview")}>stored-only · file-drop</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[10px] text-[var(--ppn-muted)]">Readout files play during the <span className="font-semibold text-[var(--ppn-text)]">question phase</span>; review files play later in the <span className="font-semibold text-[var(--ppn-text)]">answer-review phase</span> (never straight after each question). Final file numbers are assigned by running order at quiz-build time.</p>
          </Card>

          {/* Script style & winner guidance — production-script rules (no generated final content) */}
          <Card title="Script style &amp; winner guidance">
            <p className="text-xs text-[var(--ppn-muted)]">Guidance for writing/recording cue audio. Examples are direction, not generated final scripts.</p>
            <p className="mt-2 text-[11px] font-semibold text-[var(--ppn-text)]">Script style variant</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {SCRIPT_STYLES.map((s) => {
                const on = scriptStyle === s.id;
                return (
                  <button key={s.id} onClick={() => setScriptStyle(s.id)} title={s.blurb} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: on ? "var(--ppn-brand)" : "var(--ppn-border)", color: on ? "var(--ppn-brand)" : "var(--ppn-muted)" }}>{s.label}</button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] text-[var(--ppn-muted)]">{SCRIPT_STYLES.find((s) => s.id === scriptStyle)?.blurb} <span className="italic">Style is a script-direction concept — it doesn't auto-rewrite cue text.</span></p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-[var(--ppn-muted)]">
              {SCRIPT_STYLE_RULES.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <p className="mt-2 text-[11px] font-semibold text-[var(--ppn-text)]">Varied repeat / read-again phrasing (examples):</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {REPEAT_PHRASE_EXAMPLES.map((p) => <span key={p} className="rounded-full border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2 py-0.5 text-[10px] text-[var(--ppn-muted)]">“{p}”</span>)}
            </div>
            <p className="mt-2 rounded-lg border border-[var(--ppn-border)] bg-[var(--ppn-bg)] px-2.5 py-1.5 text-[11px] text-[var(--ppn-muted)]"><span className="font-semibold text-[var(--ppn-text)]">Winner announcement uses Team number, not team name:</span> “{WINNER_SCRIPT_REF}”. {TEAM_NUMBER_FOLLOWUP}</p>
          </Card>

          {/* Generic script variant banks — multiple varied takes per high-frequency cue so audio never sounds templated */}
          <Card title="Generic script variant banks">
            <p className="text-xs text-[var(--ppn-muted)]">The fastest way to spot AI-made audio is hearing the <span className="font-semibold text-[var(--ppn-text)]">same line every time</span>. Each high-frequency generic cue below has a bank of varied lines — <span className="font-semibold text-[var(--ppn-text)]">record every one as its own MP3</span> so repeats sound natural. These are a script bank to record from; the app does not yet rotate them at runtime (rotation parked).</p>
            {VARIANT_BANKS.map((bank) => {
              const colourTone = (c: VariantColour): React.CSSProperties =>
                c === "generic" ? slotTone("preview") : { background: "color-mix(in srgb, var(--ppn-brand) 14%, transparent)", color: "var(--ppn-brand)" };
              return (
                <div key={bank.id} className="mt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ppn-brand)" }}>{bank.label}</p>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase" style={slotTone("uploaded")}>{bank.variants.length} variants</span>
                  </div>
                  <p className="text-[10px] text-[var(--ppn-muted)]">{bank.blurb}</p>
                  <ul className="mt-1.5 space-y-1">
                    {bank.variants.map((v) => (
                      <li key={v.file} className="flex flex-wrap items-baseline gap-2 text-[11px]">
                        <span className="font-mono text-[9px] text-[var(--ppn-muted)]">{v.file}</span>
                        {v.colour !== "generic" && <span className="rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase" style={colourTone(v.colour)}>{v.colour}</span>}
                        <span className="text-[var(--ppn-text)]">“{v.text}”</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <p className="mt-3 text-[11px] font-semibold text-[var(--ppn-text)]">Keeping it from sounding artificial</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[10px] text-[var(--ppn-muted)]">
              {VARIETY_RECORDING_TIPS.map((t) => <li key={t}>{t}</li>)}
            </ul>
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

          {/* Apply changes — one primary action (uploads + copy + manual fallback are reconciled into the override) */}
          <Card title="Apply changes">
            <div className="flex flex-wrap gap-2">
              <button onClick={applyPack} className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Apply uploaded assets to demo</button>
              <button onClick={resetPack} disabled={!packActive} className="rounded-lg border border-[var(--ppn-border)] px-3 py-2 text-sm font-semibold disabled:opacity-40">↺ Reset to preset defaults</button>
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">Apply reloads so every surface re-merges your uploaded slot files + identity/offer copy + any manual fallbacks. Reset returns to the preset defaults. Blank fields keep the preset value — an override can never blank a page.</p>
          </Card>

          {/* Advanced — raw asset-pack copy + stored files (the per-slot UI above is the primary path) */}
          {!packsQ.isError && activePack && (
            <details className="rounded-xl border border-[var(--ppn-border)] bg-[var(--ppn-surface)]">
              <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-semibold">Client asset set — stored copy &amp; files (advanced)</summary>
              <div className="px-4 pb-4">
                <p className="text-xs font-semibold text-[var(--ppn-muted)]">Copy stored on the asset set</p>
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

          <Card title="Audience mode (presentation)">
            <p className="text-xs text-[var(--ppn-muted)]">Audience mode hides the presenter helper / chrome so a screen looks like a real event. It is display-only — it never changes the game. You can always toggle it back here.</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={slotTone(audience ? "uploaded" : "preset")}>Currently: {audience ? "audience (chrome hidden)" : "presenter (chrome on)"}</span>
              {audience
                ? <button onClick={() => setAudience(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Exit audience mode</button>
                : <button onClick={() => setAudience(true)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--ppn-on-brand)]" style={{ background: "var(--ppn-brand)" }}>Enter audience mode</button>}
            </div>
            <p className="mt-2 text-[11px] text-[var(--ppn-muted)]">When in audience mode, a small <span className="font-semibold text-[var(--ppn-text)]">Exit audience mode</span> control also stays in the corner of presenter windows, and you can always return here.</p>
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
