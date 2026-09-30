import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/home.tsx'),
	route('a-propos', 'routes/about.tsx'),
	route('services', 'routes/services.tsx'),
	route('services/:slug', 'routes/service-detail.tsx'),
	route('contact', 'routes/contact.tsx'),
	route('sitemap.xml', 'routes/sitemap.xml.ts'),
	route('robots.txt', 'routes/robots.txt.ts'),
] satisfies RouteConfig;
