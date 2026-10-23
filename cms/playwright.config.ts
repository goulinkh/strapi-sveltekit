import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	testMatch: 'admin.spec.ts',
	workers: 1,
	use: { baseURL: 'http://localhost:1337', browserName: 'chromium', trace: 'retain-on-failure' }
});
