'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';
import { deletePage, savePage } from '@/app/admin/actions/content';
import { slugify } from '@/lib/slug';

// Page simple : titre, contenu texte (gras **...**, listes "- "), visible.
export default function PageForm({ page }) {
  const router = useRouter();
  const toast = useToast();
  const [saving, start] = useTransition();
  const [form, setForm] = useState({
    id: page?.id,
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    visible: page ? page.visible : true,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    start(async () => {
      const res = await savePage(form);
      if (!res.ok) return toast(res.error, 'error');
      toast('Page enregistrée');
      router.replace('/admin/pages');
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirm('Supprimer cette page ? Pensez à la retirer des menus.')) return;
    start(async () => {
      const res = await deletePage(form.id);
      if (!res.ok) return toast(res.error, 'error');
      toast('Page supprimée');
      router.replace('/admin/pages');
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="card max-w-3xl space-y-5">
      <div>
        <label className="label" htmlFor="title">
          Titre
        </label>
        <input
          id="title"
          required
          className="field"
          value={form.title}
          onChange={(e) => {
            set('title', e.target.value);
            if (!page) set('slug', slugify(e.target.value));
          }}
        />
        <p className="mt-1 text-xs text-muted">
          Adresse : /pages/
          <input className="inline w-48 border-b border-dashed border-line bg-transparent text-xs outline-none" value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} aria-label="Slug" />
        </p>
      </div>
      <div>
        <label className="label" htmlFor="content">
          Contenu
        </label>
        <textarea id="content" rows={14} className="field" value={form.content} onChange={(e) => set('content', e.target.value)} />
        <p className="mt-1 text-xs text-muted">**texte** = gras · une ligne qui commence par « - » = liste · ligne vide = nouveau paragraphe</p>
      </div>
      <label className="flex min-h-10 items-center gap-2 text-sm">
        <input type="checkbox" className="h-5 w-5 accent-ink" checked={form.visible} onChange={(e) => set('visible', e.target.checked)} />
        Visible sur la boutique
      </label>
      <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-4">
        {form.id ? (
          <button type="button" className="btn-admin-danger" onClick={remove} disabled={saving}>
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
