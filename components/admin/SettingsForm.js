'use client';

import { useState, useTransition } from 'react';
import SingleImageField from './SingleImageField';
import { useToast } from './Toast';
import { saveSettings } from '@/app/admin/actions/content';
import { IconClose } from '@/components/icons';

// Paramètres de la boutique : nom, logo, WhatsApp, annonces, réseaux, pied de page.
export default function SettingsForm({ settings }) {
  const toast = useToast();
  const [saving, start] = useTransition();
  const [form, setForm] = useState({
    shop_name: settings.shop_name || 'CrownCaps',
    logo_url: settings.logo_url || null,
    whatsapp_number: settings.whatsapp_number || '241',
    announcements: settings.announcements?.length ? settings.announcements : [{ text: '', link: '' }],
    socials: { facebook: '', instagram: '', tiktok: '', ...(settings.socials || {}) },
    footer_text: settings.footer_text || '© CrownCaps, tous droits réservés.',
    shipping_country: settings.shipping_country || 'Gabon',
    seo_description: settings.seo_description || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setAnn = (i, patch) => set('announcements', form.announcements.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  const submit = (e) => {
    e.preventDefault();
    start(async () => {
      const res = await saveSettings(form);
      toast(res.ok ? 'Paramètres enregistrés' : res.error, res.ok ? 'success' : 'error');
    });
  };

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-4 pb-20">
      <section className="card space-y-4">
        <h2 className="font-semibold">Boutique</h2>
        <div>
          <label className="label" htmlFor="shop">
            Nom de la boutique
          </label>
          <input id="shop" className="field" value={form.shop_name} onChange={(e) => set('shop_name', e.target.value)} />
        </div>
        <SingleImageField label="Logo (laisser vide = nom écrit en serif)" ratio="aspect-[3/1]" folder="brand" value={form.logo_url} onChange={(v) => set('logo_url', v)} />
        <div>
          <label className="label" htmlFor="seo">
            Description pour Google (accueil)
          </label>
          <textarea id="seo" rows={2} maxLength={160} className="field" value={form.seo_description} onChange={(e) => set('seo_description', e.target.value)} />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">WhatsApp</h2>
        <div>
          <label className="label" htmlFor="wa">
            Numéro WhatsApp (format international, sans + ni espaces)
          </label>
          <input id="wa" inputMode="numeric" className="field" value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value.replace(/\D/g, ''))} placeholder="24107123456" />
          <p className="mt-1 text-xs text-muted">Indicatif du Gabon : 241. Exemple : 241 + 07 12 34 56 → 24107123456.</p>
        </div>
        {form.whatsapp_number.length >= 8 && (
          <a href={`https://wa.me/${form.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="text-sm underline">
            Tester le lien WhatsApp
          </a>
        )}
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Barre d&apos;annonce</h2>
        {form.announcements.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input className="field" value={a.text} onChange={(e) => setAnn(i, { text: e.target.value })} placeholder="Message (ex. Nouveau à Libreville)" />
              <input className="field" value={a.link} onChange={(e) => setAnn(i, { link: e.target.value })} placeholder="Lien (optionnel)" />
            </div>
            <button type="button" className="flex h-11 w-10 items-center justify-center text-muted hover:text-danger" onClick={() => set('announcements', form.announcements.filter((_, j) => j !== i))} aria-label="Retirer le message">
              <IconClose size={18} />
            </button>
          </div>
        ))}
        <button type="button" className="btn-admin-ghost" onClick={() => set('announcements', [...form.announcements, { text: '', link: '' }])}>
          + Ajouter un message
        </button>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Réseaux sociaux</h2>
        {['facebook', 'instagram', 'tiktok'].map((k) => (
          <div key={k}>
            <label className="label capitalize" htmlFor={k}>
              {k}
            </label>
            <input id={k} className="field" value={form.socials[k] || ''} onChange={(e) => set('socials', { ...form.socials, [k]: e.target.value })} placeholder="https://…" />
          </div>
        ))}
        <p className="text-xs text-muted">Pour les afficher dans le pied de page, ajoutez-les dans Menus → Pied de page → « Réseaux sociaux ».</p>
      </section>

      <section className="card space-y-4">
        <h2 className="font-semibold">Pied de page</h2>
        <div>
          <label className="label" htmlFor="footer">
            Texte du bas
          </label>
          <input id="footer" className="field" value={form.footer_text} onChange={(e) => set('footer_text', e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="country">
            Pays de livraison
          </label>
          <input id="country" className="field" value={form.shipping_country} onChange={(e) => set('shipping_country', e.target.value)} />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-3 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-5xl justify-end">
          <button type="submit" className="btn-admin min-w-32" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </form>
  );
}
