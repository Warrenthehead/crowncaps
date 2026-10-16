# SUIVI — état du projet CrownCaps

_Dernière mise à jour : 16 octobre 2026. Phases 1, 2 et 3 livrées ; phase 4 en partie (guides de déploiement écrits, mise en ligne à faire par vous)._

## Ce qui est fait

**Phase 1 — Fondations**
- Projet Next.js 16 (App Router) + React 19 + Tailwind 4, JavaScript, sans TypeScript.
- Script SQL unique `supabase/schema.sql` : 15 tables, règles RLS, bucket d'images, données de départ (11 couleurs, 3 groupes de tailles, 3 types de vêtement, 5 catégories, 6 produits, 5 pages, 2 menus, 6 sections d'accueil). Testé sur PostgreSQL 16, relançable sans doublon.
- Tokens de design dans `app/globals.css` (polices Assistant + Playfair Display auto-hébergées).
- En-tête collant, barre d'annonce défilante, volet burger, pied de page en accordéons « + », drapeau du Gabon.
- Composants de base : carte produit (4:5, écart 6 px, badge Vendu bleu nuit), boutons pilule, squelettes, image avec apparition flou → net.

**Phase 2 — Boutique client**
- Accueil par sections (ordre réglable) : diaporama 1/2, grille vedette, bannière, tuiles catégories, carrousel 1/3, grille paginée 1/3.
- Collections, page catégorie avec tri (récents, prix ↑↓, A–Z, plus vendus) et filtres (taille, couleur, type, disponibilité), `/collections/tous`.
- Fiche produit : galerie balayable + miniatures + zoom, pastille marque dorée, sélecteurs taille/couleur, 3 modèles (Standard, À venir avec compte à rebours et bascule automatique, Vendu), « Vous aimerez aussi ».
- Panier (localStorage), notification d'ajout, page panier, commande WhatsApp (panier complet ou achat direct), repli si message trop long, boutons « Me prévenir ».
- Recherche (nom, code), pages simples, SEO : titres, Open Graph (photo dans l'aperçu WhatsApp), sitemap, robots, données structurées Product.
- Bouton flottant WhatsApp à la place du « C ».

**Phase 3 — Admin** (`/admin`, utilisable sur téléphone)
- Connexion email + mot de passe, un seul admin (table `admins`).
- Produits : liste avec recherche, filtres, 8 tris dont Aléatoire et Manuel (glisser-déposer), actions groupées (catégorie, statut, modèle, publier/masquer, supprimer), dupliquer, « Marquer comme vendu ».
- Formulaire produit complet + compresseur d'images (WebP 1600 px ≤ 300 Ko + miniature 600 px ≤ 80 Ko, 10 images, progression, avant → après, ordre, image principale). Ajout de couleur / taille / type à la volée.
- Catégories, Couleurs & tailles, Pages, Menus (2 niveaux), Page d'accueil (sections glissables), Paramètres.

**Phase 4 — Finitions**
- Animations légères (volets, notification, fondus, zoom au survol PC), respect de « réduire les animations ».
- Ping quotidien Supabase via `vercel.json` + bascule des produits « À venir ».
- Guides de déploiement écrits. Testé : build OK, toutes les pages en 200, parcours d'achat et admin complets sur une base de test, aucune erreur console.

## Décisions prises

- **Hypothèses section 12 appliquées** : pas de comptes clients ni paiement, bouton flottant WhatsApp, prix « 12,000F », logo texte serif, un admin, marque « CrownCaps ».
- Images servies avec `<img>` + `srcset` (pas le service d'images Vercel) : pas de dépendance Vercel, et les photos sont déjà optimisées à l'envoi.
- Tri/filtres d'une catégorie faits dans le navigateur : instantané et la page reste en cache.
- Taille et couleur obligatoires aussi pour « Ajouter au panier » (sinon la commande WhatsApp serait incomplète). Choix automatique s'il n'y a qu'une option.
- Le bouton « Procéder au paiement » ouvre WhatsApp (pas de page de paiement).
- Un produit « À venir » peut venir de son statut OU de son modèle ; à la date de sortie il passe en Standard (à l'affichage tout de suite, en base par le ping quotidien).
- Tailles organisées en **groupes** (Vêtements, Casquettes fitted, Taille unique) ; chaque catégorie propose un groupe par défaut dans le formulaire produit.
- Description produit : `**gras**` et lignes `- ` pour les listes (pas d'éditeur lourd).

## Ce que vous devez configurer

1. Supabase : `docs/GUIDE-SUPABASE.md` (projet, script SQL, clés, compte admin).
2. Votre vrai numéro WhatsApp dans Admin → Paramètres.
3. Vos catégories, vrais produits et photos (supprimer les 6 exemples).
4. GitHub + Vercel + domaine : `docs/GUIDE-DEPLOIEMENT.md`.
5. Votre logo : Admin → Paramètres → Logo.

## Prochaine étape suggérée

Mise en ligne (guide de déploiement), puis test sur votre téléphone et mesure Lighthouse mobile avec vos vraies photos. Ensuite, ajustements de design à partir de ce que vous voyez en vrai.
