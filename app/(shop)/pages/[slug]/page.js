import { notFound } from 'next/navigation';
import RichText from '@/components/RichText';
import { getPage } from '@/lib/data';

export const revalidate = 600;

// Pages générées à la première visite puis mises en cache (régénérées après chaque modification dans l'admin).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.content.replace(/\*\*/g, '').slice(0, 160),
    alternates: { canonical: `/pages/${page.slug}` },
  };
}

// Pages simples créées dans Admin > Pages (Aide, FAQ, Nos services...).
export default async function SimplePage({ params }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <div className="container-shop max-w-3xl py-10 md:py-14">
      <h1 className="page-title mb-8">{page.title}</h1>
      <RichText text={page.content} className="text-[1.02rem] leading-relaxed text-ink/85" />
    </div>
  );
}
