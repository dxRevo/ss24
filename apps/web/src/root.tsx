import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';
import type { Route } from './+types/root';
import stylesheet from '@/index.css?url';
import { siteOrigin } from '@/lib/site-origin.server';
import { HorizonsPreviewScripts } from './horizons-preview-scripts';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const links: Route.LinksFunction = () => [
	{ rel: 'stylesheet', href: stylesheet },
	{ rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap',
	},
];

/**
 * Publishes the site's public origin, which `seo()` reads to build canonical
 * and `og:url` tags. A `meta` export can only reach server data through
 * `matches`, so it has to travel this way.
 *
 * The site is fully prerendered (`ssr: false`), which never runs a live
 * server — a `headers` export is invalid in that mode (nothing would ever
 * call it), so the sitemap is advertised only via `robots.txt`'s `Sitemap:`
 * line, not a response header.
 */
export function loader() {
	return { origin: siteOrigin() };
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<HorizonsPreviewScripts />
			</head>
			<body>
				<div id="root">{children}</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <><SiteHeader /><Outlet /><SiteFooter /></>;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main>
			<h1>{message}</h1>
			<p>{details}</p>
			{stack ? (
				<pre>
					<code>{stack}</code>
				</pre>
			) : null}
		</main>
	);
}
