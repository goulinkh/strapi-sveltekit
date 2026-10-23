import { redirect } from '@sveltejs/kit';
import { cookieName } from '$lib/server/session';
import type { RequestHandler } from './$types';

export const prerender = false;

export const POST: RequestHandler = ({ cookies }) => {
	cookies.delete(cookieName, { path: '/' });
	redirect(303, '/');
};
