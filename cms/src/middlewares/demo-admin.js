const { randomUUID } = require('node:crypto');
const { isLoopback } = require('../demo-admin');

module.exports =
	(_config, { strapi }) =>
	async (ctx, next) => {
		const isAdminDocument =
			ctx.method === 'GET' &&
			(ctx.path === '/admin' || ctx.path.startsWith('/admin/')) &&
			ctx.get('accept').toLowerCase().includes('text/html');

		if (!strapi.config.get('admin.demoOpenAccess') || !isAdminDocument) return next();

		if (!isLoopback(ctx.hostname) || !isLoopback(ctx.req.socket.remoteAddress)) {
			ctx.throw(403, 'Open demo admin is only available on localhost.');
		}

		const sessions = strapi.sessionManager('admin');
		const token = ctx.cookies.get('jwtToken', { signed: false });
		const access = token ? sessions.validateAccessToken(token) : { isValid: false };

		if (!access.isValid || !(await sessions.isSessionActive(access.payload.sessionId))) {
			const userId = strapi.config.get('admin.demoUserId');
			const user = await strapi.db
				.query('admin::user')
				.findOne({ where: { id: userId, isActive: true } });
			if (!user) ctx.throw(503, 'Demo administrator unavailable. Restart Strapi.');

			// Issue a real Strapi 5 admin session, not a bypass of API authentication.
			const { token: refreshToken } = await sessions.generateRefreshToken(
				String(user.id),
				randomUUID(),
				{ type: 'session' }
			);
			const result = await sessions.generateAccessToken(refreshToken);
			if ('error' in result) ctx.throw(500, 'Could not create the demo admin session.');

			const cookie = {
				path: '/admin',
				sameSite: 'lax',
				secure: ctx.secure,
				signed: false,
				overwrite: true
			};
			ctx.cookies.set('strapi_admin_refresh', refreshToken, { ...cookie, httpOnly: true });
			// Strapi's unmodified admin app reads this access cookie before rendering.
			ctx.cookies.set('jwtToken', result.token, { ...cookie, httpOnly: false });
		}

		await next();
		ctx.set('Cache-Control', 'private, no-store');
	};
