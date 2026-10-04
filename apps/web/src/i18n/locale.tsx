import { Link, NavLink, useLocation, type LinkProps, type NavLinkProps } from 'react-router';

/**
 * The site's two languages. French is canonical and unprefixed (`/`,
 * `/a-propos`, …); English lives under an `/en` prefix (`/en`, `/en/about`,
 * …). Both are fully prerendered — see `react-router.config.ts`.
 */
export type Locale = 'fr' | 'en';

export const LOCALES: Locale[] = ['fr', 'en'];

/** The English path segment for each French top-level segment. */
const EN_SEGMENTS: Record<string, string> = {
	'/a-propos': '/about',
	'/services': '/services',
	'/contact': '/contact',
};

const FR_SEGMENTS: Record<string, string> = Object.fromEntries(
	Object.entries(EN_SEGMENTS).map(([fr, en]) => [en, fr]),
);

/** Reads the active locale from a pathname — usable in loaders, outside React. */
export function localeFromPathname(pathname: string): Locale {
	return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr';
}

/** Reads the active locale from the current URL. */
export function useLocale(): Locale {
	const { pathname } = useLocation();

	return localeFromPathname(pathname);
}

/** Turns a canonical (French) path into its localized equivalent. */
export function localizePath(path: string, locale: Locale): string {
	if (locale === 'fr') {
		return path;
	}

	if (path === '/') {
		return '/en';
	}

	for (const [fr, en] of Object.entries(EN_SEGMENTS)) {
		if (path === fr) {
			return `/en${en}`;
		}

		if (path.startsWith(`${fr}/`)) {
			return `/en${en}${path.slice(fr.length)}`;
		}
	}

	return `/en${path}`;
}

/** The French (canonical) equivalent of a path — used to build hreflang alternates. */
export function delocalizePath(path: string): string {
	if (path === '/en') {
		return '/';
	}

	if (!path.startsWith('/en/')) {
		return path;
	}

	const rest = path.slice(3);

	for (const [en, fr] of Object.entries(FR_SEGMENTS)) {
		if (rest === en) {
			return fr;
		}

		if (rest.startsWith(`${en}/`)) {
			return `${fr}${rest.slice(en.length)}`;
		}
	}

	return rest;
}

/**
 * A `Link` that automatically localizes its target to the current locale.
 * Pass canonical (French) paths — `/contact`, `/services/${slug}` — from
 * anywhere in the app; it becomes `/en/contact` etc. on English pages.
 */
export function LocaleLink({ to, ...props }: LinkProps) {
	const locale = useLocale();

	return <Link to={typeof to === 'string' ? localizePath(to, locale) : to} {...props} />;
}

/** `NavLink` version of `LocaleLink`, for active-route styling in the nav. */
export function LocaleNavLink({ to, ...props }: NavLinkProps) {
	const locale = useLocale();

	return <NavLink to={typeof to === 'string' ? localizePath(to, locale) : to} {...props} />;
}

/** The current page's URL in the other language — for a language switcher. */
export function useAlternateLocalePath(): { locale: Locale; path: string } {
	const { pathname } = useLocation();
	const locale = localeFromPathname(pathname);
	const frPath = delocalizePath(pathname);
	const alternate: Locale = locale === 'fr' ? 'en' : 'fr';

	return { locale: alternate, path: localizePath(frPath, alternate) };
}
