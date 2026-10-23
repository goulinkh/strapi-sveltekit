import { env } from '$env/dynamic/private';
import { getCategories, getPages, getPosts } from '$lib/server/cms';
import { pagePath } from '$lib/content';

export const load = async () => {
	const [categories, pages, posts] = await Promise.all([getCategories(), getPages(), getPosts()]);
	const files = pages.map((page) => ({
		...page,
		href: pagePath(page),
		filename: page.slug === 'home' ? 'index.html' : `${page.slug}.html`
	}));

	// The same published collections drive the page entry generators.
	// This catalogue is itself prerendered, not a runtime CMS browser.
	return {
		rootPages: files.filter((page) => !page.category || page.slug === 'home'),
		categories: categories.map((category) => ({
			...category,
			pages: files.filter((page) => page.category?.slug === category.slug && page.slug !== 'home')
		})),
		posts,
		createPageUrl: new URL(
			'/admin/content-manager/collection-types/api::page.page/create',
			new URL(env.CMS_URL || 'http://127.0.0.1:1337').origin
		).href,
		count: pages.length + posts.length + 2, // CMS pages/posts + Insights index + this catalogue
		builtAt: new Date().toISOString()
	};
};
