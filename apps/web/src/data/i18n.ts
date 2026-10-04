import { useLocale, type Locale } from '@/i18n/locale';
import { services as servicesFr, sectors as sectorsFr, faqs as faqsFr } from './site';
import { services as servicesEn, sectors as sectorsEn, faqs as faqsEn } from './site.en';
import type { Service } from './site';

export const getServices = (locale: Locale): Service[] => (locale === 'en' ? servicesEn : servicesFr);
export const getSectors = (locale: Locale) => (locale === 'en' ? sectorsEn : sectorsFr);
export const getFaqs = (locale: Locale) => (locale === 'en' ? faqsEn : faqsFr);
export const getServiceBySlug = (locale: Locale, slug: string): Service | undefined =>
	getServices(locale).find(service => service.slug === slug);

/** Services/sectors/FAQs in the current page's language. */
export function useSiteContent() {
	const locale = useLocale();

	return { locale, services: getServices(locale), sectors: getSectors(locale), faqs: getFaqs(locale) };
}
