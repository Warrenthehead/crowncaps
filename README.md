# CrownCaps — boutique en ligne

Boutique streetwear (Gabon) : Next.js 16 (App Router) + React 19 + Tailwind CSS 4, en JavaScript, avec Supabase (base, connexion admin, images). Pas de paiement en ligne : les commandes partent sur WhatsApp.

## Démarrer sur votre PC

1. Installez Node.js 20 ou plus récent (https://nodejs.org, version LTS).
2. Suivez `docs/GUIDE-SUPABASE.md` (création de la base + fichier `.env.local`).
3. Dans le terminal de VS Code :

```bash
npm install
npm run dev
```

4. Boutique : http://localhost:3000 — Admin : http://localhost:3000/admin

## Documentation

- `docs/GUIDE-SUPABASE.md` : base de données, compte admin, clés
- `docs/GUIDE-DEPLOIEMENT.md` : GitHub, Vercel, nom de domaine (DNS), ping quotidien
- `docs/ARCHITECTURE.md` : rôle de chaque dossier, ajouter un modèle de page, changer le design
- `docs/SUIVI.md` : état du projet, décisions, prochaines étapes

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | site en développement (se recharge à chaque modification) |
| `npm run build` | vérifie et prépare la version en ligne |
| `npm run start` | lance la version préparée par `build` |
