# TODO.md — Tâches restantes

_Dernière mise à jour : 2026-09-29. À mettre à jour après chaque tâche importante._

## Priorité haute

- [x] Installer les dépendances et établir l'état de référence (`typecheck`/`lint`/`build`).
- [x] Décider de l'hébergement → **Hostinger**.
- [x] Décider de la solution de formulaire → **script PHP**.
- [x] Retirer PocketBase et le code mort associé (auth non branchée, plugin Horizons dédié) ; brancher les formulaires sur `public/php/send.php`.
- [x] Passer en pré-rendu (`ssr: false` + `prerender`) ; origine fixe dans `site-origin.server.ts` ; routes `/api/*` retirées (impossibles à exécuter sans serveur).
- [x] Donner au site sa propre identité vis-à-vis d'apsxyz.ca : renommer les 5 catégories de services et leurs sous-domaines trop proches, retirer « ONG » (n'existait que sur notre site, pas le leur), ajouter une animation de compteur sur les chiffres clés.
- [ ] **Confirmer que `24servicesandsupplies.com` (codé en dur dans `lib/site-origin.server.ts`) est bien le domaine acheté chez Hostinger** — sinon corriger cette seule constante.
- [ ] Vérifier visuellement (`npm run dev`) le contenu et les animations (secteurs, bénéfices service, FAQ étendue, menu mobile animé…) ; le formulaire affichera une erreur en local, c'est normal (`send.php` ne tourne que sur un hébergement PHP).
- [ ] Initialiser Git + `.gitignore` (`node_modules`, `dist`, `.react-router`, `.env`, `app.tar.gz`) avant les gros changements suivants.
- [ ] Mettre en place le déploiement : dépôt GitHub + workflow GitHub Actions qui build puis dépose le résultat en FTP dans `public_html` chez Hostinger (identifiants FTP en secrets GitHub, jamais dans le code).
- [ ] Configurer `send.php` sur l'hébergement réel : vérifier que `mail()` part bien (SPF/DKIM du domaine, sinon risque de spam) ; envisager `PHPMailer` + SMTP si `mail()` s'avère peu fiable chez Hostinger.
- [ ] Renseigner les vraies coordonnées : numéro WhatsApp dans `WHATSAPP` (`src/data/site.ts`), numéro de téléphone pour le bouton « Nous appeler », liens réseaux sociaux réels dans `site-footer.tsx`.
- [ ] Retirer les plugins Horizons de `vite.config.ts` et `apps/web/plugins/` si le build et le dev restent fonctionnels une fois le site quitté de la plateforme Horizons.
- [ ] Ajouter un `.htaccess` dans `public/` : forcer HTTPS, et brancher `__spa-fallback.html` (généré par le build) comme page 404 pour un rendu cohérent avec le reste du site plutôt que la page d'erreur brute d'Apache.

## Priorité moyenne

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
