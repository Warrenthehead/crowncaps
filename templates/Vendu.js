'use client';

import ProductHeader from '@/components/product/ProductHeader';
import ProductDetails from '@/components/product/ProductDetails';
import { useShop } from '@/components/shop/ShopProvider';
import { notifyMessage, whatsappLink } from '@/lib/whatsapp';
import { IconWhatsApp } from '@/components/icons';

// MODELE "VENDU" : badge Vendu + "Me prévenir si retour".
export default function Vendu({ product }) {
  const { settings } = useShop();
  const link = whatsappLink(settings.whatsapp_number, notifyMessage(product, settings.shop_name, 'vendu'));

  return (
    <div>
      <ProductHeader product={product} badge={<span className="badge-sold">Vendu</span>} />
      <div className="mt-8 flex flex-col gap-3">
        <button type="button" disabled className="btn-primary">
          Vendu
        </button>
        <a href={link} target="_blank" rel="noopener noreferrer" className="btn-outline">
          <IconWhatsApp size={20} /> Me prévenir si retour
        </a>
      </div>
      <ProductDetails product={product} />
    </div>
  );
}
