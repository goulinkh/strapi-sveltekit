import { error } from '@sveltejs/kit';
import { getPost, getPosts } from '$lib/server/cms';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = async () => (await getPosts()).map(({ slug }) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);
	if (!post) error(404, 'Story not found');
	return { post, builtAt: new Date().toISOString() };
};
