const { randomBytes } = require('node:crypto');

const email = 'cms-demo@example.invalid';
const isLoopback = (host) =>
	['localhost', '127.0.0.1', '::1', '[::1]', '::ffff:127.0.0.1'].includes(host);

async function bootstrapDemoAdmin(strapi) {
	let user = await strapi.db.query('admin::user').findOne({
		where: { email },
		populate: ['roles']
	});

	if (!strapi.config.get('admin.demoOpenAccess')) {
		// Turning the mode off also invalidates previously issued demo sessions.
		if (user) await strapi.sessionManager('admin').invalidateRefreshToken(String(user.id));
		return;
	}

	if (!user) {
		const role = await strapi.admin.services.role.getSuperAdmin();
		user = await strapi.admin.services.user.create({
			email,
			firstname: 'Demo',
			lastname: 'Admin',
			password: randomBytes(32).toString('hex'),
			registrationToken: null,
			isActive: true,
			roles: [role.id]
		});
	}

	if (!user.isActive || !user.roles.some((role) => role.code === 'strapi-super-admin')) {
		throw new Error('The demo administrator is inactive or lacks its demo role.');
	}

	strapi.config.set('admin.demoUserId', user.id);
	strapi.log.warn(
		'OPEN DEMO ADMIN: local visitors receive full CMS administrator access. Do not expose port 1337.'
	);
}

module.exports = { bootstrapDemoAdmin, isLoopback };
