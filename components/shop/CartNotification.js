'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useShop } from './ShopProvider';
import SmartImage from '@/components/ui/SmartImage';
import { IconCheck, IconClose } from '@/components/icons';

// Notification qui glisse sous l'en-tête après "Ajouter au panier".
export default function CartNotification() {
  const { lastAdded, dismissNotification, count, items, checkout, updateQuantity } = useShop();
  const pathname = usePathname();

  // Disparaît après 8 secondes ou au changement de page
  useEffect(() => {
    if (!lastAdded) return;
    const id = setTimeout(dismissNotification, 8000);
    return () => clearTimeout(id);
  }, [lastAdded, dismissNotification]);

  useEffect(() => {
    dismissNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!lastAdded) return null;

  // Annule l'ajout : retire une unité de l'article qui vient d'être ajouté
  const undo = () => {
    const current = items.find((i) => i.key === lastAdded.key);
    if (current) updateQuantity(current.key, current.quantity - 1);
    dismissNotification();
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 md:top-20" role="status" aria-live="polite">
      <div className="container-shop flex justify-end">
        <div
          key={lastAdded.at}
          className="animate-slide-down pointer-events-auto w-full border border-line bg-white px-6 pt-5 pb-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:max-w-sm"
        >
          <div className="flex items-start justify-between">
            <p className="flex items-center gap-2 text-[0.9rem]">
              <IconCheck size={18} /> Article ajouté au panier
            </p>
            <button type="button" onClick={dismissNotification} className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center" aria-label="Fermer">
              <IconClose size={22} strokeWidth={1.3} />
            </button>
          </div>
          <div className="mt-4 flex gap-4">
            <div className="w-[4.5rem] shrink-0">
              <SmartImage src={lastAdded.image} alt={lastAdded.title} ratio="aspect-[4/5]" sizes="72px" />
            </div>
            <div className="text-[0.95rem] leading-snug">
              <p>{lastAdded.title}</p>
              {(lastAdded.size || lastAdded.color) && (
                <p className="mt-1 text-[0.8rem] text-muted">{[lastAdded.size, lastAdded.color].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link href="/panier" className="py-1 text-[0.95rem] hover:underline">
              Voir le panier ({count})
            </Link>
            <button type="button" onClick={() => checkout(items)} className="btn-primary">
              Procéder au paiement
            </button>
            <button type="button" onClick={undo} className="py-1 text-[0.9rem] text-muted underline hover:text-ink">
              Annuler l&apos;ajout
            </button>
            <button type="button" onClick={dismissNotification} className="link-underline py-1 text-[0.95rem]">
              Continuer les achats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
