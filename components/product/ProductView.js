'use client';

import { useCallback, useState } from 'react';
import ProductGallery from './ProductGallery';
import { TEMPLATE_COMPONENTS } from '@/templates';
import { resolveProduct } from '@/lib/products';

// Mise en page de la fiche produit : galerie à gauche, infos à droite (collantes sur PC).
// Le contenu de droite dépend du modèle de page du produit (dossier templates/).
export default function ProductView({ product: initial }) {
  const [product, setProduct] = useState(initial);

  // Fin du compte à rebours : le produit bascule en modèle Standard sans recharger
  const onReleased = useCallback(() => setProduct((p) => resolveProduct(p, Date.now())), []);

  const Template = TEMPLATE_COMPONENTS[product.template] || TEMPLATE_COMPONENTS.standard;

  return (
    <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:gap-12 lg:gap-16">
      <div className="-mx-[var(--spacing-gutter)] md:mx-0">
        <ProductGallery images={product.images} title={product.title} />
      </div>
      <div className="md:sticky md:top-28 md:self-start">
        <Template product={product} onReleased={onReleased} />
      </div>
    </div>
  );
}
