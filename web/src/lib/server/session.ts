import { createHmac, timingSafeEqual } from 'node:crypto';

export const cookieName = 'ubuntu_demo_session';
export const sessionSeconds = 60 * 60 * 8;
export const demoUser = { name: 'Alex Morgan', email: 'alex@example.com' };

function signature(value: string, secret: string): string {
	if (secret.length < 32)
		throw new Error('SESSION_SECRET must be at least 32 characters. Run npm run setup.');
	return createHmac('sha256', secret).update(value).digest('hex');
}

// One fixed demo identity, not an authentication provider. No credentials or personal data in the cookie.
export function createSession(secret: string, now = Date.now()): string {
	const expires = String(now + sessionSeconds * 1000);
	return `${expires}.${signature(expires, secret)}`;
}

export function readSession(token: string | undefined, secret: string, now = Date.now()) {
	if (!token) return null;
	const match = /^(\d{13})\.([a-f0-9]{64})$/.exec(token);
	if (!match) return null;
	const [, expires, supplied] = match;
	const expected = signature(expires, secret);
	if (!timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return null;
	if (Number(expires) <= now) return null;
	return demoUser;
}

// Keep form redirects same-origin, even if a return URL is supplied by a visitor.
export function safeNext(value: string | null): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\'))
		return '/pro';
	if (/[\u0000-\u0020\u007f]/.test(value)) return '/pro';
	const path = new URL(value, 'https://demo.invalid');
	if (/^\/(login|logout|api)(\/|$)/.test(path.pathname)) return '/pro';
	return path.pathname + path.search + path.hash;
}
