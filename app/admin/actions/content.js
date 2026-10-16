'use server';

import { action, must, refreshShop, requireAdmin } from '@/lib/admin/guard';
import { slugify } from '@/lib/slug';

// ----------------------------- Pages -----------------------------
export async function savePage(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.title?.trim()) throw new Error('Le titre est obligatoire.');
    const row = {
      title: input.title.trim(),
      slug: slugify(input.slug || input.title),
      content: input.content || '',
      visible: input.visible !== false,
      updated_at: new Date().toISOString(),
    };
    let id = input.id;
    if (id) must(await supabase.from('pages').update(row).eq('id', id));
    else id = must(await supabase.from('pages').insert(row).select('id').single()).id;
    refreshShop();
    return { id };
  });
}

export async function deletePage(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    must(await supabase.from('pages').delete().eq('id', id));
    refreshShop();
  });
}

// ----------------------------- Menus -----------------------------
// Enregistre tout l'arbre d'un menu : [{ label, link_type, target, children: [...] }]
export async function saveMenu(handle, tree) {
  return action(async () => {
    const supabase = await requireAdmin();
    let menu = must(await supabase.from('menus').select('id').eq('handle', handle).maybeSingle());
    if (!menu) {
      menu = must(
        await supabase
          .from('menus')
          .insert({ handle, name: handle === 'main' ? 'Menu principal' : 'Pied de page' })
          .select('id')
          .single()
      );
    }
    must(await supabase.from('menu_items').delete().eq('menu_id', menu.id));

    const clean = (i) => ({
      label: String(i.label || '').trim() || 'Sans titre',
      link_type: i.link_type || 'none',
      target: i.link_type === 'none' || i.link_type === 'home' || i.link_type === 'collections' ? null : i.target || null,
    });

    for (let p = 0; p < tree.length; p++) {
      const item = tree[p];
      const parent = must(
        await supabase
          .from('menu_items')
          .insert({ ...clean(item), menu_id: menu.id, position: p + 1 })
          .select('id')
          .single()
      );
      const children = item.children || [];
      if (children.length) {
        must(
          await supabase
            .from('menu_items')
            .insert(children.map((c, i) => ({ ...clean(c), menu_id: menu.id, parent_id: parent.id, position: i + 1 })))
        );
      }
    }
    refreshShop();
  });
}

// ----------------------------- Page d'accueil -----------------------------
const SECTION_TYPES = ['slideshow', 'product_grid', 'product_carousel', 'category_tiles', 'image_banner'];

export async function saveHomeSections(sections) {
  return action(async () => {
    const supabase = await requireAdmin();
    const existing = must(await supabase.from('home_sections').select('id'));
    const keep = new Set(sections.filter((s) => s.id).map((s) => s.id));
    const toDelete = existing.map((s) => s.id).filter((id) => !keep.has(id));
    if (toDelete.length) must(await supabase.from('home_sections').delete().in('id', toDelete));

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (!SECTION_TYPES.includes(s.type)) continue;
      const row = { type: s.type, title: s.title || null, visible: s.visible !== false, config: s.config || {}, position: i + 1 };
      if (s.id) must(await supabase.from('home_sections').update(row).eq('id', s.id));
      else must(await supabase.from('home_sections').insert(row));
    }
    refreshShop();
  });
}

// ----------------------------- Paramètres -----------------------------
export async function saveSettings(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    const row = {
      id: 1,
      shop_name: input.shop_name?.trim() || 'CrownCaps',
      logo_url: input.logo_url || null,
      whatsapp_number: String(input.whatsapp_number || '').replace(/\D/g, ''),
      announcements: (input.announcements || []).filter((a) => a.text?.trim()).map((a) => ({ text: a.text.trim(), link: a.link?.trim() || '' })),
      socials: input.socials || {},
      footer_text: input.footer_text || '',
      shipping_country: input.shipping_country || 'Gabon',
      seo_description: input.seo_description || '',
      updated_at: new Date().toISOString(),
    };
    if (!/^\d{8,15}$/.test(row.whatsapp_number)) {
      throw new Error('Numéro WhatsApp invalide : format international sans + ni espaces, ex. 24107123456.');
    }
    must(await supabase.from('settings').upsert(row));
    refreshShop();
  });
}
