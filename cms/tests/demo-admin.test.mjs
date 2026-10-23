import { test } from 'node:test';
import assert from 'node:assert/strict';
import adminConfig from '../config/admin.js';
import demoAdmin from '../src/demo-admin.js';
import middleware from '../src/middlewares/demo-admin.js';

const envFor = (values) => {
	const env = (key, fallback) => values[key] ?? fallback;
	env.bool = (key, fallback) => (values[key] === undefined ? fallback : values[key] === 'true');
	return env;
};

test('open admin is opt-in and refuses production or a public bind address', () => {
	assert.equal(adminConfig({ env: envFor({}) }).demoOpenAccess, false);
	assert.equal(
		adminConfig({ env: envFor({ DEMO_ADMIN_OPEN_ACCESS: 'true' }) }).demoOpenAccess,
		true
	);
	for (const values of [{ HOST: '0.0.0.0' }, { HOST: '::' }, { NODE_ENV: 'production' }]) {
		assert.throws(
			() => adminConfig({ env: envFor({ DEMO_ADMIN_OPEN_ACCESS: 'true', ...values }) }),
			/loopback/
		);
	}
	assert.equal(
		adminConfig({ env: envFor({ NODE_ENV: 'production', DEMO_ADMIN_OPEN_ACCESS: 'false' }) })
			.demoOpenAccess,
		false
	);
});

function fixture(enabled = true) {
	const cookies = [];
	let generated = 0;
	let continued = 0;
	const strapi = {
		config: { get: (key) => (key === 'admin.demoOpenAccess' ? enabled : 7) },
		db: { query: () => ({ findOne: async () => ({ id: 7, isActive: true }) }) },
		sessionManager: () => ({
			validateAccessToken: () => ({ isValid: true, payload: { sessionId: 'existing' } }),
			isSessionActive: async () => true,
			generateRefreshToken: async () => {
				generated++;
				return { token: 'refresh' };
			},
			generateAccessToken: async () => ({ token: 'access' })
		})
	};
	const ctx = {
		method: 'GET',
		path: '/admin',
		hostname: 'localhost',
		secure: false,
		req: { socket: { remoteAddress: '127.0.0.1' } },
		get: () => 'text/html',
		set: () => {},
		throw: (status, message) => {
			throw Object.assign(new Error(message), { status });
		},
		cookies: {
			get: () => undefined,
			set: (name, token, options) => cookies.push({ name, token, options })
		}
	};
	const run = () =>
		middleware({}, { strapi })(ctx, async () => {
			continued++;
		});
	return { ctx, run, cookies, generated: () => generated, continued: () => continued };
}

test('opening an admin document issues normal access and refresh cookies', async () => {
	const f = fixture();
	await f.run();
	assert.equal(f.generated(), 1);
	assert.equal(f.continued(), 1);
	assert.deepEqual(
		f.cookies.map((cookie) => cookie.name),
		['strapi_admin_refresh', 'jwtToken']
	);
	assert.ok(f.cookies.every((cookie) => cookie.options.path === '/admin'));
	assert.equal(f.cookies[0].options.httpOnly, true);
	assert.equal(f.cookies[1].options.httpOnly, false);
});

test('normal auth remains untouched when disabled or serving API requests', async () => {
	const disabled = fixture(false);
	await disabled.run();
	assert.equal(disabled.generated(), 0);
	const api = fixture();
	api.ctx.path = '/admin/users/me';
	api.ctx.get = () => 'application/json';
	await api.run();
	assert.equal(api.generated(), 0);
});

test('valid sessions are reused rather than replaced on each reload', async () => {
	const f = fixture();
	f.ctx.cookies.get = () => 'existing';
	await f.run();
	assert.equal(f.generated(), 0);
});

test('public host headers and non-loopback clients cannot use open admin', async () => {
	for (const change of [
		(ctx) => {
			ctx.hostname = 'public.example';
		},
		(ctx) => {
			ctx.req.socket.remoteAddress = '192.0.2.1';
		}
	]) {
		const f = fixture();
		change(f.ctx);
		await assert.rejects(f.run(), (error) => error.status === 403);
		assert.equal(f.generated(), 0);
	}
});

test('disabling the mode revokes previously issued demo sessions', async () => {
	let revoked;
	await demoAdmin.bootstrapDemoAdmin({
		config: { get: () => false },
		db: { query: () => ({ findOne: async () => ({ id: 7 }) }) },
		sessionManager: () => ({
			invalidateRefreshToken: async (id) => {
				revoked = id;
			}
		})
	});
	assert.equal(revoked, '7');
});
