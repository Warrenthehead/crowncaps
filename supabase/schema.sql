-- =====================================================================
--  CROWNCAPS — Script SQL unique
--  A coller dans Supabase > SQL Editor > New query, puis "Run".
--  Le script peut être relancé : il ne casse rien s'il est exécuté 2 fois
--  (les données de départ ne sont insérées que si les tables sont vides).
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. ADMINISTRATEUR
--    Un seul compte admin. Après avoir créé l'utilisateur dans
--    Authentication > Users, lancez (en remplaçant l'email) :
--    insert into public.admins (user_id)
--    select id from auth.users where email = 'votre@email.com';
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2. PARAMETRES (une seule ligne, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  shop_name text not null default 'CrownCaps',
  logo_url text,
  whatsapp_number text not null default '24100000000',
  announcements jsonb not null default '[]'::jsonb,   -- [{ "text": "...", "link": "..." }]
  socials jsonb not null default '{}'::jsonb,          -- { "facebook": "...", "instagram": "...", "tiktok": "..." }
  footer_text text not null default '© CrownCaps, tous droits réservés.',
  shipping_country text not null default 'Gabon',
  seo_description text not null default 'CrownCaps, streetwear premium au Gabon : casquettes, bonnets, t-shirts, pantalons, sacs et accessoires. Commande sur WhatsApp.',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. ETIQUETTES : couleurs, tailles (par groupe), types de vêtement
-- ---------------------------------------------------------------------
create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  hex text not null default '#000000',
  position int not null default 0
);

create table if not exists public.size_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- ex. "Vêtements", "Casquettes fitted"
  position int not null default 0
);

create table if not exists public.sizes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.size_groups (id) on delete cascade,
  label text not null,                -- ex. "M", "7 3/8 (58 cm)"
  position int not null default 0,
  unique (group_id, label)
);

create table if not exists public.garment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- ex. "Manche courte"
  position int not null default 0
);

-- ---------------------------------------------------------------------
-- 4. CATEGORIES
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  position int not null default 0,
  visible boolean not null default true,
  default_template text not null default 'standard',
  default_sort text not null default 'recent'
    check (default_sort in ('recent', 'price_asc', 'price_desc', 'az', 'best')),
  size_group_id uuid references public.size_groups (id) on delete set null,
  seo_description text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 5. PRODUITS
-- ---------------------------------------------------------------------
create sequence if not exists public.product_code_seq start 1;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  price int not null default 0 check (price >= 0),               -- en F CFA
  compare_at_price int check (compare_at_price is null or compare_at_price >= 0),
  category_id uuid references public.categories (id) on delete set null,
  garment_type_id uuid references public.garment_types (id) on delete set null,
  status text not null default 'disponible'
    check (status in ('disponible', 'vendu', 'a_venir')),
  template text,                       -- null = modèle par défaut de la catégorie
  release_at timestamptz,              -- date de sortie (modèle "À venir")
  code text not null unique default ('CC-' || lpad(nextval('public.product_code_seq')::text, 4, '0')),
  brand text not null default 'CrownCaps',
  featured boolean not null default false,
  sales_count int not null default 0,
  position int not null default 0,     -- ordre manuel
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_created_idx on public.products (created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,                   -- image ~1600 px
  thumb_url text,                      -- miniature ~600 px
  alt text,
  position int not null default 0      -- 0 = image principale
);
create index if not exists product_images_product_idx on public.product_images (product_id, position);

create table if not exists public.product_colors (
  product_id uuid not null references public.products (id) on delete cascade,
  color_id uuid not null references public.colors (id) on delete cascade,
  primary key (product_id, color_id)
);

create table if not exists public.product_sizes (
  product_id uuid not null references public.products (id) on delete cascade,
  size_id uuid not null references public.sizes (id) on delete cascade,
  primary key (product_id, size_id)
);

-- Mise à jour automatique de updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- Bascule automatique "À venir" -> "Standard" quand la date de sortie est passée.
-- Appelée par le ping quotidien (/api/cron/ping). Le site fait aussi la bascule à l'affichage.
create or replace function public.release_due_products()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  update public.products
     set status = 'disponible',
         template = 'standard'
   where status = 'a_venir'
     and release_at is not null
     and release_at <= now();
  get diagnostics n = row_count;
  return n;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. PAGES, MENUS, ACCUEIL
-- ---------------------------------------------------------------------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,         -- 'main' (volet burger) ou 'footer'
  name text not null
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.menus (id) on delete cascade,
  parent_id uuid references public.menu_items (id) on delete cascade,
  label text not null,
  link_type text not null default 'none'
    check (link_type in ('none', 'home', 'collections', 'category', 'page', 'url')),
  target text,                          -- slug de catégorie/page, ou URL
  position int not null default 0
);
create index if not exists menu_items_menu_idx on public.menu_items (menu_id, position);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  type text not null
    check (type in ('slideshow', 'product_grid', 'product_carousel', 'category_tiles', 'image_banner')),
  title text,
  position int not null default 0,
  visible boolean not null default true,
  config jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------------
-- 7. SECURITE (Row Level Security)
--    Lecture publique de ce qui est visible, écriture réservée à l'admin.
-- ---------------------------------------------------------------------
alter table public.admins          enable row level security;
alter table public.settings        enable row level security;
alter table public.colors          enable row level security;
alter table public.size_groups     enable row level security;
alter table public.sizes           enable row level security;
alter table public.garment_types   enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_colors  enable row level security;
alter table public.product_sizes   enable row level security;
alter table public.pages           enable row level security;
alter table public.menus           enable row level security;
alter table public.menu_items      enable row level security;
alter table public.home_sections   enable row level security;

-- admins : chacun peut seulement vérifier sa propre ligne
drop policy if exists "admins_self_read" on public.admins;
create policy "admins_self_read" on public.admins for select using (user_id = auth.uid());

-- Tables en lecture publique totale
do $$
declare t text;
begin
  foreach t in array array['settings','colors','size_groups','sizes','garment_types',
                           'product_colors','product_sizes','menus','menu_items']
  loop
    execute format('drop policy if exists "public_read" on public.%I', t);
    execute format('create policy "public_read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin_write" on public.%I', t);
    execute format('create policy "admin_write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Tables où le public ne voit que ce qui est publié / visible
drop policy if exists "public_read" on public.categories;
create policy "public_read" on public.categories for select using (visible or public.is_admin());
drop policy if exists "admin_write" on public.categories;
create policy "admin_write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public_read" on public.products;
create policy "public_read" on public.products for select using (published or public.is_admin());
drop policy if exists "admin_write" on public.products;
create policy "admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public_read" on public.product_images;
create policy "public_read" on public.product_images for select using (true);
drop policy if exists "admin_write" on public.product_images;
create policy "admin_write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public_read" on public.pages;
create policy "public_read" on public.pages for select using (visible or public.is_admin());
drop policy if exists "admin_write" on public.pages;
create policy "admin_write" on public.pages for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public_read" on public.home_sections;
create policy "public_read" on public.home_sections for select using (visible or public.is_admin());
drop policy if exists "admin_write" on public.home_sections;
create policy "admin_write" on public.home_sections for all using (public.is_admin()) with check (public.is_admin());

-- La fonction de bascule est sans danger (elle ne fait que publier ce qui est
-- programmé), on autorise donc le ping à l'appeler avec la clé publique.
grant execute on function public.release_due_products() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 8. STOCKAGE DES IMAGES (bucket public "images")
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 2097152, array['image/webp', 'image/jpeg', 'image/png', 'image/svg+xml'])
on conflict (id) do update set public = true;

drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read" on storage.objects
  for select using (bucket_id = 'images');

drop policy if exists "images_admin_insert" on storage.objects;
create policy "images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'images' and public.is_admin());

drop policy if exists "images_admin_update" on storage.objects;
create policy "images_admin_update" on storage.objects
  for update using (bucket_id = 'images' and public.is_admin());

drop policy if exists "images_admin_delete" on storage.objects;
create policy "images_admin_delete" on storage.objects
  for delete using (bucket_id = 'images' and public.is_admin());

-- ---------------------------------------------------------------------
-- 9. DONNEES DE DEPART (insérées seulement si vides)
-- ---------------------------------------------------------------------
insert into public.settings (id, announcements, socials)
values (
  1,
  '[{"text":"Nouveau à Libreville","link":""},{"text":"Suivez nous sur Facebook en cliquant ici : Crowncaps","link":"https://www.facebook.com/"}]'::jsonb,
  '{"facebook":"https://www.facebook.com/","instagram":"https://www.instagram.com/","tiktok":""}'::jsonb
)
on conflict (id) do nothing;

do $$
declare
  g_clothes uuid; g_fitted uuid; g_unique uuid;
  c_tshirts uuid; c_bas uuid; c_head uuid; c_sacs uuid; c_objets uuid;
  t_court uuid; t_long uuid; t_sans uuid;
  p uuid;
begin
  if exists (select 1 from public.colors) then
    return;
  end if;

  -- Couleurs de base
  insert into public.colors (name, hex, position) values
    ('Noir', '#111111', 1), ('Blanc', '#ffffff', 2), ('Gris', '#9ca3af', 3),
    ('Beige', '#e8dcc4', 4), ('Bleu', '#8fa9c4', 5), ('Bleu nuit', '#1c2a44', 6),
    ('Rose', '#e3b6d2', 7), ('Rouge', '#b91c1c', 8), ('Vert', '#3f6b3f', 9),
    ('Marron', '#6b4a34', 10), ('Violet', '#b6a8e0', 11);

  -- Types de vêtement
  insert into public.garment_types (name, position) values ('Manche courte', 1) returning id into t_court;
  insert into public.garment_types (name, position) values ('Manche longue', 2) returning id into t_long;
  insert into public.garment_types (name, position) values ('Sans manches', 3) returning id into t_sans;

  -- Groupes de tailles
  insert into public.size_groups (name, position) values ('Vêtements', 1) returning id into g_clothes;
  insert into public.size_groups (name, position) values ('Casquettes fitted', 2) returning id into g_fitted;
  insert into public.size_groups (name, position) values ('Taille unique', 3) returning id into g_unique;

  insert into public.sizes (group_id, label, position) values
    (g_clothes, 'S', 1), (g_clothes, 'M', 2), (g_clothes, 'L', 3), (g_clothes, 'XL', 4), (g_clothes, 'XXL', 5),
    (g_fitted, '7 (55,8 cm)', 1), (g_fitted, '7 1/8 (56,8 cm)', 2), (g_fitted, '7 1/4 (57,7 cm)', 3),
    (g_fitted, '7 3/8 (58,7 cm)', 4), (g_fitted, '7 1/2 (59,6 cm)', 5), (g_fitted, '7 5/8 (60,6 cm)', 6),
    (g_unique, 'Taille unique', 1);

  -- Catégories
  insert into public.categories (name, slug, image_url, position, size_group_id)
    values ('T-shirts et Polos', 't-shirts-et-polos', '/placeholders/tshirt-noir.svg', 1, g_clothes) returning id into c_tshirts;
  insert into public.categories (name, slug, image_url, position, size_group_id)
    values ('Pantalons et Shorts', 'pantalons-et-shorts', '/placeholders/jogging-noir.svg', 2, g_clothes) returning id into c_bas;
  insert into public.categories (name, slug, image_url, position, size_group_id)
    values ('Headwear', 'headwear', '/placeholders/casquette-grise.svg', 3, g_fitted) returning id into c_head;
  insert into public.categories (name, slug, image_url, position, size_group_id)
    values ('Sacs', 'sacs', '/placeholders/sac-noir.svg', 4, g_unique) returning id into c_sacs;
  insert into public.categories (name, slug, image_url, position, size_group_id)
    values ('Petits Objets', 'petits-objets', '/placeholders/objet.svg', 5, g_unique) returning id into c_objets;

  -- 6 produits d'exemple
  insert into public.products (title, slug, description, price, category_id, status, featured, position)
    values ('NEW YORK YANKEES – Fitted Two-Tone Grey', 'new-york-yankees-fitted-two-tone-grey',
            'Casquette fitted **New Era 59FIFTY**.' || chr(10) || '- Visière noire' || chr(10) || '- Logo brodé' || chr(10) || '- 100 % polyester',
            12000, c_head, 'disponible', true, 1)
    returning id into p;
  insert into public.product_images (product_id, url, thumb_url, alt, position) values (p, '/placeholders/casquette-grise.svg', '/placeholders/casquette-grise.svg', 'Casquette grise et noire', 0);
  insert into public.product_colors select p, id from public.colors where name in ('Gris', 'Noir');
  insert into public.product_sizes select p, id from public.sizes where group_id = g_fitted;

  insert into public.products (title, slug, description, price, category_id, status, featured, position)
    values ('STUDIO BASICS – Bonnet Uni Gris Chiné', 'studio-basics-bonnet-uni-gris-chine',
            'Bonnet en maille côtelée, revers large. Chaud et léger.', 10000, c_head, 'disponible', true, 2)
    returning id into p;
  insert into public.product_images (product_id, url, thumb_url, alt, position) values (p, '/placeholders/bonnet-gris.svg', '/placeholders/bonnet-gris.svg', 'Bonnet gris chiné', 0);
  insert into public.product_colors select p, id from public.colors where name = 'Gris';
  insert into public.product_sizes select p, id from public.sizes where group_id = g_unique;

  insert into public.products (title, slug, description, price, category_id, garment_type_id, status, featured, position)
    values ('TL Noir', 'tl-noir', 'T-shirt oversize en coton épais, logo TL brodé.', 9500, c_tshirts, t_court, 'disponible', true, 3)
    returning id into p;
  insert into public.product_images (product_id, url, thumb_url, alt, position) values (p, '/placeholders/tshirt-noir.svg', '/placeholders/tshirt-noir.svg', 'T-shirt noir TL', 0);
  insert into public.product_colors select p, id from public.colors where name = 'Noir';
  insert into public.product_sizes select p, id from public.sizes where group_id = g_clothes;

  insert into public.products (title, slug, description, price, category_id, garment_type_id, status, featured, position)
    values ('TL Beige', 'tl-beige', 'T-shirt oversize en coton épais, logo TL brodé.', 9500, c_tshirts, t_court, 'disponible', true, 4)
    returning id into p;
  insert into public.product_images (product_id, url, thumb_url, alt, position) values (p, '/placeholders/tshirt-beige.svg', '/placeholders/tshirt-beige.svg', 'T-shirt beige TL', 0);
  insert into public.product_colors select p, id from public.colors where name = 'Beige';
  insert into public.product_sizes select p, id from public.sizes where group_id = g_clothes;

  insert into public.products (title, slug, description, price, category_id, status, sales_count, position)
    values ('SHADOW REALM – Jogging Tribal Flame Noir', 'shadow-realm-jogging-tribal-flame-noir',
            'Jogging cargo, motif tribal ton sur ton, cordon de serrage.', 14000, c_bas, 'vendu', 3, 5)
    returning id into p;
  insert into public.product_images (product_id, url, thumb_url, alt, position) values (p, '/placeholders/jogging-noir.svg', '/placeholders/jogging-noir.svg', 'Jogging noir', 0);
  insert into public.product_colors select p, id from public.colors where name = 'Noir';
  insert into public.product_sizes select p, id from public.sizes where group_id = g_clothes;

  insert into public.products (title, slug, description, price, category_id, status, template, release_at, position)
    values ('ROYAL CROWN – Sac Bandoulière Noir', 'royal-crown-sac-bandouliere-noir',
            'Sac bandoulière en cuir synthétique, fermeture zippée.', 18000, c_sacs, 'a_venir', 'a-venir', now() + interval '10 days', 6)
    returning id into p;
  insert into public.product_images (product_id, url, thumb_url, alt, position) values (p, '/placeholders/sac-noir.svg', '/placeholders/sac-noir.svg', 'Sac bandoulière noir', 0);
  insert into public.product_colors select p, id from public.colors where name = 'Noir';
  insert into public.product_sizes select p, id from public.sizes where group_id = g_unique;

  -- Pages
  insert into public.pages (title, slug, content) values
    ('Aide', 'aide', 'Besoin d''aide pour une commande ? Écrivez-nous sur WhatsApp, nous répondons rapidement.'),
    ('Nos services', 'nos-services', 'Livraison à Libreville et dans tout le Gabon.' || chr(10) || '- Livraison rapide' || chr(10) || '- Paiement à la livraison' || chr(10) || '- Commandes spéciales sur demande'),
    ('Travailler avec nous', 'travailler-avec-nous', 'Envoyez-nous votre profil sur WhatsApp.'),
    ('Partenariat, collaboration et sponsorisation', 'partenariat', 'Marques, créateurs et événements : contactez-nous pour collaborer.'),
    ('FAQ', 'faq', '**Comment commander ?**' || chr(10) || 'Ajoutez vos articles au panier puis cliquez sur « Procéder au paiement » : la commande s''ouvre sur WhatsApp.' || chr(10) || chr(10) || '**Quels sont les frais de livraison ?**' || chr(10) || 'Ils sont confirmés sur WhatsApp selon votre quartier.');

  -- Menus
  insert into public.menus (handle, name) values ('main', 'Menu principal'), ('footer', 'Pied de page')
  on conflict (handle) do nothing;

  insert into public.menu_items (menu_id, label, link_type, target, position)
  select m.id, x.label, x.link_type, x.target, x.position
  from public.menus m,
  (values ('Accueil', 'home', null, 1), ('Collections', 'collections', null, 2),
          ('T-shirts et Polos', 'category', 't-shirts-et-polos', 3), ('Headwear', 'category', 'headwear', 4),
          ('Pantalons et Shorts', 'category', 'pantalons-et-shorts', 5), ('Sacs', 'category', 'sacs', 6),
          ('FAQ', 'page', 'faq', 7)) as x(label, link_type, target, position)
  where m.handle = 'main';

  -- Pied de page : groupes (déroulants) puis liens enfants
  with f as (select id from public.menus where handle = 'footer'),
  groups as (
    insert into public.menu_items (menu_id, label, link_type, position)
    select f.id, g.label, 'none', g.position from f,
    (values ('Aide', 1), ('Nos services', 2), ('Travailler avec nous', 3),
            ('Partenariat, collaboration et sponsorisation', 4), ('FAQ', 5), ('Réseaux sociaux', 6)) as g(label, position)
    returning id, menu_id, label
  )
  insert into public.menu_items (menu_id, parent_id, label, link_type, target, position)
  select g.menu_id, g.id, c.label, c.link_type, c.target, c.position
  from groups g
  join (values
    ('Aide', 'Comment commander', 'page', 'aide', 1),
    ('Nos services', 'Livraison et services', 'page', 'nos-services', 1),
    ('Travailler avec nous', 'Rejoindre l''équipe', 'page', 'travailler-avec-nous', 1),
    ('Partenariat, collaboration et sponsorisation', 'Nous contacter', 'page', 'partenariat', 1),
    ('FAQ', 'Questions fréquentes', 'page', 'faq', 1),
    ('Réseaux sociaux', 'Facebook', 'url', 'https://www.facebook.com/', 1),
    ('Réseaux sociaux', 'Instagram', 'url', 'https://www.instagram.com/', 2)
  ) as c(group_label, label, link_type, target, position) on c.group_label = g.label;

  -- Sections de la page d'accueil (ordre des captures)
  insert into public.home_sections (type, title, position, config) values
    ('slideshow', null, 1, '{"slides":[{"image_url":"/placeholders/banniere-2.svg","link":"/collections/headwear","alt":"Casquettes et bonnets"}]}'),
    ('product_grid', 'Collection en vedette', 2, '{"source":"featured","limit":8,"per_page":8}'),
    ('image_banner', null, 3, '{"image_url":"/placeholders/banniere-2.svg","link":"/collections","alt":"Streetwear à Libreville"}'),
    ('category_tiles', 'Explorez les sélections de la Maison', 4, '{"limit":4}'),
    ('product_carousel', 'Collection de casquettes et bonnets', 5, format('{"source":"category","category_id":"%s","limit":12}', c_head)::jsonb),
    ('product_grid', 'Tout le prêt-à-porter', 6, '{"source":"all","limit":24,"per_page":4}');
end $$;

-- Fin du script. Vérifiez dans Table Editor que les tables sont remplies.
