'use client';

import Link from 'next/link';
import { useShop } from '@/components/shop/ShopProvider';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { IconMinus, IconPlus, IconTrash } from '@/components/icons';

// Page panier : lignes produits, quantité, total, envoi de la commande sur WhatsApp.
export default function CartView() {
  const { items, ready, total, updateQuantity, removeItem, checkout } = useShop();

  if (!ready) {
    return (
      <div aria-busy="true">
        <div className="skeleton h-10 w-56 rounded" />
        <div className="skeleton mt-10 h-36 w-full rounded" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="py-12 text-center">
        <h1 className="page-title">Votre panier est vide</h1>
        <div className="mx-auto mt-8 max-w-xs">
          <Link href="/collections" className="btn-primary">
            Continuer les achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="page-title">Votre panier</h1>
        <Link href="/collections" className="link-underline shrink-0 text-[0.95rem]">
          Continuer les achats
        </Link>
      </div>

      <div className="mt-10 flex justify-between border-b border-line pb-4">
        <span className="caps">Produit</span>
        <span className="caps">Total</span>
      </div>

      <ul>
        {items.map((item) => (
          <li key={item.key} className="animate-fade-in grid grid-cols-[6.5rem_1fr_auto] gap-x-4 border-b border-line py-8 md:grid-cols-[8rem_1fr_auto] md:gap-x-8">
            <Link href={`/produits/${item.slug}`} className="block">
              <SmartImage src={item.image} alt={item.title} ratio="aspect-[4/5]" sizes="130px" />
            </Link>
            <div className="min-w-0">
              <Link href={`/produits/${item.slug}`} className="block text-[0.95rem] leading-snug tracking-[0.04em] uppercase hover:underline">
                {item.title}
              </Link>
              <p className="mt-1.5 text-[0.85rem] text-muted">{formatPrice(item.price)}</p>
              {(item.size || item.color) && (
                <p className="mt-1 text-[0.8rem] text-muted">
                  {item.size && <>Taille : {item.size}</>}
                  {item.size && item.color && ' · '}
                  {item.color && <>Couleur : {item.color}</>}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 items-center border border-ink">
                  <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="flex h-full w-11 items-center justify-center" aria-label="Diminuer la quantité">
                    <IconMinus size={16} />
                  </button>
                  <span className="w-8 text-center tabular-nums" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} className="flex h-full w-11 items-center justify-center" aria-label="Augmenter la quantité">
                    <IconPlus size={16} />
                  </button>
                </div>
                <button type="button" onClick={() => removeItem(item.key)} className="flex h-11 w-11 items-center justify-center text-ink/75 hover:text-ink" aria-label={`Retirer ${item.title} du panier`}>
                  <IconTrash size={20} strokeWidth={1.4} />
                </button>
              </div>
            </div>
            <p className="text-[0.95rem] tabular-nums">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-3 md:ml-auto md:max-w-sm md:items-end">
        <p className="flex items-baseline gap-4 text-[1.05rem]">
          Total estimé <span className="tabular-nums">{formatPrice(total)}</span>
        </p>
        <p className="text-center text-[0.8rem] text-muted md:text-right">Frais de livraison confirmés sur WhatsApp.</p>
        <button type="button" onClick={() => checkout(items)} className="btn-primary mt-3">
          Procéder au paiement
        </button>
      </div>
    </div>
  );
}
