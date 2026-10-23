import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.CMS_URL || 'http://127.0.0.1:1337';

for (const collection of ['pages', 'posts', 'categories']) {
	test(`${collection}: public reads return published content even when drafts are requested`, async () => {
		const response = await fetch(`${base}/api/${collection}?status=draft`);
		assert.equal(response.status, 200);
		const { data } = await response.json();
		assert.ok(data.length > 0, 'Start the seeded CMS first.');
		assert.ok(data.every((entry) => entry.publishedAt));
		const detail = await fetch(`${base}/api/${collection}/${data[0].documentId}?status=draft`);
		assert.equal(detail.status, 200);
		assert.ok((await detail.json()).data.publishedAt);
	});

	test(`${collection}: anonymous visitors cannot create content`, async () => {
		const response = await fetch(`${base}/api/${collection}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ data: {} })
		});
		assert.equal(response.status, 403);
	});
}

test('example pages are related to their CMS categories', async () => {
	const response = await fetch(`${base}/api/pages?populate=category`);
	assert.equal(response.status, 200);
	const { data } = await response.json();
	assert.equal(
		data.find((page) => page.slug === 'university-desktops').category.slug,
		'case-studies'
	);
	assert.equal(
		data.find((page) => page.slug === 'desktop-and-server').category.slug,
		'comparisons'
	);
});
