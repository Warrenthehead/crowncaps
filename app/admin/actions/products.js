'use server';

import { action, must, refreshShop, requireAdmin } from '@/lib/admin/guard';
import { slugify } from '@/lib/slug';

const STORAGE_MARKER = '/storage/v1/object/public/images/';

// Supprime du stockage les images qui ne sont plus utilisées par aucun produit.
async function cleanupImages(supabase, urls) {
  const candidates = [...new Set(urls.filter((u) => u && u.includes(`${STORAGE_MARKER}products/`)))];
  if (!candidates.length) return;
  const [byUrl, byThumb] = await Promise.all([
    supabase.from('product_images').select('url').in('url', candidates),
    supabase.from('product_images').select('thumb_url').in('thumb_url', candidates),
  ]);
  const used = new Set([...(byUrl.data || []).map((r) => r.url), ...(byThumb.data || []).map((r) => r.thumb_url)]);
  const paths = candidates.filter((u) => !used.has(u)).map((u) => decodeURIComponent(u.split(STORAGE_MARKER)[1]));
  if (paths.length) await supabase.storage.from('images').remove(paths);
}

async function uniqueSlug(supabase, base, excludeId) {
  const root = slugify(base) || 'produit';
  let slug = root;
  for (let i = 2; i < 200; i++) {
    let q = supabase.from('products').select('id').eq('slug', slug);
    if (excludeId) q = q.neq('id', excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
    slug = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

function toInt(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = parseInt(String(v).replace(/[^\d]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

// Crée ou met à jour un produit avec ses images, couleurs et tailles.
export async function saveProduct(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.title?.trim()) throw new Error('Le titre est obligatoire.');

    const row = {
      title: input.title.trim(),
      slug: await uniqueSlug(supabase, input.slug || input.title, input.id),
      description: input.description || '',
      price: toInt(input.price) ?? 0,
      compare_at_price: toInt(input.compare_at_price),
      category_id: input.category_id || null,
      garment_type_id: input.garment_type_id || null,
      status: input.status || 'disponible',
      template: input.template || null,
      release_at: input.release_at ? new Date(input.release_at).toISOString() : null,
      release_text: input.release_text?.trim() || null,
      brand: input.brand?.trim() || 'CrownCaps',
      featured: Boolean(input.featured),
      published: input.published !== false,
    };
    if (input.code?.trim()) row.code = input.code.trim().toUpperCase();

    let id = input.id;
    let previousUrls = [];
    if (id) {
      const old = must(await supabase.from('product_images').select('url, thumb_url').eq('product_id', id));
      previousUrls = old.flatMap((i) => [i.url, i.thumb_url]);
      must(await supabase.from('products').update(row).eq('id', id));
    } else {
      // Nouveau produit : placé en tête de l'ordre manuel
      const { data: first } = await supabase.from('products').select('position').order('position').limit(1).maybeSingle();
      row.position = (first?.position ?? 1) - 1;
      id = must(await supabase.from('products').insert(row).select('id').single()).id;
    }

    // Images (la première = image principale)
    must(await supabase.from('product_images').delete().eq('product_id', id));
    const images = (input.images || []).filter((i) => i.url);
    if (images.length) {
      must(
        await supabase.from('product_images').insert(
          images.map((img, position) => ({ product_id: id, url: img.url, thumb_url: img.thumb_url || img.url, alt: img.alt || row.title, position }))
        )
      );
    }
    const keptUrls = new Set(images.flatMap((i) => [i.url, i.thumb_url]));
    await cleanupImages(supabase, previousUrls.filter((u) => !keptUrls.has(u)));

    // Couleurs et tailles
    must(await supabase.from('product_colors').delete().eq('product_id', id));
    if (input.color_ids?.length) {
      must(await supabase.from('product_colors').insert(input.color_ids.map((color_id) => ({ product_id: id, color_id }))));
    }
    must(await supabase.from('product_sizes').delete().eq('product_id', id));
    if (input.size_ids?.length) {
      must(await supabase.from('product_sizes').insert(input.size_ids.map((size_id) => ({ product_id: id, size_id }))));
    }

    refreshShop();
    return { id, slug: row.slug };
  });
}

// Crée plusieurs produits d'un coup (5 maximum). Tout ou rien : si l'un échoue,
// ceux déjà créés pendant cet appel sont supprimés.
export async function saveProducts(inputs) {
  return action(async () => {
    await requireAdmin();
    if (!Array.isArray(inputs) || inputs.length === 0) throw new Error('Aucun produit à enregistrer.');
    if (inputs.length > 5) throw new Error('5 produits maximum à la fois.');
    inputs.forEach((p, i) => {
      if (!p.title?.trim()) throw new Error(`Produit ${i + 1} : le titre est obligatoire.`);
    });

    const created = [];
    for (const [i, input] of inputs.entries()) {
      const res = await saveProduct({ ...input, id: undefined });
      if (!res.ok) {
        if (created.length) await deleteProducts(created.map((c) => c.id));
        throw new Error(`Produit ${i + 1} : ${res.error}`);
      }
      created.push(res.data);
    }
    return created;
  });
}

export async function deleteProducts(ids) {
  return action(async () => {
    const supabase = await requireAdmin();
    const imgs = must(await supabase.from('product_images').select('url, thumb_url').in('product_id', ids));
    must(await supabase.from('products').delete().in('id', ids));
    await cleanupImages(supabase, imgs.flatMap((i) => [i.url, i.thumb_url]));
    refreshShop();
  });
}

export async function duplicateProduct(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    const p = must(
      await supabase
        .from('products')
        .select('*, product_images(url, thumb_url, alt, position), product_colors(color_id), product_sizes(size_id)')
        .eq('id', id)
        .single()
    );
    const { id: _id, code: _code, created_at: _c, updated_at: _u, product_images, product_colors, product_sizes, ...rest } = p;
    const copy = must(
      await supabase
        .from('products')
        .insert({ ...rest, title: `${p.title} (copie)`, slug: await uniqueSlug(supabase, `${p.slug}-copie`), sales_count: 0, published: false })
        .select('id')
        .single()
    );
    if (product_images.length) must(await supabase.from('product_images').insert(product_images.map((i) => ({ ...i, product_id: copy.id }))));
    if (product_colors.length) must(await supabase.from('product_colors').insert(product_colors.map((c) => ({ ...c, product_id: copy.id }))));
    if (product_sizes.length) must(await supabase.from('product_sizes').insert(product_sizes.map((s) => ({ ...s, product_id: copy.id }))));
    refreshShop();
    return { id: copy.id };
  });
}

// Actions groupées : changer catégorie, statut ou modèle de page.
export async function bulkUpdateProducts(ids, patch) {
  return action(async () => {
    const supabase = await requireAdmin();
    const allowed = {};
    if ('category_id' in patch) allowed.category_id = patch.category_id || null;
    if ('status' in patch) allowed.status = patch.status;
    if ('template' in patch) allowed.template = patch.template || null;
    if ('published' in patch) allowed.published = Boolean(patch.published);
    if ('featured' in patch) allowed.featured = Boolean(patch.featured);
    must(await supabase.from('products').update(allowed).in('id', ids));
    refreshShop();
  });
}

// "Marquer comme vendu" : +1 au compteur de ventes, et option statut Vendu.
export async function markProductSold(id, setSoldStatus) {
  return action(async () => {
    const supabase = await requireAdmin();
    const p = must(await supabase.from('products').select('sales_count').eq('id', id).single());
    const patch = { sales_count: (p.sales_count || 0) + 1 };
    if (setSoldStatus) patch.status = 'vendu';
    must(await supabase.from('products').update(patch).eq('id', id));
    refreshShop();
    return patch;
  });
}

// Ordre manuel (glisser-déposer) : ids dans le nouvel ordre.
export async function reorderProducts(ids) {
  return action(async () => {
    const supabase = await requireAdmin();
    await Promise.all(ids.map((id, position) => supabase.from('products').update({ position }).eq('id', id)));
    refreshShop();
  });
}
