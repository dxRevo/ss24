import type { Config } from '@react-router/dev/config';
import { services } from './src/data/site';

/** Mirrors the top-segment mapping in `src/i18n/locale.tsx` — kept inline
 * here (instead of imported) so this Node-loaded config file never has to
 * pull in a `.tsx` module with JSX. */
const EN_SEGMENTS: Record<string, string> = {
	'/a-propos': '/about',
	'/services': '/services',
	'/contact': '/contact',
};

function toEnglishPath(path: string): string {
	if (path === '/') {
		return '/en';
	}

	for (const [fr, en] of Object.entries(EN_SEGMENTS)) {
		if (path === fr || path.startsWith(`${fr}/`)) {
			return `/en${en}${path.slice(fr.length)}`;
		}
	}

	return `/en${path}`;
}

/**
 * The whole site is static content, so it is prerendered to plain HTML at
 * build time instead of served by a Node process — Hostinger's shared
 * hosting only serves files. Every route in `src/routes.ts` that has a page
 * must be listed here (French path only — `toEnglishPath` derives the /en
 * mirror); a route left out ships no HTML for its path, in either language.
 */
export default {
	appDirectory: 'src',
	buildDirectory: '../../dist/apps/web',
	ssr: false,
	async prerender() {
		const frPaths = [
			'/',
			'/a-propos',
			'/services',
			'/contact',
			...services.map(service => `/services/${service.slug}`),
		];

		return [
			...frPaths,
			...frPaths.map(toEnglishPath),
			'/sitemap.xml',
			'/robots.txt',
		];
	},
} satisfies Config;
