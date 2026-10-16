'use server';

import { action, must, refreshShop, requireAdmin } from '@/lib/admin/guard';
import { slugify } from '@/lib/slug';

// ----------------------------- Catégories -----------------------------
export async function saveCategory(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.name?.trim()) throw new Error('Le nom est obligatoire.');
    const row = {
      name: input.name.trim(),
      slug: slugify(input.slug || input.name),
      image_url: input.image_url || null,
      visible: input.visible !== false,
      default_template: input.default_template || 'standard',
      default_sort: input.default_sort || 'recent',
      size_group_id: input.size_group_id || null,
      seo_description: input.seo_description || null,
    };
    if (row.slug === 'tous') throw new Error('Le slug « tous » est réservé.');
    let id = input.id;
    if (id) {
      must(await supabase.from('categories').update(row).eq('id', id));
    } else {
      const { data: last } = await supabase.from('categories').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
      row.position = (last?.position ?? 0) + 1;
      id = must(await supabase.from('categories').insert(row).select('id').single()).id;
    }
    refreshShop();
    return { id };
  });
}

export async function deleteCategory(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    must(await supabase.from('categories').delete().eq('id', id));
    refreshShop();
  });
}

// ----------------------------- Ordre générique -----------------------------
const ORDERABLE = ['categories', 'colors', 'sizes', 'size_groups', 'garment_types'];

export async function reorder(table, ids) {
  return action(async () => {
    if (!ORDERABLE.includes(table)) throw new Error('Table non autorisée.');
    const supabase = await requireAdmin();
    await Promise.all(ids.map((id, i) => supabase.from(table).update({ position: i + 1 }).eq('id', id)));
    refreshShop();
  });
}

// ----------------------------- Couleurs -----------------------------
export async function saveColor(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.name?.trim()) throw new Error('Le nom de la couleur est obligatoire.');
    const row = { name: input.name.trim(), hex: input.hex || '#000000' };
    let saved;
    if (input.id) {
      saved = must(await supabase.from('colors').update(row).eq('id', input.id).select().single());
    } else {
      const { data: last } = await supabase.from('colors').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
      saved = must(await supabase.from('colors').insert({ ...row, position: (last?.position ?? 0) + 1 }).select().single());
    }
    refreshShop();
    return saved;
  });
}

export async function deleteColor(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    must(await supabase.from('colors').delete().eq('id', id));
    refreshShop();
  });
}

// ----------------------------- Tailles -----------------------------
export async function saveSizeGroup(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.name?.trim()) throw new Error('Le nom du groupe est obligatoire.');
    let saved;
    if (input.id) {
      saved = must(await supabase.from('size_groups').update({ name: input.name.trim() }).eq('id', input.id).select().single());
    } else {
      const { data: last } = await supabase.from('size_groups').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
      saved = must(await supabase.from('size_groups').insert({ name: input.name.trim(), position: (last?.position ?? 0) + 1 }).select().single());
    }
    refreshShop();
    return saved;
  });
}

export async function deleteSizeGroup(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    must(await supabase.from('size_groups').delete().eq('id', id));
    refreshShop();
  });
}

export async function saveSize(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.label?.trim()) throw new Error('Le libellé de la taille est obligatoire.');
    if (!input.group_id) throw new Error('Choisissez un groupe de tailles.');
    let saved;
    if (input.id) {
      saved = must(await supabase.from('sizes').update({ label: input.label.trim() }).eq('id', input.id).select().single());
    } else {
      const { data: last } = await supabase
        .from('sizes')
        .select('position')
        .eq('group_id', input.group_id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();
      saved = must(
        await supabase.from('sizes').insert({ group_id: input.group_id, label: input.label.trim(), position: (last?.position ?? 0) + 1 }).select().single()
      );
    }
    refreshShop();
    return saved;
  });
}

export async function deleteSize(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    must(await supabase.from('sizes').delete().eq('id', id));
    refreshShop();
  });
}

// ----------------------------- Types de vêtement -----------------------------
export async function saveGarmentType(input) {
  return action(async () => {
    const supabase = await requireAdmin();
    if (!input.name?.trim()) throw new Error('Le nom est obligatoire.');
    let saved;
    if (input.id) {
      saved = must(await supabase.from('garment_types').update({ name: input.name.trim() }).eq('id', input.id).select().single());
    } else {
      const { data: last } = await supabase.from('garment_types').select('position').order('position', { ascending: false }).limit(1).maybeSingle();
      saved = must(await supabase.from('garment_types').insert({ name: input.name.trim(), position: (last?.position ?? 0) + 1 }).select().single());
    }
    refreshShop();
    return saved;
  });
}

export async function deleteGarmentType(id) {
  return action(async () => {
    const supabase = await requireAdmin();
    must(await supabase.from('garment_types').delete().eq('id', id));
    refreshShop();
  });
}
