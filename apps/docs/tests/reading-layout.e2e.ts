import { expect, test, type Locator } from '@playwright/test';

test('component introductions wrap long identifiers without widening the mobile page', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/#/components/tabs');
	const title = page.locator('main h1');
	await expect(title).toHaveText('ZTabs');
	await expect(page.locator('main [data-doc-route="component:tabs"] > header')).toContainText(
		'LogicalCollection/MountedElements/CollectionNavigation'
	);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
	await expect(page.locator('main')).toHaveCSS('overflow-wrap', 'anywhere');
});

async function horizontalOverflow(root: Locator) {
	return root.evaluateAll((roots) =>
		roots.flatMap((root) => {
			const elements = [
				root,
				...root.querySelectorAll<HTMLElement>('table, th, td, pre, code, dd, [data-slot="wrapper"]')
			];
			return elements
				.filter(
					(element) =>
						element.getClientRects().length > 0 &&
						element.clientWidth > 0 &&
						element.scrollWidth > element.clientWidth + 1
				)
				.map((element) => ({
					tag: element.tagName,
					text: element.textContent?.slice(0, 100),
					clientWidth: element.clientWidth,
					scrollWidth: element.scrollWidth
				}));
		})
	);
}

test('desktop API gives descriptions room while complete long types wrap inside the table', async ({
	page
}) => {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto('/#/components/button');
	const api = page.locator('[data-api-reading]').first();
	const table = api.locator('[data-api-layout="table"] table');
	await expect(table).toBeVisible();
	await expect(table).toHaveCSS('table-layout', 'fixed');
	const metrics = await table.evaluate((element) => {
		const headers = element.querySelectorAll('th');
		const types = [...element.querySelectorAll<HTMLElement>('tbody td:nth-child(2) code')].sort(
			(left, right) => (right.textContent?.length ?? 0) - (left.textContent?.length ?? 0)
		);
		const longest = types[0]!;
		return {
			typeWidth: headers[1]!.getBoundingClientRect().width,
			descriptionWidth: headers[4]!.getBoundingClientRect().width,
			longTypeLength: longest.textContent?.length ?? 0,
			longTypeHeight: longest.getBoundingClientRect().height,
			lineHeight: Number.parseFloat(getComputedStyle(longest).lineHeight),
			whiteSpace: getComputedStyle(longest).whiteSpace,
			wrap: getComputedStyle(longest).overflowWrap
		};
	});
	expect(metrics.descriptionWidth).toBeGreaterThan(metrics.typeWidth);
	expect(metrics.longTypeLength).toBeGreaterThan(40);
	expect(metrics.longTypeHeight).toBeGreaterThanOrEqual(metrics.lineHeight * 2);
	expect(metrics.whiteSpace).toBe('pre-wrap');
	expect(metrics.wrap).toBe('anywhere');
	expect(await horizontalOverflow(page.locator('[data-api-reading]'))).toEqual([]);
});

test('narrow API becomes a definition list without losing names, full types or descriptions', async ({
	page
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/#/components/button');
	const api = page.locator('[data-api-reading]').first();
	const stack = api.locator('[data-api-layout="stack"]');
	await expect(stack).toBeVisible();
	await expect(api.locator('[data-api-layout="table"]')).toBeHidden();
	await expect(api.getByRole('table')).toHaveCount(0);
	const content = await api.evaluate((element) => {
		const rows = [...element.querySelectorAll<HTMLTableRowElement>('table tbody tr')];
		const stacked = [...element.querySelectorAll('[data-api-layout="stack"] > [data-api-row]')];
		return {
			table: rows.map((row) => [
				row.cells[0]!.textContent,
				row.cells[1]!.textContent,
				row.cells[4]!.textContent
			]),
			stack: stacked.map((row) =>
				['name', 'type', 'description'].map(
					(field) => row.querySelector(`[data-api-field="${field}"]`)!.textContent
				)
			),
			termsPerRow: stacked.map((row) => row.querySelectorAll('dt').length)
		};
	});
	expect(content.table.length).toBeGreaterThan(0);
	expect(content.stack).toEqual(content.table);
	expect(content.termsPerRow.every((count) => count === 5)).toBe(true);
	expect(await horizontalOverflow(page.locator('[data-api-reading]'))).toEqual([]);
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
		)
	).toBe(true);
});

test('demo source and guide code wrap for reading at mobile width', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/#/components/button');
	const demo = page.locator('#button-variants');
	await demo.getByRole('button', { name: '查看源码', exact: true }).click();
	const source = page.getByTestId('source-button-variants');
	await expect(source).toBeVisible();
	await expect(source.locator('pre')).toHaveCSS('white-space', 'pre-wrap');
	expect(await horizontalOverflow(source)).toEqual([]);
	await page.goto('/#/guides/icss');
	const guide = page.locator('[data-doc-route="guide:icss"]');
	await expect(guide).toBeVisible();
	const examples = guide.locator('pre');
	expect(await examples.count()).toBeGreaterThan(0);
	for (const example of await examples.all())
		await expect(example).toHaveCSS('white-space', 'pre-wrap');
	expect(await horizontalOverflow(guide)).toEqual([]);
});
