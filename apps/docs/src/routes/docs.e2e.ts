import { expect, test } from '@playwright/test';

test('ICSS demo keeps class and rule count stable', async ({ page }) => {
	const consoleErrors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') consoleErrors.push(message.text());
	});
	await page.goto('/icss');
	const panel = page.getByTestId('dynamic-panel');
	const slider = page.getByTestId('width');
	const initialClass = await panel.getAttribute('class');
	const initialRules = await page
		.locator('style[data-icss]')
		.evaluateAll((styles) =>
			styles.reduce(
				(total, style) => total + ((style as HTMLStyleElement).sheet?.cssRules.length ?? 0),
				0
			)
		);

	await slider.fill('480');
	await expect(panel).toHaveClass(initialClass ?? '');
	await expect
		.poll(() =>
			panel.evaluate((element) => {
				const variable = [...(element as HTMLElement).style].find((name) =>
					name.startsWith('--width-')
				);
				return variable ? (element as HTMLElement).style.getPropertyValue(variable) : undefined;
			})
		)
		.toBe('480');
	const finalRules = await page
		.locator('style[data-icss]')
		.evaluateAll((styles) =>
			styles.reduce(
				(total, style) => total + ((style as HTMLStyleElement).sheet?.cssRules.length ?? 0),
				0
			)
		);

	expect(finalRules).toBe(initialRules);
	expect(await page.locator('svelte-css-wrapper').count()).toBe(0);
	expect(consoleErrors).toEqual([]);
});
