import RichText from '@/components/RichText';

// Description + caractéristiques du produit, sous les boutons.
export default function ProductDetails({ product }) {
  return (
    <div className="mt-8 space-y-5 text-[0.95rem] leading-relaxed text-ink/85">
      <RichText text={product.description} />
      {(product.garment_type || product.category) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-line pt-4 text-[0.85rem]">
          {product.category && (
            <>
              <dt className="text-muted">Collection</dt>
              <dd>{product.category.name}</dd>
            </>
          )}
          {product.garment_type && (
            <>
              <dt className="text-muted">Type</dt>
              <dd>{product.garment_type.name}</dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
