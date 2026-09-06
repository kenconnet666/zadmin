import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('copies real collapsed demo source from separate responsive actions and confirms success', async ({
	page
}) => {
	const expectedSource = (
		await readFile(
			new URL('../src/content/components/gene/button/VariantsDemo.svelte', import.meta.url),
			'utf8'
		)
	).trim();
	await page.addInitScript(() => {
		const state = window as Window & { copiedDemoSource?: string; finishDemoCopy?: () => void };
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				writeText: (source: string) =>
					new Promise<void>((resolve) => {
						state.copiedDemoSource = source;
						state.finishDemoCopy = resolve;
					})
			}
		});
	});

	for (const width of [1280, 390]) {
		await page.setViewportSize({ width, height: 844 });
		await page.goto('/#/components/button');
		const demo = page.locator('#button-variants');
		const actions = demo.getByTestId('doc-source-actions');
		const copy = actions.getByTestId('copy-demo-source');
		const toggle = actions.getByRole('button', { name: '查看源码', exact: true });
		await expect(copy).toHaveText('复制源码');
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect(copy.locator('[data-copy-icon="copy"]')).toBeVisible();
		await expect(actions.locator('button button')).toHaveCount(0);
		const initialCopy = await copy.boundingBox();
		const initialToggle = await toggle.boundingBox();
		expect(initialCopy).not.toBeNull();
		expect(initialToggle).not.toBeNull();
		if (width === 1280)
			expect(initialCopy!.x + initialCopy!.width).toBeLessThanOrEqual(initialToggle!.x);

		await copy.click();
		await expect(copy).toBeDisabled();
		await expect(copy).toHaveAttribute('data-copy-state', 'copying');
		await expect(copy.locator('[data-copy-icon="check"]')).toHaveCount(0);
		await page.evaluate(() =>
			(window as Window & { finishDemoCopy?: () => void }).finishDemoCopy?.()
		);
		await expect(copy).toHaveText('已复制');
		await expect(copy.locator('[data-copy-icon="check"]')).toBeVisible();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await expect
			.poll(() =>
				page.evaluate(() => (window as Window & { copiedDemoSource?: string }).copiedDemoSource)
			)
			.toBe(expectedSource);
		expect((await copy.boundingBox())!.width).toBeCloseTo(initialCopy!.width, 1);

		await toggle.click();
		const source = demo.getByTestId('source-button-variants');
		await expect(source).toBeVisible();
		await expect(source.locator('[data-slot="copy-action"]')).toHaveCount(0);
		await expect(source.locator('pre')).toHaveCSS('white-space', 'pre-wrap');
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
			)
		).toBe(true);
	}
});
