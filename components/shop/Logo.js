import Link from 'next/link';

// Logo : image si renseignée dans Paramètres, sinon le nom en serif élégante.
export default function Logo({ settings, className = '' }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label={`${settings.shop_name} – accueil`}>
      {settings.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.logo_url} alt={settings.shop_name} className="h-8 w-auto md:h-10" />
      ) : (
        <span className="font-serif text-[1.65rem] leading-none tracking-normal md:text-[2rem]">
          {settings.shop_name}
        </span>
      )}
    </Link>
  );
}
