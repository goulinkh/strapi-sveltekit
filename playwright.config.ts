import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	use: { baseURL: 'http://localhost:4173', browserName: 'chromium', trace: 'retain-on-failure' },
	webServer: {
		command: 'npm run start:web',
		url: 'http://localhost:4173',
		env: { PORT: '4173', ORIGIN: 'http://localhost:4173' },
		reuseExistingServer: false
	}
});
