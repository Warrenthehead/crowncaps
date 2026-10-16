import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';
import ProductGrid from '@/components/ui/ProductGrid';
import { getProduct, getRelatedProducts } from '@/lib/data';
import { absoluteUrl } from '@/lib/site';
import { mainImage } from '@/lib/products';

export const revalidate = 600;

// Pages générées à la première visite puis mises en cache (régénérées après chaque modification dans l'admin).
export async function generateStaticParams() {
  return [];
}

function plainText(text = '') {
  return text.replace(/\*\*/g, '').replace(/^\s*[-•]\s+/gm, '').replace(/\s+/g, ' ').trim();
}

// Balises SEO + Open Graph : c'est grâce à og:image que WhatsApp affiche
// la photo du produit quand le lien est envoyé.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const image = mainImage(product);
  const description = plainText(product.description).slice(0, 160) || `${product.title} – ${product.brand}, disponible chez CrownCaps au Gabon.`;
  return {
    title: product.title,
    description,
    alternates: { canonical: `/produits/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.title,
      description,
      url: `/produits/${product.slug}`,
      images: image ? [{ url: absoluteUrl(image.url), width: 1200, height: 1200, alt: image.alt || product.title }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: product.title, description, images: image ? [absoluteUrl(image.url)] : undefined },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product, 4);

  // Données structurées "Product" pour Google
  const availability = {
    disponible: 'https://schema.org/InStock',
    vendu: 'https://schema.org/SoldOut',
    a_venir: 'https://schema.org/PreOrder',
  }[product.status];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.code,
    brand: { '@type': 'Brand', name: product.brand },
    description: plainText(product.description),
    image: product.images.map((i) => absoluteUrl(i.url)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XAF',
      price: product.price,
      availability,
      url: absoluteUrl(`/produits/${product.slug}`),
    },
  };

  return (
    <>
      <div className="container-shop pt-4 pb-10 md:pt-10">
        <ProductView product={product} />
      </div>

      {related.length > 0 && (
        <section className="container-shop py-10 md:py-14">
          <h2 className="section-title mb-7">Vous aimerez aussi</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </>
  );
}
