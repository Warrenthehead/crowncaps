'use client';

import { useEffect, useMemo, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import useLockBody from '@/components/shop/useLockBody';
import { IconClose } from '@/components/icons';
import { SORT_OPTIONS, STATUS_LABELS, sortProducts } from '@/lib/products';

const EMPTY = { size: [], color: [], type: [], status: [] };

// Lit/écrit les filtres dans l'adresse (?tri=price_asc&taille=M...) pour pouvoir partager le lien.
function readUrl() {
  const p = new URLSearchParams(window.location.search);
  const list = (k) => (p.get(k) ? p.get(k).split(',') : []);
  return {
    sort: p.get('tri'),
    filters: { size: list('taille'), color: list('couleur'), type: list('type'), status: list('dispo') },
  };
}

function writeUrl(sort, defaultSort, filters) {
  const p = new URLSearchParams();
  if (sort && sort !== defaultSort) p.set('tri', sort);
  if (filters.size.length) p.set('taille', filters.size.join(','));
  if (filters.color.length) p.set('couleur', filters.color.join(','));
  if (filters.type.length) p.set('type', filters.type.join(','));
  if (filters.status.length) p.set('dispo', filters.status.join(','));
  const qs = p.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
}

// Tri + filtres simples (taille, couleur, type, disponibilité). Instantané, sans rechargement.
export default function CollectionBrowser({ products, defaultSort, options }) {
  const [sort, setSort] = useState(defaultSort);
  const [filters, setFilters] = useState(EMPTY);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useLockBody(panelOpen, () => setPanelOpen(false));

  useEffect(() => {
    const fromUrl = readUrl();
    if (fromUrl.sort) setSort(fromUrl.sort);
    setFilters(fromUrl.filters);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeUrl(sort, defaultSort, filters);
  }, [sort, filters, defaultSort, hydrated]);

  // Valeurs disponibles dans cette collection uniquement
  const available = useMemo(() => {
    const sizes = new Map();
    const colors = new Set();
    const types = new Set();
    const statuses = new Set();
    products.forEach((p) => {
      p.sizes.forEach((s) => sizes.set(s.label, s.position));
      p.colors.forEach((c) => colors.add(c.name));
      if (p.garment_type) types.add(p.garment_type.name);
      statuses.add(p.status);
    });
    return {
      size: [...sizes.keys()],
      color: options.colors.filter((c) => colors.has(c.name)),
      type: options.garmentTypes.filter((t) => types.has(t.name)).map((t) => t.name),
      status: Object.keys(STATUS_LABELS).filter((s) => statuses.has(s)),
    };
  }, [products, options]);

  const visible = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        (!filters.size.length || p.sizes.some((s) => filters.size.includes(s.label))) &&
        (!filters.color.length || p.colors.some((c) => filters.color.includes(c.name))) &&
        (!filters.type.length || (p.garment_type && filters.type.includes(p.garment_type.name))) &&
        (!filters.status.length || filters.status.includes(p.status))
    );
    return sortProducts(filtered, sort);
  }, [products, filters, sort]);

  const toggle = (group, value) =>
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(value) ? f[group].filter((v) => v !== value) : [...f[group], value],
    }));

  const activeCount = Object.values(filters).reduce((n, l) => n + l.length, 0);

  const Chip = ({ group, value, children }) => {
    const on = filters[group].includes(value);
    return (
      <button
        type="button"
        onClick={() => toggle(group, value)}
        aria-pressed={on}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm transition ${
          on ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:border-ink'
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3 border-y border-line py-3 text-[0.9rem]">
        <button type="button" onClick={() => setPanelOpen(true)} className="min-h-10 underline-offset-4 hover:underline">
          Filtrer{activeCount ? ` (${activeCount})` : ''}
        </button>
        <span className="hidden text-muted sm:inline">{visible.length} produit(s)</span>
        <label className="flex items-center gap-2">
          <span className="text-muted">Trier :</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-10 bg-transparent pr-1 outline-none">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length ? (
        <div className="grid grid-cols-2 gap-x-1.5 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted">Aucun produit ne correspond à ces filtres.</p>
          {activeCount > 0 && (
            <button type="button" onClick={() => setFilters(EMPTY)} className="link-underline mt-4">
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {/* Volet des filtres */}
      <div className={`fixed inset-0 z-50 ${panelOpen ? '' : 'pointer-events-none'}`} aria-hidden={!panelOpen}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${panelOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setPanelOpen(false)} />
        <div
          className={`absolute inset-y-0 right-0 flex w-[90%] max-w-md flex-col bg-white transition-transform duration-300 ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-label="Filtres"
          {...(!panelOpen ? { inert: '' } : {})}
        >
          <div className="flex h-16 items-center justify-between border-b border-line px-5">
            <p className="text-lg">Filtrer</p>
            <button type="button" onClick={() => setPanelOpen(false)} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Fermer les filtres">
              <IconClose size={22} strokeWidth={1.3} />
            </button>
          </div>
          <div className="flex-1 space-y-8 overflow-y-auto p-5">
            {available.status.length > 1 && (
              <fieldset>
                <legend className="caps mb-3">Disponibilité</legend>
                <div className="flex flex-wrap gap-2">
                  {available.status.map((s) => (
                    <Chip key={s} group="status" value={s}>
                      {STATUS_LABELS[s]}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
            {available.size.length > 0 && (
              <fieldset>
                <legend className="caps mb-3">Taille</legend>
                <div className="flex flex-wrap gap-2">
                  {available.size.map((s) => (
                    <Chip key={s} group="size" value={s}>
                      {s}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
            {available.color.length > 0 && (
              <fieldset>
                <legend className="caps mb-3">Couleur</legend>
                <div className="flex flex-wrap gap-2">
                  {available.color.map((c) => (
                    <Chip key={c.id} group="color" value={c.name}>
                      <span className="h-4 w-4 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} />
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
            {available.type.length > 0 && (
              <fieldset>
                <legend className="caps mb-3">Type de vêtement</legend>
                <div className="flex flex-wrap gap-2">
                  {available.type.map((t) => (
                    <Chip key={t} group="type" value={t}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}
          </div>
          <div className="flex gap-3 border-t border-line p-5">
            <button type="button" onClick={() => setFilters(EMPTY)} className="btn-outline">
              Effacer
            </button>
            <button type="button" onClick={() => setPanelOpen(false)} className="btn-primary">
              Voir {visible.length}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
