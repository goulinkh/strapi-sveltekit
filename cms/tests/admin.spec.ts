import { test, expect } from '@playwright/test';

test('the catalogue create-page destination opens directly in the editor', async ({ page }) => {
	await page.goto('/admin/content-manager/collection-types/api::page.page/create');
	await expect(page.getByRole('textbox', { name: /^title/i })).toBeVisible({ timeout: 30_000 });
	await expect(page.getByRole('link', { name: 'Content Manager', exact: true })).toBeVisible();
	expect(page.url()).not.toContain('/auth/');
});

test('a fresh visitor enters the CMS without registering or signing in', async ({ page }) => {
	await page.goto('/admin');
	await expect(page.getByRole('link', { name: 'Content Manager', exact: true })).toBeVisible({
		timeout: 30_000
	});
	expect(page.url()).not.toMatch(/auth\/(login|register-admin)/);

	const cookies = await page.context().cookies();
	expect(cookies.find((cookie) => cookie.name === 'jwtToken')?.path).toBe('/admin');
	expect(cookies.find((cookie) => cookie.name === 'strapi_admin_refresh')?.httpOnly).toBe(true);

	await page.getByRole('link', { name: 'Content Manager', exact: true }).click();
	await expect(
		page
			.getByRole('navigation', { name: 'Content Manager', exact: true })
			.getByRole('link', { name: 'Page', exact: true })
	).toBeVisible();
	await page.reload();
	await expect(page.getByRole('link', { name: 'Content Manager', exact: true })).toBeVisible();

	// Refresh stays on Strapi's native session flow; admin APIs still require a bearer token.
	const refresh = await page.request.post('/admin/access-token');
	expect(refresh.status()).toBe(200);
	const { data } = await refresh.json();
	const me = await page.request.get('/admin/users/me', {
		headers: { Authorization: `Bearer ${data.token}` }
	});
	expect(me.status()).toBe(200);
	expect((await me.json()).data.email).toBe('cms-demo@example.invalid');
	expect((await page.request.get('/admin/users/me')).status()).toBe(401);
});
