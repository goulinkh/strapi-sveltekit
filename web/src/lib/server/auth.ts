import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { sessionSeconds } from './session';

export function sessionSecret() {
	if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
		throw new Error('SESSION_SECRET must be at least 32 characters. Run npm run setup.');
	}
	return env.SESSION_SECRET;
}

export const cookieOptions = () => ({
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	secure: env.SESSION_COOKIE_SECURE !== 'false' && !dev,
	maxAge: sessionSeconds
});
