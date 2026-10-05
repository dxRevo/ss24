# TODO.md — Tâches restantes

_Dernière mise à jour : 2026-09-29. À mettre à jour après chaque tâche importante._

## Priorité haute

- [x] Installer les dépendances et établir l'état de référence (`typecheck`/`lint`/`build`).
- [x] Décider de l'hébergement → **Hostinger**.
- [x] Décider de la solution de formulaire → **script PHP**.
- [x] Retirer PocketBase et le code mort associé (auth non branchée, plugin Horizons dédié) ; brancher les formulaires sur `public/php/send.php`.
- [x] Passer en pré-rendu (`ssr: false` + `prerender`) ; origine fixe dans `site-origin.server.ts` ; routes `/api/*` retirées (impossibles à exécuter sans serveur).
- [x] Donner au site sa propre identité vis-à-vis d'apsxyz.ca : renommer les 5 catégories de services et leurs sous-domaines trop proches, retirer « ONG » (n'existait que sur notre site, pas le leur), ajouter une animation de compteur sur les chiffres clés.
- [x] **Domaine réel confirmé et corrigé** → `sevicesandsupplies24.com` (pas `24servicesandsupplies.com`), e-mail `contact@sevicesandsupplies24.com`, corrigés dans `site-origin.server.ts`, `data/site.ts`, `public/php/send.php`.
- [ ] Vérifier visuellement (`npm run dev`) le contenu et les animations (secteurs, bénéfices service, FAQ étendue, menu mobile animé…) ; le formulaire affichera une erreur en local, c'est normal (`send.php` ne tourne que sur un hébergement PHP).
- [x] Initialiser Git + `.gitignore`, et pousser sur [github.com/dxRevo/ss24](https://github.com/dxRevo/ss24) (branche `main`).
- [x] Intégrer le vrai logo dans l'en-tête et le pied de page ; ajouter `netlify.toml` (publish dir corrigé suite à une erreur de déploiement test).
- [x] Corriger le titre des pages intérieures trop grand sur mobile (`page-hero.tsx`).
- [x] Rendre le site bilingue FR/EN (`/en` préfixé) : routage, SEO (hreflang, sitemap), contenu et interface traduits, sélecteur de langue. Voir `CLAUDE.md` (section i18n) pour les conventions à suivre pour toute nouvelle page/texte.
- [x] Corriger le lien WhatsApp (numéro réel ajouté).
- [x] **Build natif Hostinger testé et abandonné** après investigation approfondie (incompatibilité probable entre le bac à sable de build de Hostinger et le mécanisme de pré-rendu de React Router, qui a besoin de se connecter en réseau à lui-même). Retour au dépôt manuel du build (`site-hostinger.zip`) en attendant GitHub Actions. Voir `PROGRESS.md` pour le détail de l'investigation (versions Node, `host` de Vite, script de diagnostic `scripts/check-loopback.cjs`).
- [x] **Site en ligne et confirmé fonctionnel** sur `sevicesandsupplies24.com` (dépôt manuel du zip) — testé par l'utilisateur et vérifié par requêtes directes (FR, EN, sitemap).
- [x] **Domaine réel corrigé** : `sevicesandsupplies24.com` (pas `24servicesandsupplies.com`) et e-mail `contact@sevicesandsupplies24.com` partout dans le code.
- [x] **6ᵉ service ajouté : Froid & climatisation** (`data/site.ts`/`site.en.ts`, image locale `public/froid-climatisation.webp`, tous les compteurs/textes « 5 services » corrigés en « 6 »).
- [ ] **Vérifier que la boîte mail `contact@sevicesandsupplies24.com` existe réellement** dans hPanel → E-mails, sinon `send.php` « réussira » sans que rien n'arrive nulle part.
- [ ] **Tester le formulaire de contact et l'inscription newsletter en conditions réelles** (le bouton WhatsApp et le chargement des pages FR/EN sont déjà confirmés).
- [ ] Repousser le build avec le 6ᵉ service (nouveau `site-hostinger.zip` à générer et uploader).
- [ ] Décider où (le cas échéant) utiliser la seconde photo fournie (groupe froid Carrier AquaSnap), non utilisée pour l'instant.
- [ ] Si possible, obtenir une version du logo **sans le texte** (juste le cercle « 24 ») pour l'en-tête, plus lisible qu'un recadrage du logo complet à petite taille.
- [ ] Dans l'interface Netlify, corriger le champ *Publish directory* (actuellement `apps/web/build/client`) pour qu'il corresponde à `netlify.toml` (`dist/apps/web/client`) — un réglage fait dans l'UI peut rester prioritaire sur le fichier du dépôt. (Note : Netlify n'est plus la piste privilégiée pour le build, voir ci-dessus — à garder seulement si on veut un second test de build fonctionnel.)
- [ ] Mettre en place GitHub Actions pour builder automatiquement et déposer le résultat en FTP dans `public_html` chez Hostinger (identifiants FTP en secrets GitHub, jamais dans le code) — solution durable pour ne plus reconstruire/uploader le zip à la main à chaque changement.
- [ ] Configurer `send.php` sur l'hébergement réel : vérifier que `mail()` part bien (SPF/DKIM du domaine, sinon risque de spam) ; envisager `PHPMailer` + SMTP si `mail()` s'avère peu fiable chez Hostinger.
- [ ] Renseigner les vraies coordonnées encore manquantes : numéro de téléphone pour le bouton « Nous appeler », liens réseaux sociaux réels dans `site-footer.tsx`.
- [ ] Envisager de retirer `apps/web/scripts/check-loopback.cjs` et sa mention dans `package.json` une fois certain qu'on ne reviendra pas sur le build natif Hostinger (actuellement inoffensif, laissé en place).
- [ ] Retirer les plugins Horizons de `vite.config.ts` et `apps/web/plugins/` si le build et le dev restent fonctionnels une fois le site quitté de la plateforme Horizons.
- [ ] Ajouter un `.htaccess` dans `public/` : forcer HTTPS, et brancher `__spa-fallback.html` (généré par le build) comme page 404 pour un rendu cohérent avec le reste du site plutôt que la page d'erreur brute d'Apache.

## Priorité moyenne

- [ ] Le message WhatsApp pré-rempli (`WHATSAPP` dans `data/site.ts`) est en français même sur les pages anglaises — prévoir une variante EN si pertinent.
- [ ] Le JSON-LD `Organization` de l'accueil (`routes/home.tsx`) reste en français dans les deux langues ; l'ancre `#qui-sommes-nous` du bouton « Découvrir »/« Discover » n'est pas traduite — fonctionnel mais pas idiomatique.
- [ ] Revoir si besoin les 4 `tags` restants par service (mots-clés courts type « Audit », « Faisabilité ») — laissés tels quels car génériques au secteur, mais à reformuler si un chevauchement supplémentaire avec un concurrent est repéré.
- [ ] Ajouter une limite de fréquence sur `send.php` (ex. par IP) en plus du honeypot déjà en place, pour limiter les abus.
- [ ] Traduire/styler l'`ErrorBoundary` de `root.tsx` (404 et erreurs en français, cohérent avec le site).
- [ ] Vérifier l'accessibilité (statut du formulaire annoncé aux lecteurs d'écran, focus visible, contrastes orange/navy).
- [ ] Héberger localement les images (actuellement `images.hostinger.com`) et ajouter une image OG/favicons complets dans `public/`.

## Priorité basse

- [ ] Ajouter un README minimal (installation, variables d'environnement par nom, déploiement).
- [ ] Ajouter quelques tests (routes `sitemap.xml`/`robots.txt`, 404 de `/services/:slug`, `seo()`).
- [ ] Traiter les signalements `knip` préexistants et sans rapport avec PocketBase : dépendances `@hookform/resolvers`/`date-fns`/`zod` apparemment inutilisées, imports `@babel/*` non déclarés dans `apps/web/plugins/`, type `Domain` non exporté ailleurs.
- [ ] Reformater progressivement les fichiers du site en lignes lisibles (composants écrits en une ligne dense) — uniquement si l'utilisateur le souhaite.
- [ ] Clarifier le rôle de `.version` (contient `17`) et décider si `app.tar.gz` (maintenant obsolète) doit être supprimé ou archivé ailleurs une fois Git initialisé.
