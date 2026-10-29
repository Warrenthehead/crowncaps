'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm from './ProductForm';
import { useToast } from './Toast';
import { saveProducts } from '@/app/admin/actions/products';
import { IconPlus, IconTrash } from '@/components/icons';

const MAX = 5;

// Création de 1 à 5 produits sur une même page, enregistrés d'un seul coup.
export default function MultiProductForm({ catalog }) {
  const router = useRouter();
  const toast = useToast();
  const [saving, startSaving] = useTransition();
  const nextKey = useRef(1);
  const [blocks, setBlocks] = useState([{ key: 0, open: true }]);
  const data = useRef({}); // key -> dernières valeurs du formulaire

  const add = () => {
    if (blocks.length >= MAX) return;
    setBlocks((b) => [...b.map((x) => ({ ...x, open: false })), { key: nextKey.current++, open: true }]);
  };
  const remove = (key) => {
    delete data.current[key];
    setBlocks((b) => b.filter((x) => x.key !== key));
  };
  const toggle = (key) => setBlocks((b) => b.map((x) => (x.key === key ? { ...x, open: !x.open } : x)));

  const submit = () => {
    const items = blocks.map((b) => data.current[b.key]);
    for (const [i, p] of items.entries()) {
      if (!p?.title?.trim()) {
        setBlocks((b) => b.map((x, j) => (j === i ? { ...x, open: true } : x)));
        return toast(`Produit ${i + 1} : le titre est obligatoire.`, 'error');
      }
      if (!p.price) {
        setBlocks((b) => b.map((x, j) => (j === i ? { ...x, open: true } : x)));
        return toast(`Produit ${i + 1} : le prix est obligatoire.`, 'error');
      }
    }
    const missing = items.map((p, i) => (p.images.length === 0 ? i + 1 : null)).filter(Boolean);
    if (missing.length && !confirm(`Sans image : produit ${missing.join(', ')}. Enregistrer quand même ?`)) return;

    startSaving(async () => {
      const res = await saveProducts(items);
      if (!res.ok) return toast(res.error, 'error');
      toast(res.data.length > 1 ? `${res.data.length} produits enregistrés` : 'Produit enregistré');
      router.replace('/admin/produits');
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {blocks.map((b, i) => (
        <div key={b.key} className="rounded-xl border border-line bg-white/60">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <button type="button" className="flex-1 text-left font-semibold" onClick={() => toggle(b.key)} aria-expanded={b.open}>
              Produit {i + 1}
              {!b.open && data.current[b.key]?.title && <span className="ml-2 font-normal text-muted">· {data.current[b.key].title}</span>}
            </button>
            {blocks.length > 1 && (
              <button type="button" className="btn-admin-ghost min-h-9 px-2.5" onClick={() => confirm(`Retirer le produit ${i + 1} ?`) && remove(b.key)} aria-label={`Retirer le produit ${i + 1}`}>
                <IconTrash size={18} />
              </button>
            )}
          </div>
          <div hidden={!b.open} className="border-t border-line p-3">
            <ProductForm catalog={catalog} embedded onData={(v) => (data.current[b.key] = v)} />
          </div>
        </div>
      ))}

      {blocks.length < MAX ? (
        <button type="button" className="btn-admin-ghost w-full gap-2" onClick={add}>
          <IconPlus size={18} /> Ajouter un produit ({blocks.length}/{MAX})
        </button>
      ) : (
        <p className="text-center text-sm text-muted">Maximum de {MAX} produits atteint.</p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
          <button type="button" className="btn-admin-ghost" onClick={() => router.push('/admin/produits')}>
            Annuler
          </button>
          <button type="button" className="btn-admin min-w-32" onClick={submit} disabled={saving}>
            {saving ? 'Enregistrement…' : blocks.length > 1 ? `Enregistrer les ${blocks.length} produits` : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
