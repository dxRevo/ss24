# PROGRESS.md — État du projet

_Dernière mise à jour : 2026-09-29. À mettre à jour après chaque tâche importante._

## Contexte de l'analyse

- Dépôt Git : [github.com/dxRevo/ss24](https://github.com/dxRevo/ss24), branche `main`. L'historique détaillé des décisions (pourquoi, pas seulement quoi) vit surtout dans la conversation, pas dans les messages de commit.
- `app.tar.gz` (racine) est un **instantané figé de l'état d'origine** (export Hostinger Horizons, avec PocketBase) : il diverge maintenant significativement du code actuel. Ne pas s'y fier pour l'état présent.

## Direction décidée

- **Hébergement : Hostinger** (Premium + domaine déjà achetés là-bas) — tranché le 2026-09-29, après une hésitation avec Netlify.
- **Formulaires : script PHP** (`apps/web/public/php/send.php`) — fait le 2026-09-29.
- **PocketBase : retiré** — fait le 2026-09-29 (voir plus bas).
- **Pré-rendu statique** (`ssr: false` + `prerender`) — fait le 2026-09-29 (voir plus bas).
- **Déploiement : site en ligne**, sur `https://sevicesandsupplies24.com`, via dépôt manuel du build (`site-hostinger.zip`) dans `public_html`. GitHub Actions reste à mettre en place pour automatiser (voir TODO).

## Fonctionnalités présentes (code écrit)

- Site vitrine **bilingue FR/EN**, entièrement statique, **en ligne** : accueil (hero, présentation, secteurs accompagnés, offre, « plus » avec FAQ), À propos (engagement QHSE détaillé, témoignages sectoriels, raisons de confiance), Services (liste de 6), fiche service dynamique `/services/:slug` (bénéfices + secteurs concernés, 404 si slug inconnu), Contact (rappel du processus en 3 étapes). Chaque page existe en français (`/...`) et en anglais (`/en/...`).
- Contenu centralisé dans `apps/web/src/data/site.ts` (FR) et `site.en.ts` (EN, mêmes slugs) : 6 services (chacun avec `benefits`, `sectors` et `faqs` — 3 questions par service), `sectors[]` (4 secteurs accompagnés), `faqs[]` globales (8), e-mail de contact. Les textes d'interface (nav, boutons, libellés) vivent dans `i18n/dictionary.ts`.
- SEO : `seo()` (title, description, canonical/og, JSON-LD Organization sur l'accueil), `sitemap.xml`, `robots.txt`, header `Link` vers le sitemap.
- **Formulaires → PHP** : le formulaire de contact et l'inscription newsletter postent en `FormData` vers `/php/send.php`, qui envoie un e-mail à `contact@sevicesandsupplies24.com` et répond en JSON. Anti-spam par champ honeypot (`company`, invisible pour un humain).
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

## Mise à jour 2026-10-01 — Titre d'accueil retravaillé, Git initialisé et poussé sur GitHub

- **Hero** (`components/home/hero.tsx`) : après deux allers-retours avec l'utilisateur, le titre « Toujours là. 24h/24, 7j/7. » (jugé pas assez distinctif, puis sa première reformulation « De l'étude à la maintenance. » jugée trop réductrice — la maintenance n'est qu'une facette de l'activité) est devenu **« Étudier. Construire. Équiper. »**, trois verbes qui mettent en avant les activités à forte valeur plutôt que le cycle de vie ou la seule disponibilité. Le 24/7 reste mentionné dans le paragraphe sous le titre.
- **Dépôt Git initialisé et poussé** sur [github.com/dxRevo/ss24](https://github.com/dxRevo/ss24), branche `main` (premier commit `42e3b0b`). Identité Git déjà configurée globalement sur la machine (dxrevo / 6ceejey@gmail.com), réutilisée telle quelle.
- **`.gitignore`** créé : `node_modules/`, `dist/`, `apps/web/.react-router/`, `.env`/`.env.*`, `apps/web/vault/` (journal de session généré par le plugin Horizons en dev, repéré en préparant le commit), `.claude/settings.local.json`, et **`app.tar.gz`** (l'instantané Horizons/PocketBase, maintenant obsolète et volumineux — exclu du suivi Git mais **pas supprimé du disque**).
- 178 fichiers commités, aucun `node_modules`/`dist`/secret/fichier ignoré n'a été inclus (vérifié avant le commit).
- **Non fait dans ce même geste** : aucune mise à jour de `PROGRESS.md`/`TODO.md` n'a encore été commitée après ce premier push (ce fichier inclus) — à committer/pousser séparément si l'utilisateur le demande, conformément à la règle « ne pas commit/push sans demande explicite ».

## Mise à jour 2026-10-03 — Logo réel, test Netlify

- **Vrai logo intégré** : `apps/web/public/logo.webp` (103 Ko, réduit depuis l'original 864 Ko/1470×1070 fourni par l'utilisateur, PNG de secours conservé en `logo.png`). Remplace l'ancien logo « bricolé » en CSS dans l'en-tête et le pied de page. Point en suspens : le fichier contient le cercle **et** le texte « SERVICES & SUPPLIES » en un seul visuel, donc à 56 px de haut dans l'en-tête ce texte est petit — une version du logo sans texte (juste le cercle) donnerait un meilleur résultat en en-tête si l'utilisateur peut la fournir.
- **`netlify.toml` ajouté** à la racine (`command = "npm run build"`, `publish = "dist/apps/web/client"`) suite à un test de déploiement Netlify par l'utilisateur qui a échoué : le réglage fait dans l'interface Netlify pointait vers `apps/web/build/client`, qui n'existe pas (notre build sort dans `dist/apps/web/client`). L'utilisateur doit aussi corriger ce champ côté interface Netlify, un réglage UI pouvant rester prioritaire sur le fichier. Rappel : ce test Netlify est juste pour vérifier que le site statique se construit bien — l'hébergement retenu reste Hostinger, et `/php/send.php` ne fonctionnera pas sur Netlify (pas de PHP).
- Commité et poussé sur `main` à la demande de l'utilisateur.

## Mise à jour 2026-10-03 — Titre des pages intérieures trop grand sur mobile

- `components/page-hero.tsx` : le `<h1>` avait un plancher de taille de 2.8rem (44,8 px), trop grand pour un titre long (« Construction & infrastructures ») sur un téléphone étroit — débordement/wrap disgracieux signalé par l'utilisateur. Plancher ramené à 2rem (32 px, aligné sur `.section-title`), plafond desktop inchangé. Commité et poussé (`2c1d98a`).

## Mise à jour 2026-10-04 — Site bilingue FR/EN

À la demande de l'utilisateur (« le site doit être bilingue français, anglais »). Décision prise avec l'utilisateur : anglais sous préfixe `/en`, français inchangé à la racine (pas de `/fr/`, pas de sous-domaine séparé).

- **Nouveau : `apps/web/src/i18n/`** — `locale.tsx` (type `Locale`, `useLocale()`, `localizePath()`/`delocalizePath()` pour convertir un chemin FR canonique ↔ sa version `/en/...`, `LocaleLink`/`LocaleNavLink` qui localisent automatiquement leur `to`, `useAlternateLocalePath()` pour le sélecteur de langue) ; `dictionary.ts` (toutes les chaînes d'interface — nav, boutons, libellés, messages de statut — en FR et EN, servies par `useT()`).
- **Nouveau : `apps/web/src/data/site.en.ts`** — miroir anglais complet de `site.ts` : mêmes 5 services, mêmes `slug` (identifiants partagés entre les deux langues), tout le reste traduit (titres, sous-domaines, bénéfices, secteurs, FAQ par service). `sectors[]` et les 8 FAQ globales traduits aussi. Et **`data/i18n.ts`** : `getServices/getSectors/getFaqs/getServiceBySlug(locale)` + hook `useSiteContent()`.
- **`routes.ts`** : miroir des 5 routes FR sous `/en` (via le helper `prefix()`) pointant vers **les mêmes fichiers route** — pas de duplication de fichiers. Fallait donner un `id` explicite à chaque route EN (`{id:'en-home'}` etc.) pour éviter une collision d'id avec la route FR qui réutilise le même fichier.
- **`react-router.config.ts`** : `prerender()` génère maintenant les 9 chemins FR **et** leurs 9 équivalents `/en/...` (mapping de segments dupliqué en dur dans ce fichier plutôt qu'importé de `i18n/locale.tsx`, pour ne pas faire charger un module JSX par le chargeur de config Node — voir CLAUDE.md).
- **`root.tsx`** : `<html lang>` dynamique via `useLocale()`.
- **`lib/seo.ts`** : ajoute les balises `<link rel="alternate" hreflang="fr"/"en"/"x-default">` sur chaque page.
- **`routes/sitemap.xml.ts`** : liste maintenant les deux langues (18 URLs au lieu de 9), chaque `<url>` annoté avec des `<xhtml:link rel="alternate">` vers son équivalent dans l'autre langue.
- **Tous les composants de page** réécrits pour lire `useT()` (textes d'interface) et/ou `useSiteContent()` (contenu) au lieu de texte français en dur ou d'un import direct de `data/site.ts`.
- **Sélecteur de langue** ajouté dans l'en-tête (desktop + menu mobile), « FR »/« EN », qui pointe vers la page équivalente dans l'autre langue (pas juste l'accueil).
- **Bug corrigé en cours de route** : le sélecteur de langue utilisait `LocaleLink` sur une URL déjà entièrement résolue par `useAlternateLocalePath()`, ce qui la relocalisait une seconde fois (`/en` → `/en/en`-like, détecté via inspection du HTML généré : le lien « FR » affiché sur la page anglaise pointait vers `/en` au lieu de `/`). Corrigé en utilisant le `Link` brut de `react-router` pour ce cas précis (voir la note dans CLAUDE.md).
- **Bug TypeScript corrigé** : le dictionnaire était écrit avec `as const`, ce qui rendait les types FR et EN incompatibles entre eux (littéraux de chaîne différents) ; retiré, les deux objets sont maintenant typés en `string` simple.
- **Vérifié** : `npm run typecheck`, `npm run lint`, `npm run build` passent sans erreur. Build inspecté en détail : `<html lang="fr">` vs `"en"`, titres `<title>` traduits, texte du hero traduit, hreflang présents sur les deux versions, sitemap avec 18 URLs et alternates corrects, `robots.txt` inchangé, `/php/send.php` toujours livré, sélecteur de langue testé dans les deux sens y compris sur une page profonde (`/services/eau-assainissement` ↔ `/en/services/eau-assainissement`, le slug est bien conservé). Contenu français relu pour confirmer qu'il n'a pas été altéré par la refonte.
- **Non commité pour l'instant** — à faire sur demande explicite.

## Mise à jour 2026-10-04/05 — WhatsApp, tentative de build natif Hostinger (abandonnée), domaine réel corrigé

- **WhatsApp corrigé** (`data/site.ts`) : le lien était `https://wa.me/?text=...` sans numéro — n'importe quel visiteur cliquant dessus choisissait lui-même à qui envoyer le message, ça ne joignait jamais l'entreprise. Numéro réel ajouté : `+221 78 191 80 48` → `https://wa.me/221781918048?text=...`.
- **Build natif Hostinger (« Git deploy ») testé, longuement diagnostiqué, puis abandonné** : Hostinger propose de builder directement depuis le dépôt GitHub à chaque push. Plusieurs tentatives, chacune creusée en profondeur (pas de simples suppositions — lecture directe du code source de `@react-router/dev` et de Vite dans `node_modules`) :
  1. **Node 22.18.0 vs `>=22.22.0` requis par react-router 8** → `.nvmrc` précisé, puis `.nvmrc` → `24` (Hostinger ne propose que des versions majeures : 18/20/22/24, et leur « 22 » résout en 22.18).
  2. **`Output directory` vide** dans les réglages Hostinger → renseigné à `dist/apps/web/client`.
  3. **`Error: Prerender: Request failed for /_.data`** : en lisant le code de `@react-router/dev`, confirmé que le pré-rendu démarre un vrai serveur Vite (`vite.preview()`) et s'y connecte lui-même en HTTP (`node:http`, pas `fetch`, donc pas de repli IPv4 automatique). `vite.config.ts` avait `host: '::'` (IPv6 seul) hérité du gabarit Horizons → changé en `host: true`, puis (la résolution de « localhost » restant incertaine côté Hostinger) en **IP littérale `host: '127.0.0.1'`** pour le bloc `preview` — élimine toute résolution DNS. Ajout en parallèle de `NODE_OPTIONS=--dns-result-order=ipv4first` sur le script `build`. Script `dev` nettoyé au passage (`--host ::` en CLI annulait silencieusement le réglage du fichier de config).
  4. Malgré ça, nouvel échec : **`ECONNREFUSED 127.0.0.1:<port aléatoire>`** — plus une question de DNS/IPv6, mais de connexion refusée tout court. Ajout d'un script de diagnostic autonome, `apps/web/scripts/check-loopback.cjs` (ouvre un serveur HTTP sur `127.0.0.1` et s'y connecte lui-même, indépendamment de Vite/React Router), lancé en préfixe du build pour isoler la question.
  5. **Conclusion retenue avec l'utilisateur** : le « Git deploy » de Hostinger est probablement un bac à sable qui ne garantit pas les connexions réseau internes (y compris vers `localhost`) pendant le build — une contrainte que des plateformes dédiées comme Netlify/Vercel gèrent nativement (c'est littéralement leur métier), mais qu'un hébergeur mutualisé généraliste n'a aucune raison de garantir. **Décision : abandonner le build natif Hostinger**, revenir à un build local (ou futur GitHub Actions) + dépôt des fichiers statiques — voir TODO. `apps/web/scripts/check-loopback.cjs` laissé en place (inoffensif, à retirer si on ne revient jamais sur cette piste).
  6. Tout au long de cet échange, l'assistant intégré à Hostinger a répété un diagnostic générique et par moments faux (ex. mention d'un `entry.server.tsx` qui n'existe pas dans ce projet) — chaque suggestion a été vérifiée dans le code réel avant d'être écartée ou appliquée, jamais suivie aveuglément.
- **Domaine réel découvert et corrigé** : en configurant le Gestionnaire de fichiers Hostinger, l'utilisateur a révélé que le vrai domaine est **`sevicesandsupplies24.com`** (sans le « r » de « services », « 24 » à la fin) — différent de `24servicesandsupplies.com` que le code utilisait depuis le début du projet (supposition jamais confirmée jusqu'ici, malgré plusieurs demandes). Corrigé aux 4 endroits concernés : `lib/site-origin.server.ts` (origine canonique), `data/site.ts` (`EMAIL`), `public/php/send.php` (`RECIPIENT`, `FROM_ADDRESS`). L'adresse e-mail de contact devient `contact@sevicesandsupplies24.com` (confirmé explicitly par l'utilisateur). Le nom de l'entreprise affiché (« 24 Services & Supplies ») reste inchangé — seul le domaine/l'e-mail technique a changé.
- **Déploiement manuel repris** : `site-hostinger.zip` reconstruit et revérifié (bon domaine, bonne adresse e-mail, bon numéro WhatsApp) pour upload direct dans `public_html` via le Gestionnaire de fichiers — solution qui fonctionne de façon fiable, contrairement au build natif.
- **Vérifié** à chaque étape : `typecheck`, `lint`, `build` local (toujours réussi, du début à la fin de cette investigation — le problème n'a jamais été reproductible en local, seulement chez Hostinger).
- **Site confirmé en ligne et fonctionnel** après le dépôt manuel : testé par l'utilisateur (navigation privée, portable et téléphone) et par moi-même (requêtes directes sur `sevicesandsupplies24.com` et `www.sevicesandsupplies24.com`, FR et EN, sitemap valide à 20 URLs). Une alerte `DNS_PROBE_FINISHED_NXDOMAIN` rencontrée par certains contacts de l'utilisateur s'est révélée être de la propagation DNS classique après activation du domaine, résolue d'elle-même.

## Mise à jour 2026-10-05 — 6ᵉ service : Froid & climatisation

À la demande de l'utilisateur, avec deux photos fournies (unités de climatisation en toiture, groupe froid Carrier AquaSnap).

- **Nouveau service** `froid-climatisation` ajouté dans `data/site.ts` et `data/site.en.ts` (même structure que les 5 autres : overview, 4 domaines, 4 étapes, 4 bénéfices, secteurs, 3 FAQ — traduit intégralement).
- **Image** : la photo des unités en toiture (cohérente avec le style « terrain » des autres photos du site, contrairement à la photo produit Carrier sur fond blanc) — enregistrée localement dans `public/froid-climatisation.webp` (182 Ko, compressée depuis l'original) plutôt que sur le CDN externe `images.hostinger.com` utilisé par les 5 autres services. La photo du groupe Carrier n'a pas été utilisée (un seul champ `image` par service) — à intégrer ailleurs si l'utilisateur le souhaite.
- **Toutes les mentions de « 5 »/« cinq »/« five » services corrigées** : `i18n/dictionary.ts` (meta description et titre de la page Services, FR+EN), `routes/services.tsx` (sa propre copie de la meta description), compteurs animés « 05 »→« 06 » (`home/overview.tsx`, `about-content.tsx`).
- **`home/offer.tsx`** : avec 6 services, la grille se répartit maintenant en 2 rangées égales de 3 — la mise en forme spéciale de la 1ʳᵉ carte (double largeur) a été retirée, plus nécessaire et désormais déséquilibrée. Icône `Snowflake` (lucide) ajoutée pour ce service.
- **Vérifié** : `typecheck`, `lint`, `build` passent ; les 2 nouvelles pages (`/services/froid-climatisation`, `/en/services/froid-climatisation`) se prérendent correctement, titres et image confirmés dans le HTML généré.
- **Non commité au moment de l'écriture** — à faire sur demande explicite.

## Problèmes connus / risques

- **`send.php` n'est testable qu'une fois déployé** sur un hébergement PHP (Hostinger) — impossible de vérifier l'envoi d'e-mail en local.
- **Placeholders de contact** : lien WhatsApp sans numéro (`wa.me/?text=…`), bouton « Nous appeler » qui renvoie vers `/contact` (aucun numéro de téléphone dans le code), liens réseaux sociaux génériques (`linkedin.com`, `facebook.com`, `instagram.com`).
- Images du site hébergées sur `images.hostinger.com` (dépendance externe) ; un seul favicon dans `public/`.
- `ErrorBoundary` de `root.tsx` en anglais et non stylé, alors que le site est en français.
- Aucun test automatisé ; pas de README.
- Domaine codé en dur (`site-origin.server.ts`) à confirmer (voir ci-dessus).
- Aucun `.htaccess` : pas de redirection HTTP→HTTPS forcée, pas de page 404 personnalisée (Apache servira sa propre page brute pour un chemin inconnu ; React Router génère un `__spa-fallback.html` mais rien ne le branche encore à Apache).
- **Bilingue — détails mineurs non traités** : le JSON-LD `Organization` de la page d'accueil (`routes/home.tsx`) reste en français dans les deux langues (adresse postale, nom — raisonnable, mais pas vérifié avec l'utilisateur) ; l'ancre `#qui-sommes-nous` du bouton « Découvrir » du hero n'est pas traduite en anglais (fonctionne, juste pas idiomatique dans l'URL).

## Prochaine étape recommandée

1. Lancer `npm run dev` pour vérifier visuellement le site bilingue (FR, EN, et le sélecteur de langue) et les animations.
2. Confirmer le domaine réel (voir ci-dessus) et corriger `site-origin.server.ts` si besoin.
3. Mettre en place le déploiement : workflow GitHub Actions (build → FTP vers `public_html` chez Hostinger).
4. Traiter les placeholders de contact (WhatsApp, téléphone, réseaux sociaux).
5. Commiter et pousser le travail bilingue (en attente de demande explicite).
