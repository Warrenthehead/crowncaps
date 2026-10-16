import { getAllProducts, getCategories, getPages } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

// Plan du site pour Google : /sitemap.xml
export default async function sitemap() {
  try {
    const [products, categories, pages] = await Promise.all([getAllProducts(), getCategories(), getPages()]);
    return [
      { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
      { url: absoluteUrl('/collections'), changeFrequency: 'weekly', priority: 0.8 },
      { url: absoluteUrl('/collections/tous'), changeFrequency: 'daily', priority: 0.8 },
      ...categories.map((c) => ({ url: absoluteUrl(`/collections/${c.slug}`), changeFrequency: 'weekly', priority: 0.8 })),
      ...products.map((p) => ({ url: absoluteUrl(`/produits/${p.slug}`), lastModified: p.created_at, priority: 0.7 })),
      ...pages.map((p) => ({ url: absoluteUrl(`/pages/${p.slug}`), lastModified: p.updated_at, priority: 0.3 })),
    ];
  } catch {
    return [{ url: absoluteUrl('/') }];
  }
}
