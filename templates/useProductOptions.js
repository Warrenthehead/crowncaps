'use client';

import { useState } from 'react';
import { mainImage } from '@/lib/products';

// Gère le choix taille/couleur et prépare l'article pour le panier ou WhatsApp.
// S'il n'y a qu'une seule taille ou couleur, elle est choisie automatiquement.
export default function useProductOptions(product) {
  const [sizeId, setSizeId] = useState(product.sizes.length === 1 ? product.sizes[0].id : null);
  const [colorId, setColorId] = useState(product.colors.length === 1 ? product.colors[0].id : null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (product.sizes.length && !sizeId) next.size = 'Choisissez une taille.';
    if (product.colors.length && !colorId) next.color = 'Choisissez une couleur.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toItem = () => {
    const image = mainImage(product);
    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      code: product.code,
      price: product.price,
      image: image?.thumb_url || image?.url || null,
      size: product.sizes.find((s) => s.id === sizeId)?.label || null,
      color: product.colors.find((c) => c.id === colorId)?.name || null,
    };
  };

  return {
    sizeId,
    colorId,
    errors,
    setSize: (id) => {
      setSizeId(id);
      setErrors((e) => ({ ...e, size: null }));
    },
    setColor: (id) => {
      setColorId(id);
      setErrors((e) => ({ ...e, color: null }));
    },
    validate,
    toItem,
  };
}
