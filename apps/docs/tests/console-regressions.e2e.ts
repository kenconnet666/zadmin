import { expect, test, type Page } from '@playwright/test';

declare global {
	interface Window {
		__docsScrollCalls: Array<{ id: string; route: string | null }>;
	}
}

async function settleFrames(page: Page): Promise<void> {
	await page.evaluate(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
			})
	);
}

test('serves real SVG and ICO favicons without fallback 404s', async ({ request }) => {
	const svg = await request.get('/favicon.svg');
	expect(svg.status()).toBe(200);
	expect(svg.headers()['content-type']).toContain('image/svg+xml');
	expect(await svg.text()).toContain('<svg');
	const ico = await request.get('/favicon.ico');
	expect(ico.status()).toBe(200);
	expect(ico.headers()['content-type']).toMatch(/image\/(?:x-icon|vnd\.microsoft\.icon)/u);
	const bytes = await ico.body();
	expect(bytes.readUInt16LE(0)).toBe(0);
	expect(bytes.readUInt16LE(2)).toBe(1);
	expect(bytes.readUInt16LE(4)).toBe(2);
});

test('scrolls each section once and only after the requested document mounts', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.addInitScript(() => {
		window.__docsScrollCalls = [];
		const original = Element.prototype.scrollIntoView;
		Element.prototype.scrollIntoView = function (options) {
			window.__docsScrollCalls.push({
				id: this.id,
				route: this.closest('[data-doc-route]')?.getAttribute('data-doc-route') ?? null
			});
			original.call(this, options);
		};
	});

	await page.goto('/#/components/button/api-states');
	await expect(page.locator('[data-doc-route="component:button"]')).toBeVisible();
	await expect(page.locator('#api-states')).toBeInViewport();
	await settleFrames(page);
	expect(
		await page.evaluate(() => window.__docsScrollCalls.filter(({ id }) => id === 'api-states'))
	).toEqual([{ id: 'api-states', route: 'component:button' }]);

	await page.evaluate(() => {
		window.__docsScrollCalls = [];
	});
	await page.getByRole('link', { name: 'Parts', exact: true }).click();
	await expect(page.locator('#api-parts')).toBeInViewport();
	await settleFrames(page);
	expect(
		await page.evaluate(() => window.__docsScrollCalls.filter(({ id }) => id === 'api-parts'))
	).toEqual([{ id: 'api-parts', route: 'component:button' }]);

	await page.evaluate(() => {
		window.__docsScrollCalls = [];
		location.hash = '#/components/list/api-states';
	});
	await expect(page.locator('[data-doc-route="component:list"]')).toBeVisible();
	await expect(page.locator('#api-states')).toBeInViewport();
	await settleFrames(page);
	expect(
		await page.evaluate(() => window.__docsScrollCalls.filter(({ id }) => id === 'api-states'))
	).toEqual([{ id: 'api-states', route: 'component:list' }]);

	await page.evaluate(() => {
		window.__docsScrollCalls = [];
		location.hash = '#/components/button/api-parts';
		location.hash = '#/components/card/api-states';
	});
	await expect(page.locator('[data-doc-route="component:card"]')).toBeVisible();
	await expect(page.locator('#api-states')).toBeInViewport();
	await settleFrames(page);
	expect(
		await page.evaluate(() => window.__docsScrollCalls.filter(({ route }) => route !== null))
	).toEqual([{ id: 'api-states', route: 'component:card' }]);
	expect(errors).toEqual([]);
});
