'use client';

import ProductHeader from '@/components/product/ProductHeader';
import OptionPicker from '@/components/product/OptionPicker';
import ProductDetails from '@/components/product/ProductDetails';
import { useShop } from '@/components/shop/ShopProvider';
import useProductOptions from './useProductOptions';

// MODELE "STANDARD" : choix taille/couleur, Ajouter au panier, Acheter directement.
export default function Standard({ product }) {
  const { addItem, checkout } = useShop();
  const opts = useProductOptions(product);

  const addToCart = () => {
    if (!opts.validate()) return;
    addItem(opts.toItem(), 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buyNow = () => {
    if (!opts.validate()) return;
    checkout([{ ...opts.toItem(), quantity: 1 }]);
  };

  const hasErrors = opts.errors.size || opts.errors.color;

  return (
    <div>
      <ProductHeader product={product} />
      <OptionPicker label="Taille" options={product.sizes} value={opts.sizeId} onChange={opts.setSize} error={opts.errors.size} />
      <OptionPicker label="Couleur" type="color" options={product.colors} value={opts.colorId} onChange={opts.setColor} error={opts.errors.color} />

      <div className="mt-8 flex flex-col gap-3">
        <button type="button" onClick={addToCart} className="btn-primary">
          Ajouter au panier
        </button>
        <button type="button" onClick={buyNow} className="btn-outline">
          Acheter directement
        </button>
        {hasErrors && (
          <p className="text-center text-[0.85rem] text-danger" role="alert">
            Merci de choisir {[opts.errors.size && 'une taille', opts.errors.color && 'une couleur'].filter(Boolean).join(' et ')} avant de continuer.
          </p>
        )}
        <p className="text-center text-[0.8rem] text-muted">Commande finalisée sur WhatsApp. Frais de livraison confirmés sur WhatsApp.</p>
      </div>

      <ProductDetails product={product} />
    </div>
  );
}
