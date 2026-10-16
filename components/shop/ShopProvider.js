'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { openWhatsAppOrder } from '@/lib/whatsapp';

// =====================================================================
//  ETAT GLOBAL DE LA BOUTIQUE (côté navigateur)
//  - panier mémorisé dans localStorage
//  - notification "Article ajouté au panier"
//  - repli WhatsApp quand le message est trop long
// =====================================================================

const STORAGE_KEY = 'crowncaps-cart-v1';
const ShopContext = createContext(null);

// Une même référence avec une autre taille/couleur = une ligne séparée.
export function cartKey(productId, size, color) {
  return [productId, size || '-', color || '-'].join('|');
}

export default function ShopProvider({ settings, children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const [fallback, setFallback] = useState(null);

  // Lecture du panier au chargement
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      // panier illisible : on repart de zéro
    }
    setReady(true);
  }, []);

  // Sauvegarde à chaque changement
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // stockage plein ou désactivé : le panier reste en mémoire
    }
  }, [items, ready]);

  // Synchronise plusieurs onglets ouverts
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setItems(JSON.parse(e.newValue || '[]'));
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((item, quantity = 1) => {
    const key = cartKey(item.productId, item.size, item.color);
    setItems((current) => {
      const existing = current.find((i) => i.key === key);
      if (existing) {
        return current.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i));
      }
      return [...current, { ...item, key, quantity }];
    });
    setLastAdded({ ...item, key, at: Date.now() });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.key !== key)
        : current.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, quantity) } : i))
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((current) => current.filter((i) => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Envoie une liste d'articles sur WhatsApp (panier complet ou achat direct)
  const checkout = useCallback(
    async (list) => {
      const result = await openWhatsAppOrder(settings.whatsapp_number, list, settings.shop_name);
      if (result.fallback) setFallback(result);
      return result;
    },
    [settings.whatsapp_number, settings.shop_name]
  );

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((n, i) => n + i.quantity * i.price, 0);
    return {
      settings,
      items,
      ready,
      count,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      checkout,
      lastAdded,
      dismissNotification: () => setLastAdded(null),
      fallback,
      closeFallback: () => setFallback(null),
    };
  }, [settings, items, ready, addItem, updateQuantity, removeItem, clearCart, checkout, lastAdded, fallback]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop doit être utilisé dans <ShopProvider>');
  return ctx;
}
