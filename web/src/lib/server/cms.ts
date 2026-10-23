import { env } from '$env/dynamic/private';
import type { Category, ContentPage, Post } from '$lib/types';

type Collection = 'pages' | 'posts' | 'categories';
type Response<T> = {
	data: T[];
	meta: { pagination: { pageCount: number } };
};

// This module is server-only. Prerendered routes call it at build time, not in the browser.
async function read<T>(collection: Collection, filters: Record<string, string> = {}): Promise<T[]> {
	const result: T[] = [];
	let pageCount = 1;

	for (let page = 1; page <= pageCount; page++) {
		const url = new URL(`/api/${collection}`, env.CMS_URL || 'http://127.0.0.1:1337');
		url.search = new URLSearchParams({
			status: 'published',
			sort: 'slug:asc',
			'pagination[pageSize]': '100',
			'pagination[page]': String(page),
			...(collection === 'pages'
				? { 'populate[category][fields][0]': 'slug', 'populate[category][fields][1]': 'title' }
				: {}),
			...filters
		}).toString();

		let response: globalThis.Response;
		try {
			response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
		} catch (cause) {
			throw new Error(
				'Cannot reach Strapi. Start the CMS before developing or building the site.',
				{
					cause
				}
			);
		}
		if (!response.ok) {
			throw new Error(
				`Strapi returned ${response.status} for ${collection}. Check public read permissions.`
			);
		}
		const data = (await response.json()) as Response<T>;
		result.push(...data.data);
		pageCount = data.meta.pagination.pageCount;
	}
	return result;
}

export const getCategories = () => read<Category>('categories');
export const getPages = () => read<ContentPage>('pages');
export const getPosts = () => read<Post>('posts');
export const getPage = async (slug: string) =>
	(await read<ContentPage>('pages', { 'filters[slug][$eq]': slug }))[0];
export const getPost = async (slug: string) =>
	(await read<Post>('posts', { 'filters[slug][$eq]': slug }))[0];
