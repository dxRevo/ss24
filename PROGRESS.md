# PROGRESS.md — État du projet

_Dernière mise à jour : 2026-09-29. À mettre à jour après chaque tâche importante._

## Contexte de l'analyse

- Le dossier **n'est pas un dépôt Git** : aucun historique n'est consultable, cet historique vit uniquement dans cette conversation.
- `app.tar.gz` (racine) est un **instantané figé de l'état d'origine** (export Hostinger Horizons, avec PocketBase) : il diverge maintenant significativement du code actuel. Ne pas s'y fier pour l'état présent.

## Direction décidée

- **Hébergement : Hostinger** (Premium + domaine déjà achetés là-bas) — tranché le 2026-09-29, après une hésitation avec Netlify.
- **Formulaires : script PHP** (`apps/web/public/php/send.php`) — fait le 2026-09-29.
- **PocketBase : retiré** — fait le 2026-09-29 (voir plus bas).
- **Pré-rendu statique** (`ssr: false` + `prerender`) — fait le 2026-09-29 (voir plus bas).
- Déploiement (GitHub + Actions → FTP Hostinger) : **pas encore configuré**. C'est la prochaine grosse étape.

## Fonctionnalités présentes (code écrit)

- Site vitrine FR en SSR : accueil (hero, présentation, secteurs accompagnés, offre, « plus » avec FAQ), À propos (engagement QHSE détaillé, témoignages sectoriels, raisons de confiance), Services (liste de 5), fiche service dynamique `/services/:slug` (bénéfices + secteurs concernés, 404 si slug inconnu), Contact (rappel du processus en 3 étapes).
- Contenu centralisé dans `apps/web/src/data/site.ts` : 5 services (chacun avec `benefits`, `sectors` et `faqs` — 3 questions par service), `sectors[]` (4 secteurs accompagnés), `faqs[]` globales (8), e-mail de contact.
- SEO : `seo()` (title, description, canonical/og, JSON-LD Organization sur l'accueil), `sitemap.xml`, `robots.txt`, header `Link` vers le sitemap.
- **Formulaires → PHP** : le formulaire de contact et l'inscription newsletter postent en `FormData` vers `/php/send.php`, qui envoie un e-mail à `contact@24servicesandsupplies.com` et répond en JSON. Anti-spam par champ honeypot (`company`, invisible pour un humain).
- Animations de défilement (`framer-motion` + `lib/motion.ts`) sur l'accueil, À propos, Services et Contact ; FAQ et menu mobile animés.
- Le site est **entièrement statique** : `dist/apps/web/client/` (956 Ko) contient un `index.html` par page, `sitemap.xml`, `robots.txt` et `php/send.php`, prêt à être déposé dans `public_html` chez Hostinger. Plus de routes `/api/*` ni de serveur Node en production.

## Mise à jour 2026-09-29 — Retrait de PocketBase + script PHP

À la demande explicite de l'utilisateur (« enlève PocketBase et toutes les choses inutiles ») :

- **Supprimé** : `apps/pocketbase/` en entier (binaire, migrations, hooks, données SQLite — sauvegardé par précaution dans le scratchpad de la session, hors du projet, car pas de Git), `lib/pocketbase-client.ts`, `lib/pocketbase-client.server.ts` (superuser, non utilisé nulle part), `lib/require-auth.ts` et `hooks/use-auth.ts` (système de connexion préparé mais jamais branché à une route), `plugins/vite-plugin-pocketbase-auth.ts` et `plugins/pocketbase-auth-client.ts` (plugin Horizons dédié à l'aperçu PocketBase dans leur éditeur).
- **Nettoyé en conséquence** : import et usage du plugin dans `vite.config.ts` ; déclarations de module dans `vite-env.d.ts` ; script de prévisualisation dans `horizons-preview-scripts.tsx` ; dépendance `pocketbase` dans `apps/web/package.json` ; scripts racine `dev`/`start` (ne lancent plus un process PocketBase en parallèle, `concurrently` retiré car devenu inutile avec un seul workspace) ; `workspaces` réduit à `apps/web` ; entrées obsolètes dans `knip.json`.
- **Créé** : `apps/web/public/php/send.php`, un script PHP autonome qui reçoit les deux formulaires (distingués par un champ `_form`), valide les champs, filtre un honeypot anti-spam, et envoie un e-mail via `mail()` avec `Reply-To` sur l'expéditeur.
- **Reconnecté** : `contact-content.tsx` et `site-footer.tsx` postent maintenant en `fetch` vers `/php/send.php` au lieu d'appeler PocketBase.
- **Lockfile** : `apps/pocketbase` laissait une entrée `"extraneous": true` résiduelle dans `package-lock.json` après `npm install` ; retirée manuellement (édition JSON ciblée), puis `npm install` revérifié propre.
- **Vérifié** : `npm run typecheck`, `npm run lint`, `npm run build` passent sans erreur. Le chunk client `pocketbase-client` (~39 Ko gzip) a bien disparu du build. `npx knip` ne référence plus PocketBase ; les seuls signalements restants (`@hookform/resolvers`, `date-fns`, `zod` non utilisés ; imports `@babel/*` non déclarés dans les plugins Horizons ; type `Domain` non exporté ailleurs) sont préexistants et sans rapport avec ce nettoyage — non traités ici.
- **Non vérifié** : l'envoi réel d'e-mail par `send.php` (le PHP ne s'exécute pas en local ; à tester une fois déployé sur Hostinger).

## Mise à jour 2026-09-29 — Passage en pré-rendu statique

- **`react-router.config.ts`** : `ssr: false` + `prerender()` listant les 9 chemins publics (import de `services` depuis `data/site.ts` pour générer les 5 `/services/<slug>` automatiquement — toute page ajoutée à `routes.ts` doit aussi être ajoutée ici).
- **`lib/site-origin.server.ts`** : `siteOrigin()` ne dérive plus l'origine d'une requête (il n'y en a plus au moment du build) — c'est maintenant une **constante fixe**, `https://24servicesandsupplies.com` (déduite de l'adresse e-mail déjà présente dans le code ; **à confirmer** que c'est bien le domaine acheté chez Hostinger, sinon changer cette seule ligne).
- **`root.tsx`** : le loader ne prend plus `request` ; l'export `headers()` a été retiré (React Router **refuse de builder** si une route en garde un en mode `ssr:false` — erreur constatée puis corrigée). Le header `Link: rel=sitemap` disparaît avec (aucun serveur pour l'envoyer de toute façon) ; le sitemap reste annoncé via la ligne `Sitemap:` de `robots.txt`.
- **`sitemap.xml.ts` / `robots.txt.ts`** : mêmes ajustements (plus de `request`) ; la logique « hôte non publié » de `robots.txt` (détection `*.app-preview.com` etc.) a été retirée — sans objet une fois l'origine fixée sur le vrai domaine.
- **Supprimé, devenu impossible à exécuter sans serveur** : routes `/api/health` et `/api/*`, et toute leur infrastructure dédiée (`lib/api.server.ts`, `lib/rate-limit.server.ts`, `lib/logger.server.ts`) — plus aucun importeur ailleurs, confirmé avant suppression. Dépendances `ipaddr.js` et `rate-limiter-flexible` retirées du `package.json` en conséquence.
- **`knip.json`** : entrées correspondantes retirées.
- **Vérifié** : `npm run typecheck`, `npm run lint`, `npm run build` passent sans erreur. Le build produit bien un `index.html` par page (`/`, `/a-propos`, `/services`, `/contact`, 5× `/services/<slug>`), `sitemap.xml` et `robots.txt` en fichiers statiques avec la bonne URL de domaine dedans, et `php/send.php` copié tel quel. `npm run start` testé en local : sert correctement les pages prérendues et répond 404 sur un chemin inconnu.
- **À confirmer par l'utilisateur** : le domaine `24servicesandsupplies.com` codé en dur dans `site-origin.server.ts` est-il bien celui acheté chez Hostinger ?

## Mise à jour 2026-09-29 — Contenu retravaillé à partir d'apsxyz.ca (reformulé)

À la demande de l'utilisateur, qui voulait s'inspirer des **textes réels** d'un concurrent du secteur (apsxyz.ca, Dakar/Calgary) plutôt que de sa seule structure :

- J'ai extrait le texte verbatim de leur accueil, page à propos, contact et de leurs 5 pages service (via lecture web), pour en comprendre le style et les tournures de phrase — pas pour le copier.
- **Ajouté** : une FAQ propre à chaque service (`faqs` dans chaque objet `Service` de `data/site.ts`, 3 questions/réponses), affichée dans une nouvelle section « 05 / Questions fréquentes » de `service-detail.tsx` (accordéon animé, même mécanique que la FAQ de l'accueil). C'est le principal apport structurel de ce passage : apsxyz a une FAQ par page service, notre site n'en avait qu'une seule globale.
- **Reformulé** (texte différent, mêmes idées) : l'intro de la page À propos, sur le schéma rhétorique « [Entreprise] n'est pas un simple X, c'est Y » repéré chez eux ; l'intro de la page Contact, avec une phrase courte inspirée de leur accroche « chaque grand projet commence par une conversation ».
- **Volontairement écarté** : leurs chiffres et affirmations propres à leur entreprise (« -40 % de consommation énergétique », « 15+ partenaires », marques CAT/Siemens/ABB, témoignages attribués, bureaux Dakar+Calgary, leurs coordonnées) — les reprendre aurait inventé des faits faux sur 24 Services & Supplies.
- **Vérifié** : `npm run typecheck`, `npm run lint`, `npm run build` passent sans erreur ; le nouveau texte des FAQ par service est bien présent dans le HTML prérendu (vérifié par recherche du texte dans le fichier généré).

## Mise à jour 2026-09-29 — Identité propre (les 5 catégories de services étaient quasi identiques à apsxyz.ca)

En comparant plus attentivement, l'utilisateur a repéré que les **5 catégories de services** (déjà présentes dans le site **avant** mon intervention, dès la toute première lecture du projet) portaient les mêmes intitulés qu'apsxyz.ca, dans le même ordre, et que plusieurs sous-domaines à l'intérieur de chaque service correspondaient presque mot pour mot aux leurs (« Électrification rurale », « Traitement des eaux usées », « Unités conteneurisées », « Audit & faisabilité », « Ingénierie électrique », etc.). Décision : garder les 5 grands domaines d'activité (réels), mais leur donner des intitulés distincts.

- **Renommé** (`data/site.ts`, slugs et titres) : `genie-civil-btp` → **`construction-infrastructures`** (Construction & infrastructures) ; `solutions-energetiques` → **`energie-electrification`** (Énergie & électrification) ; `hydraulique-assainissement` → **`eau-assainissement`** (Eau & assainissement) ; `fourniture-services-industriels` → **`equipements-fournitures-industrielles`** (Équipements & fournitures industrielles) ; `etudes-ingenierie` → **`ingenierie-conseil`** (Ingénierie & conseil technique). Les URL changent en conséquence (site jamais déployé, donc sans impact SEO/liens cassés à ce stade).
- **Reformulé** les sous-domaines qui matchaient de trop près (ex. « Électrification rurale » → « Alimentation des zones éloignées », « Traitement des eaux usées » → « Gestion des eaux usées », « Unités conteneurisées » → « Solutions modulaires conteneurisées », « Audit & faisabilité » → « Diagnostic & étude de faisabilité », « Ingénierie électrique » → « Études électriques & réseaux », et quelques autres) ; badge générique de chaque fiche service (« Projets clés en main », trop proche de leur tag « Projets Clés en Main ») → « Accompagnement de bout en bout ».
- **Retiré « ONG »** partout où ça apparaissait (secteur `ONG & organisations internationales` dans `sectors[]` — devenu 4 secteurs — et dans les `sectors` de 2 services, la phrase d'intro d'`Overview` et la FAQ « Quels secteurs accompagnez-vous ? »). Vérifié qu'apsxyz.ca ne mentionne nulle part « ONG » : cette mention venait en fait du site d'origine (déjà présente avant mon intervention), pas d'eux.
- **Ajouté une animation de compteur** (`components/counter.tsx`, `framer-motion`) : les chiffres clés (« 24/7 », « 05 », « 100 % », « 01 ») défilent depuis 0 quand ils entrent dans l'écran, au lieu d'être statiques — à la demande de l'utilisateur de reprendre le type d'animations d'apsxyz.ca (impossible de voir leur JS réel via un simple fetch de page, donc reproduit l'effet standard de ce type de site : compteurs animés sur les statistiques). Point d'attention corrigé en cours de route : le premier jet affichait « 00 » dans le HTML statique tant que le JS n'avait pas tourné ; corrigé pour que le HTML prérendu affiche toujours la vraie valeur, l'animation ne jouant qu'après hydratation.
- **Volontairement pas repris** : leur carrousel de logos partenaires (nous n'avons pas de vrais partenaires/marques à afficher — en inventer aurait été mentir) ; les autres animations (apparition au défilement, survol des cartes, accordéon FAQ) existaient déjà côté nôtre et remplissent le même rôle que leurs animations d'entrée Elementor.
- **Vérifié** : `npm run typecheck`, `npm run lint`, `npm run build` passent sans erreur ; les nouvelles URLs de service sont bien générées ; recherche dans le HTML généré confirmant qu'aucune ancienne URL ni aucune mention « ONG » (secteur) ne subsiste (les seules occurrences de la sous-chaîne « ong » restantes sont dans le mot « strong », sans rapport).

## Problèmes connus / risques

- **`send.php` n'est testable qu'une fois déployé** sur un hébergement PHP (Hostinger) — impossible de vérifier l'envoi d'e-mail en local.
- **Placeholders de contact** : lien WhatsApp sans numéro (`wa.me/?text=…`), bouton « Nous appeler » qui renvoie vers `/contact` (aucun numéro de téléphone dans le code), liens réseaux sociaux génériques (`linkedin.com`, `facebook.com`, `instagram.com`).
- Images du site hébergées sur `images.hostinger.com` (dépendance externe) ; un seul favicon dans `public/`.
- `ErrorBoundary` de `root.tsx` en anglais et non stylé, alors que le site est en français.
- Aucun test automatisé ; pas de README.
- Domaine codé en dur (`site-origin.server.ts`) à confirmer (voir ci-dessus).
- Aucun `.htaccess` : pas de redirection HTTP→HTTPS forcée, pas de page 404 personnalisée (Apache servira sa propre page brute pour un chemin inconnu ; React Router génère un `__spa-fallback.html` mais rien ne le branche encore à Apache).

## Prochaine étape recommandée

1. Confirmer le domaine réel (voir ci-dessus) et corriger `site-origin.server.ts` si besoin.
2. Lancer `npm run dev` pour vérifier visuellement le contenu et les animations (le formulaire affichera une erreur en local, c'est attendu — `send.php` ne s'exécute que sur Hostinger).
3. Initialiser Git (à la demande de l'utilisateur).
4. Mettre en place le déploiement : dépôt GitHub + workflow GitHub Actions (build → FTP vers `public_html`).
5. Traiter les placeholders de contact (WhatsApp, téléphone, réseaux sociaux).
