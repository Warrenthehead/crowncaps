'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import SmartImage from '@/components/ui/SmartImage';
import Pager from '@/components/ui/Pager';

// Diaporama pleine largeur, balayable au doigt, pagination "1/2" + flèches.
export default function Slideshow({ slides = [] }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);
  const list = slides.filter((s) => s?.image_url);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setIndex(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  if (!list.length) return null;

  const goTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <section aria-roledescription="carrousel" aria-label="Diaporama">
      <div ref={trackRef} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto">
        {list.map((slide, i) => {
          const image = (
            <SmartImage
              src={slide.image_url}
              alt={slide.alt || ''}
              ratio="aspect-[4/5] md:aspect-[16/7]"
              sizes="100vw"
              priority={i === 0}
            />
          );
          return (
            <div key={i} className="w-full shrink-0 snap-start" aria-roledescription="diapositive" aria-label={`${i + 1} sur ${list.length}`}>
              {slide.link ? <Link href={slide.link}>{image}</Link> : image}
            </div>
          );
        })}
      </div>
      <div className="border-b border-line py-1">
        <Pager
          page={index + 1}
          total={list.length}
          onPrev={() => goTo(Math.max(0, index - 1))}
          onNext={() => goTo(Math.min(list.length - 1, index + 1))}
          label="Diapositive"
        />
      </div>
    </section>
  );
}
