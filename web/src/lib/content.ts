import type { ContentPage } from './types';

export function pagePath(page: ContentPage): string {
	if (page.slug === 'home') return '/';
	return page.category ? `/${page.category.slug}/${page.slug}` : `/${page.slug}`;
}
