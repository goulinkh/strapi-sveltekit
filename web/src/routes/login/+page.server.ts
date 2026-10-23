import { redirect } from '@sveltejs/kit';
import { createSession, cookieName, safeNext } from '$lib/server/session';
import { cookieOptions, sessionSecret } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = ({ locals, url }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (locals.user) redirect(303, next);
	return { next };
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const form = await request.formData();
		const value = form.get('next');
		const next = safeNext(typeof value === 'string' ? value : null);
		cookies.set(cookieName, createSession(sessionSecret()), cookieOptions());
		redirect(303, next);
	}
};
