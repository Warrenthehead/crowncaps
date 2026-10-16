'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useLockBody from './useLockBody';
import { IconClose, IconSearch } from '@/components/icons';

// Barre de recherche qui descend depuis le haut.
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const router = useRouter();
  useLockBody(open, onClose);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/recherche?q=${encodeURIComponent(q)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-slide-down relative border-b border-line bg-white">
        <form onSubmit={submit} className="container-shop flex h-20 items-center gap-3" role="search">
          <label htmlFor="search-input" className="sr-only">
            Rechercher un produit
          </label>
          <div className="flex flex-1 items-center gap-3 border border-ink px-4">
            <IconSearch size={20} />
            <input
              id="search-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher"
              className="h-12 flex-1 bg-transparent text-base outline-none"
              autoComplete="off"
              enterKeyHint="search"
            />
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center" aria-label="Fermer la recherche">
            <IconClose size={24} strokeWidth={1.3} />
          </button>
        </form>
      </div>
    </div>
  );
}
