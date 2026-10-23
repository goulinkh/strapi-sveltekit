import { error } from '@sveltejs/kit';
import { getPage, getPosts } from '$lib/server/cms';

export const load = async () => {
	const [home, posts] = await Promise.all([getPage('home'), getPosts()]);
	if (!home) error(404, 'Publish the home page in Strapi first.');
	return {
		home,
		featuredPost: posts[0] ?? null,
		builtAt: new Date().toISOString()
	};
};
