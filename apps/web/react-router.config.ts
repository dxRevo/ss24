import type { Config } from '@react-router/dev/config';
import { services } from './src/data/site';

/**
 * The whole site is static content, so it is prerendered to plain HTML at
 * build time instead of served by a Node process — Hostinger's shared
 * hosting only serves files. Every route in `src/routes.ts` that has a page
 * must be listed here; a route left out ships no HTML for its path.
 */
export default {
	appDirectory: 'src',
	buildDirectory: '../../dist/apps/web',
	ssr: false,
	async prerender() {
		return [
			'/',
			'/a-propos',
			'/services',
			'/contact',
			'/sitemap.xml',
			'/robots.txt',
			...services.map(service => `/services/${service.slug}`),
		];
	},
} satisfies Config;
