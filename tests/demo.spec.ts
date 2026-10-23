import { test, expect } from '@playwright/test';
import { readFile, readdir, access } from 'node:fs/promises';

async function signIn(page: import('@playwright/test').Page, next = '/pro') {
	await page.goto('/login?next=' + encodeURIComponent(next));
	await page.getByRole('button', { name: 'Sign in as Alex (demo)' }).click();
}

test('public routes exist as real HTML, with no private data baked in', async ({ request }) => {
	for (const path of [
		'index',
		'desktop',
		'server',
		'news',
		'catalogue',
		'case-studies/university-desktops',
		'case-studies/research-cloud',
		'comparisons/desktop-and-server',
		'comparisons/standard-and-pro',
		'news/open-source-everywhere',
		'news/a-little-more-peace-of-mind'
	]) {
		const html = await readFile(`web/build/prerendered/${path}.html`, 'utf8');
		expect(html).toContain('data-rendering="static"');
		expect(html).not.toContain('alex@example.com');
		expect(html).not.toContain('alex-workstation');
	}
	await expect(access('web/build/prerendered/pro.html')).rejects.toThrow();
	const response = await request.get('/desktop');
	expect(response.status()).toBe(200);
	expect(await response.text()).toContain('Ubuntu for desktops');
});

test('global CSS highlights plain page markup and the dynamic account area', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'What changes, and when?' })).toBeVisible();
	const introduction = page.locator('main > .page-content.demo-static');
	await expect(introduction).toHaveCount(1);
	await expect(page.locator('main .demo-dynamic')).toHaveCount(0);
	await expect(introduction).toHaveCSS('background-color', 'rgb(237, 247, 241)');
	expect(
		await introduction.evaluate((element) => getComputedStyle(element, '::before').content)
	).toBe('"Static · prepared in advance"');
	await expect(introduction.getByRole('link', { name: 'Open your Pro dashboard' })).toBeVisible();

	const account = page.locator('header .header-account.demo-dynamic');
	await expect(account.getByRole('link', { name: 'Sign in' })).toBeVisible();
	await expect(account).toHaveCSS('background-color', 'rgb(243, 234, 251)');
	await expect(page.locator('.header-navigation.demo-shared')).toBeVisible();
	await expect(page.locator('.site-footer .demo-shared')).toBeVisible();
});

test('navigation actions use accessible button-style links without icon characters', async ({
	page
}) => {
	await page.goto('/');
	const primary = page.getByRole('link', { name: 'View static catalogue', exact: true });
	const secondary = page.getByRole('link', { name: 'Open your Pro dashboard', exact: true });
	for (const link of [primary, secondary]) {
		await expect(link).toHaveClass(/ds button/);
		expect(await link.evaluate((element) => element.tagName)).toBe('A');
		expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
	}
	await expect(primary).toHaveCSS('background-color', 'rgb(14, 132, 32)');
	await expect(
		page.locator('aside.featured-story').getByRole('link', { name: 'Read story' })
	).toBeVisible();
	await page.goto('/desktop');
	await expect(page.getByRole('link', { name: 'Page catalogue', exact: true })).toHaveClass(
		/ds button/
	);
	await expect(
		page.getByRole('link', { name: 'Open your Pro dashboard', exact: true })
	).toHaveClass(/ds button/);
});

test('UI markup and CSS do not use Unicode arrow or icon glyphs', async () => {
	const files = (await readdir('web/src', { recursive: true })).filter((file) =>
		/\.(svelte|css)$/.test(file)
	);
	for (const file of files) {
		expect(await readFile('web/src/' + file, 'utf8'), file).not.toMatch(
			/[\u2190-\u21ff\u25a0-\u25ff\u27f0-\u27ff]/
		);
	}
});

test('demo classes are not required for page content or sign-in to work', async ({ page }) => {
	const removeHighlights = () =>
		page.locator('.demo-static, .demo-dynamic, .demo-shared').evaluateAll((elements) => {
			for (const element of elements)
				element.classList.remove('demo-static', 'demo-dynamic', 'demo-shared');
		});
	await page.goto('/');
	await removeHighlights();
	const content = page.locator('main > .page-content');
	await expect(content).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
	expect(await content.evaluate((element) => getComputedStyle(element, '::before').content)).toBe(
		'none'
	);
	await expect(
		page.getByRole('heading', { name: 'Open source. Open possibilities.' })
	).toBeVisible();
	await page.getByRole('link', { name: 'Open your Pro dashboard' }).click();
	await removeHighlights();
	await page.getByRole('button', { name: 'Sign in as Alex (demo)' }).click();
	await expect(page.getByRole('heading', { name: 'Hello, Alex.' })).toBeVisible();
});

test('Ubuntu.com-based content is visible without adding more framed regions', async ({ page }) => {
	for (const [path, heading] of [
		['/', 'One platform, from the workstation to the cloud'],
		['/desktop', 'Everything you need for the everyday'],
		['/server', 'Scale out with Ubuntu Server'],
		['/case-studies/university-desktops', 'A desktop for learning and development'],
		['/case-studies/research-cloud', 'Self-service infrastructure with OpenStack'],
		['/comparisons/desktop-and-server', 'Use the same skills across both'],
		['/comparisons/standard-and-pro', 'What Ubuntu Pro adds'],
		['/news/open-source-everywhere', 'Build a cloud on open infrastructure'],
		['/news/a-little-more-peace-of-mind', 'Plan for a longer service life']
	]) {
		await page.goto(path);
		await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
		await expect(page.locator('main > .page-content.demo-static')).toHaveCount(1);
		const words = (await page.locator('.content-body').innerText()).split(/\s+/);
		expect(words.length).toBeGreaterThanOrEqual(130);
	}
});

test('every public content page has static outlines and a separate dynamic account area', async ({
	page
}) => {
	for (const path of [
		'/desktop',
		'/server',
		'/news',
		'/catalogue',
		'/case-studies/university-desktops',
		'/comparisons/desktop-and-server',
		'/news/open-source-everywhere',
		'/news/a-little-more-peace-of-mind'
	]) {
		await page.goto(path);
		await expect(page.locator('main > .page-content.demo-static')).toHaveCount(1);
		await expect(page.locator('main .demo-dynamic')).toHaveCount(0);
		await expect(page.locator('header .demo-dynamic')).toHaveCount(1);
	}
});

test('CSS highlights follow the content across sign-in and navigation', async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('main > .page-content.demo-dynamic')).toBeVisible();
	await page.getByRole('button', { name: 'Sign in as Alex (demo)' }).click();
	await expect(page.locator('main > .page-content.demo-dynamic')).toHaveCount(1);
	await expect(page.locator('main .demo-static')).toHaveCount(0);
	await expect(page.locator('main > .page-content.demo-dynamic')).toContainText('Hello, Alex.');
	await expect(page.locator('main')).toContainText('Fictional demo data');

	await page.getByRole('link', { name: 'Desktop', exact: true }).click();
	await expect(page.locator('main > .page-content.demo-static')).toBeVisible();
	await expect(page.locator('header .header-account.demo-dynamic')).toContainText('Alex Morgan');
	await expect(page.locator('main .demo-dynamic')).toHaveCount(0);
});

test('the catalogue is a file tree of every built static page', async ({ page, request }) => {
	await page.goto('/catalogue');
	await expect(page.getByRole('heading', { name: 'What did we build?' })).toBeVisible();
	for (const name of ['Case studies', 'Comparisons']) {
		const files = page.getByRole('list', { name, exact: true }).getByRole('link');
		expect(await files.count()).toBeGreaterThanOrEqual(2);
	}

	const files = (await readdir('web/build/prerendered', { recursive: true })).filter((file) =>
		file.endsWith('.html')
	);
	const paths = files.map((file) => (file === 'index.html' ? '/' : '/' + file.slice(0, -5)));
	const links = await page
		.locator('.file-tree a')
		.evaluateAll((links) =>
			links.map((link) => new URL((link as HTMLAnchorElement).href).pathname)
		);
	expect(links.sort()).toEqual(paths.sort());
	for (const path of paths) expect((await request.get(path)).status()).toBe(200);

	await page.getByRole('link', { name: /university-desktops.html/ }).click();
	await expect(page.getByRole('heading', { name: 'Ubuntu on campus' })).toBeVisible();
	await page.getByRole('link', { name: 'Page catalogue' }).click();
	await expect(page).toHaveURL('/catalogue');
	expect((await request.get('/comparisons/research-cloud')).status()).toBe(404);
	expect((await request.get('/research-cloud')).status()).toBe(404);
});

test('category folders show room to grow without inventing built files', async ({ page }) => {
	await page.goto('/catalogue');
	await expect(page.locator('.lede')).toContainText('any number of pages');
	await expect(page.locator('.folder-growth')).toHaveCount(2);
	await expect(page.locator('.folder-growth').first()).toHaveText('More pages can go here');

	const addPage = page.getByRole('link', { name: 'Add a page in Strapi', exact: true });
	const url = new URL((await addPage.getAttribute('href'))!);
	expect(url.pathname).toBe('/admin/content-manager/collection-types/api::page.page/create');
	expect(url.username).toBe('');
	await expect(addPage).toHaveAttribute('target', '_blank');
	await expect(page.getByRole('heading', { name: 'Add content, not route files' })).toBeVisible();

	const fileCount = await page.locator('.file-tree a').count();
	await page.getByRole('searchbox', { name: 'Filter pages' }).fill('university-desktops');
	await expect(page.locator('.file-tree a')).toHaveCount(1);
	await expect(page.locator('.folder-growth')).toHaveCount(0);
	await expect(page.locator('.tree-root [role="status"]')).toHaveText(`1 of ${fileCount} pages`);

	await page.getByRole('searchbox', { name: 'Filter pages' }).fill('');
	await page.getByRole('button', { name: 'Collapse all', exact: true }).click();
	await expect(page.locator('.file-tree details[open]')).toHaveCount(0);
	await page.getByRole('button', { name: 'Expand all', exact: true }).click();
	await expect(page.locator('.folder-growth').first()).toBeVisible();
	await expect(page.locator('.file-tree a')).toHaveCount(fileCount);
});

test('the dashboard and its data require a valid session', async ({ request }) => {
	const response = await request.get('/pro', { maxRedirects: 0 });
	expect(response.status()).toBe(303);
	expect(response.headers().location).toBe('/login?next=%2Fpro');
	expect(response.headers()['cache-control']).toBe('private, no-store');
	const data = await request.get('/pro/__data.json');
	expect(await data.text()).not.toContain('alex-workstation');
	const session = await request.get('/api/session', {
		headers: { Cookie: 'ubuntu_demo_session=forged' }
	});
	expect(await session.json()).toEqual({ user: null });
});

test('sign in, visit a static page, reload, then sign out', async ({ page }) => {
	await signIn(page);
	await expect(page.getByRole('heading', { name: 'Hello, Alex.' })).toBeVisible();
	await expect(page.getByRole('rowheader', { name: 'alex-workstation' })).toBeVisible();
	await expect(page.locator('header').getByText('Alex Morgan')).toBeVisible();
	await page.getByRole('link', { name: 'Desktop', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'Ubuntu for desktops' })).toBeVisible();
	await expect(page.locator('header').getByText('Alex Morgan')).toBeVisible();
	await page.reload();
	await expect(page.locator('header').getByText('Alex Morgan')).toBeVisible();
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.locator('header').getByRole('link', { name: 'Sign in' })).toBeVisible();
	await page.goto('/pro');
	await expect(page).toHaveURL(/\/login\?next=/);
});

test('static HTML is identical for anonymous and signed-in visitors', async ({ page, request }) => {
	const anonymous = await request.get('/desktop');
	await signIn(page, '/desktop');
	await expect(page.locator('header').getByText('Alex Morgan')).toBeVisible();
	const personalised = await page.request.get('/desktop');
	expect(await personalised.text()).toBe(await anonymous.text());
	expect(personalised.headers()['set-cookie']).toBeUndefined();

	const session = await page.request.get('/api/session');
	expect(session.headers()['cache-control']).toBe('private, no-store');
	expect(session.headers().vary).toContain('Cookie');
	expect((await session.json()).user.name).toBe('Alex Morgan');
	const cookie = (await page.context().cookies()).find(
		(cookie) => cookie.name === 'ubuntu_demo_session'
	);
	expect(cookie?.httpOnly).toBe(true);
	expect(cookie?.sameSite).toBe('Lax');
});

test('private account content is not cached and refreshes at request time', async ({ page }) => {
	await signIn(page);
	const first = await page.request.get('/pro');
	const second = await page.request.get('/pro');
	expect(first.headers()['cache-control']).toBe('private, no-store');
	expect(first.headers().vary).toContain('Cookie');
	expect(await first.text()).not.toBe(await second.text());
});

test('native forms and public content work without JavaScript', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('http://localhost:4173/desktop');
	await expect(page.getByRole('heading', { name: 'Ubuntu for desktops' })).toBeVisible();
	await page.goto('http://localhost:4173/catalogue');
	await expect(page.locator('.folder-growth').first()).toBeVisible();
	const folder = page.locator('.file-tree details').first();
	await folder.locator('summary').click();
	await expect(folder.getByRole('list')).not.toBeVisible();
	await folder.locator('summary').click();
	await expect(folder.getByRole('list')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Add a page in Strapi', exact: true })).toBeVisible();
	await page.goto('http://localhost:4173/login');
	await page.getByRole('button', { name: 'Sign in as Alex (demo)' }).click();
	await expect(page.getByRole('heading', { name: 'Hello, Alex.' })).toBeVisible();
	await context.close();
});

test('cross-origin form submissions are rejected', async ({ request }) => {
	for (const path of ['/login', '/logout']) {
		const response = await request.post(path, {
			headers: { Origin: 'https://not-this-site.example' },
			form: { next: '/pro' },
			maxRedirects: 0
		});
		expect(response.status()).toBe(403);
	}
});

test('a narrow screen keeps navigation and content accessible', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');
	await expect(
		page.getByRole('heading', { name: 'Open source. Open possibilities.' })
	).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
	await page.goto('/catalogue');
	await expect(page.getByRole('heading', { name: 'What did we build?' })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
	await signIn(page);
	await expect(page.getByRole('heading', { name: 'Hello, Alex.' })).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
		true
	);
});

test('an unavailable session endpoint does not break static content', async ({ page }) => {
	await page.route('**/api/session', (route) => route.abort());
	await page.goto('/desktop');
	await expect(page.getByRole('heading', { name: 'Ubuntu for desktops' })).toBeVisible();
	await expect(
		page.locator('header').getByRole('link', { name: 'Account unavailable' })
	).toBeVisible();
});

test('unbuilt CMS paths return 404, rather than fetching content at runtime', async ({
	request
}) => {
	expect((await request.get('/not-a-published-page')).status()).toBe(404);
	expect((await request.get('/news/not-a-published-post')).status()).toBe(404);
});
