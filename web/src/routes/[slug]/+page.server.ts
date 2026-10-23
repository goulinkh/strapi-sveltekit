import { error } from '@sveltejs/kit';
import { getPage, getPages } from '$lib/server/cms';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () =>
	(await getPages())
		.filter((page) => page.slug !== 'home' && !page.category)
		.map(({ slug }) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
	const content = await getPage(params.slug);
	if (!content || content.category) error(404, 'Page not found');
	return { content, builtAt: new Date().toISOString() };
};
