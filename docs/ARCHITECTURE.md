# Architecture du projet

```
crowncaps/
├── app/                        Pages (Next.js App Router)
│   ├── layout.js               Polices, balises SEO communes
│   ├── globals.css             TOKENS DE DESIGN (couleurs, polices, boutons)
│   ├── (shop)/                 La boutique (le dossier entre () n'apparaît pas dans l'URL)
│   │   ├── layout.js           Barre d'annonce, en-tête, pied de page, panier
│   │   ├── page.js             Accueil (sections réglées dans l'admin)
│   │   ├── collections/        /collections et /collections/[slug] (+ /collections/tous)
│   │   ├── produits/[slug]/    Fiche produit + SEO + données structurées
│   │   ├── panier/             Page panier
│   │   ├── recherche/          Recherche
│   │   ├── pages/[slug]/       Pages simples (Aide, FAQ…)
│   │   ├── loading.js          Squelettes pendant le chargement
│   │   └── error.js            Message d'erreur clair
│   ├── admin/
│   │   ├── login/              Connexion
│   │   ├── (panel)/            Écrans de l'admin (protégés)
│   │   └── actions/            Enregistrements (Server Actions, côté serveur)
│   ├── api/cron/ping/          Ping quotidien Supabase
│   ├── sitemap.js, robots.js   SEO
├── components/
│   ├── shop/                   En-tête, volet, pied de page, panier (contexte), WhatsApp
│   ├── home/                   Sections d'accueil (diaporama, grille, carrousel…)
│   ├── collection/             Tri + filtres d'une catégorie
│   ├── product/                Galerie, sélecteurs taille/couleur, compte à rebours
│   ├── cart/                   Page panier
│   ├── ui/                     Carte produit, image optimisée, pagination, squelettes
│   └── admin/                  Tous les écrans de l'admin
├── templates/                  MODELES DE PAGE PRODUIT (Standard, À venir, Vendu)
├── lib/
│   ├── data.js                 Lecture des données pour la boutique
│   ├── products.js             Statut/modèle effectifs, tri
│   ├── whatsapp.js             Messages et liens WhatsApp
│   ├── compress-image.js       Compresseur d'images (navigateur)
│   ├── supabase/               Clients Supabase (public, serveur, navigateur)
│   └── admin/                  Sécurité et lectures de l'admin
├── public/placeholders/        Images d'exemple
├── supabase/schema.sql         Script SQL unique
├── proxy.js                    Protège /admin (redirige vers la connexion)
└── vercel.json                 Tâche quotidienne (ping)
```

## Comment ça marche

- **Lecture** : les pages de la boutique lisent Supabase avec la clé publique. Elles sont mises en cache (rapides) et régénérées dès qu'on enregistre quelque chose dans l'admin (`revalidatePath`), sinon toutes les 10 minutes.
- **Écriture** : l'admin enregistre via des Server Actions (`app/admin/actions/`). Elles utilisent la session de l'admin ; la base refuse toute écriture d'un compte qui n'est pas dans la table `admins` (RLS). Aucune clé secrète n'est utilisée.
- **Images** : compressées dans le navigateur (WebP, 1600 px, ≤ 300 Ko + miniature 600 px ≤ 80 Ko), puis envoyées directement dans Supabase Storage. Le site les affiche avec `<img loading="lazy">` et un `srcset` (miniature / grande).
- **Panier** : dans le navigateur (localStorage + React Context, `components/shop/ShopProvider.js`).
- **Commande** : `lib/whatsapp.js` construit le message. Au-delà de 1 800 caractères, le message complet est copié et une fenêtre explique comment le coller.
- **Tri et filtres** des catégories : faits instantanément dans le navigateur (`components/collection/CollectionBrowser.js`), l'adresse garde les choix (`?tri=price_asc&taille=M`).

## Ajouter un modèle de page produit

1. Copiez `templates/Standard.js` en `templates/Precommande.js` et modifiez-le.
2. Dans `templates/registry.js`, ajoutez `{ key: 'precommande', label: 'Précommande', description: '…' }`.
3. Dans `templates/index.js`, ajoutez `import Precommande from './Precommande';` et `precommande: Precommande,`.
4. Le modèle apparaît tout seul dans l'admin (produits, catégories, actions groupées).

## Changer le design

Tout est dans `app/globals.css`, bloc `@theme` : couleurs (`--color-ink`, `--color-navy`, `--color-gold`…), polices, conteneur. Les classes `.btn-primary`, `.pill-gold`, `.badge-sold`, `.section-title` sont juste en dessous.
