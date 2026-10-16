'use client';

import { useState, useTransition } from 'react';
import SortableList from './SortableList';
import { useToast } from './Toast';
import { saveMenu } from '@/app/admin/actions/content';
import { IconClose } from '@/components/icons';

const LINK_TYPES = [
  { value: 'none', label: 'Aucun lien (groupe)' },
  { value: 'home', label: 'Accueil' },
  { value: 'collections', label: 'Page Collections' },
  { value: 'category', label: 'Catégorie' },
  { value: 'page', label: 'Page' },
  { value: 'url', label: 'Adresse web (URL)' },
];

const MENUS = [
  { handle: 'main', label: 'Menu principal (volet burger)', help: 'Chaque élément peut avoir des sous-liens (affichés en accordéon).' },
  { handle: 'footer', label: 'Pied de page', help: 'Chaque groupe devient une ligne dépliable « + » ; ses sous-liens apparaissent dedans.' },
];

let tempId = 0;
const newId = () => `new-${Date.now()}-${tempId++}`;

function withIds(items) {
  return items.map((i) => ({ ...i, id: i.id || newId(), children: (i.children || []).map((c) => ({ ...c, id: c.id || newId() })) }));
}

function LinkFields({ item, onChange, categories, pages }) {
  return (
    <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_1fr]">
      <input className="field h-10 py-1" value={item.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Libellé" aria-label="Libellé" />
      <select className="field h-10 py-1" value={item.link_type} onChange={(e) => onChange({ link_type: e.target.value, target: '' })} aria-label="Type de lien">
        {LINK_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {item.link_type === 'category' && (
        <select className="field h-10 py-1" value={item.target || ''} onChange={(e) => onChange({ target: e.target.value })} aria-label="Catégorie">
          <option value="">Choisir…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      )}
      {item.link_type === 'page' && (
        <select className="field h-10 py-1" value={item.target || ''} onChange={(e) => onChange({ target: e.target.value })} aria-label="Page">
          <option value="">Choisir…</option>
          {pages.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
      )}
      {item.link_type === 'url' && (
        <input className="field h-10 py-1" value={item.target || ''} onChange={(e) => onChange({ target: e.target.value })} placeholder="https://…" aria-label="URL" />
      )}
    </div>
  );
}

// Éditeur des menus : ajouter, réordonner (glisser), supprimer, sous-liens.
export default function MenuEditor({ menus, categories, pages }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [tab, setTab] = useState('main');
  const [trees, setTrees] = useState({ main: withIds(menus.main), footer: withIds(menus.footer) });
  const items = trees[tab];
  const setItems = (fn) => setTrees((t) => ({ ...t, [tab]: typeof fn === 'function' ? fn(t[tab]) : fn }));

  const update = (id, patch) => setItems((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const updateChild = (pid, cid, patch) =>
    setItems((list) => list.map((i) => (i.id === pid ? { ...i, children: i.children.map((c) => (c.id === cid ? { ...c, ...patch } : c)) } : i)));

  const save = () =>
    start(async () => {
      const res = await saveMenu(tab, items);
      toast(res.ok ? 'Menu enregistré' : res.error, res.ok ? 'success' : 'error');
    });

  const current = MENUS.find((m) => m.handle === tab);

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist">
        {MENUS.map((m) => (
          <button
            key={m.handle}
            type="button"
            role="tab"
            aria-selected={tab === m.handle}
            onClick={() => setTab(m.handle)}
            className={tab === m.handle ? 'btn-admin' : 'btn-admin-ghost'}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted">{current.help}</p>

      <SortableList
        items={items}
        onChange={setItems}
        className="space-y-3"
        renderItem={(item, handle) => (
          <div className="card space-y-3 p-3">
            <div className="flex items-start gap-2">
              {handle}
              <LinkFields item={item} onChange={(patch) => update(item.id, patch)} categories={categories} pages={pages} />
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center text-muted hover:text-danger"
                onClick={() => confirm(`Supprimer « ${item.label} » et ses sous-liens ?`) && setItems((l) => l.filter((i) => i.id !== item.id))}
                aria-label="Supprimer"
              >
                <IconClose size={18} />
              </button>
            </div>
            <div className="ml-6 space-y-2 border-l-2 border-line pl-3">
              <SortableList
                items={item.children}
                onChange={(children) => update(item.id, { children })}
                className="space-y-2"
                renderItem={(child, childHandle) => (
                  <div className="flex items-start gap-2 bg-white">
                    {childHandle}
                    <LinkFields item={child} onChange={(patch) => updateChild(item.id, child.id, patch)} categories={categories} pages={pages} />
                    <button
                      type="button"
                      className="flex h-10 w-10 shrink-0 items-center justify-center text-muted hover:text-danger"
                      onClick={() => update(item.id, { children: item.children.filter((c) => c.id !== child.id) })}
                      aria-label="Supprimer le sous-lien"
                    >
                      <IconClose size={16} />
                    </button>
                  </div>
                )}
              />
              <button
                type="button"
                className="text-sm text-muted hover:text-ink hover:underline"
                onClick={() => update(item.id, { children: [...item.children, { id: newId(), label: '', link_type: 'page', target: '' }] })}
              >
                + Sous-lien
              </button>
            </div>
          </div>
        )}
      />

      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" className="btn-admin-ghost" onClick={() => setItems((l) => [...l, { id: newId(), label: '', link_type: tab === 'footer' ? 'none' : 'category', target: '', children: [] }])}>
          + Ajouter un élément
        </button>
        <button type="button" className="btn-admin min-w-32" onClick={save} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer le menu'}
        </button>
      </div>
    </div>
  );
}
