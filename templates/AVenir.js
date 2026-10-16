'use client';

import ProductHeader from '@/components/product/ProductHeader';
import ProductDetails from '@/components/product/ProductDetails';
import Countdown from '@/components/product/Countdown';
import { useShop } from '@/components/shop/ShopProvider';
import { notifyMessage, whatsappLink } from '@/lib/whatsapp';
import { IconWhatsApp } from '@/components/icons';

// MODELE "A VENIR" : badge visible, pas d'achat, compte à rebours optionnel,
// bouton "Me prévenir sur WhatsApp". A la date de sortie, la page bascule en Standard.
export default function AVenir({ product, onReleased }) {
  const { settings } = useShop();
  const link = whatsappLink(settings.whatsapp_number, notifyMessage(product, settings.shop_name, 'a_venir'));
  const upcoming = product.release_at && new Date(product.release_at).getTime() > Date.now();

  return (
    <div>
      <ProductHeader
        product={product}
        badge={<span className="inline-flex items-center rounded-full bg-ink px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.16em] text-white uppercase">À venir</span>}
      />
      {upcoming && <Countdown date={product.release_at} onDone={onReleased} />}
      <div className="mt-8 flex flex-col gap-3">
        <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <IconWhatsApp size={20} /> Me prévenir sur WhatsApp
        </a>
        <p className="text-center text-[0.8rem] text-muted">Bientôt disponible. Nous vous écrivons dès la sortie.</p>
      </div>
      <ProductDetails product={product} />
    </div>
  );
}
