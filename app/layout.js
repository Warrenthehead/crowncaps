import { Assistant, Playfair_Display } from 'next/font/google';
import { SITE_URL } from '@/lib/site';
import './globals.css';

// Polices hébergées par le site lui-même (rapide, sans appel à Google côté client).
const assistant = Assistant({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-assistant',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CrownCaps – Streetwear premium au Gabon',
    template: '%s – CrownCaps',
  },
  description: 'CrownCaps, streetwear premium au Gabon : casquettes, bonnets, t-shirts, pantalons, sacs et accessoires. Commande sur WhatsApp.',
  openGraph: {
    siteName: 'CrownCaps',
    locale: 'fr_FR',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${assistant.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
