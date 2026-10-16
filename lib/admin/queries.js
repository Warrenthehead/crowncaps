import 'server-only';
import { getServerClient } from '@/lib/supabase/server';
import { PRODUCT_SELECT, normalizeProduct } from '@/lib/products';

// Lectures pour l'admin (avec la session admin : voit aussi les éléments masqués).

export async function adminProducts() {
  const supabase = await getServerClient();
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).order('position').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map(normalizeProduct);
}

export async function adminProduct(id) {
  const supabase = await getServerClient();
  const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return normalizeProduct(data);
}

export async function adminCatalog() {
  const supabase = await getServerClient();
  const [categories, colors, sizeGroups, sizes, garmentTypes] = await Promise.all([
    supabase.from('categories').select('*').order('position'),
    supabase.from('colors').select('*').order('position'),
    supabase.from('size_groups').select('*').order('position'),
    supabase.from('sizes').select('*').order('position'),
    supabase.from('garment_types').select('*').order('position'),
  ]);
  const err = [categories, colors, sizeGroups, sizes, garmentTypes].find((r) => r.error);
  if (err) throw new Error(err.error.message);
  return {
    categories: categories.data,
    colors: colors.data,
    sizeGroups: sizeGroups.data.map((g) => ({ ...g, sizes: sizes.data.filter((s) => s.group_id === g.id) })),
    garmentTypes: garmentTypes.data,
  };
}

export async function adminTable(table, order = 'position') {
  const supabase = await getServerClient();
  const { data, error } = await supabase.from(table).select('*').order(order);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminRow(table, id) {
  const supabase = await getServerClient();
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function adminMenus() {
  const supabase = await getServerClient();
  const { data: menus } = await supabase.from('menus').select('id, handle');
  const { data: items } = await supabase.from('menu_items').select('*').order('position');
  const tree = (menuId) => {
    const own = (items || []).filter((i) => i.menu_id === menuId);
    return own
      .filter((i) => !i.parent_id)
      .map((p) => ({ ...p, children: own.filter((c) => c.parent_id === p.id) }));
  };
  const byHandle = Object.fromEntries((menus || []).map((m) => [m.handle, tree(m.id)]));
  return { main: byHandle.main || [], footer: byHandle.footer || [] };
}
