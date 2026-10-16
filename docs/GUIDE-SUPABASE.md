# Guide Supabase (base de données, connexion admin, images)

Supabase est gratuit pour commencer. Il regroupe la base de données, la connexion de l'admin et le stockage des photos.

## Étape 1 — Créer le projet

1. Allez sur https://supabase.com et cliquez sur **Start your project**.
2. Connectez-vous avec GitHub (le plus simple) ou un email.
3. Cliquez sur **New project**.
4. Nom : `crowncaps`. Mot de passe de la base : cliquez sur **Generate a password** et gardez-le dans un endroit sûr.
5. Région : **Europe West (Paris)** ou **Europe Central (Frankfurt)** (les plus proches du Gabon).
6. Plan : **Free**. Cliquez sur **Create new project** et attendez 1 à 2 minutes.

## Étape 2 — Créer les tables (script SQL)

1. Dans le menu de gauche, ouvrez **SQL Editor**.
2. Cliquez sur **New query**.
3. Ouvrez le fichier `supabase/schema.sql` du projet dans VS Code, sélectionnez tout (Ctrl+A), copiez (Ctrl+C).
4. Collez dans Supabase (Ctrl+V) puis cliquez sur **Run** (en bas à droite).
5. Vous devez voir **Success. No rows returned**.
6. Vérifiez dans **Table Editor** : les tables `products`, `categories`, `colors`… existent et contiennent 6 produits d'exemple.

Le script peut être relancé sans danger : il ne crée rien en double.

## Étape 3 — Récupérer les clés

1. Menu de gauche : **Project Settings** (roue dentée) → **API** (ou **Data API** / **API Keys** selon la version).
2. Copiez :
   - **Project URL** (ex. `https://abcdefgh.supabase.co`)
   - la clé **anon public** (longue chaîne qui commence par `eyJ…`, ou une clé « publishable » `sb_publishable_…` selon la version)
3. Ne copiez **jamais** la clé `service_role` / `secret` dans le projet : elle n'est pas nécessaire.

## Étape 4 — Fichier `.env.local` (pour travailler sur votre PC)

1. À la racine du projet, dupliquez `.env.example` et renommez la copie `.env.local`.
2. Remplissez :

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...votre-cle-anon...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=une-longue-chaine-au-hasard-par-exemple-48-caracteres
```

3. Dans le terminal de VS Code : `npm install` puis `npm run dev`.
4. Ouvrez http://localhost:3000 : la boutique s'affiche avec les produits d'exemple.

`.env.local` n'est jamais envoyé sur GitHub (il est dans `.gitignore`).

## Étape 5 — Créer votre compte administrateur

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Entrez votre email et un mot de passe solide. Cochez **Auto Confirm User**. Cliquez sur **Create user**.
3. Retournez dans **SQL Editor** → **New query**, collez ceci en remplaçant l'email :

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'votre@email.com';
```

4. Cliquez sur **Run**. Résultat attendu : `Success. 1 row`.
5. Ouvrez http://localhost:3000/admin et connectez-vous.

## Étape 6 — Bloquer les inscriptions publiques (sécurité)

1. **Authentication** → **Sign In / Providers** (ou **Providers**) → **Email**.
2. Désactivez **Allow new users to sign up** puis **Save**.

Même si quelqu'un créait un compte, il ne pourrait rien modifier : seuls les comptes listés dans la table `admins` ont le droit d'écrire (règles RLS).

## Étape 7 — Vérifier le stockage des images

1. Menu **Storage** : un bucket `images` doit exister, marqué **Public**.
2. S'il n'apparaît pas, relancez le script `schema.sql`.

## Mise en pause du plan gratuit

Un projet gratuit inactif pendant 7 jours est mis en pause. Le site appelle automatiquement `/api/cron/ping` chaque jour (fichier `vercel.json`) pour l'éviter. Voir `docs/GUIDE-DEPLOIEMENT.md`, étape 6.

## Remplacer les produits d'exemple

Dans l'admin → **Produits** : cochez les 6 produits d'exemple → **Supprimer**. Les images d'exemple (`public/placeholders/`) peuvent rester, elles ne gênent pas.
