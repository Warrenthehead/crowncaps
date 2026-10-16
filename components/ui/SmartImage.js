'use client';

import { useEffect, useRef, useState } from 'react';

// Image optimisée :
// - squelette gris pendant le chargement, puis apparition floue -> nette
// - loading="lazy" (sauf priority), srcset miniature 600 px / grande 1600 px
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
  const [failed, setFailed] = useState(false);

  // Image déjà en cache : l'événement onLoad peut ne jamais arriver
  useEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  const srcSet = thumb && thumb !== src ? `${thumb} 600w, ${src} 1600w` : undefined;

  return (
    <div className={`relative overflow-hidden bg-surface ${ratio} ${className}`}>
      {!loaded && !failed && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={srcSet ? thumb : src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full ${fit} transition-[opacity,filter,transform] duration-500 ease-out ${
            loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          } ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">Image indisponible</div>
      )}
    </div>
  );
}
