'use client';

import { useState } from 'react';
import { useShop } from './ShopProvider';
import useLockBody from './useLockBody';
import { IconClose, IconWhatsApp } from '@/components/icons';

// Fenêtre affichée quand la commande est trop longue pour un lien WhatsApp.
export default function WhatsAppFallbackDialog() {
  const { fallback, closeFallback } = useShop();
  const [copiedAgain, setCopiedAgain] = useState(false);
  useLockBody(Boolean(fallback), closeFallback);
  if (!fallback) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fallback.message);
      setCopiedAgain(true);
    } catch {
      setCopiedAgain(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="wa-fallback-title">
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={closeFallback} />
      <div className="animate-slide-down relative m-0 w-full max-w-md bg-white p-6 sm:m-4">
        <button type="button" onClick={closeFallback} className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center" aria-label="Fermer">
          <IconClose size={22} strokeWidth={1.3} />
        </button>
        <h2 id="wa-fallback-title" className="pr-8 text-xl">
          Votre commande est longue
        </h2>
        <p className="mt-3 text-[0.95rem] text-muted">
          {fallback.copied || copiedAgain
            ? 'Le détail complet a été copié. Dans WhatsApp, appuyez longuement dans la zone de message puis « Coller » avant d\'envoyer.'
            : 'Copiez le détail ci-dessous, puis collez-le dans WhatsApp avant d\'envoyer.'}
        </p>
        <textarea
          readOnly
          value={fallback.message}
          className="mt-4 h-40 w-full resize-none border border-line bg-surface p-3 text-[0.8rem]"
          onFocus={(e) => e.target.select()}
          aria-label="Détail de la commande"
        />
        <div className="mt-4 flex flex-col gap-3">
          <a href={fallback.link} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" onClick={closeFallback}>
            <IconWhatsApp size={20} /> Ouvrir WhatsApp
          </a>
          <button type="button" onClick={copy} className="btn-outline">
            {copiedAgain ? 'Copié' : 'Copier le détail'}
          </button>
        </div>
      </div>
    </div>
  );
}
