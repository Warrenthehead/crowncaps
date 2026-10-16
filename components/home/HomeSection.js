import Slideshow from './Slideshow';
import PaginatedProducts from './PaginatedProducts';
import ProductCarousel from './ProductCarousel';
import CategoryTiles from './CategoryTiles';
import ImageBanner from './ImageBanner';
import ViewAllLink from '@/components/ui/ViewAllLink';
import { getCategories, getProducts } from '@/lib/data';

// Affiche une section de la page d'accueil selon son type (réglé dans l'admin).
export default async function HomeSection({ section, first = false }) {
  const config = section.config || {};

  if (section.type === 'slideshow') {
    return <Slideshow slides={config.slides} />;
  }

  if (section.type === 'image_banner') {
    return <ImageBanner {...config} priority={first} />;
  }

  if (section.type === 'category_tiles') {
    const categories = (await getCategories()).slice(0, config.limit || 4);
    if (!categories.length) return null;
    return (
      <section className="container-shop py-12 md:py-16">
        {section.title && <h2 className="mb-8 text-center text-[1.4rem] tracking-[0.02em] md:text-[2rem]">{section.title}</h2>}
        <CategoryTiles categories={categories} priority={first} />
        <ViewAllLink href="/collections" />
      </section>
    );
  }

  // Grille ou carrousel de produits
  const products = await getProducts({
    source: config.source || 'all',
    categoryId: config.category_id,
    limit: config.limit || 12,
    sort: config.sort,
  });
  if (!products.length) return null;

  let viewAll = '/collections/tous';
  if (config.source === 'category' && config.category_id) {
    const category = (await getCategories()).find((c) => c.id === config.category_id);
    if (category) viewAll = `/collections/${category.slug}`;
  }

  return (
    <section className="container-shop py-10 md:py-14">
      {section.title && <h2 className="section-title mb-7 md:mb-9">{section.title}</h2>}
      {section.type === 'product_carousel' ? (
        <ProductCarousel products={products} />
      ) : (
        <PaginatedProducts products={products} perPage={config.per_page || 8} priority={first} />
      )}
      <ViewAllLink href={viewAll} />
    </section>
  );
}
