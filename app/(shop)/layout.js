import ShopProvider from '@/components/shop/ShopProvider';
import AnnouncementBar from '@/components/shop/AnnouncementBar';
import Header from '@/components/shop/Header';
import Footer from '@/components/shop/Footer';
import CartNotification from '@/components/shop/CartNotification';
import WhatsAppFloat from '@/components/shop/WhatsAppFloat';
import WhatsAppFallbackDialog from '@/components/shop/WhatsAppFallbackDialog';
import { getMenu, getSettings } from '@/lib/data';

// Habillage commun à toutes les pages de la boutique.
export default async function ShopLayout({ children }) {
  const [settings, mainMenu, footerMenu] = await Promise.all([getSettings(), getMenu('main'), getMenu('footer')]);

  // Seules les infos utiles au navigateur sont transmises au panier
  const publicSettings = {
    shop_name: settings.shop_name,
    whatsapp_number: settings.whatsapp_number,
  };

  return (
    <ShopProvider settings={publicSettings}>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:bg-white focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <AnnouncementBar messages={settings.announcements} />
      <Header settings={settings} menu={mainMenu} />
      <main id="contenu" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={settings} menu={footerMenu} />
      <CartNotification />
      <WhatsAppFloat />
      <WhatsAppFallbackDialog />
    </ShopProvider>
  );
}
