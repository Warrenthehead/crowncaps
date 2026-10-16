'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import MenuDrawer from './MenuDrawer';
import SearchOverlay from './SearchOverlay';
import { useShop } from './ShopProvider';
import { IconBag, IconMenu, IconSearch } from '@/components/icons';

// En-tête collant : burger à gauche, logo centré, recherche + panier à droite.
// Sur PC (≥ 1024 px) le menu principal s'affiche en ligne sous le logo.
export default function Header({ settings, menu }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count, ready } = useShop();
  const pathname = usePathname();

  // Ferme les volets à chaque changement de page
  useEffect(() => {
    setDrawerOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="container-shop grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={drawerOpen}
            >
              <IconMenu size={26} strokeWidth={1.2} />
            </button>
          </div>

          <Logo settings={settings} />

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center"
              aria-label="Rechercher"
            >
              <IconSearch size={24} strokeWidth={1.3} />
            </button>
            <Link href="/panier" className="relative -mr-2 flex h-11 w-11 items-center justify-center" aria-label={`Panier, ${count} article(s)`}>
              <IconBag size={26} strokeWidth={1.2} />
              {ready && count > 0 && (
                <span className="absolute right-1.5 bottom-1.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-ink px-1 text-[0.65rem] leading-none font-semibold text-white">
                  {count > 99 ? '99' : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menu.length > 0 && (
          <nav className="hidden lg:block" aria-label="Menu principal">
            <ul className="container-shop flex flex-wrap items-center justify-center gap-x-7 pb-3 text-[0.9rem] tracking-[0.06em]">
              {menu.map((item) => (
                <li key={item.id} className="group relative">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`inline-block py-1 text-ink/75 transition hover:text-ink ${pathname === item.href ? 'text-ink underline underline-offset-4' : ''}`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="inline-block py-1 text-ink/75">{item.label}</span>
                  )}
                  {item.children.length > 0 && (
                    <ul className="invisible absolute top-full left-1/2 z-50 min-w-48 -translate-x-1/2 border border-line bg-white py-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link href={child.href || '#'} className="block px-4 py-2 text-ink/75 hover:bg-surface hover:text-ink">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <MenuDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} menu={menu} settings={settings} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
