'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Pager from '@/components/ui/Pager';

// Carrousel horizontal de produits (balayable) avec contrôles "‹ 1/3 ›".
export default function ProductCarousel({ products }) {
  const trackRef = useRef(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const total = Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
      setPages(total);
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      setPage(atEnd ? total : Math.min(total, Math.floor(track.scrollLeft / track.clientWidth + 0.1) + 1));
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products.length]);

  const scrollByPage = (dir) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: dir * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div>
      <div ref={trackRef} className="no-scrollbar -mr-[var(--spacing-gutter)] flex snap-x snap-mandatory gap-x-1.5 overflow-x-auto pr-[var(--spacing-gutter)] md:mr-0 md:pr-0">
        {products.map((p) => (
          <div key={p.id} className="w-[43%] shrink-0 snap-start md:w-[calc((100%-0.75rem)/3)] lg:w-[calc((100%-1.125rem)/4)]">
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 45vw" />
          </div>
        ))}
      </div>
      <Pager page={page} total={pages} onPrev={() => scrollByPage(-1)} onNext={() => scrollByPage(1)} />
    </div>
  );
}
