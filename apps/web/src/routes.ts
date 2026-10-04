import { type RouteConfig, index, prefix, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('a-propos', 'routes/about.tsx'),
	route('services', 'routes/services.tsx'),
	route('services/:slug', 'routes/service-detail.tsx'),
	route('contact', 'routes/contact.tsx'),
	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
	// English mirror of the same pages, under /en — same component files, each
	// one reads the active locale from the URL (see src/i18n/locale.tsx).
	// Explicit `id`s avoid clashing with the French route that reuses the file.
	...prefix('en', [
		index('routes/home.tsx', { id: 'en-home' }),
		route('about', 'routes/about.tsx', { id: 'en-about' }),
		route('services', 'routes/services.tsx', { id: 'en-services' }),
		route('services/:slug', 'routes/service-detail.tsx', { id: 'en-service-detail' }),
		route('contact', 'routes/contact.tsx', { id: 'en-contact' }),
	]),
] satisfies RouteConfig;
