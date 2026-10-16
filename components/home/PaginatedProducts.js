'use client';

import { useRef, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Pager from '@/components/ui/Pager';

// Grille produits 2 colonnes avec pagination "‹ 1/3 ›" (section d'accueil).
export default function PaginatedProducts({ products, perPage = 8, priority = false }) {
  const [page, setPage] = useState(1);
  const ref = useRef(null);
  const total = Math.max(1, Math.ceil(products.length / perPage));
  const visible = products.slice((page - 1) * perPage, page * perPage);

  const go = (p) => {
    setPage(p);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={ref} className="scroll-mt-24">
      <div key={page} className="animate-fade-in grid grid-cols-2 gap-x-1.5 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={priority && page === 1 && i < 2} />
        ))}
      </div>
      <Pager page={page} total={total} onPrev={() => go(page - 1)} onNext={() => go(page + 1)} />
    </div>
  );
}
