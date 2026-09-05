import { expect, test } from '@playwright/test';

test('Provider demonstrates shared text-control defaults and an explicit override', async ({
	page
}) => {
	await page.goto('/#/components/provider');
	const demo = page.getByTestId('demo-provider-component-defaults');
	for (const name of [
		'Provider默认大尺寸输入框',
		'Provider默认大尺寸组合输入框',
		'Provider默认大尺寸多行输入框'
	]) {
		const control = demo.getByRole('textbox', { name, exact: true });
		await expect(control).toHaveAttribute('data-size', 'large');
		await expect(control).toHaveCSS('font-size', '18px');
	}
	const small = demo.getByRole('textbox', { name: '显式小尺寸多行输入框', exact: true });
	await expect(small).toHaveAttribute('data-size', 'small');
	await expect(small).toHaveCSS('font-size', '12px');
});

test('long-code demo and Theme Lab token values wrap on a narrow viewport', async ({
	page
}, testInfo) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/#/components/code');
	const code = page.getByTestId('demo-code-inline').locator('pre[aria-label="可换行长标识符"]');
	await expect(code).toBeVisible();
	await expect(code).toHaveText('0123456789abcdef'.repeat(12));
	expect(await code.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
	await page.goto('/#/guides/theme');
	const values = page.locator('[data-slot="semantic-color"] code');
	await expect(values).toHaveCount(29);
	expect(
		await values.evaluateAll((elements) =>
			elements.every((el) => el.scrollWidth <= el.clientWidth + 1)
		)
	).toBe(true);
	await values.first().scrollIntoViewIfNeeded();
	await page.screenshot({ path: testInfo.outputPath('theme-tokens-wrapped-mobile.png') });
});

test('Badge controls change actual size, tone and placement while Avatar preserves a grapheme', async ({
	page
}) => {
	await page.goto('/#/components/badge');
	const demo = page.getByTestId('demo-badge-dynamic');
	const badge = demo.locator('[data-slot="root"][data-anchored="true"]').first();
	const indicator = badge.locator('[data-slot="indicator"]');
	await expect(badge).toHaveAttribute('data-size', 'medium');
	const height = await indicator.evaluate((el) => el.getBoundingClientRect().height);
	const color = await indicator.evaluate((el) => getComputedStyle(el).backgroundColor);
	await demo.getByRole('button', { name: 'size（medium）', exact: true }).click();
	await expect(badge).toHaveAttribute('data-size', 'small');
	await expect
		.poll(() => indicator.evaluate((el) => el.getBoundingClientRect().height))
		.toBeLessThan(height);
	await demo.getByRole('button', { name: 'tone（danger）', exact: true }).click();
	await expect(badge).toHaveAttribute('data-tone', 'accent');
	await expect(indicator).not.toHaveCSS('background-color', color);
	await demo.getByRole('button', { name: 'placement（top-end）', exact: true }).click();
	await expect(badge).toHaveAttribute('data-placement', 'top-start');
	await page.goto('/#/components/avatar');
	await expect(
		page
			.getByTestId('demo-avatar-fallback')
			.getByRole('img', { name: '👩‍💻 研发工程师', exact: true })
	).toHaveText('👩‍💻');
});
