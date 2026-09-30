/**
 * The site's public origin, e.g. `https://example.com`. Use it for absolute
 * URLs that leave the app — sitemap `<loc>`, canonical links, `og:url`.
 *
 * The site is fully prerendered at build time (there is no live request to
 * read a host from), so this is a fixed constant rather than derived per
 * request — there is only ever one production domain to publish.
 *
 * Update this if the site moves to a different domain.
 */
const SITE_ORIGIN = 'https://24servicesandsupplies.com';

export const siteOrigin = (): string => SITE_ORIGIN;
