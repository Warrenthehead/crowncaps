import 'server-only';
import { cache } from 'react';
import { getPublicClient } from '@/lib/supabase/public';
import { PRODUCT_SELECT, normalizeProduct, resolveProduct, sortProducts } from '@/lib/products';

// =====================================================================
//  LECTURE DES DONNEES POUR LA BOUTIQUE
//  Toutes ces fonctions lisent Supabase avec la clé publique (RLS : seul
//  ce qui est publié/visible est renvoyé). cache() évite de refaire la
//  même requête plusieurs fois pendant l'affichage d'une page.
// =====================================================================

const DEFAULT_SETTINGS = {
  shop_name: 'CrownCaps',
  logo_url: null,
  whatsapp_number: '',
  announcements: [],
  socials: {},
  footer_text: '© CrownCaps, tous droits réservés.',
  shipping_country: 'Gabon',
  seo_description: 'CrownCaps, streetwear premium au Gabon.',
};

const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

// Exécute une requête Supabase. En cas d'erreur :
// - pendant "npm run build" : on continue avec une valeur vide (la page sera
//   régénérée au premier passage ou après une modification dans l'admin) ;
// - sur le site en ligne : erreur claire, affichée par app/(shop)/error.js.
async function run(what, fallback, query) {
  try {
    const { data, error } = await query();
    if (error) throw error;
    return data ?? fallback;
  } catch (e) {
    if (IS_BUILD) {
      console.warn(`[Supabase] ${what} indisponible pendant le build : ${e.message}`);
      return fallback;
    }
    console.error(`[Supabase] ${what}:`, e.message);
    throw new Error(`Impossible de charger ${what}. ${e.message}`);
  }
}

export const getSettings = cache(async () => {
  const data = await run('les paramètres', null, () => getPublicClient().from('settings').select('*').eq('id', 1).maybeSingle());
  return { ...DEFAULT_SETTINGS, ...(data || {}) };
});

// Menus sous forme d'arbre : [{ label, href, children: [...] }]
export const getMenu = cache(async (handle) => {
  const menu = await run('le menu', null, () => getPublicClient().from('menus').select('id').eq('handle', handle).maybeSingle());
  if (!menu) return [];
  const items = await run('le menu', [], () =>
    getPublicClient().from('menu_items').select('id, parent_id, label, link_type, target, position').eq('menu_id', menu.id).order('position')
  );
  return buildMenuTree(items);
});

export function menuHref(item) {
  switch (item.link_type) {
    case 'home':
      return '/';
    case 'collections':
      return '/collections';
    case 'category':
      return item.target ? `/collections/${item.target}` : '/collections';
    case 'page':
      return item.target ? `/pages/${item.target}` : '/';
    case 'url':
      return item.target || '#';
    default:
      return null;
  }
}

function buildMenuTree(items) {
  const byParent = {};
  items.forEach((i) => {
    const key = i.parent_id || 'root';
    (byParent[key] ||= []).push(i);
  });
  const build = (parentKey) =>
    (byParent[parentKey] || []).map((i) => ({
      id: i.id,
      label: i.label,
      href: menuHref(i),
      external: i.link_type === 'url',
      children: build(i.id),
    }));
  return build('root');
}

export const getCategories = cache(async () =>
  run('les catégories', [], () =>
    getPublicClient()
      .from('categories')
      .select('id, name, slug, image_url, position, default_sort, default_template, seo_description')
      .order('position')
  )
);

export const getCategory = cache(async (slug) =>
  run('la catégorie', null, () =>
    getPublicClient()
      .from('categories')
      .select('id, name, slug, image_url, default_sort, default_template, seo_description')
      .eq('slug', slug)
      .maybeSingle()
  )
);

// Tous les produits publiés (la boutique est petite : on les charge en une fois,
// le tri et les filtres se font ensuite instantanément dans le navigateur).
export const getAllProducts = cache(async () => {
  const data = await run('les produits', [], () =>
    getPublicClient().from('products').select(PRODUCT_SELECT).order('position').order('created_at', { ascending: false })
  );
  return data.map((row) => resolveProduct(normalizeProduct(row)));
});

export async function getProducts({ source = 'all', categoryId, limit, sort } = {}) {
  let list = await getAllProducts();
  if (source === 'featured') list = list.filter((p) => p.featured);
  if (source === 'category' && categoryId) list = list.filter((p) => p.category_id === categoryId);
  list = sort ? sortProducts(list, sort) : list;
  return limit ? list.slice(0, limit) : list;
}

export const getProduct = cache(async (slug) => {
  const data = await run('le produit', null, () => getPublicClient().from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle());
  return data ? resolveProduct(normalizeProduct(data)) : null;
});

// "Vous aimerez aussi" : même catégorie d'abord, puis le reste.
export async function getRelatedProducts(product, limit = 4) {
  const all = await getAllProducts();
  const others = all.filter((p) => p.id !== product.id);
  const same = others.filter((p) => p.category_id && p.category_id === product.category_id);
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, limit);
}

export const getHomeSections = cache(async () =>
  run("les sections de l'accueil", [], () =>
    getPublicClient().from('home_sections').select('id, type, title, position, config').order('position')
  )
);

export const getPage = cache(async (slug) =>
  run('la page', null, () => getPublicClient().from('pages').select('id, title, slug, content, updated_at').eq('slug', slug).maybeSingle())
);

export const getPages = cache(async () => run('les pages', [], () => getPublicClient().from('pages').select('slug, updated_at')));

export async function getFilterOptions() {
  const [colors, garmentTypes] = await Promise.all([
    run('les couleurs', [], () => getPublicClient().from('colors').select('id, name, hex').order('position')),
    run('les types de vêtement', [], () => getPublicClient().from('garment_types').select('id, name').order('position')),
  ]);
  return { colors, garmentTypes };
}

export async function searchProducts(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const words = q.normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/);
  const all = await getAllProducts();
  return all.filter((p) => {
    const hay = `${p.title} ${p.code} ${p.brand} ${p.category?.name || ''}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return words.every((w) => hay.includes(w));
  });
}
