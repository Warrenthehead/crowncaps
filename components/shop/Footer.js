import Link from 'next/link';
import { IconPlus } from '@/components/icons';

// Drapeau du Gabon (vert, jaune, bleu)
function GabonFlag() {
  return (
    <svg width="22" height="15" viewBox="0 0 3 2" aria-label="Drapeau du Gabon" role="img" className="inline-block">
      <rect width="3" height="2" fill="#3a75c4" />
      <rect width="3" height="1.333" fill="#fcd116" />
      <rect width="3" height="0.667" fill="#009e60" />
    </svg>
  );
}

function FooterLink({ item }) {
  const external = item.external || /^https?:/.test(item.href || '');
  return (
    <Link
      href={item.href || '#'}
      className="block py-2 text-ink/75 hover:text-ink hover:underline"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {item.label}
    </Link>
  );
}

// Pied de page : nom en gras, groupes dépliables "+" (sans JavaScript, balise <details>).
export default function Footer({ settings, menu }) {
  return (
    <footer className="mt-20 border-t border-line pt-14 pb-28 md:mt-28">
      <div className="container-shop">
        <p className="text-center text-2xl font-bold tracking-wide">{settings.shop_name}</p>

        {menu.length > 0 && (
          <div className="mx-auto mt-10 max-w-3xl border-t border-line">
            {menu.map((group) =>
              group.children.length > 0 ? (
                <details key={group.id} className="group border-b border-line">
                  <summary className="flex min-h-[4.25rem] cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.05rem] [&::-webkit-details-marker]:hidden">
                    {group.label}
                    <IconPlus size={20} strokeWidth={1.3} className="shrink-0 transition-transform duration-200 group-open:rotate-45" />
                  </summary>
                  <div className="animate-fade-in pb-4">
                    {group.children.map((child) => (
                      <FooterLink key={child.id} item={child} />
                    ))}
                  </div>
                </details>
              ) : (
                <div key={group.id} className="border-b border-line py-4 text-[1.05rem]">
                  {group.href ? <Link href={group.href} className="hover:underline">{group.label}</Link> : group.label}
                </div>
              )
            )}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3 text-center text-[0.75rem] text-muted">
          <p>{settings.footer_text}</p>
          <p className="inline-flex items-center gap-2">
            Pays de livraison – {settings.shipping_country} <GabonFlag />
          </p>
        </div>
      </div>
    </footer>
  );
}
