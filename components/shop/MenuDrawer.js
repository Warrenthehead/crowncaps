'use client';

import Link from 'next/link';
import { useState } from 'react';
import useLockBody from './useLockBody';
import { IconChevronDown, IconClose } from '@/components/icons';

// Volet latéral (menu burger) qui glisse depuis la gauche.
export default function MenuDrawer({ open, onClose, menu, settings }) {
  const [expanded, setExpanded] = useState(null);
  useLockBody(open, onClose);

  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <nav
        className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col bg-white shadow-xl transition-transform duration-300 ease-[var(--ease-out-soft)] ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu principal"
        {...(!open ? { inert: '' } : {})}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span className="font-serif text-xl">{settings.shop_name}</span>
          <button type="button" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Fermer le menu">
            <IconClose size={24} strokeWidth={1.3} />
          </button>
        </div>
        <ul className="flex-1 overflow-y-auto py-3">
          {menu.map((item) => (
            <li key={item.id}>
              {item.children.length > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left text-[1.1rem] hover:bg-surface"
                    aria-expanded={expanded === item.id}
                  >
                    {item.label}
                    <IconChevronDown size={18} className={`transition-transform duration-200 ${expanded === item.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded === item.id && (
                    <ul className="animate-fade-in pb-2">
                      {item.href && (
                        <li>
                          <Link href={item.href} className="block px-8 py-2.5 text-ink/75 hover:text-ink">
                            Tout voir
                          </Link>
                        </li>
                      )}
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link href={child.href || '#'} className="block px-8 py-2.5 text-ink/75 hover:text-ink">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="block px-5 py-3.5 text-[1.1rem] hover:bg-surface"
                  {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="block px-5 py-3.5 text-[1.1rem] text-muted">{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
