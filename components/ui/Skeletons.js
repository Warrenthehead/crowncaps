// Squelettes de chargement (affichés par les fichiers loading.js)

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton aspect-[4/5]" />
      <div className="px-1.5 pt-3.5 pb-5">
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton mt-2 h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-1.5 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TitleSkeleton() {
  return <div className="skeleton h-10 w-2/3 max-w-sm rounded" aria-hidden="true" />;
}
