'use client';

import { useState } from 'react';
import { useShop } from '@/components/shop/ShopProvider';
import useProductOptions from '@/templates/useProductOptions';

// Mini-barre de la carte produit : "Ajouter au panier" / "Commander" (WhatsApp).
// Si le produit a plusieurs tailles ou couleurs, elles s'affichent au premier clic
// et l'action choisie part dès que tout est sélectionné.
export default function QuickActions({ product }) {
  const { addItem, checkout } = useShop();
  const opts = useProductOptions(product);
  const [pending, setPending] = useState(null); // 'cart' | 'buy' | null
  const [done, setDone] = useState(false);

  const run = (action, sizeId = opts.sizeId, colorId = opts.colorId) => {
    const item = opts.toItem(sizeId, colorId);
    if (action === 'cart') {
      addItem(item, 1);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } else {
      checkout([{ ...item, quantity: 1 }]);
    }
    setPending(null);
  };

  const missing = (sizeId, colorId) =>
    (product.sizes.length && !sizeId) || (product.colors.length && !colorId);

  const start = (action) => {
    if (missing(opts.sizeId, opts.colorId)) {
      setPending(action);
      return;
    }
    run(action);
  };

  const pick = (kind, id) => {
    const sizeId = kind === 'size' ? id : opts.sizeId;
    const colorId = kind === 'color' ? id : opts.colorId;
    (kind === 'size' ? opts.setSize : opts.setColor)(id);
    if (pending && !missing(sizeId, colorId)) run(pending, sizeId, colorId);
  };

  const chip = (on) =>
    `inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[0.8rem] transition ${
      on ? 'border-navy bg-navy text-white' : 'border-gold text-navy hover:bg-gold/10'
    }`;

  return (
    <div>
      {pending && (
        <div className="mb-2 mt-2 space-y-2" role="group" aria-label="Choisir les options">
          {product.sizes.length > 1 || (product.sizes.length === 1 && !opts.sizeId) ? (
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => (
                <button key={s.id} type="button" onClick={() => pick('size', s.id)} aria-pressed={opts.sizeId === s.id} className={chip(opts.sizeId === s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}
          {product.colors.length > 1 || (product.colors.length === 1 && !opts.colorId) ? (
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((c) => (
                <button key={c.id} type="button" onClick={() => pick('color', c.id)} aria-pressed={opts.colorId === c.id} className={chip(opts.colorId === c.id)}>
                  <span className="h-3 w-3 rounded-full ring-1 ring-black/15" style={{ background: c.hex }} aria-hidden="true" />
                  {c.name}
                </button>
              ))}
            </div>
          ) : null}
          <p className="text-[0.75rem] text-muted">
            {[product.sizes.length && !opts.sizeId && 'une taille', product.colors.length && !opts.colorId && 'une couleur'].filter(Boolean).length
              ? `Choisissez ${[product.sizes.length && !opts.sizeId && 'une taille', product.colors.length && !opts.colorId && 'une couleur'].filter(Boolean).join(' et ')}.`
              : ''}
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 border border-ink text-[0.7rem] tracking-[0.03em] md:text-[0.75rem]">
        <button type="button" onClick={() => start('cart')} className="h-8 whitespace-nowrap bg-white px-1 text-ink transition hover:bg-ink hover:text-white active:opacity-80">
          {done ? 'Ajouté ✓' : 'Au panier'}
        </button>
        <button type="button" onClick={() => start('buy')} className="h-8 whitespace-nowrap bg-ink px-1 text-white transition hover:bg-black/80 active:opacity-80">
          Acheter maintenant
        </button>
      </div>
    </div>
  );
}
