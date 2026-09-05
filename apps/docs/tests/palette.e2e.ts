import { expect, test } from '@playwright/test';

test('applies and persists primary palette while high contrast keeps its preset colors', async ({
	page
}) => {
	await page.goto('/#/components/button');
	await page.evaluate(() => {
		localStorage.setItem('zui-docs-preferences-v1', JSON.stringify({ palette: 'invalid' }));
	});
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-palette', 'preset');
	const primary = page
		.getByTestId('demo-button-variants')
		.getByRole('button', { name: 'Primary', exact: true });
	const current = page.locator('nav[aria-label="组件导航"] a[aria-current="page"]');

	await page.getByRole('button', { name: '调整显示偏好', exact: true }).click();
	await page.getByRole('button', { name: '主色', exact: true }).click();
	await page.getByRole('option', { name: '玫瑰', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-palette', 'rose');
	await expect(page.locator('html')).toHaveAttribute('data-scheme', 'light');
	await page.keyboard.press('Escape');
	await expect(primary).toHaveCSS('background-color', 'rgb(190, 18, 60)');
	await expect(current).toHaveCSS('color', 'rgb(190, 18, 60)');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-palette', 'rose');
	await expect(primary).toHaveCSS('background-color', 'rgb(190, 18, 60)');

	await page.getByRole('button', { name: '选择文档主题', exact: true }).click();
	await page.getByRole('option', { name: '午夜专业', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-scheme', 'dark');
	await expect(page.locator('html')).toHaveAttribute('data-palette', 'rose');
	await expect(primary).toHaveCSS('background-color', 'rgb(253, 164, 175)');
	await expect(primary).toHaveCSS('color', 'rgb(15, 23, 42)');
	await page.getByRole('button', { name: '选择文档主题', exact: true }).click();
	await page.getByRole('option', { name: '高对比暗色', exact: true }).click();
	await expect(primary).toHaveCSS('background-color', 'rgb(102, 179, 255)');
	await page.getByRole('button', { name: '调整显示偏好', exact: true }).click();
	await expect(page.getByRole('button', { name: '主色', exact: true })).toBeDisabled();
	await page.keyboard.press('Escape');
	await page.getByRole('button', { name: '选择文档主题', exact: true }).click();
	await page.getByRole('option', { name: '午夜专业', exact: true }).click();
	await expect(primary).toHaveCSS('background-color', 'rgb(253, 164, 175)');

	await page.getByRole('button', { name: '调整显示偏好', exact: true }).click();
	await page.getByRole('button', { name: '对比度', exact: true }).click();
	await page.getByRole('option', { name: '高对比', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
	await expect(primary).toHaveCSS('background-color', 'rgb(102, 179, 255)');
	await expect(page.getByRole('button', { name: '主色', exact: true })).toBeDisabled();

	await page.getByRole('button', { name: '对比度', exact: true }).click();
	await page.getByRole('option', { name: '标准', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('data-contrast', 'normal');
	await expect(page.getByRole('button', { name: '主色', exact: true })).toBeEnabled();
	await expect(primary).toHaveCSS('background-color', 'rgb(253, 164, 175)');
	await expect(page.locator('html')).toHaveAttribute('data-palette', 'rose');

	const stored = await page.evaluate(() =>
		JSON.parse(localStorage.getItem('zui-docs-preferences-v1') ?? '{}')
	);
	expect(stored.palette).toBe('rose');
});

test('Theme Lab previews actual Card elevations and high contrast suppresses shadows', async ({
	page
}, testInfo) => {
	await page.goto('/#/guides/theme');
	const previews = page.locator('[data-slot="elevation-preview"]');
	await expect(previews).toHaveCount(4);
	await previews.last().scrollIntoViewIfNeeded();
	await expect(previews.nth(0)).toHaveCSS('box-shadow', 'none');
	const shadows = await previews.evaluateAll((cards) =>
		cards.map((card) => getComputedStyle(card).boxShadow)
	);
	expect(new Set(shadows).size).toBe(4);
	await page.screenshot({ path: testInfo.outputPath('theme-lab-elevations.png') });
	await page.getByRole('button', { name: '选择文档主题', exact: true }).click();
	await page.getByRole('option', { name: '高对比亮色', exact: true }).click();
	for (const card of await previews.all()) await expect(card).toHaveCSS('box-shadow', 'none');
});
