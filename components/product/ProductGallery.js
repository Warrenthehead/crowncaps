'use client';

import { useEffect, useRef, useState } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import { mediaUrl } from '@/lib/image-url';
import useLockBody from '@/components/shop/useLockBody';
import { IconChevronLeft, IconChevronRight, IconClose, IconZoom } from '@/components/icons';

// Galerie produit : grande image carrée balayable, loupe (zoom plein écran),
// miniatures dessous (la sélectionnée a une bordure noire épaisse).
export default function ProductGallery({ images, title }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  useLockBody(zoom, () => setZoom(false));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setIndex(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (i) => {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    setIndex(i);
  };

  if (!images.length) {
    return <SmartImage src={null} alt={title} ratio="aspect-square" />;
  }

  const current = images[index] || images[0];

  return (
    <div>
      <div className="relative">
        <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-label="Photos du produit">
          {images.map((img, i) => (
            <div key={img.id || i} className="w-full shrink-0 snap-start">
              <SmartImage
                src={img.url}
                alt={img.alt || `${title} – photo ${i + 1}`}
                ratio="aspect-square"
                sizes="(min-width: 1024px) 55vw, 100vw"
                priority={i === 0}
                fit="object-contain"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 ring-1 ring-black/10 transition hover:bg-white"
          aria-label="Agrandir la photo"
        >
          <IconZoom size={20} strokeWidth={1.4} />
        </button>
      </div>

      {images.length > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto md:mt-4" aria-label="Miniatures">
          {images.map((img, i) => (
            <li key={img.id || i} className="w-[30%] shrink-0 md:w-[22%]">
              <button
                type="button"
                onClick={() => goTo(i)}
                className={`block w-full border-2 transition ${i === index ? 'border-ink' : 'border-transparent opacity-80 hover:opacity-100'}`}
                aria-label={`Voir la photo ${i + 1}`}
                aria-current={i === index}
              >
                <SmartImage src={img.thumb_url || img.url} alt="" ratio="aspect-square" sizes="150px" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {zoom && (
        <div className="animate-fade-in fixed inset-0 z-[60] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Photo agrandie">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-sm text-muted tabular-nums">
              {index + 1}/{images.length}
            </span>
            <button type="button" onClick={() => setZoom(false)} className="flex h-11 w-11 items-center justify-center" aria-label="Fermer">
              <IconClose size={26} strokeWidth={1.3} />
            </button>
          </div>
          <div className="relative flex-1 overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl(current.url)}
              alt={current.alt || title}
              onError={(e) => {
                if (e.currentTarget.src !== current.url) e.currentTarget.src = current.url;
              }}
              className="mx-auto h-full w-full object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((index - 1 + images.length) % images.length)}
                  className="absolute top-1/2 left-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 ring-1 ring-black/10"
                  aria-label="Photo précédente"
                >
                  <IconChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((index + 1) % images.length)}
                  className="absolute top-1/2 right-2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 ring-1 ring-black/10"
                  aria-label="Photo suivante"
                >
                  <IconChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
