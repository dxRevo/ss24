import { siteOrigin } from '@/lib/site-origin.server';
import { services } from '@/data/site';
import { localizePath } from '@/i18n/locale';

type SitemapEntry = {
	path: string;
	lastmod?: string;
};

const STATIC_PATHS = ['/', '/a-propos', '/services', '/contact'];

function escapeXml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function toLoc(origin: string, path: string): string {
	return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Every page exists in French (canonical) and English (`/en` prefix) — each
 * gets its own `<url>` entry, and each entry lists both language variants as
 * `xhtml:link` alternates so crawlers can pair them up.
 */
function serializeSitemap(origin: string, entries: SitemapEntry[]): string {
	const blocks = entries.flatMap(entry => {
		const frPath = entry.path;
		const enPath = localizePath(frPath, 'en');
		const lastmod = entry.lastmod ? `\n\t\t<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
		const alternates = [
			`\n\t\t<xhtml:link rel="alternate" hreflang="fr" href="${escapeXml(toLoc(origin, frPath))}"/>`,
			`\n\t\t<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(toLoc(origin, enPath))}"/>`,
		].join('');

		return [frPath, enPath].map(path => {
			const loc = escapeXml(toLoc(origin, path));

			return `\t<url>\n\t\t<loc>${loc}</loc>${lastmod}${alternates}\n\t</url>`;
		});
	});

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${blocks.join('\n')}\n</urlset>\n`;
}

/**
 * Public dynamic URLs (blog posts, PDPs, articles).
 * Return `{ path, lastmod }` in the same change that adds a collection.
 * Return `[]` only while the site has no public records; clear those URLs
 * again in the same change that removes the collection.
 */
async function getDynamicEntries(): Promise<SitemapEntry[]> {
	return services.map(service => ({ path: `/services/${service.slug}` }));
}

export async function loader() {
	const origin = siteOrigin();
	const entries: SitemapEntry[] = [
		...STATIC_PATHS.map(path => ({ path })),
		...(await getDynamicEntries()),
	];

	return new Response(serializeSitemap(origin, entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
			'Access-Control-Allow-Origin': '*',
		},
	});
}
