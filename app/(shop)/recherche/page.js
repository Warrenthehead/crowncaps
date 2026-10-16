import ProductGrid from '@/components/ui/ProductGrid';
import { searchProducts } from '@/lib/data';

export const metadata = {
  title: 'Recherche',
  robots: { index: false },
};

export default async function SearchPage({ searchParams }) {
  const { q = '' } = await searchParams;
  const query = String(q).slice(0, 80);
  const results = await searchProducts(query);

  return (
    <div className="container-shop py-10 md:py-14">
      <h1 className="page-title">Recherche</h1>
      <form action="/recherche" className="mt-6 flex max-w-xl border border-ink" role="search">
        <label htmlFor="q" className="sr-only">
          Rechercher un produit
        </label>
        <input id="q" name="q" type="search" defaultValue={query} placeholder="Nom, code (CC-0012)..." className="h-12 flex-1 px-4 outline-none" enterKeyHint="search" />
        <button type="submit" className="bg-ink px-5 text-sm tracking-[0.08em] text-white">
          Rechercher
        </button>
      </form>
      {query && (
        <p className="mt-6 mb-6 text-muted">
          {results.length} résultat(s) pour « {query} »
        </p>
      )}
      {results.length > 0 ? (
        <ProductGrid products={results} priorityCount={2} />
      ) : (
        query && <p className="py-10 text-center text-muted">Aucun produit trouvé. Essayez un autre mot.</p>
      )}
    </div>
  );
}
