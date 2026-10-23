const { isLoopback } = require('../src/demo-admin');

module.exports = ({ env }) => {
	const demoOpenAccess = env.bool('DEMO_ADMIN_OPEN_ACCESS', false);
	if (
		demoOpenAccess &&
		(env('NODE_ENV', 'development') === 'production' || !isLoopback(env('HOST', '127.0.0.1')))
	) {
		throw new Error(
			'DEMO_ADMIN_OPEN_ACCESS is only allowed outside production on a loopback host.'
		);
	}

	return {
		autoOpen: false,
		demoOpenAccess,
		auth: { secret: env('ADMIN_JWT_SECRET'), cookie: { path: '/admin' } },
		apiToken: { salt: env('API_TOKEN_SALT') },
		transfer: { token: { salt: env('TRANSFER_TOKEN_SALT') } },
		secrets: { encryptionKey: env('ENCRYPTION_KEY') }
	};
};
