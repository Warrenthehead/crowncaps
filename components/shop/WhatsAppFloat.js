'use client';

import { useShop } from './ShopProvider';
import { whatsappLink } from '@/lib/whatsapp';
import { IconWhatsApp } from '@/components/icons';

// Bouton flottant WhatsApp "Discuter avec nous" (remplace le bouton rond "C").
export default function WhatsAppFloat() {
  const { settings } = useShop();
  if (!settings.whatsapp_number) return null;
  const link = whatsappLink(settings.whatsapp_number, `Bonjour ${settings.shop_name}, j'ai une question.`);
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 bottom-4 z-30 flex h-14 items-center gap-2 rounded-full bg-white px-2.5 md:pr-4 md:pl-3 text-ink shadow-[0_2px_14px_rgba(0,0,0,0.14)] ring-1 ring-black/5 transition hover:-translate-y-0.5 md:right-6 md:bottom-6"
      aria-label="Discuter avec nous sur WhatsApp"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp text-white">
        <IconWhatsApp size={20} />
      </span>
      <span className="hidden text-[0.85rem] font-semibold tracking-wide md:inline">Discuter avec nous</span>
    </a>
  );
}
