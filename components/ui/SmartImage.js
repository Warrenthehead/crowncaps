'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { imageCandidates } from '@/lib/image-url';

// Image robuste, quel que soit le réseau :
// - l'image est visible dès qu'elle arrive, sans attendre le JavaScript (le squelette gris n'est qu'un fond) ;
// - en cas d'échec (coupure, domaine bloqué, délai dépassé) : nouvel essai automatique, en alternant
//   entre le domaine du site et Supabase, puis bouton « Réessayer » si tout échoue ;
// - réessaie aussi quand la connexion revient ;
// - srcset miniature 600 px / grande 1600 px, loading="lazy" (sauf priority).
const RETRY_DELAY_MS = 1500;

export default function SmartImage({
  src,
  thumb,
  alt = '',
  ratio = 'aspect-[4/5]',
  sizes = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw',
  priority = false,
  className = '',
  imgClassName = '',
  fit = 'object-cover',
}) {
  const ref = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const fullList = imageCandidates(src);
  const thumbList = thumb && thumb !== src ? imageCandidates(thumb) : null;
  const current = Math.min(attempt, Math.max(fullList.length - 1, 0));
  const fullUrl = fullList[current];
  const thumbUrl = thumbList?.[current];
  const srcSet = thumbUrl && thumbUrl !== fullUrl ? `${thumbUrl} 600w, ${fullUrl} 1600w` : undefined;

  const fail = useCallback(() => {
    if (attempt + 1 >= fullList.length) {
      setFailed(true);
      return;
    }
    setTimeout(() => setAttempt((a) => a + 1), RETRY_DELAY_MS);
  }, [attempt, fullList.length]);

  const retry = useCallback(() => {
    setFailed(false);
    setLoaded(false);
    setAttempt(0);
  }, []);

  // Image déjà arrivée (cache) ou déjà en échec avant que React ne soit actif :
  // dans les deux cas l'événement onLoad / onError a pu être manqué.
  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoaded(true);
    else fail();
  }, [src, attempt, fail]);

  // Connexion revenue : on retente les images abandonnées
  useEffect(() => {
    if (!failed) return;
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [failed, retry]);

  return (
    <div className={`relative overflow-hidden bg-surface ${ratio} ${className}`}>
      {!loaded && !failed && src && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={attempt}
          ref={ref}
          src={srcSet ? thumbUrl : fullUrl}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={fail}
          className={`absolute inset-0 h-full w-full ${fit} ${imgClassName}`}
        />
      ) : src ? (
        <button
          type="button"
          onClick={retry}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted"
        >
          <span>Image non chargée</span>
          <span className="underline underline-offset-4">Réessayer</span>
        </button>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">Image indisponible</div>
      )}
    </div>
  );
}
