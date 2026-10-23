import type { Handle } from '@sveltejs/kit';
import { cookieName, readSession } from '$lib/server/session';
import { sessionSecret } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(cookieName);
	event.locals.user = token ? readSession(token, sessionSecret()) : null;

	const response = await resolve(event);
	// Public static HTML is never personalised. Only these runtime routes touch account data.
	if (['/pro', '/login', '/logout', '/api/session'].includes(event.url.pathname)) {
		response.headers.set('cache-control', 'private, no-store');
		response.headers.append('vary', 'Cookie');
	}
	return response;
};
