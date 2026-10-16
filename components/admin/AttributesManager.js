'use client';

import { useState } from 'react';
import SortableList from './SortableList';
import { useToast } from './Toast';
import {
  deleteColor,
  deleteGarmentType,
  deleteSize,
  deleteSizeGroup,
  reorder,
  saveColor,
  saveGarmentType,
  saveSize,
  saveSizeGroup,
} from '@/app/admin/actions/catalog';
import { IconClose } from '@/components/icons';

// Les 3 seules étiquettes : couleurs, tailles (par groupe), types de vêtement.
export default function AttributesManager(props) {
  const toast = useToast();
  const [colors, setColors] = useState(props.colors);
  const [groups, setGroups] = useState(props.sizeGroups);
  const [types, setTypes] = useState(props.garmentTypes);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });
  const [newType, setNewType] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newSizes, setNewSizes] = useState({});

  const done = (res, msg) => {
    if (!res.ok) {
      toast(res.error, 'error');
      return false;
    }
    if (msg) toast(msg);
    return true;
  };

  const confirmDelete = (what) => confirm(`Supprimer ${what} ? Il sera retiré de tous les produits.`);

  // ---- Couleurs
  const addColor = async (e) => {
    e.preventDefault();
    const res = await saveColor(newColor);
    if (done(res, 'Couleur ajoutée')) {
      setColors((c) => [...c, res.data]);
      setNewColor({ name: '', hex: '#000000' });
    }
  };
  const updateColor = async (color, patch) => {
    const next = { ...color, ...patch };
    setColors((list) => list.map((c) => (c.id === color.id ? next : c)));
    done(await saveColor(next));
  };
  const removeColor = async (color) => {
    if (!confirmDelete(`la couleur « ${color.name} »`)) return;
    if (done(await deleteColor(color.id), 'Couleur supprimée')) setColors((l) => l.filter((c) => c.id !== color.id));
  };

  // ---- Tailles
  const addGroup = async (e) => {
    e.preventDefault();
    const res = await saveSizeGroup({ name: newGroup });
    if (done(res, 'Groupe ajouté')) {
      setGroups((g) => [...g, { ...res.data, sizes: [] }]);
      setNewGroup('');
    }
  };
  const renameGroup = async (group, name) => {
    if (!name.trim() || name === group.name) return;
    if (done(await saveSizeGroup({ id: group.id, name }), 'Groupe renommé')) setGroups((l) => l.map((g) => (g.id === group.id ? { ...g, name } : g)));
  };
  const removeGroup = async (group) => {
    if (!confirmDelete(`le groupe « ${group.name} » et toutes ses tailles`)) return;
    if (done(await deleteSizeGroup(group.id), 'Groupe supprimé')) setGroups((l) => l.filter((g) => g.id !== group.id));
  };
  const addSize = async (group) => {
    const label = newSizes[group.id] || '';
    const res = await saveSize({ group_id: group.id, label });
    if (done(res)) {
      setGroups((l) => l.map((g) => (g.id === group.id ? { ...g, sizes: [...g.sizes, res.data] } : g)));
      setNewSizes((s) => ({ ...s, [group.id]: '' }));
    }
  };
  const removeSize = async (group, size) => {
    if (!confirmDelete(`la taille « ${size.label} »`)) return;
    if (done(await deleteSize(size.id))) setGroups((l) => l.map((g) => (g.id === group.id ? { ...g, sizes: g.sizes.filter((s) => s.id !== size.id) } : g)));
  };
  const reorderSizes = async (group, sizes) => {
    setGroups((l) => l.map((g) => (g.id === group.id ? { ...g, sizes } : g)));
    done(await reorder('sizes', sizes.map((s) => s.id)));
  };

  // ---- Types
  const addType = async (e) => {
    e.preventDefault();
    const res = await saveGarmentType({ name: newType });
    if (done(res, 'Type ajouté')) {
      setTypes((t) => [...t, res.data]);
      setNewType('');
    }
  };
  const renameType = async (type, name) => {
    if (!name.trim() || name === type.name) return;
    if (done(await saveGarmentType({ id: type.id, name }))) setTypes((l) => l.map((t) => (t.id === type.id ? { ...t, name } : t)));
  };
  const removeType = async (type) => {
    if (!confirmDelete(`le type « ${type.name} »`)) return;
    if (done(await deleteGarmentType(type.id), 'Type supprimé')) setTypes((l) => l.filter((t) => t.id !== type.id));
  };

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="font-semibold">Couleurs</h2>
        <SortableList
          items={colors}
          onChange={async (next) => {
            setColors(next);
            done(await reorder('colors', next.map((c) => c.id)));
          }}
          className="divide-y divide-line rounded-lg border border-line"
          renderItem={(c, handle) => (
            <div className="flex items-center gap-2 bg-white px-2 py-1.5">
              {handle}
              <input type="color" defaultValue={c.hex} onBlur={(e) => e.target.value !== c.hex && updateColor(c, { hex: e.target.value })} className="h-9 w-10 cursor-pointer rounded border border-line" aria-label={`Couleur de ${c.name}`} />
              <input defaultValue={c.name} onBlur={(e) => e.target.value.trim() && e.target.value !== c.name && updateColor(c, { name: e.target.value.trim() })} className="field h-10 flex-1 py-1" aria-label="Nom de la couleur" />
              <button type="button" onClick={() => removeColor(c)} className="flex h-10 w-10 items-center justify-center text-muted hover:text-danger" aria-label={`Supprimer ${c.name}`}>
                <IconClose size={16} />
              </button>
            </div>
          )}
        />
        <form onSubmit={addColor} className="flex flex-wrap items-center gap-2">
          <input type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-10 w-12 cursor-pointer rounded border border-line" aria-label="Nouvelle couleur" />
          <input value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} placeholder="Nom (ex. Bordeaux)" className="field w-48" required />
          <button type="submit" className="btn-admin">
            + Ajouter une couleur
          </button>
        </form>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Tailles</h2>
        <p className="text-sm text-muted">Un groupe par famille de produits (ex. Vêtements S à XXL, Casquettes fitted en tailles US avec équivalent en cm). Chaque catégorie propose un groupe par défaut.</p>
        {groups.map((g) => (
          <div key={g.id} className="rounded-lg border border-line p-3">
            <div className="mb-3 flex items-center gap-2">
              <input defaultValue={g.name} onBlur={(e) => renameGroup(g, e.target.value.trim())} className="field h-10 flex-1 py-1 font-semibold" aria-label="Nom du groupe" />
              <button type="button" onClick={() => removeGroup(g)} className="btn-admin-danger">
                Supprimer
              </button>
            </div>
            <SortableList
              items={g.sizes}
              onChange={(next) => reorderSizes(g, next)}
              layout="grid"
              className="flex flex-wrap gap-2"
              renderItem={(s, handle) => (
                <span className="inline-flex items-center rounded-full border border-line bg-white pr-1">
                  {handle}
                  <span className="text-sm">{s.label}</span>
                  <button type="button" onClick={() => removeSize(g, s)} className="flex h-8 w-8 items-center justify-center text-muted hover:text-danger" aria-label={`Supprimer ${s.label}`}>
                    <IconClose size={14} />
                  </button>
                </span>
              )}
            />
            <div className="mt-3 flex gap-2">
              <input
                value={newSizes[g.id] || ''}
                onChange={(e) => setNewSizes((s) => ({ ...s, [g.id]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize(g))}
                placeholder="Nouvelle taille (ex. 7 3/8 (58 cm))"
                className="field"
              />
              <button type="button" onClick={() => addSize(g)} className="btn-admin-ghost shrink-0">
                Ajouter
              </button>
            </div>
          </div>
        ))}
        <form onSubmit={addGroup} className="flex gap-2">
          <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Nouveau groupe (ex. Pointures)" className="field" required />
          <button type="submit" className="btn-admin shrink-0">
            + Groupe
          </button>
        </form>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Types de vêtement</h2>
        <SortableList
          items={types}
          onChange={async (next) => {
            setTypes(next);
            done(await reorder('garment_types', next.map((t) => t.id)));
          }}
          className="divide-y divide-line rounded-lg border border-line"
          renderItem={(t, handle) => (
            <div className="flex items-center gap-2 bg-white px-2 py-1.5">
              {handle}
              <input defaultValue={t.name} onBlur={(e) => renameType(t, e.target.value.trim())} className="field h-10 flex-1 py-1" aria-label="Nom du type" />
              <button type="button" onClick={() => removeType(t)} className="flex h-10 w-10 items-center justify-center text-muted hover:text-danger" aria-label={`Supprimer ${t.name}`}>
                <IconClose size={16} />
              </button>
            </div>
          )}
        />
        <form onSubmit={addType} className="flex gap-2">
          <input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="ex. Manche courte" className="field" required />
          <button type="submit" className="btn-admin shrink-0">
            + Ajouter
          </button>
        </form>
      </section>
    </div>
  );
}
