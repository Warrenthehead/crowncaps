'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SingleImageField from './SingleImageField';
import { useToast } from './Toast';
import { deleteCategory, saveCategory } from '@/app/admin/actions/catalog';
import { SORT_OPTIONS } from '@/lib/products';
import { TEMPLATES } from '@/templates/registry';
import { slugify } from '@/lib/slug';

// Formulaire catégorie : nom, image, visible, modèle de page et tri par défaut.
export default function CategoryForm({ category, sizeGroups }) {
  const router = useRouter();
  const toast = useToast();
  const [saving, start] = useTransition();
  const [form, setForm] = useState({
    id: category?.id,
    name: category?.name || '',
    slug: category?.slug || '',
    image_url: category?.image_url || null,
    visible: category ? category.visible : true,
    default_template: category?.default_template || 'standard',
    default_sort: category?.default_sort || 'recent',
    size_group_id: category?.size_group_id || '',
    seo_description: category?.seo_description || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    start(async () => {
      const res = await saveCategory(form);
      if (!res.ok) return toast(res.error, 'error');
      toast('Catégorie enregistrée');
      router.replace('/admin/categories');
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm('Supprimer cette catégorie ? Ses produits resteront, sans catégorie.')) return;
    start(async () => {
      const res = await deleteCategory(form.id);
      if (!res.ok) return toast(res.error, 'error');
      toast('Catégorie supprimée');
      router.replace('/admin/categories');
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-5">
      <div>
        <label className="label" htmlFor="name">
          Nom
        </label>
        <input
          id="name"
          required
          className="field"
          value={form.name}
          onChange={(e) => {
            set('name', e.target.value);
            if (!category) set('slug', slugify(e.target.value));
          }}
        />
        <p className="mt-1 text-xs text-muted">
          Adresse : /collections/
          <input className="inline w-48 border-b border-dashed border-line bg-transparent text-xs outline-none" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} aria-label="Slug" />
        </p>
      </div>

      <SingleImageField label="Image de la tuile" value={form.image_url} onChange={(v) => set('image_url', v)} folder="categories" />

      <label className="flex min-h-10 items-center gap-2 text-sm">
        <input type="checkbox" className="h-5 w-5 accent-ink" checked={form.visible} onChange={(e) => set('visible', e.target.checked)} />
        Visible sur la boutique
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tpl">
            Modèle de page produit par défaut
          </label>
          <select id="tpl" className="field" value={form.default_template} onChange={(e) => set('default_template', e.target.value)}>
            {TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sort">
            Tri par défaut
          </label>
          <select id="sort" className="field" value={form.default_sort} onChange={(e) => set('default_sort', e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="sizes">
            Groupe de tailles proposé
          </label>
          <select id="sizes" className="field" value={form.size_group_id} onChange={(e) => set('size_group_id', e.target.value)}>
            <option value="">Tous</option>
            {sizeGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="seo">
          Description pour Google (optionnel)
        </label>
        <textarea id="seo" rows={2} maxLength={160} className="field" value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} />
      </div>

      <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
        {form.id ? (
          <button type="button" onClick={remove} className="btn-admin-danger" disabled={saving}>
            Supprimer
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn-admin min-w-32" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
