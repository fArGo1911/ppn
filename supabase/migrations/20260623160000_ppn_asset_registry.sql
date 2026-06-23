-- PPN POC — asset storage foundation (PPN-LOCAL Supabase only; source migration, never run on hosted).
--
-- Decision: binary files live in OBJECT STORAGE (bucket ppn-brand-assets); the DB holds METADATA only
-- (ownership, type, path, status, usage). Beta foundation — NOT a CMS / portal / approval workflow.

-- ── Storage bucket (public read for the demo; objects still governed by the policies below) ──
insert into storage.buckets (id, name, public)
values ('ppn-brand-assets', 'ppn-brand-assets', true)
on conflict (id) do nothing;

-- ── updated_at helper (no existing trigger pattern in the repo) ──
create or replace function public.ppn_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ── A. Asset packs — a named asset pack for a brewery / demo / campaign ──
create table if not exists public.ppn_asset_packs (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  brand_id        text,
  campaign_name   text,
  sponsor_name    text,
  pub_name        text,
  event_name      text,
  offer           text,
  tagline         text,
  responsible_note text,
  status          text not null default 'draft' check (status in ('draft','active','archived')),
  is_demo         boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── B. Assets — metadata for stored files (one row per uploaded file) ──
create table if not exists public.ppn_assets (
  id               uuid primary key default gen_random_uuid(),
  asset_pack_id    uuid not null references public.ppn_asset_packs(id) on delete cascade,
  asset_type       text not null check (asset_type in (
    'logo','hero','sponsor_slide','phone_card','lower_third','venue_image',
    'intro_video','sponsor_bumper_video','closing_video',
    'event_intro_audio','round_intro_audio','sponsored_round_intro_audio','question_readout_audio',
    'answer_reveal_audio','winner_audio','question_chime_audio','sponsor_audio_message',
    'question_audio','reveal_audio'
  )),
  storage_bucket   text not null default 'ppn-brand-assets',
  storage_path     text not null,
  public_url       text,
  original_filename text,
  mime_type        text,
  file_size_bytes  bigint,
  alt_text         text,
  usage_note       text,
  status           text not null default 'draft' check (status in ('draft','active','archived')),
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists ppn_assets_pack_idx on public.ppn_assets(asset_pack_id);
create index if not exists ppn_assets_type_idx on public.ppn_assets(asset_type);

drop trigger if exists ppn_asset_packs_set_updated on public.ppn_asset_packs;
create trigger ppn_asset_packs_set_updated before update on public.ppn_asset_packs for each row execute function public.ppn_set_updated_at();
drop trigger if exists ppn_assets_set_updated on public.ppn_assets;
create trigger ppn_assets_set_updated before update on public.ppn_assets for each row execute function public.ppn_set_updated_at();

-- ── RLS (POC/demo-operator: permissive for local demo; tighten before any hosted deploy) ──
do $$
declare t text;
begin
  foreach t in array array['ppn_asset_packs','ppn_assets'] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "ppn_poc_all" on public.%I;', t);
    execute format($p$create policy "ppn_poc_all" on public.%I for all to anon, authenticated using (true) with check (true);$p$, t);
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated;', t);
  end loop;
end $$;

-- ── Storage object policies for the demo bucket (operator can read/write demo assets) ──
drop policy if exists "ppn_brand_assets_read"   on storage.objects;
drop policy if exists "ppn_brand_assets_write"  on storage.objects;
drop policy if exists "ppn_brand_assets_update" on storage.objects;
drop policy if exists "ppn_brand_assets_delete" on storage.objects;
create policy "ppn_brand_assets_read"   on storage.objects for select to anon, authenticated using (bucket_id = 'ppn-brand-assets');
create policy "ppn_brand_assets_write"  on storage.objects for insert to anon, authenticated with check (bucket_id = 'ppn-brand-assets');
create policy "ppn_brand_assets_update" on storage.objects for update to anon, authenticated using (bucket_id = 'ppn-brand-assets');
create policy "ppn_brand_assets_delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'ppn-brand-assets');
