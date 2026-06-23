/**
 * PPN asset registry (beta foundation). Files live in Supabase Storage (bucket ppn-brand-assets); these helpers
 * manage the metadata rows (ppn_asset_packs / ppn_assets) + uploads. Read path is OPTIONAL: if Supabase is
 * offline or empty, the app still runs on the S9 localStorage asset pack + preset defaults (see assetPack.ts).
 * NOT a CMS / portal / approval workflow — operator beta only.
 */
import { supabase } from "./supabaseClient";
import type { AssetPack } from "../demo/assetPack";

export const ASSET_BUCKET = "ppn-brand-assets";

export type AssetType =
  | "logo" | "hero" | "sponsor_slide" | "phone_card" | "lower_third" | "venue_image"
  | "intro_video" | "sponsor_bumper_video" | "closing_video"
  | "event_intro_audio" | "round_intro_audio" | "sponsored_round_intro_audio" | "question_readout_audio"
  | "answer_reveal_audio" | "winner_audio" | "question_chime_audio" | "sponsor_audio_message"
  | "question_audio" | "reveal_audio";

export type AssetStatus = "draft" | "active" | "archived";

export interface AssetPackRow {
  id: string; label: string; brand_id: string | null; campaign_name: string | null; sponsor_name: string | null;
  pub_name: string | null; event_name: string | null; offer: string | null; tagline: string | null;
  responsible_note: string | null; status: AssetStatus; is_demo: boolean; updated_at: string;
}
export interface AssetRow {
  id: string; asset_pack_id: string; asset_type: AssetType; storage_bucket: string; storage_path: string;
  public_url: string | null; original_filename: string | null; mime_type: string | null; file_size_bytes: number | null;
  alt_text: string | null; usage_note: string | null; status: AssetStatus; sort_order: number; updated_at: string;
}

export async function listAssetPacks(): Promise<AssetPackRow[]> {
  const { data, error } = await supabase.from("ppn_asset_packs").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssetPackRow[];
}
export async function getActiveAssetPack(): Promise<AssetPackRow | null> {
  const { data, error } = await supabase.from("ppn_asset_packs").select("*").eq("status", "active").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return (data as AssetPackRow | null) ?? null;
}
export async function createAssetPack(fields: Partial<AssetPackRow> & { label: string }): Promise<AssetPackRow> {
  const { data, error } = await supabase.from("ppn_asset_packs").insert(fields).select().single();
  if (error) throw error;
  return data as AssetPackRow;
}
export async function updateAssetPack(id: string, fields: Partial<AssetPackRow>): Promise<void> {
  const { error } = await supabase.from("ppn_asset_packs").update(fields).eq("id", id);
  if (error) throw error;
}
export async function listAssets(assetPackId: string): Promise<AssetRow[]> {
  const { data, error } = await supabase.from("ppn_assets").select("*").eq("asset_pack_id", assetPackId).order("asset_type", { ascending: true }).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AssetRow[];
}
export async function updateAssetStatus(assetId: string, status: AssetStatus): Promise<void> {
  const { error } = await supabase.from("ppn_assets").update({ status }).eq("id", assetId);
  if (error) throw error;
}
export const setAssetActive = (assetId: string) => updateAssetStatus(assetId, "active");

export function getAssetUrl(asset: AssetRow): string {
  return asset.public_url ?? supabase.storage.from(asset.storage_bucket || ASSET_BUCKET).getPublicUrl(asset.storage_path).data.publicUrl;
}

const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);

/** Upload a file to Storage, then register its metadata. Partial failures are reported, not hidden. */
export async function uploadAssetFile(assetPackId: string, assetType: AssetType, file: File): Promise<AssetRow> {
  const path = `${assetPackId}/${assetType}/${Date.now()}-${safeName(file.name)}`;
  const up = await supabase.storage.from(ASSET_BUCKET).upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (up.error) throw new Error(`Storage upload failed: ${up.error.message}`);
  const publicUrl = supabase.storage.from(ASSET_BUCKET).getPublicUrl(path).data.publicUrl;
  const { data, error } = await supabase.from("ppn_assets").insert({
    asset_pack_id: assetPackId, asset_type: assetType, storage_bucket: ASSET_BUCKET, storage_path: path,
    public_url: publicUrl, original_filename: file.name, mime_type: file.type || null, file_size_bytes: file.size, status: "active",
  }).select().single();
  if (error) throw new Error(`File uploaded to ${path}, but registry insert failed: ${error.message}`);
  return data as AssetRow;
}

// asset_type → S9 AssetPack (localStorage override) field, so a DB pack can drive synchronous brand rendering.
const TYPE_TO_FIELD: Partial<Record<AssetType, keyof AssetPack>> = {
  logo: "logoUrl", hero: "heroUrl", sponsor_slide: "sponsorSlideUrl", phone_card: "phoneCardUrl",
  lower_third: "lowerThirdUrl", venue_image: "venueUrl",
  intro_video: "tvIntroVideoUrl", sponsor_bumper_video: "sponsorBumperVideoUrl", closing_video: "closingVideoUrl",
  // audio cues — operator-uploaded MP3/etc. (playback only, no generation)
  event_intro_audio: "eventIntroAudioUrl", round_intro_audio: "roundIntroAudioUrl",
  sponsored_round_intro_audio: "sponsoredIntroAudioUrl", question_readout_audio: "questionReadoutAudioUrl",
  answer_reveal_audio: "answerRevealAudioUrl", winner_audio: "winnerAudioUrl", sponsor_audio_message: "sponsorMessageAudioUrl",
};

/** Build an S9-shaped override (copy + image/video paths) from a DB pack + its assets. Latest ACTIVE per type wins. */
export function buildBrandOverrideFromAssetPack(pack: AssetPackRow, assets: AssetRow[]): AssetPack {
  const out: AssetPack = {};
  if (pack.sponsor_name) out.sponsorName = pack.sponsor_name;
  if (pack.campaign_name) out.campaignName = pack.campaign_name;
  if (pack.pub_name) out.pubName = pack.pub_name;
  if (pack.event_name) out.eventName = pack.event_name;
  if (pack.offer) out.offer = pack.offer;
  if (pack.tagline) out.tagline = pack.tagline;
  if (pack.responsible_note) out.responsibleNote = pack.responsible_note;
  const seen = new Set<keyof AssetPack>();
  for (const a of assets) {
    if (a.status !== "active") continue;
    const field = TYPE_TO_FIELD[a.asset_type];
    if (field && !seen.has(field)) { out[field] = getAssetUrl(a); seen.add(field); }
  }
  return out;
}
