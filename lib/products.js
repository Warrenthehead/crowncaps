import { TEMPLATE_KEYS } from '@/templates/registry';

export const STATUS_LABELS = {
  disponible: 'Disponible',
  vendu: 'Vendu',
  a_venir: 'À venir',
};

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'best', label: 'Plus vendus' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'az', label: 'De A à Z' },
];

// Colonnes demandées à Supabase pour un produit complet.
export const PRODUCT_SELECT = `
  id, title, slug, description, price, compare_at_price, status, template, release_at,
  code, brand, featured, sales_count, position, published, created_at, category_id, garment_type_id,
  category:categories ( id, name, slug, default_template ),
  garment_type:garment_types ( id, name ),
  images:product_images ( id, url, thumb_url, alt, position ),
  colors:product_colors ( color:colors ( id, name, hex, position ) ),
  sizes:product_sizes ( size:sizes ( id, label, position, group_id ) )
`;

// Met en forme une ligne brute de Supabase (images triées, listes à plat).
export function normalizeProduct(row) {
  if (!row) return null;
  return {
    ...row,
    images: [...(row.images || [])].sort((a, b) => a.position - b.position),
    colors: (row.colors || [])
      .map((c) => c.color)
      .filter(Boolean)
      .sort((a, b) => a.position - b.position),
    sizes: (row.sizes || [])
      .map((s) => s.size)
      .filter(Boolean)
      .sort((a, b) => a.position - b.position),
  };
}

// Calcule le statut et le modèle réellement affichés.
// - le produit peut remplacer le modèle par défaut de sa catégorie ;
// - un produit "À venir" dont la date de sortie est passée devient Standard ;
// - un produit Vendu utilise le modèle Vendu.
export function resolveProduct(product, now = Date.now()) {
  if (!product) return product;
  let template = product.template || product.category?.default_template || 'standard';
  let status = product.status;
  const releaseDue = product.release_at && new Date(product.release_at).getTime() <= now;

  if (releaseDue && (status === 'a_venir' || template === 'a-venir')) {
    if (template === 'a-venir') template = 'standard';
    if (status === 'a_venir') status = 'disponible';
  } else if (status === 'a_venir' && template === 'standard') {
    template = 'a-venir';
  }
  if (status === 'vendu' && template === 'standard') template = 'vendu';
  if (template === 'a-venir' && status === 'disponible') status = 'a_venir';
  if (!TEMPLATE_KEYS.includes(template)) template = 'standard';

  return { ...product, status, template };
}

export function mainImage(product) {
  return product?.images?.[0] || null;
}

// Tri des listes de produits côté boutique.
export function sortProducts(list, sort) {
  const items = [...list];
  switch (sort) {
    case 'price_asc':
      return items.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return items.sort((a, b) => b.price - a.price);
    case 'az':
      return items.sort((a, b) => a.title.localeCompare(b.title, 'fr'));
    case 'best':
      return items.sort((a, b) => b.sales_count - a.sales_count);
    case 'manual':
      return items.sort((a, b) => a.position - b.position);
    case 'recent':
    default:
      return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
}
