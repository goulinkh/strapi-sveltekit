import { getPosts } from '$lib/server/cms';

export const load = async () => ({ posts: await getPosts(), builtAt: new Date().toISOString() });
