import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('renders the component catalog and real demo source', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	await page.goto('/#/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('看见组件');
	await expect(page.getByTestId('component-card')).toHaveCount(20);
	await expect(page.getByRole('heading', { level: 3 })).toHaveText([
		'通用组件',
		'布局组件',
		'输入组件',
		'导航组件'
	]);

	await page.goto('/#/components/button');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZButton');
	await expect(page.getByRole('link', { name: /查看组件源码/u })).toHaveAttribute(
		'href',
		/\/components\/gene\/ZButton\.svelte$/u
	);
	await page.getByRole('button', { name: '查看源码' }).first().click();
	const source = page.getByTestId('source-button-variants');
	await expect(source).toContainText("from '@zadmin/zui'");
	const lightCode = source.locator('[data-color-scheme="light"]');
	await expect(lightCode).toBeVisible();
	await expect(lightCode).toHaveCSS('background-color', 'rgb(255, 255, 255)');
	await expect(lightCode).toHaveCSS('font-size', '14px');
	expect(await source.evaluate((element) => getComputedStyle(element).overflowY)).not.toBe('auto');

	await page.getByTestId('button-counter').click();
	await expect(page.getByText('count = 1')).toBeVisible();
	expect(errors).toEqual([]);
});

test('switches and persists coordinated light and cyberpunk themes', async ({ page }) => {
	await page.goto('/#/components/button');
	const shell = page.locator('#app > div').first();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
	await expect(shell).toHaveCSS('background-color', 'rgb(238, 244, 255)');
	await page.getByRole('button', { name: '切换到赛博朋克暗色主题' }).click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(shell).toHaveCSS('background-color', 'rgb(5, 9, 20)');
	await expect(page.getByRole('button', { name: '切换到亮色主题' })).toBeVisible();
	await page.getByRole('button', { name: '查看源码' }).first().click();
	const darkCode = page.getByTestId('source-button-variants').locator('[data-color-scheme="dark"]');
	await expect(darkCode).toBeVisible();
	await expect(darkCode).toHaveCSS('background-color', 'rgb(2, 4, 12)');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
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

test('keeps toggle button state native, bindable and keyboard accessible', async ({ page }) => {
	await page.goto('/#/components/toggle-button');
	const toggle = page.getByTestId('toggle-button-controlled');
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-pressed', 'true');
	await expect(toggle).toHaveAttribute('data-state', 'on');
	await expect(page.getByText('pressed = true · 用户变更次数 = 1')).toBeVisible();
	await toggle.press('Space');
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await expect(page.getByText('pressed = false · 用户变更次数 = 2')).toBeVisible();
});

test('keeps checkbox indeterminate, FormData and reset synchronized', async ({ page }) => {
	await page.goto('/#/components/checkbox');
	const checkbox = page.getByTestId('checkbox-reports');
	await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
	await expect(checkbox).toHaveJSProperty('indeterminate', true);
	await checkbox.check();
	await expect(checkbox).toBeChecked();
	await expect(page.getByText(/state = true · 用户变更次数 = 1/u)).toBeVisible();
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(page.getByText(/weekly/u)).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
	await expect(checkbox).toHaveJSProperty('indeterminate', true);
	await expect(page.getByText(/state = indeterminate · 用户变更次数 = 1/u)).toBeVisible();
});

test('keeps switch semantics, keyboard state, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/switch');
	const control = page.getByTestId('switch-alerts');
	await expect(control).toHaveRole('switch');
	await expect(control).toHaveAttribute('aria-checked', 'false');
	await page.locator('summary[aria-label="调整显示偏好"]').click();
	const preferences = page.locator('details select');
	await preferences.nth(2).selectOption('reduced');
	await preferences.nth(3).selectOption('rtl');
	await expect(control).toHaveCSS('transition-duration', '0s');
	await expect
		.poll(() => control.evaluate((element) => getComputedStyle(element, '::before').transform))
		.toBe('matrix(1, 0, 0, 1, 18, 0)');
	await control.press('Space');
	await expect(control).toHaveAttribute('aria-checked', 'true');
	await expect
		.poll(() => control.evaluate((element) => getComputedStyle(element, '::before').transform))
		.toBe('matrix(1, 0, 0, 1, 0, 0)');
	await expect(page.getByText(/checked = true · 用户变更次数 = 1/u)).toBeVisible();
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(page.getByText(/enabled/u)).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(control).toHaveAttribute('aria-checked', 'false');
	await expect(page.getByText(/checked = false · 用户变更次数 = 1 · 尚未提交/u)).toBeVisible();
});

test('keeps radio group roving focus, selection, RTL and FormData synchronized', async ({
	page
}) => {
	await page.goto('/#/components/radio-group');
	const starter = page.getByRole('radio', { name: '入门版' });
	const team = page.getByRole('radio', { name: '团队版' });
	const legacy = page.getByRole('radio', { name: '旧版' });
	const enterprise = page.getByRole('radio', { name: '企业版' });
	await expect(team).toBeChecked();
	await expect(team).toHaveAttribute('tabindex', '0');
	await expect(legacy).toBeDisabled();
	await team.press('ArrowRight');
	await expect(enterprise).toBeChecked();
	await expect(enterprise).toBeFocused();
	await enterprise.press('Home');
	await expect(starter).toBeChecked();
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(page.getByText(/starter/u)).toBeVisible();

	await page.locator('summary[aria-label="调整显示偏好"]').click();
	await page.locator('#zui-docs-direction').selectOption('rtl');
	await starter.press('ArrowRight');
	await expect(enterprise).toBeChecked();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(team).toBeChecked();
	await expect(page.getByText(/value = team · 用户变更次数 = 3 · 尚未提交/u)).toBeVisible();
});

test('keeps Tabs ARIA relationships, disabled skipping and RTL activation synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tabs');
	const overview = page.getByRole('tab', { name: '概览' });
	const metrics = page.getByRole('tab', { name: '指标' });
	const legacy = page.getByRole('tab', { name: '旧版' });
	const events = page.getByRole('tab', { name: '事件' });
	await expect(overview).toHaveAttribute('aria-selected', 'true');
	const panelId = await overview.getAttribute('aria-controls');
	await expect(page.locator(`#${panelId}`)).toBeVisible();
	await expect(legacy).toBeDisabled();
	await overview.press('ArrowRight');
	await expect(metrics).toHaveAttribute('aria-selected', 'true');
	await metrics.press('ArrowRight');
	await expect(events).toHaveAttribute('aria-selected', 'true');
	await events.press('Home');
	await expect(overview).toHaveAttribute('aria-selected', 'true');

	await page.locator('summary[aria-label="调整显示偏好"]').click();
	await page.locator('#zui-docs-direction').selectOption('rtl');
	await overview.press('ArrowRight');
	await expect(events).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByText(/value = events · 用户变更次数 = 4/u)).toBeVisible();
});

test('keeps S1 primitives semantic and display preferences effective', async ({ page }) => {
	await page.goto('/#/guides/theme');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('主题不是一组颜色');
	await expect(page.locator('[style^="background:"]')).toHaveCount(19);

	await page.goto('/#/components/link');
	await expect(page.locator('main a[aria-disabled="true"]')).not.toHaveAttribute('href');
	await expect(page.locator('main a[target="_blank"]').first()).toHaveAttribute(
		'rel',
		'noopener noreferrer'
	);

	await page.goto('/#/components/separator');
	await expect(page.locator('main hr[data-orientation="horizontal"]')).toHaveCount(1);
	await expect(page.locator('main [role="separator"][aria-orientation="vertical"]')).toHaveCount(1);

	await page.goto('/#/components/visually-hidden');
	await expect(page.getByRole('button', { name: '搜索文档', exact: true })).toBeVisible();

	await page.locator('summary[aria-label="调整显示偏好"]').click();
	const preferences = page.locator('details select');
	await preferences.nth(0).selectOption('compact');
	await preferences.nth(1).selectOption('high');
	await preferences.nth(2).selectOption('reduced');
	await preferences.nth(3).selectOption('rtl');
	await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
	await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
	await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
	for (const route of [
		'#/',
		'#/guides/theme',
		'#/components/provider',
		'#/components/box',
		'#/components/stack',
		'#/components/text',
		'#/components/icon',
		'#/components/code',
		'#/components/button',
		'#/components/toggle-button',
		'#/components/link',
		'#/components/separator',
		'#/components/visually-hidden',
		'#/components/kbd',
		'#/components/aspect-ratio',
		'#/components/container',
		'#/components/checkbox',
		'#/components/input',
		'#/components/field',
		'#/components/radio-group',
		'#/components/switch',
		'#/components/tabs'
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
