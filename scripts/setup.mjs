import { randomBytes } from 'node:crypto';
import { access, writeFile } from 'node:fs/promises';

const secret = () => randomBytes(32).toString('hex');
const files = {
	'cms/.env': `HOST=127.0.0.1
PORT=1337
APP_KEYS=${secret()},${secret()}
API_TOKEN_SALT=${secret()}
ADMIN_JWT_SECRET=${secret()}
TRANSFER_TOKEN_SALT=${secret()}
JWT_SECRET=${secret()}
ENCRYPTION_KEY=${secret()}
DATABASE_FILENAME=.tmp/data.db
SEED_DEMO=true
# Local demo only: visitors enter the CMS admin without a login form.
DEMO_ADMIN_OPEN_ACCESS=true
STRAPI_TELEMETRY_DISABLED=true
`,
	'web/.env': `CMS_URL=http://127.0.0.1:1337
SESSION_SECRET=${secret()}
# Local HTTP only. Remove this override when deploying behind HTTPS.
SESSION_COOKIE_SECURE=false
ORIGIN=http://localhost:3000
HOST=127.0.0.1
PORT=3000
`
};

for (const [path, content] of Object.entries(files)) {
	try {
		await access(path);
		console.log(`Kept existing ${path}`);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		await writeFile(path, content, { flag: 'wx', mode: 0o600 });
		console.log(`Created ${path}`);
	}
}
