'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import SortableList from './SortableList';
import { useToast } from './Toast';
import { bulkUpdateProducts, deleteProducts, duplicateProduct, markProductSold, reorderProducts } from '@/app/admin/actions/products';
import { STATUS_LABELS, mainImage } from '@/lib/products';
import { TEMPLATES } from '@/templates/registry';
import { formatPrice } from '@/lib/format';

const SORTS = [
  { value: 'manual', label: 'Manuel (glisser-déposer)' },
  { value: 'recent', label: 'Plus récents' },
  { value: 'az', label: 'A–Z' },
  { value: 'za', label: 'Z–A' },
  { value: 'best', label: 'Plus vendus' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'random', label: 'Aléatoire' },
];

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STATUS_STYLE = {
  disponible: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  vendu: 'bg-navy text-white ring-navy',
  a_venir: 'bg-amber-50 text-amber-800 ring-amber-200',
};

function Row({ p, handle, canDrag, checked, onCheck, onSold, onDuplicate, onDelete }) {
  const img = mainImage(p);
  return (
    <div className="flex items-center gap-2 border-b border-line bg-white px-2 py-2 last:border-b-0 md:gap-3 md:px-3">
      <input
        type="checkbox"
        className="h-5 w-5 shrink-0 accent-ink"
        checked={checked}
        onChange={(e) => onCheck(e.target.checked)}
        aria-label={`Sélectionner ${p.title}`}
      />
      {canDrag && handle}
      <Link href={`/admin/produits/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="h-14 w-12 shrink-0 overflow-hidden rounded-md bg-surface">
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img.thumb_url || img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {p.title}
            {!p.published && <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[0.65rem] font-normal text-muted">Masqué</span>}
            {p.featured && <span className="ml-1 rounded bg-gold/20 px-1.5 py-0.5 text-[0.65rem] font-normal text-navy">Vedette</span>}
          </p>
          <p className="truncate text-xs text-muted">
            {p.code} · {p.category?.name || 'Sans catégorie'} · {p.sales_count} vente(s)
          </p>
        </div>
      </Link>
      <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs ring-1 sm:inline ${STATUS_STYLE[p.status]}`}>{STATUS_LABELS[p.status]}</span>
      <span className="w-20 shrink-0 text-right text-sm tabular-nums">{formatPrice(p.price)}</span>
      <details className="relative shrink-0">
        <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-surface [&::-webkit-details-marker]:hidden" aria-label="Actions">
          ⋯
        </summary>
        <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-line bg-white py-1 text-sm shadow-lg">
          <Link href={`/admin/produits/${p.id}`} className="block px-3 py-2.5 hover:bg-surface">
            Modifier
          </Link>
          <button type="button" onClick={onSold} className="block w-full px-3 py-2.5 text-left hover:bg-surface">
            Marquer comme vendu
          </button>
          <button type="button" onClick={onDuplicate} className="block w-full px-3 py-2.5 text-left hover:bg-surface">
            Dupliquer
          </button>
          <a href={`/produits/${p.slug}`} target="_blank" rel="noopener noreferrer" className="block px-3 py-2.5 hover:bg-surface">
            Voir sur le site
          </a>
          <button type="button" onClick={onDelete} className="block w-full px-3 py-2.5 text-left text-danger hover:bg-surface">
            Supprimer
          </button>
        </div>
      </details>
    </div>
  );
}

// Liste des produits de l'admin : recherche, filtres, tri, actions groupées.
export default function ProductsTable({ products: initial, categories }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [products, setProducts] = useState(initial);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('manual');
  const [seed, setSeed] = useState(0);
  const [selected, setSelected] = useState([]);
  const [soldDialog, setSoldDialog] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(
      (p) =>
        (!q || p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)) &&
        (!category || (category === 'none' ? !p.category_id : p.category_id === category)) &&
        (!status || p.status === status)
    );
    switch (sort) {
      case 'recent':
        list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'az':
        list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'fr'));
        break;
      case 'za':
        list = [...list].sort((a, b) => b.title.localeCompare(a.title, 'fr'));
        break;
      case 'best':
        list = [...list].sort((a, b) => b.sales_count - a.sales_count);
        break;
      case 'price_asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'random':
        list = shuffle(list);
        break;
      default:
        list = [...list].sort((a, b) => a.position - b.position);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, category, status, sort, seed]);

  const canDrag = sort === 'manual' && !query && !category && !status;
  const allChecked = filtered.length > 0 && filtered.every((p) => selected.includes(p.id));

  const run = (fn, success) =>
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return toast(res.error, 'error');
      if (success) toast(success);
      router.refresh();
      return res;
    });

  // Après router.refresh(), la liste serveur change : on la resynchronise
  useEffect(() => setProducts(initial), [initial]);

  const onReorder = (next) => {
    const positioned = next.map((p, i) => ({ ...p, position: i }));
    setProducts(positioned);
    run(() => reorderProducts(positioned.map((p) => p.id)), 'Ordre enregistré');
  };

  const bulk = (patch, label) => {
    if (!selected.length) return;
    setProducts((list) => list.map((p) => (selected.includes(p.id) ? { ...p, ...patch } : p)));
    run(() => bulkUpdateProducts(selected, patch), `${selected.length} produit(s) : ${label}`);
  };

  const remove = (ids) => {
    if (!confirm(`Supprimer définitivement ${ids.length} produit(s) ? Cette action est irréversible.`)) return;
    setProducts((list) => list.filter((p) => !ids.includes(p.id)));
    setSelected([]);
    run(() => deleteProducts(ids), 'Produit(s) supprimé(s)');
  };

  const duplicate = (id) =>
    startTransition(async () => {
      const res = await duplicateProduct(id);
      if (!res.ok) return toast(res.error, 'error');
      toast('Produit dupliqué (masqué tant que vous ne le publiez pas)');
      router.push(`/admin/produits/${res.data.id}`);
    });

  const confirmSold = (setStatus) => {
    const p = soldDialog;
    setSoldDialog(null);
    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, sales_count: x.sales_count + 1, ...(setStatus ? { status: 'vendu' } : {}) } : x)));
    run(() => markProductSold(p.id, setStatus), 'Vente enregistrée');
  };

  const rowFor = (p, handle) => (
    <Row
      p={p}
      handle={handle}
      canDrag={canDrag}
      checked={selected.includes(p.id)}
      onCheck={(on) => setSelected((s) => (on ? [...s, p.id] : s.filter((x) => x !== p.id)))}
      onSold={() => setSoldDialog(p)}
      onDuplicate={() => duplicate(p.id)}
      onDelete={() => remove([p.id])}
    />
  );

  return (
    <div className={pending ? 'opacity-90' : ''}>
      <div className="card mb-3 grid gap-2 p-3 md:grid-cols-[1fr_auto_auto_auto] md:p-3">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher (nom ou code)" className="field" aria-label="Rechercher" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field" aria-label="Filtrer par catégorie">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">Sans catégorie</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="field" aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            if (e.target.value === 'random') setSeed((s) => s + 1);
          }}
          className="field"
          aria-label="Trier"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Tri : {s.label}
            </option>
          ))}
        </select>
      </div>

      {sort === 'manual' && !canDrag && <p className="mb-2 text-xs text-muted">Videz la recherche et les filtres pour réordonner à la main.</p>}

      {selected.length > 0 && (
        <div className="card sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-2 p-3 lg:top-2">
          <span className="mr-1 text-sm font-semibold">{selected.length} sélectionné(s)</span>
          <select className="field w-auto" defaultValue="" onChange={(e) => e.target.value && (bulk({ category_id: e.target.value === 'none' ? null : e.target.value }, 'catégorie changée'), (e.target.value = ''))} aria-label="Changer la catégorie">
            <option value="">Catégorie…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="none">Aucune</option>
          </select>
          <select className="field w-auto" defaultValue="" onChange={(e) => e.target.value && (bulk({ status: e.target.value }, 'statut changé'), (e.target.value = ''))} aria-label="Changer le statut">
            <option value="">Statut…</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select className="field w-auto" defaultValue="" onChange={(e) => e.target.value && (bulk({ template: e.target.value === 'default' ? null : e.target.value }, 'modèle changé'), (e.target.value = ''))} aria-label="Changer le modèle de page">
            <option value="">Modèle de page…</option>
            <option value="default">Celui de la catégorie</option>
            {TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="button" className="btn-admin-ghost" onClick={() => bulk({ published: true }, 'publiés')}>
            Publier
          </button>
          <button type="button" className="btn-admin-ghost" onClick={() => bulk({ published: false }, 'masqués')}>
            Masquer
          </button>
          <button type="button" className="btn-admin-danger" onClick={() => remove(selected)}>
            Supprimer
          </button>
          <button type="button" className="ml-auto text-sm text-muted hover:underline" onClick={() => setSelected([])}>
            Annuler
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="flex items-center gap-3 border-b border-line bg-surface/60 px-2 py-2 text-xs text-muted md:px-3">
          <input
            type="checkbox"
            className="h-5 w-5 accent-ink"
            checked={allChecked}
            onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p.id) : [])}
            aria-label="Tout sélectionner"
          />
          <span>{filtered.length} produit(s)</span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">Aucun produit.</p>
        ) : canDrag ? (
          <SortableList items={filtered} onChange={onReorder} renderItem={(p, handle) => rowFor(p, handle)} />
        ) : (
          filtered.map((p) => <div key={p.id}>{rowFor(p)}</div>)
        )}
      </div>

      {soldDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm space-y-3">
            <p className="font-semibold">Vente de « {soldDialog.title} »</p>
            <p className="text-sm text-muted">Le compteur de ventes passera à {soldDialog.sales_count + 1}. Il sert au tri « Plus vendus ».</p>
            <button type="button" className="btn-admin w-full" onClick={() => confirmSold(false)}>
              +1 vente (reste disponible)
            </button>
            <button type="button" className="btn-admin-ghost w-full" onClick={() => confirmSold(true)}>
              +1 vente et passer en « Vendu »
            </button>
            <button type="button" className="w-full py-2 text-sm text-muted hover:underline" onClick={() => setSoldDialog(null)}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
