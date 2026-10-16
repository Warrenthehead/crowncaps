import CategoryTiles from '@/components/home/CategoryTiles';
import { getCategories } from '@/lib/data';

export const revalidate = 600;

export const metadata = {
  title: 'Collections',
  description: 'Toutes les collections CrownCaps : casquettes, bonnets, t-shirts, pantalons, sacs et petits objets.',
  alternates: { canonical: '/collections' },
};

export default async function CollectionsPage() {
  const categories = await getCategories();
  return (
    <div className="container-shop py-10 md:py-14">
      <h1 className="page-title mb-10">Collections</h1>
      {categories.length ? (
        <CategoryTiles categories={categories} priority />
      ) : (
        <p className="text-muted">Aucune collection pour le moment.</p>
      )}
    </div>
  );
}
