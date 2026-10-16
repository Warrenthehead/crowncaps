'use client';

import { useState, useTransition } from 'react';
import SortableList from './SortableList';
import SingleImageField from './SingleImageField';
import { useToast } from './Toast';
import { saveHomeSections } from '@/app/admin/actions/content';
import { SORT_OPTIONS } from '@/lib/products';
import { IconClose } from '@/components/icons';

const TYPES = {
  slideshow: { label: 'Diaporama', defaults: { slides: [] } },
  product_grid: { label: 'Grille de produits', defaults: { source: 'all', limit: 12, per_page: 8 } },
  product_carousel: { label: 'Carrousel de produits', defaults: { source: 'featured', limit: 12 } },
  category_tiles: { label: 'Tuiles de catégories', defaults: { limit: 4 } },
  image_banner: { label: 'Bannière image', defaults: { image_url: null, link: '', alt: '' } },
};

let n = 0;
const tmpId = () => `new-${Date.now()}-${n++}`;

function ProductSourceFields({ config, onChange, categories, grid }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="label">Produits affichés</label>
        <select className="field" value={config.source || 'all'} onChange={(e) => onChange({ source: e.target.value })}>
          <option value="featured">En vedette</option>
          <option value="category">Une catégorie</option>
          <option value="all">Tous les produits</option>
        </select>
      </div>
      {config.source === 'category' && (
        <div>
          <label className="label">Catégorie</label>
          <select className="field" value={config.category_id || ''} onChange={(e) => onChange({ category_id: e.target.value })}>
            <option value="">Choisir…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="label">Tri</label>
        <select className="field" value={config.sort || ''} onChange={(e) => onChange({ sort: e.target.value || undefined })}>
          <option value="">Ordre manuel</option>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Nombre de produits</label>
        <input type="number" min={1} max={48} className="field" value={config.limit || 12} onChange={(e) => onChange({ limit: Number(e.target.value) })} />
      </div>
      {grid && (
        <div>
          <label className="label">Produits par page (pagination 1/3)</label>
          <input type="number" min={2} max={24} step={2} className="field" value={config.per_page || 8} onChange={(e) => onChange({ per_page: Number(e.target.value) })} />
        </div>
      )}
    </div>
  );
}

function SectionFields({ section, onConfig, categories }) {
  const c = section.config || {};
  switch (section.type) {
    case 'slideshow': {
      const slides = c.slides || [];
      const setSlides = (next) => onConfig({ slides: next });
      return (
        <div className="space-y-3">
          {slides.map((s, i) => (
            <div key={i} className="rounded-lg border border-line p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Diapositive {i + 1}</span>
                <button type="button" className="text-sm text-danger hover:underline" onClick={() => setSlides(slides.filter((_, j) => j !== i))}>
                  Retirer
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                <SingleImageField label="Image" ratio="aspect-[4/5]" folder="home" value={s.image_url} onChange={(v) => setSlides(slides.map((x, j) => (j === i ? { ...x, image_url: v } : x)))} />
                <div className="space-y-2">
                  <input className="field" placeholder="Lien (ex. /collections/headwear)" value={s.link || ''} onChange={(e) => setSlides(slides.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} />
                  <input className="field" placeholder="Texte alternatif (description de l'image)" value={s.alt || ''} onChange={(e) => setSlides(slides.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn-admin-ghost" onClick={() => setSlides([...slides, { image_url: null, link: '', alt: '' }])}>
            + Ajouter une diapositive
          </button>
        </div>
      );
    }
    case 'image_banner':
      return (
        <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
          <SingleImageField label="Image" ratio="aspect-[4/3]" folder="home" value={c.image_url} onChange={(v) => onConfig({ image_url: v })} />
          <div className="space-y-2">
            <input className="field" placeholder="Lien (optionnel)" value={c.link || ''} onChange={(e) => onConfig({ link: e.target.value })} />
            <input className="field" placeholder="Texte alternatif" value={c.alt || ''} onChange={(e) => onConfig({ alt: e.target.value })} />
          </div>
        </div>
      );
    case 'category_tiles':
      return (
        <div className="max-w-xs">
          <label className="label">Nombre de catégories</label>
          <input type="number" min={1} max={12} className="field" value={c.limit || 4} onChange={(e) => onConfig({ limit: Number(e.target.value) })} />
        </div>
      );
    default:
      return <ProductSourceFields config={c} onChange={onConfig} categories={categories} grid={section.type === 'product_grid'} />;
  }
}

// Sections de la page d'accueil : ordre (glisser-déposer), titre, réglages.
export default function HomeEditor({ sections: initial, categories }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [sections, setSections] = useState(initial);
  const [open, setOpen] = useState(null);

  const update = (id, patch) => setSections((l) => l.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const updateConfig = (id, patch) => setSections((l) => l.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...patch } } : s)));

  const add = (type) => {
    if (!type) return;
    const id = tmpId();
    setSections((l) => [...l, { id, isNew: true, type, title: '', visible: true, config: { ...TYPES[type].defaults } }]);
    setOpen(id);
  };

  const save = () =>
    start(async () => {
      const payload = sections.map(({ isNew, id, ...s }) => (isNew ? s : { id, ...s }));
      const res = await saveHomeSections(payload);
      if (!res.ok) return toast(res.error, 'error');
      toast("Page d'accueil enregistrée");
      window.location.reload();
    });

  return (
    <div className="space-y-4 pb-20">
      <p className="text-sm text-muted">Glissez les sections pour changer leur ordre sur la page d&apos;accueil.</p>
      <SortableList
        items={sections}
        onChange={setSections}
        className="space-y-3"
        renderItem={(s, handle) => (
          <div className={`card p-3 ${s.visible ? '' : 'opacity-60'}`}>
            <div className="flex items-center gap-2">
              {handle}
              <button type="button" className="flex min-w-0 flex-1 flex-col items-start text-left" onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id}>
                <span className="text-xs text-muted">{TYPES[s.type]?.label}</span>
                <span className="max-w-full truncate font-semibold">{s.title || '(sans titre)'}</span>
              </button>
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" className="h-4 w-4 accent-ink" checked={s.visible} onChange={(e) => update(s.id, { visible: e.target.checked })} />
                <span className="hidden sm:inline">Visible</span>
              </label>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-muted hover:text-danger"
                onClick={() => confirm('Retirer cette section ?') && setSections((l) => l.filter((x) => x.id !== s.id))}
                aria-label="Retirer la section"
              >
                <IconClose size={18} />
              </button>
            </div>
            {open === s.id && (
              <div className="mt-4 space-y-4 border-t border-line pt-4">
                {s.type !== 'slideshow' && s.type !== 'image_banner' && (
                  <div>
                    <label className="label">Titre de la section</label>
                    <input className="field" value={s.title || ''} onChange={(e) => update(s.id, { title: e.target.value })} placeholder="ex. Collection en vedette" />
                  </div>
                )}
                <SectionFields section={s} onConfig={(patch) => updateConfig(s.id, patch)} categories={categories} />
              </div>
            )}
          </div>
        )}
      />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <select className="field w-auto" value="" onChange={(e) => add(e.target.value)} aria-label="Ajouter une section">
            <option value="">+ Ajouter une section…</option>
            {Object.entries(TYPES).map(([k, t]) => (
              <option key={k} value={k}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn-admin min-w-32" onClick={save} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
