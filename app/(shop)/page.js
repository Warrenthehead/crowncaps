import HomeSection from '@/components/home/HomeSection';
import { getHomeSections, getSettings } from '@/lib/data';

export const revalidate = 600;

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: { absolute: `${settings.shop_name} – Streetwear premium au Gabon` },
    description: settings.seo_description,
    alternates: { canonical: '/' },
  };
}

// Page d'accueil : les sections et leur ordre se règlent dans Admin > Page d'accueil.
export default async function HomePage() {
  const sections = await getHomeSections();
  return (
    <>
      <h1 className="sr-only">CrownCaps</h1>
      {sections.map((section, i) => (
        <HomeSection key={section.id} section={section} first={i === 0} />
      ))}
    </>
  );
}
