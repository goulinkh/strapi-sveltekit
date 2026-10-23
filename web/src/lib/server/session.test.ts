import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, readSession, safeNext, demoUser, sessionSeconds } from './session.ts';

const secret = 'a-demo-secret-that-is-longer-than-32-characters';
const now = 1_800_000_000_000;

test('a signed session resolves the demo identity, until expiry', () => {
	const token = createSession(secret, now);
	assert.deepEqual(readSession(token, secret, now + 1), demoUser);
	assert.equal(readSession(token, secret, now + sessionSeconds * 1000), null);
});

test('missing, malformed, forged, or wrong-secret cookies do not authenticate', () => {
	const token = createSession(secret, now);
	for (const invalid of [undefined, '', 'Alex', token + 'x', token.replace(/^./, '9')]) {
		assert.equal(readSession(invalid, secret, now), null);
	}
	assert.equal(readSession(token, 'a-different-secret-longer-than-32-characters', now), null);
});

test('session signing refuses an unconfigured secret', () => {
	assert.throws(() => createSession(''), /SESSION_SECRET/);
});

test('return URLs must be safe local destinations, not auth loops', () => {
	for (const next of [
		null,
		'',
		'https://example.com',
		'//evil.test',
		'/\\evil.test',
		'/\n/evil.test',
		'/login',
		'/login?next=/login',
		'/logout',
		'/api/session'
	]) {
		assert.equal(safeNext(next), '/pro');
	}
	assert.equal(safeNext('/desktop'), '/desktop');
	assert.equal(safeNext('/news?from=header#stories'), '/news?from=header#stories');
});
