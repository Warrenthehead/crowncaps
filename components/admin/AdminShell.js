'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import SignOutButton from './SignOutButton';
import { ToastProvider } from './Toast';
import { IconClose, IconExternal, IconMenu } from '@/components/icons';

const NAV = [
  { href: '/admin', label: 'Accueil' },
  { href: '/admin/produits', label: 'Produits' },
  { href: '/admin/categories', label: 'Catégories' },
  { href: '/admin/attributs', label: 'Couleurs & tailles' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/menus', label: 'Menus' },
  { href: '/admin/accueil', label: "Page d'accueil" },
  { href: '/admin/parametres', label: 'Paramètres' },
];

// Habillage de l'admin : barre latérale à gauche (volet sur mobile).
export default function AdminShell({ email, children }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/admin" className="font-serif text-xl">
          CrownCaps
        </Link>
        <button type="button" className="flex h-10 w-10 items-center justify-center lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer le menu">
          <IconClose size={20} />
        </button>
      </div>
      <ul className="flex-1 space-y-0.5 px-2 py-2">
        {NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex min-h-11 items-center rounded-lg px-3 text-[0.95rem] transition ${
                isActive(item.href) ? 'bg-white font-semibold text-ink shadow-sm ring-1 ring-line' : 'text-ink/75 hover:bg-white/70 hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-line p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm text-ink/75 hover:bg-white">
          <IconExternal size={16} /> Voir la boutique
        </a>
        <p className="truncate px-3 text-xs text-muted">{email}</p>
        <SignOutButton className="btn-admin-ghost w-full" />
      </div>
    </nav>
  );

  return (
    <ToastProvider>
      <div className="lg:grid lg:min-h-dvh lg:grid-cols-[15rem_1fr]">
        {/* Barre latérale PC */}
        <aside className="sticky top-0 hidden h-dvh border-r border-line bg-[#ebebeb] lg:block">{nav}</aside>

        {/* Barre du haut + volet mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-[#ebebeb] px-2 lg:hidden">
          <button type="button" className="flex h-11 w-11 items-center justify-center" onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <IconMenu size={22} />
          </button>
          <span className="font-serif text-lg">CrownCaps</span>
        </header>
        <div className={`fixed inset-0 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}>
          <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />
          <aside className={`absolute inset-y-0 left-0 w-72 bg-[#ebebeb] transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            {nav}
          </aside>
        </div>

        <main className="min-w-0 px-3 py-5 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
