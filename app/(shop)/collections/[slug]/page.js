import { notFound } from 'next/navigation';
import CollectionBrowser from '@/components/collection/CollectionBrowser';
import { getCategory, getFilterOptions, getProducts } from '@/lib/data';

export const revalidate = 600;

// Pages générées à la première visite puis mises en cache (régénérées après chaque modification dans l'admin).
export async function generateStaticParams() {
  return [];
}

const ALL = { id: null, name: 'Tous les produits', slug: 'tous', default_sort: 'recent', seo_description: null };

async function load(slug) {
  if (slug === 'tous') return ALL;
  return getCategory(slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await load(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.seo_description || `${category.name} – streetwear premium CrownCaps au Gabon. Commande sur WhatsApp.`,
    alternates: { canonical: `/collections/${category.slug}` },
    openGraph: category.image_url ? { images: [category.image_url] } : undefined,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await load(slug);
  if (!category) notFound();

  const [products, options] = await Promise.all([
    category.id ? getProducts({ source: 'category', categoryId: category.id }) : getProducts(),
    getFilterOptions(),
  ]);

  return (
    <div className="container-shop py-10 md:py-14">
      <h1 className="page-title mb-8">{category.name}</h1>
      <CollectionBrowser products={products} defaultSort={category.default_sort || 'recent'} options={options} />
    </div>
  );
}
