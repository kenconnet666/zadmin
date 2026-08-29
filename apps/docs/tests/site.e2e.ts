import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('renders the component catalog and real demo source', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	await page.goto('/#/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('看见组件');
	await expect(page.locator('.component-card')).toHaveCount(8);
	await expect(page.locator('.catalog-group > h3')).toHaveText([
		'通用组件',
		'布局组件',
		'输入组件'
	]);

	await page.goto('/#/components/button');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZButton');
	await expect(page.locator('.source-link')).toHaveAttribute(
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
	await page.goto('/#/components/button');
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
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
