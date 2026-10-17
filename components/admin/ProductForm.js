'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import { useToast } from './Toast';
import { deleteProducts, markProductSold, saveProduct } from '@/app/admin/actions/products';
import { saveColor, saveGarmentType, saveSize } from '@/app/admin/actions/catalog';
import { STATUS_LABELS } from '@/lib/products';
import { TEMPLATES, templateLabel } from '@/templates/registry';
import { slugify } from '@/lib/slug';

// "2026-10-20T18:00:00Z" -> "2026-10-20T19:00" (heure locale pour le champ date)
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Section({ title, children, aside }) {
  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Formulaire produit (création et modification).
export default function ProductForm({ product, catalog }) {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  const descRef = useRef(null);

  const [colors, setColors] = useState(catalog.colors);
  const [sizeGroups, setSizeGroups] = useState(catalog.sizeGroups);
  const [garmentTypes, setGarmentTypes] = useState(catalog.garmentTypes);

  const [form, setForm] = useState({
    id: product?.id,
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price ?? '',
    compare_at_price: product?.compare_at_price ?? '',
    category_id: product?.category_id || '',
    garment_type_id: product?.garment_type_id || '',
    status: product?.status || 'disponible',
    template: product?.template || '',
    release_at: toLocalInput(product?.release_at),
    release_text: product?.release_text || '',
    code: product?.code || '',
    brand: product?.brand || 'CrownCaps',
    featured: product?.featured || false,
    published: product ? product.published : true,
    color_ids: product?.colors.map((c) => c.id) || [],
    size_ids: product?.sizes.map((s) => s.id) || [],
  });
  const [images, setImages] = useState(product?.images.map(({ url, thumb_url, alt }) => ({ url, thumb_url, alt })) || []);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [newColor, setNewColor] = useState(null);
  const [newSize, setNewSize] = useState(null);
  const [newType, setNewType] = useState(null);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const toggle = (key, id) => set(key, form[key].includes(id) ? form[key].filter((x) => x !== id) : [...form[key], id]);

  const category = catalog.categories.find((c) => c.id === form.category_id);
  const effectiveTemplate = form.template || category?.default_template || 'standard';

  // Groupes de tailles affichés : celui de la catégorie + ceux déjà cochés
  const visibleGroups = useMemo(() => {
    if (showAllSizes || !category?.size_group_id) return sizeGroups;
    return sizeGroups.filter((g) => g.id === category.size_group_id || g.sizes.some((s) => form.size_ids.includes(s.id)));
  }, [sizeGroups, category, showAllSizes, form.size_ids]);

  // Boutons Gras / Liste de la description
  const wrapBold = () => {
    const el = descRef.current;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const selected = value.slice(a, b) || 'texte en gras';
    set('description', `${value.slice(0, a)}**${selected}**${value.slice(b)}`);
  };
  const addList = () => {
    const el = descRef.current;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const lines = (value.slice(a, b) || 'élément').split('\n').map((l) => (l.startsWith('- ') ? l : `- ${l}`));
    const before = value.slice(0, a);
    set('description', `${before}${before && !before.endsWith('\n') ? '\n' : ''}${lines.join('\n')}${value.slice(b)}`);
  };

  const addColor = async () => {
    const res = await saveColor(newColor);
    if (!res.ok) return toast(res.error, 'error');
    setColors((c) => [...c, res.data]);
    set('color_ids', [...form.color_ids, res.data.id]);
    setNewColor(null);
    toast(`Couleur « ${res.data.name} » ajoutée`);
  };
  const addSize = async () => {
    const res = await saveSize(newSize);
    if (!res.ok) return toast(res.error, 'error');
    setSizeGroups((groups) => groups.map((g) => (g.id === res.data.group_id ? { ...g, sizes: [...g.sizes, res.data] } : g)));
    set('size_ids', [...form.size_ids, res.data.id]);
    setNewSize(null);
  };
  const addType = async () => {
    const res = await saveGarmentType(newType);
    if (!res.ok) return toast(res.error, 'error');
    setGarmentTypes((t) => [...t, res.data]);
    set('garment_type_id', res.data.id);
    setNewType(null);
  };

  const submit = (e) => {
    e.preventDefault();
    if (images.length === 0 && !confirm('Ce produit n\'a pas d\'image. Enregistrer quand même ?')) return;
    startSaving(async () => {
      const res = await saveProduct({
        ...form,
        release_at: form.release_at ? new Date(form.release_at).toISOString() : null,
        images,
      });
      if (!res.ok) return toast(res.error, 'error');
      toast('Produit enregistré');
      if (!form.id) router.replace(`/admin/produits/${res.data.id}`);
      else {
        set('slug', res.data.slug);
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!confirm('Supprimer définitivement ce produit ?')) return;
    startSaving(async () => {
      const res = await deleteProducts([form.id]);
      if (!res.ok) return toast(res.error, 'error');
      toast('Produit supprimé');
      router.replace('/admin/produits');
    });
  };

  const sold = (setStatus) =>
    startSaving(async () => {
      const res = await markProductSold(form.id, setStatus);
      if (!res.ok) return toast(res.error, 'error');
      if (setStatus) set('status', 'vendu');
      toast(`Vente enregistrée (total : ${res.data.sales_count})`);
      router.refresh();
    });

  return (
    <form onSubmit={submit} className="grid gap-4 pb-24 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <Section title="Informations">
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
                if (!slugTouched) set('slug', slugify(e.target.value));
              }}
              placeholder="NEW YORK YANKEES – Fitted Two-Tone Grey"
            />
            <p className="mt-1 text-xs text-muted">
              Adresse : /produits/
              <input
                className="inline w-56 border-b border-dashed border-line bg-transparent text-xs outline-none focus:border-ink"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                aria-label="Adresse du produit (slug)"
              />
            </p>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label mb-0" htmlFor="description">
                Description
              </label>
              <div className="flex gap-1">
                <button type="button" onClick={wrapBold} className="btn-admin-ghost min-h-8 px-2.5 font-bold" title="Gras">
                  G
                </button>
                <button type="button" onClick={addList} className="btn-admin-ghost min-h-8 px-2.5" title="Liste à puces">
                  • Liste
                </button>
              </div>
            </div>
            <textarea
              id="description"
              ref={descRef}
              rows={6}
              className="field"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={'**Gras** entre deux étoiles doubles.\n- Une ligne qui commence par un tiret = liste'}
            />
          </div>
        </Section>

        <Section title="Images">
          <ImageUploader images={images} onChange={setImages} />
        </Section>

        <Section title="Prix">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="price">
                Prix (F CFA)
              </label>
              <input id="price" inputMode="numeric" required className="field" value={form.price} onChange={(e) => set('price', e.target.value.replace(/\D/g, ''))} placeholder="12000" />
            </div>
            <div>
              <label className="label" htmlFor="compare">
                Ancien prix barré (optionnel)
              </label>
              <input id="compare" inputMode="numeric" className="field" value={form.compare_at_price} onChange={(e) => set('compare_at_price', e.target.value.replace(/\D/g, ''))} placeholder="15000" />
            </div>
          </div>
        </Section>

        <Section
          title="Tailles"
          aside={
            category?.size_group_id && (
              <button type="button" className="text-sm text-muted hover:underline" onClick={() => setShowAllSizes((v) => !v)}>
                {showAllSizes ? 'Masquer les autres groupes' : 'Voir tous les groupes'}
              </button>
            )
          }
        >
          {visibleGroups.map((g) => (
            <div key={g.id}>
              <p className="mb-2 text-sm text-muted">{g.name}</p>
              <div className="flex flex-wrap gap-2">
                {g.sizes.map((s) => (
                  <Pill key={s.id} on={form.size_ids.includes(s.id)} onClick={() => toggle('size_ids', s.id)}>
                    {s.label}
                  </Pill>
                ))}
                {newSize?.group_id === g.id ? (
                  <span className="flex items-center gap-1">
                    <input autoFocus className="field h-10 w-36 py-1" value={newSize.label} onChange={(e) => setNewSize({ ...newSize, label: e.target.value })} placeholder="ex. 7 3/8 (58 cm)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} />
                    <button type="button" className="btn-admin min-h-10" onClick={addSize}>
                      OK
                    </button>
                  </span>
                ) : (
                  <button type="button" className="min-h-10 rounded-full border border-dashed border-line px-3 text-sm text-muted hover:border-ink hover:text-ink" onClick={() => setNewSize({ group_id: g.id, label: '' })}>
                    + Ajouter
                  </button>
                )}
              </div>
            </div>
          ))}
        </Section>

        <Section title="Couleurs">
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <Pill key={c.id} on={form.color_ids.includes(c.id)} onClick={() => toggle('color_ids', c.id)}>
                <span className="h-4 w-4 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} />
                {c.name}
              </Pill>
            ))}
          </div>
          {newColor ? (
            <div className="flex flex-wrap items-center gap-2">
              <input type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-10 w-12 cursor-pointer rounded border border-line" aria-label="Couleur" />
              <input autoFocus className="field w-44" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} placeholder="Nom (ex. Bordeaux)" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} />
              <button type="button" className="btn-admin" onClick={addColor}>
                Ajouter
              </button>
              <button type="button" className="text-sm text-muted hover:underline" onClick={() => setNewColor(null)}>
                Annuler
              </button>
            </div>
          ) : (
            <button type="button" className="btn-admin-ghost" onClick={() => setNewColor({ name: '', hex: '#000000' })}>
              + Ajouter une couleur
            </button>
          )}
        </Section>
      </div>

      <div className="space-y-4">
        <Section title="Statut">
          <select className="field" value={form.status} onChange={(e) => set('status', e.target.value)} aria-label="Statut">
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-ink" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
            Visible sur la boutique
          </label>
          <label className="flex min-h-10 items-center gap-2 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-ink" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
            En vedette (section « Collection en vedette »)
          </label>
          {form.id && (
            <div className="space-y-2 border-t border-line pt-3">
              <p className="text-sm text-muted">Ventes enregistrées : {product.sales_count}</p>
              <button type="button" className="btn-admin-ghost w-full" onClick={() => sold(false)} disabled={saving}>
                Marquer comme vendu (+1)
              </button>
              <button type="button" className="w-full text-sm text-muted hover:underline" onClick={() => sold(true)} disabled={saving}>
                +1 et passer en « Vendu »
              </button>
            </div>
          )}
        </Section>

        <Section title="Modèle de page">
          <select className="field" value={form.template} onChange={(e) => set('template', e.target.value)} aria-label="Modèle de page">
            <option value="">Celui de la catégorie ({templateLabel(category?.default_template || 'standard')})</option>
            {TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">{TEMPLATES.find((t) => t.key === effectiveTemplate)?.description}</p>
          {(effectiveTemplate === 'a-venir' || form.status === 'a_venir') && (
            <div>
              <label className="label" htmlFor="release">
                Date de sortie (optionnel)
              </label>
              <input id="release" type="datetime-local" className="field" value={form.release_at} onChange={(e) => set('release_at', e.target.value)} />
              <p className="mt-1 text-xs text-muted">Compte à rebours sur la page. À l&apos;heure choisie, le produit passe en Standard. Laissez vide si vous n&apos;avez pas de date.</p>
              <label className="label mt-3" htmlFor="release-text">
                Message affiché (optionnel)
              </label>
              <input id="release-text" className="field" maxLength={120} value={form.release_text} onChange={(e) => set('release_text', e.target.value)} placeholder="Bientôt disponible" />
              <p className="mt-1 text-xs text-muted">Ex. « Bientôt disponible », « Drop fin du mois », « Arrivage en cours ». Vide = « Bientôt disponible ».</p>
            </div>
          )}
        </Section>

        <Section title="Organisation">
          <div>
            <label className="label" htmlFor="category">
              Catégorie
            </label>
            <select id="category" className="field" value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">Aucune</option>
              {catalog.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="type">
              Type de vêtement
            </label>
            {newType ? (
              <div className="flex gap-2">
                <input autoFocus className="field" value={newType.name} onChange={(e) => setNewType({ name: e.target.value })} placeholder="ex. Col V" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addType())} />
                <button type="button" className="btn-admin" onClick={addType}>
                  OK
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select id="type" className="field" value={form.garment_type_id} onChange={(e) => set('garment_type_id', e.target.value)}>
                  <option value="">Aucun</option>
                  {garmentTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button type="button" className="btn-admin-ghost shrink-0 px-3" onClick={() => setNewType({ name: '' })} title="Ajouter un type">
                  +
                </button>
              </div>
            )}
          </div>
          <div>
            <label className="label" htmlFor="code">
              Code produit
            </label>
            <input id="code" className="field uppercase" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="Automatique (CC-0042)" />
          </div>
          <div>
            <label className="label" htmlFor="brand">
              Marque
            </label>
            <input id="brand" className="field" value={form.brand} onChange={(e) => set('brand', e.target.value)} />
          </div>
        </Section>

        {form.id && (
          <button type="button" className="btn-admin-danger w-full" onClick={remove} disabled={saving}>
            Supprimer le produit
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
          <button type="button" className="btn-admin-ghost" onClick={() => router.push('/admin/produits')}>
            Annuler
          </button>
          <button type="submit" className="btn-admin min-w-32" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
}

function Pill({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm transition ${on ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'}`}
    >
      {children}
    </button>
  );
}
