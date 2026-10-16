'use client';

import { useEffect, useState } from 'react';
import { IconArrowRight, IconChevronLeft, IconChevronRight } from '@/components/icons';

// Barre d'annonce : messages qui défilent toutes les 5 secondes, flèches ‹ ›.
export default function AnnouncementBar({ messages = [] }) {
  const list = messages.filter((m) => m?.text);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (list.length < 2 || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length, paused]);

  if (!list.length) return null;
  const current = list[index % list.length];
  const go = (delta) => setIndex((i) => (i + delta + list.length) % list.length);

  return (
    <div
      className="border-b border-line bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Annonces"
    >
      <div className="container-shop flex min-h-[3.25rem] items-center justify-between gap-2">
        {list.length > 1 ? (
          <button type="button" onClick={() => go(-1)} className="-ml-2 p-2 text-ink/70 hover:text-ink" aria-label="Annonce précédente">
            <IconChevronLeft size={16} />
          </button>
        ) : (
          <span className="w-8" />
        )}
        <p key={index} className="animate-fade-in py-2 text-center text-[0.8rem] leading-snug tracking-[0.08em]" aria-live="polite">
          {current.link ? (
            <a
              href={current.link}
              className="inline-flex flex-wrap items-center justify-center gap-x-1.5 hover:underline"
              {...(/^https?:/.test(current.link) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {current.text}
              <IconArrowRight size={14} />
            </a>
          ) : (
            current.text
          )}
        </p>
        {list.length > 1 ? (
          <button type="button" onClick={() => go(1)} className="-mr-2 p-2 text-ink/70 hover:text-ink" aria-label="Annonce suivante">
            <IconChevronRight size={16} />
          </button>
        ) : (
          <span className="w-8" />
        )}
      </div>
    </div>
  );
}
