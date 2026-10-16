import { formatPrice } from '@/lib/format';

// Pastille marque (bordure dorée), titre, prix en gras, trait fin.
export default function ProductHeader({ product, badge }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="pill-gold">{product.brand || 'CrownCaps'}</span>
        {badge}
      </div>
      <h1 className="mt-3 text-[1.35rem] leading-snug tracking-[0.03em] md:text-[2rem]">{product.title}</h1>
      <p className="mt-4 flex items-baseline gap-3 pb-4 text-[1rem] font-bold tracking-[0.08em]">
        {product.compare_at_price > product.price && (
          <s className="font-normal text-muted">{formatPrice(product.compare_at_price)}</s>
        )}
        {formatPrice(product.price)}
      </p>
      <div className="border-b border-line" />
      <p className="mt-2 text-[0.75rem] tracking-[0.1em] text-muted">Réf. {product.code}</p>
    </div>
  );
}
