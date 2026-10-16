# Mise en ligne : GitHub → Vercel → votre nom de domaine

Prérequis : le guide Supabase est terminé et le site marche sur votre PC (`npm run dev`).

## Étape 1 — Mettre le code sur GitHub

1. Créez un compte sur https://github.com si besoin.
2. Cliquez sur **+** (en haut à droite) → **New repository**.
3. Nom : `crowncaps`. Choisissez **Private**. Ne cochez rien d'autre. **Create repository**.
4. Dans le terminal de VS Code, à la racine du projet :

```bash
git init
git add .
git commit -m "Site CrownCaps"
git branch -M main
git remote add origin https://github.com/Warrenthehead/crowncaps.git
git push -u origin main
```

5. Rafraîchissez la page GitHub : vos fichiers apparaissent. Vérifiez que `.env.local` n'y est **pas**.

## Étape 2 — Importer dans Vercel

1. Allez sur https://vercel.com → **Sign Up** → **Continue with GitHub**.
2. **Add New…** → **Project** → choisissez le dépôt `crowncaps` → **Import**.
3. Framework : **Next.js** (détecté automatiquement). Ne changez rien d'autre.
4. Ouvrez **Environment Variables** et ajoutez ces 4 lignes (Name / Value) :

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | votre Project URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | votre clé anon |
| `NEXT_PUBLIC_SITE_URL` | `https://www.votredomaine.com` (sans `/` à la fin) |
| `CRON_SECRET` | la même longue chaîne que dans `.env.local` |

5. Cliquez sur **Deploy** et attendez 1 à 2 minutes.
6. Cliquez sur l'aperçu : le site est en ligne sur une adresse `xxx.vercel.app`.

Chaque `git push` sur `main` remettra le site à jour automatiquement.

## Étape 3 — Connecter votre nom de domaine

1. Vercel → votre projet → **Settings** → **Domains**.
2. Tapez `votredomaine.com` → **Add**. Acceptez la proposition d'ajouter aussi `www.votredomaine.com` (redirection recommandée vers `www`).
3. Vercel affiche les enregistrements DNS à créer. En général :

| Type | Nom (Host) | Valeur |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

   Utilisez **exactement** les valeurs affichées par Vercel si elles diffèrent (Vercel les met parfois à jour).
4. Connectez-vous chez votre registrar (là où vous avez acheté le domaine) → **Gestion DNS** / **Zone DNS**.
5. Supprimez les anciens enregistrements `A` sur `@` et `CNAME` sur `www` s'ils existent (souvent une page « parking »).
6. Ajoutez les deux enregistrements ci-dessus et enregistrez.
7. Attendez : de 10 minutes à quelques heures. Dans Vercel, la pastille passe au vert (**Valid Configuration**). Le certificat HTTPS est créé automatiquement.

## Étape 4 — Mettre à jour l'adresse du site

1. Vercel → **Settings** → **Environment Variables** → modifiez `NEXT_PUBLIC_SITE_URL` = `https://www.votredomaine.com`.
2. **Deployments** → sur le dernier déploiement, menu **⋯** → **Redeploy**.

Cette adresse est utilisée dans les liens des messages WhatsApp, le sitemap et les aperçus (photo du produit).

## Étape 5 — Autoriser votre domaine dans Supabase

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL** : `https://www.votredomaine.com` → **Save**.

## Étape 6 — Ping quotidien (garder Supabase éveillé)

Rien à faire : le fichier `vercel.json` demande à Vercel d'appeler `/api/cron/ping` tous les jours à 6 h (UTC). Vercel envoie automatiquement `CRON_SECRET`.

Pour vérifier : Vercel → projet → **Settings** → **Cron Jobs** : la tâche `/api/cron/ping` est listée. Vous pouvez cliquer sur **Run** pour la tester.

Ce ping publie aussi les produits « À venir » dont la date de sortie est passée.

**Alternative si vous quittez Vercel** : créez `.github/workflows/ping.yml` dans le dépôt :

```yaml
name: Ping Supabase
on:
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" https://www.votredomaine.com/api/cron/ping
```

Puis GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** : `CRON_SECRET`.

## Étape 7 — Derniers réglages dans l'admin

1. Ouvrez `https://www.votredomaine.com/admin` et connectez-vous.
2. **Paramètres** : vérifiez le numéro WhatsApp (ex. `24107123456`), puis **Tester le lien WhatsApp**.
3. Envoyez-vous un lien produit sur WhatsApp : l'aperçu doit afficher la photo. (Les images d'exemple en SVG n'en affichent pas : ce sera le cas avec vos vraies photos.)

## Vérifier la vitesse (Lighthouse)

Chrome → ouvrez le site → clic droit **Inspecter** → onglet **Lighthouse** → **Mobile** → **Analyze page load**. Objectif : 90 ou plus. Les plus gros gains viennent des photos : passez toujours par l'admin (compression automatique).
