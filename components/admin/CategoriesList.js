'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SortableList from './SortableList';
import { useToast } from './Toast';
import { reorder } from '@/app/admin/actions/catalog';
import { templateLabel } from '@/templates/registry';

// Liste des catégories, réordonnable par glisser-déposer (ordre sur le site).
export default function CategoriesList({ categories: initial }) {
  const [categories, setCategories] = useState(initial);
  const toast = useToast();
  useEffect(() => setCategories(initial), [initial]);

  const onChange = async (next) => {
    setCategories(next);
    const res = await reorder('categories', next.map((c) => c.id));
    toast(res.ok ? 'Ordre enregistré' : res.error, res.ok ? 'success' : 'error');
  };

  if (!categories.length) return <p className="card text-sm text-muted">Aucune catégorie.</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <SortableList
        items={categories}
        onChange={onChange}
        renderItem={(c, handle) => (
          <div className="flex items-center gap-3 border-b border-line bg-white px-2 py-2 last:border-b-0">
            {handle}
            <Link href={`/admin/categories/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
                {c.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {c.name}
                  {!c.visible && <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-xs font-normal text-muted">Masquée</span>}
                </p>
                <p className="truncate text-xs text-muted">
                  /collections/{c.slug} · modèle {templateLabel(c.default_template)}
                </p>
              </div>
            </Link>
            <Link href={`/admin/categories/${c.id}`} className="btn-admin-ghost">
              Modifier
            </Link>
          </div>
        )}
      />
    </div>
  );
}
