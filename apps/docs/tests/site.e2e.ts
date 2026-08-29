import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('renders the component catalog and real demo source', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	await page.goto('/#/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('看见组件');
	await expect(page.getByTestId('component-card')).toHaveCount(9);
	await expect(page.getByRole('heading', { level: 3 })).toHaveText([
		'通用组件',
		'布局组件',
		'输入组件'
	]);

	await page.goto('/#/components/button');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZButton');
	await expect(page.getByRole('link', { name: /查看组件源码/u })).toHaveAttribute(
		'href',
		/\/components\/gene\/ZButton\.svelte$/u
	);
	await page.getByRole('button', { name: '查看源码' }).first().click();
	await expect(page.getByTestId('source-button-variants')).toContainText("from '@zadmin/zui'");

	await page.getByTestId('button-counter').click();
	await expect(page.getByText('count = 1')).toBeVisible();
	expect(errors).toEqual([]);
});

test('keeps input binding and field validation interactive', async ({ page }) => {
	await page.goto('/#/components/input');
	const input = page.getByTestId('input-binding');
	await input.fill('typed');
	await expect(page.getByText(/value = typed/u)).toBeVisible();

	await page.goto('/#/components/field');
	const account = page.getByTestId('field-account');
	await account.fill('ab');
	await expect(page.getByText('账号至少需要3个字符')).toBeVisible();
	await account.fill('alice');
	await expect(page.getByText('账号至少需要3个字符')).toHaveCount(0);
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
	for (const route of [
		'#/',
		'#/components/provider',
		'#/components/box',
		'#/components/stack',
		'#/components/text',
		'#/components/icon',
		'#/components/code',
		'#/components/button',
		'#/components/input',
		'#/components/field'
	]) {
		await page.goto(`/${route}`);
		const results = await new AxeBuilder({ page }).analyze();
		expect(results.violations, route).toEqual([]);
	}
});

test('highlights code on demand and supports section deep links', async ({ page }) => {
	await page.goto('/#/components/code');
	const code = page.getByLabel('Svelte按钮示例');
	await expect(code).toHaveAttribute('data-highlight-status', 'highlighted');
	await expect(code.locator('[data-highlighted="true"]')).toHaveCount(2);

	await page.goto('/#/components/button/api');
	await expect(page.getByRole('heading', { level: 2, name: 'Props' })).toBeInViewport();
});

test('keeps navigation usable at a narrow viewport', async ({ page }) => {
	await page.setViewportSize({ height: 800, width: 390 });
	await page.goto('/#/components/button');
	await expect(page.getByRole('navigation', { name: '组件导航' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 1, name: 'ZButton' })).toBeVisible();
});

test('handles denied clipboard permission without a console error', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	page.on('pageerror', (error) => errors.push(error.message));
	await page.addInitScript(() => {
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				writeText: async () => {
					throw new DOMException('Denied', 'NotAllowedError');
				}
			}
		});
	});

	await page.goto('/#/components/button');
	await page.getByRole('button', { name: '复制' }).first().click();
	await expect(page.getByRole('button', { name: '复制失败' })).toBeVisible();
	expect(errors).toEqual([]);
});
