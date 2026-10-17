import Link from 'next/link';
import SmartImage from './SmartImage';
import QuickActions from './QuickActions';
import { formatPrice } from '@/lib/format';
import { mainImage } from '@/lib/products';

// Carte produit : image portrait 4:5, mini-barre "Au panier / Acheter maintenant"
// juste sous l'image (produits disponibles), puis nom, prix "12,000F", badge Vendu / À venir.
export default function ProductCard({ product, priority = false, sizes }) {
  const image = mainImage(product);
  const badge = product.status === 'vendu' ? 'Vendu' : product.status === 'a_venir' ? 'À venir' : null;
  const href = `/produits/${product.slug}`;

  return (
    <div className="group">
      <Link href={href} className="block" prefetch aria-label={product.title}>
        <div className="relative">
          <SmartImage
            src={image?.url}
            thumb={image?.thumb_url}
            alt={image?.alt || product.title}
            priority={priority}
            sizes={sizes}
            imgClassName="md:group-hover:scale-[1.03]"
          />
          {badge && (
            <span className={`badge-sold absolute bottom-3 left-3 ${badge === 'À venir' ? 'bg-white text-navy ring-1 ring-navy/20' : ''}`}>{badge}</span>
          )}
        </div>
      </Link>
      {!badge && <QuickActions product={product} />}
      <Link href={href} className="block px-1.5 pt-3 pb-5 md:px-2" prefetch>
        <h3 className="text-[0.95rem] leading-snug tracking-[0.04em] group-hover:underline group-hover:underline-offset-4 md:text-base">
          {product.title}
        </h3>
        <p className="mt-1.5 flex items-baseline gap-2 text-[0.9rem] tracking-[0.06em]">
          {product.compare_at_price > product.price && (
            <s className="text-muted">{formatPrice(product.compare_at_price)}</s>
          )}
          <span>{formatPrice(product.price)}</span>
        </p>
      </Link>
    </div>
  );
}
