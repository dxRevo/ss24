# CLAUDE.md — 24 Services & Supplies

Site vitrine (français) de **24 Services & Supplies**, société technique basée à Dakar (BTP, énergie, hydraulique, fourniture industrielle, ingénierie). Généré à l'origine via Hostinger Horizons ; l'utilisateur le republie lui-même.

## Direction du projet (décidée avec l'utilisateur)

- **Hébergement : Hostinger** (Premium + domaine déjà achetés chez Hostinger, tranché le 2026-09-29). Le déploiement se fera probablement via **GitHub Actions → export FTP vers `public_html`** (le site pré-rendu est un dossier statique) — pas encore configuré.
- **Formulaires : script PHP** (`apps/web/public/php/send.php`), envoyé par mail via `mail()`. Netlify Forms écarté (nécessiterait d'héberger sur Netlify).
- **PocketBase retiré** (2026-09-29) : plus de binaire, plus de dépendance `pocketbase`, plus de collections. Le code mort qui l'accompagnait (auth non branchée, plugin Horizons dédié) a été supprimé avec.
- **Site pré-rendu en statique** (2026-09-29) : `ssr: false` + `prerender` dans `react-router.config.ts`. Plus de serveur Node en production — `dist/apps/web/client/` est un dossier de fichiers statiques prêt à être déposé dans `public_html`. Les routes `/api/health` et `/api/*` ont été retirées (un serveur ne tourne plus, elles ne pouvaient plus répondre).
- `app.tar.gz` (racine) est un **instantané figé de l'état d'origine (Horizons, avec PocketBase)** : il diverge maintenant significativement du code actuel. Ne pas s'y fier pour comprendre l'état présent ; ne pas l'éditer. Le dossier n'est toujours pas un dépôt Git.

## Règles de travail (à respecter en permanence)

- **Ne pas relire tout le projet.** Consulter uniquement les fichiers nécessaires à la tâche en cours (utiliser Grep/Glob pour cibler). Ce fichier suffit à s'orienter.
- **Ne jamais écrire ni afficher de secret** (mots de passe, clés API, contenu de `.env`, valeurs de variables). Ne citer que les *noms* de variables.
- Ne pas commit / push sans demande explicite. (Le dossier n'est actuellement **pas** un dépôt Git.)
- Ne pas modifier `apps/web/src/components/ui/` (composants shadcn générés, exclus du lint) ni `apps/web/plugins/` (outillage Horizons) sauf demande explicite.
- Après une tâche importante : **mettre à jour `PROGRESS.md` et `TODO.md`**.
- Répondre à l'utilisateur en français. Le contenu du site est en français (`<html lang="fr">`).

## Stack

- **Front** (`apps/web`, seul workspace restant) : React 19, **React Router 8 en mode framework, entièrement pré-rendu** (`ssr: false` + `prerender`, aucun serveur en production), Vite 7, TypeScript strict, Tailwind CSS 3 + tailwindcss-animate, shadcn/ui (style new-york, Radix), lucide-react, **framer-motion** (animations de défilement, voir `lib/motion.ts`), zod, react-hook-form, sonner.
- **Formulaires** : `apps/web/public/php/send.php` — script PHP autonome (aucune dépendance npm), copié tel quel dans le build par Vite (`public/` → `dist/apps/web/client/`). Fonctionne sur un hébergement mutualisé Hostinger ; ne fonctionne pas en local (pas de PHP dans `npm run dev`).
- **Outillage racine** : `knip` (config `knip.json`). Node : **22** (`.nvmrc`). `.version` contient `17` (signification non documentée).

## Architecture

```
package.json               scripts racine (dev/build/start/lint/typecheck → délèguent à apps/web), workspace apps/web
apps/web/
  react-router.config.ts   appDirectory=src, build → ../../dist/apps/web, ssr=false, prerender() liste les 9 chemins
  vite.config.ts           alias @ → src ; plugins Horizons (dev) ; hôtes *.app-preview.com/.io
  .env                     secrets serveur (NE PAS LIRE/AFFICHER) — jamais de préfixe VITE_ pour un secret
  public/
    php/send.php           reçoit les 2 formulaires (contact + newsletter), envoie un e-mail, anti-spam honeypot
                           (copié tel quel dans dist/apps/web/client/php/send.php par le build)
  src/
    root.tsx               Layout HTML, loader (origine du site, fixe — pas de `headers()`, invalide en prerender), ErrorBoundary
    routes.ts              table de routes (voir ci-dessous)
    routes/                un fichier par route ; `meta` via `seo()` de lib/seo.ts
    components/            site-header, site-footer, page-hero ; dossiers home/ (dont sectors.tsx) about/ services/ contact/
    components/ui/         shadcn (généré, ne pas modifier)
    data/site.ts           contenu : constantes (images, EMAIL, WHATSAPP), `services[]` (5, avec benefits/sectors),
                           `sectors[]` (5 secteurs accompagnés), `faqs[]` (8)
    lib/                   seo.ts, site-origin.server.ts (origine fixe, constante),
                           motion.ts (variants framer-motion partagés : fadeUp, stagger, revealViewport)
    hooks/                 use-mobile, use-toast
    index.css              styles globaux + classes utilitaires (.section-pad, .section-title, .cta-button…)
  plugins/                 plugins Vite Horizons (éditeur visuel, logger, runtime, session-journal)
```

### Routes (`apps/web/src/routes.ts`)

`/` (home) · `/a-propos` · `/services` · `/services/:slug` (404 si slug inconnu, non prérendu) · `/contact` · `/sitemap.xml` · `/robots.txt`. Toutes prérendues en HTML statique (voir `prerender()` dans `react-router.config.ts`) ; **toute nouvelle route doit être ajoutée à cette fonction**, sinon elle ne produit aucun fichier. Il n'y a plus de routes `/api/*` : un hébergement statique ne peut pas les exécuter, elles ont été retirées avec leur infrastructure dédiée (`lib/api.server.ts`, `lib/rate-limit.server.ts`, `lib/logger.server.ts`).

### Flux de données

- Contenu statique dans `src/data/site.ts` (services, secteurs, FAQ, liens). Le sitemap et la navigation en dérivent.
- Formulaire de contact (`contact-content.tsx`) et newsletter (`site-footer.tsx`) : `fetch('/php/send.php', { method: 'POST', body: FormData })`, avec un champ caché `_form` (`contact`/`newsletter`) et un champ honeypot `company`. Le script répond `{ok:true}` / `{ok:false,error}` en JSON. Ne fonctionne que sur l'hébergement réel (PHP), jamais en local.
- `siteOrigin()` (`lib/site-origin.server.ts`) est une **constante fixe** (`https://24servicesandsupplies.com`), pas dérivée d'une requête : le site est prérendu au build, il n'y a pas de requête réelle à lire. La changer si le domaine change.

## Conventions

- **Style du code existant** : composants et routes du site écrits en *une ligne dense* (peu de retours à la ligne), guillemets simples, alias `@/…`, TypeScript strict. Se conformer au style du fichier édité ; ne pas reformater massivement.
- Palette : navy `#0A1F44`, bleu `#0B4FD6`, orange `#FF7A00→#FFB300`. Polices Montserrat (titres) / Inter (texte).
- Nouvelle page : créer `routes/x.tsx` avec `meta` via `seo({matches,location},{title,description})`, l'ajouter à `routes.ts`, et à `STATIC_PATHS` de `routes/sitemap.xml.ts` si elle est publique.
- Animation d'une nouvelle section : réutiliser `fadeUp`/`stagger`/`revealViewport` de `lib/motion.ts` plutôt que redéfinir des variants ad hoc.
- ESLint : règle `import/no-cycle` en erreur ; plugin maison sur les échappements unicode (`eslint.unicode-escapes-*.mjs`) — garder les accents en clair dans le JSX/TSX.

## Commandes utiles

Depuis la racine (`/Users/mac/Downloads/ss24`) :

```bash
npm install                # dépendances déjà installées normalement
npm run dev                # apps/web seul (port 3000) — /php/send.php ne répond pas en local (pas de PHP)
npm run build              # prérend tout → dist/apps/web/client (à uploader tel quel sur Hostinger)
npm run start              # sert dist/apps/web/server/index.js — aperçu local uniquement, jamais utilisé en prod
npm run lint               # eslint sur apps/web
npm run typecheck          # react-router typegen && tsc --noEmit
npx knip                   # détection de code mort (quelques faux positifs préexistants, voir TODO)
```

Variables d'environnement (noms seulement, dans `apps/web/.env`) : aucune n'est actuellement définie (fichier vide, juste des commentaires).

## Pièges connus

- Pas de dépôt Git, pas de tests automatisés, pas de README dans ce projet.
- `/php/send.php` n'existe que dans `dist/apps/web/client/php/` (copié depuis `public/`), jamais en local — les formulaires afficheront une erreur en `npm run dev`, c'est attendu.
- Toute page ajoutée à `routes.ts` doit aussi être ajoutée à `prerender()` dans `react-router.config.ts`, sinon `npm run build` ne produit pas son HTML.
- `/Users/mac/Desktop/portail` (Django, PETROSEN) est un projet **sans rapport**, simplement présent comme répertoire additionnel de la session.
