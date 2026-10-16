'use client';

import { useEffect } from 'react';

// Bloque le défilement de la page quand un volet est ouvert + fermeture avec Échap.
export default function useLockBody(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
}
