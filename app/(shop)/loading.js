import { ProductGridSkeleton, TitleSkeleton } from '@/components/ui/Skeletons';

// Affiché instantanément pendant le chargement d'une page de la boutique.
export default function Loading() {
  return (
    <div className="container-shop py-10 md:py-14" aria-busy="true" aria-label="Chargement">
      <TitleSkeleton />
      <div className="mt-8">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
