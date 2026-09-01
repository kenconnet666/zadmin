import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';

const demo = (page: Page, id: string) => page.getByTestId(`demo-${id}`);

async function setDisplayPreference(
	page: Page,
	preference: '动画' | '对比度' | '方向' | '密度',
	option: string
): Promise<void> {
	await page.getByRole('button', { name: '调整显示偏好', exact: true }).click();
	await page.getByRole('button', { name: preference, exact: true }).click();
	await page.getByRole('option', { name: option, exact: true }).click();
	await page.keyboard.press('Escape');
}

test('renders the component catalog and real demo source', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	await page.goto('/#/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('看见组件');
	const cards = page.getByTestId('component-card');
	const guideCards = page.getByTestId('guide-card');
	expect(await cards.count()).toBeGreaterThanOrEqual(50);
	await expect(guideCards).toHaveCount(7);
	await expect(page.getByRole('heading', { level: 2, name: '生产指南' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 3 })).toHaveText([
		'通用组件',
		'布局组件',
		'输入组件',
		'导航组件',
		'浮层组件',
		'展示组件',
		'反馈组件'
	]);

	await page.goto('/#/components/button');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZButton');
	await expect(page.getByRole('link', { name: /查看组件源码/u })).toHaveAttribute(
		'href',
		/\/components\/gene\/ZButton\.svelte$/u
	);
	await page
		.locator('#button-variants')
		.getByRole('button', { name: '查看源码', exact: true })
		.click();
	const source = page.getByTestId('source-button-variants');
	await expect(source).toContainText("from '@zadmin/zui'");
	const lightCode = source.locator('[data-color-scheme="light"]');
	await expect(lightCode).toBeVisible();
	await expect(lightCode).toHaveCSS('background-color', 'rgb(255, 255, 255)');
	await expect(lightCode).toHaveCSS('font-size', '14px');
	expect(await source.evaluate((element) => getComputedStyle(element).overflowY)).not.toBe('auto');

	const buttonStatesDemo = demo(page, 'button-states');
	await buttonStatesDemo.getByTestId('button-counter').click();
	await expect(buttonStatesDemo.getByText('count = 1')).toBeVisible();
	expect(errors).toEqual([]);
});

test('announces component search totals and empty results', async ({ page }) => {
	await page.goto('/#/');
	const search = page.getByRole('textbox', { name: '搜索组件', exact: true });
	const status = page.locator('#zui-docs-search-status');
	const shortcut = page.locator('[data-slot="search-shortcut"]');
	await expect(shortcut).toBeVisible();
	await expect(shortcut).toHaveAttribute('aria-hidden', 'true');
	await page.keyboard.press('/');
	await expect(search).toBeFocused();
	await search.press('/');
	await expect(search).toHaveValue('/');
	await search.clear();
	await expect(search).toHaveAttribute('aria-controls', 'zui-docs-component-nav');
	await expect(search).toHaveAttribute('aria-describedby', 'zui-docs-search-status');
	await expect(search).toHaveAttribute('aria-keyshortcuts', '/');
	await expect(status).toHaveAttribute('aria-live', 'polite');
	await expect(status).toHaveAttribute('role', 'status');
	await expect(status).toHaveText('共 78 个组件');

	await search.fill('autosize');
	await expect(status).toHaveText('1 个匹配组件');
	await expect(page.getByRole('link', { name: 'ZTextarea', exact: true })).toBeVisible();

	await search.fill('definitely-no-component');
	await expect(status).toHaveText('0 个匹配组件');
	await expect(page.getByText('没有匹配组件')).toBeVisible();

	await search.fill('autosize');
	await search.press('Escape');
	await expect(search).toBeFocused();
	await expect(search).toHaveValue('');
	await expect(status).toHaveText('共 78 个组件');
});

test('skips repeated navigation without corrupting hash routes', async ({ page }) => {
	await page.goto('/#/components/checkbox');
	const route = page.url();
	await page.keyboard.press('Tab');
	const skipLink = page.getByRole('link', { name: '跳到主要内容', exact: true });
	await expect(skipLink).toBeVisible();
	await expect(skipLink).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(route);
	await expect(page.locator('main#zui-main-content')).toBeFocused();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZCheckbox');
});

test('restores route identity through browser back and forward history', async ({ page }) => {
	await page.goto('/#/components/input');
	await page.getByRole('link', { name: 'ZTextarea', exact: true }).click();
	await expect(page).toHaveURL(/#\/components\/textarea$/u);
	await expect(page).toHaveTitle('ZTextarea · ZUI Components');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZTextarea');
	await expect(page.getByRole('link', { name: 'ZTextarea', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);

	await page.goBack();
	await expect(page).toHaveURL(/#\/components\/input$/u);
	await expect(page).toHaveTitle('ZInput · ZUI Components');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZInput');
	await expect(page.getByRole('link', { name: 'ZInput', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);

	await page.goForward();
	await expect(page).toHaveURL(/#\/components\/textarea$/u);
	await expect(page).toHaveTitle('ZTextarea · ZUI Components');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ZTextarea');
	await expect(page.getByRole('link', { name: 'ZTextarea', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
});

test('renders every production guide from the shared registry', async ({ page }) => {
	for (const [id, heading] of [
		['getting-started', '从真实Provider和原生语义开始。'],
		['icss', '类型安全样式，不把运行时对象塞进DOM。'],
		['accessibility', '语义、键盘和焦点是同一个行为合同。'],
		['ssr-csp', '每个请求拥有自己的样式Registry。'],
		['hmr', '更新规则所有权，不重建业务状态。'],
		['webview', '组件留在Web层，系统能力留在Host边界。'],
		['package', '从公开entrypoint消费，而不是依赖工作区路径。']
	] as const) {
		await page.goto(`/#/guides/${id}`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
		expect(await page.locator('main article article').count()).toBeGreaterThanOrEqual(3);
	}
});

test('switches and persists all coordinated production themes', async ({ page }) => {
	await page.goto('/#/components/button');
	const shell = page.locator('#app > div');
	const theme = page.getByRole('button', { name: '选择文档主题', exact: true });
	for (const [id, label, scheme, surface] of [
		['aurora-light', '极光明亮', 'light', 'rgb(238, 244, 255)'],
		['paper-light', '纸张暖白', 'light', 'rgb(245, 237, 225)'],
		['neon-dark', '霓虹暗色', 'dark', 'rgb(5, 9, 20)'],
		['midnight-dark', '午夜专业', 'dark', 'rgb(11, 18, 32)'],
		['high-contrast-light', '高对比亮色', 'light', 'rgb(255, 255, 255)'],
		['high-contrast-dark', '高对比暗色', 'dark', 'rgb(0, 0, 0)']
	] as const) {
		await theme.click();
		await page.getByRole('option', { name: label, exact: true }).click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', id);
		await expect(page.locator('html')).toHaveAttribute('data-scheme', scheme);
		await expect(shell).toHaveCSS('background-color', surface);
	}

	await theme.click();
	await page.getByRole('option', { name: '霓虹暗色', exact: true }).click();
	await page
		.locator('#button-variants')
		.getByRole('button', { name: '查看源码', exact: true })
		.click();
	const darkCode = page.getByTestId('source-button-variants').locator('[data-color-scheme="dark"]');
	await expect(darkCode).toBeVisible();
	await expect(darkCode).toHaveCSS('background-color', 'rgb(2, 4, 12)');
	await theme.click();
	await page.getByRole('option', { name: '午夜专业', exact: true }).click();
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'midnight-dark');
	await expect(theme).toContainText('午夜专业');

	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations).toEqual([]);
});

test('restores the current preferences trigger after nested direction updates', async ({
	page
}) => {
	const messages: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error' || message.type() === 'warning') messages.push(message.text());
	});
	await page.goto('/#/');
	const preferences = page.getByRole('button', { name: '调整显示偏好', exact: true });
	await preferences.click();
	await page.getByRole('button', { name: '方向', exact: true }).click();
	await page.getByRole('option', { name: '从右到左', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await page.keyboard.press('Escape');
	await expect(preferences).toBeFocused();
	await expect(preferences).toHaveAttribute('aria-expanded', 'false');

	await preferences.click();
	await page.getByRole('button', { name: '方向', exact: true }).click();
	await page.getByRole('option', { name: '从左到右', exact: true }).click();
	await page.keyboard.press('Escape');
	await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
	await expect(preferences).toBeFocused();
	expect(messages).toEqual([]);
});

test('inherits compact Provider density while preserving explicit control size', async ({
	page
}) => {
	await page.goto('/#/components/provider');
	const preferencesDemo = demo(page, 'provider-preferences');
	const compactButton = preferencesDemo.getByTestId('provider-density-button');
	const explicitButton = preferencesDemo.getByTestId('provider-explicit-button');
	const compactInput = preferencesDemo.getByTestId('provider-density-input');
	const compactTextarea = preferencesDemo.getByTestId('provider-density-textarea');

	await expect(compactButton).toHaveCSS('min-height', '24px');
	await expect(compactInput).toHaveCSS('min-height', '24px');
	await expect(compactTextarea).toHaveCSS('min-height', '64px');
	await expect(explicitButton).toHaveCSS('min-height', '48px');
	await expect
		.poll(
			async () =>
				(await explicitButton.boundingBox())!.height > (await compactButton.boundingBox())!.height
		)
		.toBe(true);
});

test('keeps input binding and field validation interactive', async ({ page }) => {
	await page.goto('/#/components/input');
	const bindingDemo = demo(page, 'input-binding');
	const input = bindingDemo.getByTestId('input-binding');
	await input.fill('typed');
	await expect(bindingDemo.getByText(/value = typed/u)).toBeVisible();
	const externalDemo = demo(page, 'input-external-form');
	const externalInput = externalDemo.getByTestId('input-external-control');
	await externalInput.fill('external-changed');
	await expect(
		externalDemo.getByText('owner = input-external-owner · external value = external-changed')
	).toBeVisible();
	await externalDemo.getByRole('button', { name: '切换到备用表单', exact: true }).click();
	await expect(externalInput).toHaveAttribute('form', 'input-external-backup');
	await expect(
		externalDemo.getByText('owner = input-external-backup · external value = external-changed')
	).toBeVisible();
	await externalDemo.getByRole('button', { name: '重建备用表单', exact: true }).click();
	await expect(externalInput).toHaveAttribute('form', 'input-external-backup');
	await expect(externalDemo.locator('#input-external-backup')).toHaveAttribute('data-version', '1');
	await expect(
		externalDemo.getByText('owner = input-external-backup · external value = external-changed')
	).toBeVisible();
	await externalDemo.getByRole('button', { name: '重置主表单', exact: true }).click();
	await expect(externalInput).toHaveValue('external-changed');
	await externalDemo.getByRole('button', { name: '重置备用表单', exact: true }).click();
	await expect(externalInput).toHaveValue('external-seed');
	await expect(
		externalDemo.getByText('owner = input-external-backup · external value = external-seed')
	).toBeVisible();
	await expect
		.poll(() =>
			externalDemo
				.locator('#input-external-backup')
				.evaluate((form) => [...new FormData(form as HTMLFormElement).entries()])
		)
		.toEqual([['external', 'external-seed']]);
	await expect
		.poll(() =>
			externalDemo
				.locator('#input-external-owner')
				.evaluate((form) => [...new FormData(form as HTMLFormElement).entries()])
		)
		.toEqual([]);

	await page.goto('/#/components/field');
	const fieldDemo = demo(page, 'field-validation');
	const account = fieldDemo.getByTestId('field-account');
	await account.fill('ab');
	await expect(fieldDemo.getByText('账号至少需要3个字符')).toBeVisible();
	await account.fill('alice');
	await expect(fieldDemo.getByText('账号至少需要3个字符')).toHaveCount(0);
});

test('keeps FileUpload validation, native FormData, removal and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/file-upload');
	const uploadDemo = demo(page, 'file-upload-queue');
	const input = uploadDemo.locator('input[type="file"]');
	await input.setInputFiles({
		buffer: Buffer.from('{"ready":true}'),
		mimeType: 'application/json',
		name: 'production.json'
	});
	await expect(uploadDemo.getByText('files = production.json · rejected = 0')).toBeVisible();
	await expect
		.poll(() =>
			uploadDemo
				.locator('form')
				.evaluate((form) => (new FormData(form as HTMLFormElement).get('config') as File).name)
		)
		.toBe('production.json');
	await input.setInputFiles({
		buffer: Buffer.from('plain text'),
		mimeType: 'text/plain',
		name: 'invalid.txt'
	});
	await expect(uploadDemo.getByText('files = production.json · rejected = 1')).toBeVisible();
	await uploadDemo.getByRole('button', { name: '移除 production.json', exact: true }).click();
	await expect(uploadDemo.getByText('files = none · rejected = 1')).toBeVisible();
	await uploadDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect
		.poll(() => input.evaluate((element: HTMLInputElement) => element.files?.length))
		.toBe(0);
	await expect(uploadDemo.getByText('files = none · rejected = 0')).toBeVisible();
});

test('keeps Form schema errors, async state, first-error focus, valid submit and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/form');
	const schemaDemo = demo(page, 'form-schema');
	await schemaDemo.getByRole('button', { name: '保存', exact: true }).click();
	const account = schemaDemo.getByRole('textbox', { name: '账号', exact: true });
	const email = schemaDemo.getByRole('textbox', { name: '邮箱', exact: true });
	await expect(account).toBeFocused();
	await expect(schemaDemo.getByText('账号至少需要3个字符')).toBeVisible();
	await expect(schemaDemo.getByText('请输入有效邮箱')).toBeVisible();
	await account.fill('alice');
	await email.fill('alice@example.com');
	await schemaDemo.getByRole('button', { name: '保存', exact: true }).click();
	await expect(
		schemaDemo.getByText('submitted = true · errors = 0 · validating = false · result = alice')
	).toBeVisible();
	await schemaDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(
		schemaDemo.getByText('submitted = false · errors = 0 · validating = false · result = alice')
	).toBeVisible();
	await expect(schemaDemo.locator('[data-dirty="true"]')).toHaveCount(0);

	const busyDemo = demo(page, 'form-external-busy');
	const busyForm = busyDemo.getByTestId('external-busy-form');
	const busyButton = busyDemo.getByTestId('external-busy-button');
	await busyButton.click();
	await expect(busyForm).toHaveAttribute('aria-busy', 'true');
	await expect(busyButton).toHaveAttribute('aria-busy', 'true');
	await expect(busyButton).toBeEnabled();
	await expect(busyDemo.getByText('外部任务进行中，表单仍可操作。')).toBeVisible();
	await busyButton.click();
	await expect(busyForm).not.toHaveAttribute('aria-busy');
	await expect(busyButton).not.toHaveAttribute('aria-busy');
});

test('settles pending docs validation delays when navigating away', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/#/components/form');
	const account = demo(page, 'form-schema').getByRole('textbox', { name: '账号', exact: true });
	await account.fill('ab');
	await account.blur();
	await page.waitForTimeout(90);
	await page.goto('/#/');
	await page.waitForTimeout(160);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'看见组件，运行组件，复制真实源码。'
	);
	expect(errors).toEqual([]);
});

test('keeps InputGroup focus boundary, Field context, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/input-group');
	const inputGroupDemo = demo(page, 'input-group-affixes');
	const group = inputGroupDemo.getByRole('group', { name: '服务地址组合', exact: true });
	const input = inputGroupDemo.getByRole('textbox', { name: '服务主机', exact: true });
	await input.focus();
	await expect(group).toHaveCSS('outline-style', 'solid');
	await expect(input).toHaveCSS('border-style', 'none');
	await input.fill('gateway');
	await expect(inputGroupDemo.getByText('url = https://gateway.internal')).toBeVisible();
	await expect
		.poll(() =>
			inputGroupDemo
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('host'))
		)
		.toBe('gateway');
	await inputGroupDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(input).toHaveValue('api');
	await expect(inputGroupDemo.getByText('url = https://api.internal')).toBeVisible();
});

test('keeps NumberField locale parsing, spinbutton keys, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/number-field');
	const numberDemo = demo(page, 'number-field-locale');
	const input = numberDemo.getByRole('spinbutton', { name: '并发上限', exact: true });
	await expect(input).toHaveAttribute('aria-valuenow', '1234.5');
	await input.fill('12.75');
	await page.keyboard.press('ArrowUp');
	await expect(input).toHaveAttribute('aria-valuenow', '13');
	await expect(numberDemo.getByText('value = 13')).toBeVisible();
	await expect
		.poll(() =>
			numberDemo
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('concurrency'))
		)
		.toBe('13');
	await numberDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(input).toHaveAttribute('aria-valuenow', '1234.5');
	await expect(numberDemo.getByText('value = 1234.5')).toBeVisible();
});

test('keeps Calendar grid keyboard, selection, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/calendar');
	const calendarDemo = demo(page, 'calendar-grid');
	const selected = calendarDemo.getByRole('button', {
		name: '2026年8月18日星期二',
		exact: true
	});
	await selected.focus();
	await page.keyboard.press('ArrowRight');
	await expect(
		calendarDemo.getByRole('button', { name: '2026年8月19日星期三', exact: true })
	).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(calendarDemo.getByText('value = 2026-08-19')).toBeVisible();
	await expect
		.poll(() =>
			calendarDemo
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('date'))
		)
		.toBe('2026-08-19');
	await calendarDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(calendarDemo.getByText('value = 2026-08-18')).toBeVisible();
});

test('keeps DateField and TimeField segment keys, values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-field');
	const dateFieldDemo = demo(page, 'date-field-segments');
	await dateFieldDemo.getByRole('textbox', { name: 'Month', exact: true }).press('ArrowUp');
	await expect(dateFieldDemo.getByText('value = 2026-09-18')).toBeVisible();
	await dateFieldDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(dateFieldDemo.getByText('value = 2026-08-18')).toBeVisible();
	const dateSegments = dateFieldDemo.locator('input:not([type="hidden"])');
	const preferences = page.getByRole('button', { name: '调整显示偏好', exact: true });
	await preferences.click();
	await page.getByRole('button', { name: '方向', exact: true }).click();
	await page.getByRole('option', { name: '从右到左', exact: true }).click();
	await page.keyboard.press('Escape');
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
	await dateSegments.nth(1).press('ArrowRight');
	await expect(dateSegments.nth(0)).toBeFocused();
	await preferences.click();
	await page.getByRole('button', { name: '方向', exact: true }).click();
	await page.getByRole('option', { name: '从左到右', exact: true }).click();
	await page.keyboard.press('Escape');
	await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

	await page.goto('/#/components/time-field');
	const timeFieldDemo = demo(page, 'time-field-segments');
	await timeFieldDemo.getByRole('textbox', { name: 'Minute', exact: true }).press('ArrowUp');
	await expect(timeFieldDemo.getByText('value = 09:31:15')).toBeVisible();
	await timeFieldDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(timeFieldDemo.getByText('value = 09:30:15')).toBeVisible();
});

test('keeps DatePicker Calendar selection, form value and focus restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-picker');
	const datePickerDemo = demo(page, 'date-picker-popover');
	const trigger = datePickerDemo.locator('button[aria-haspopup="dialog"]');
	await trigger.click();
	await page
		.getByRole('dialog', { name: '选择上线日期', exact: true })
		.getByRole('button', { name: '2026年8月20日星期四', exact: true })
		.click();
	await expect(trigger).toBeFocused();
	await expect(datePickerDemo.getByText('value = 2026-08-20')).toBeVisible();
});

test('keeps DateRangePicker two-step normalized selection and dual form fields synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-range-picker');
	const rangeDemo = demo(page, 'date-range-picker-window');
	const trigger = rangeDemo.locator('button[aria-haspopup="dialog"]');
	await trigger.click();
	const calendarDialog = page.getByRole('dialog', { name: '选择发布窗口', exact: true });
	await calendarDialog.getByRole('button', { name: '2026年8月25日星期二', exact: true }).click();
	await calendarDialog.getByRole('button', { name: '2026年8月22日星期六', exact: true }).click();
	await expect(trigger).toBeFocused();
	await expect(rangeDemo.getByText('range = 2026-08-22 / 2026-08-25')).toBeVisible();
	await expect
		.poll(() =>
			rangeDemo
				.locator('form')
				.evaluate((form) => [
					new FormData(form as HTMLFormElement).get('window.start'),
					new FormData(form as HTMLFormElement).get('window.end')
				])
		)
		.toEqual(['2026-08-22', '2026-08-25']);
});

test('keeps data-display document semantics, image alternatives and Tag ownership explicit', async ({
	page
}) => {
	await page.goto('/#/components/avatar');
	const avatarDemo = demo(page, 'avatar-fallback');
	await expect(avatarDemo.getByRole('img', { name: '林墨', exact: true })).toHaveText('林');
	await expect(avatarDemo.getByRole('img', { name: '部署机器人', exact: true })).toHaveText('机');

	await page.goto('/#/components/card');
	const card = demo(page, 'card-anatomy').locator('article:has(> [data-slot="body"])');
	await expect(card).toHaveCount(1);
	await expect(card.locator(':scope > header')).toContainText('生产部署');
	await expect(card.locator(':scope > footer')).toContainText('更新于刚刚');

	await page.goto('/#/components/list');
	await expect(demo(page, 'list-ordered').locator('ol > li')).toHaveCount(2);

	await page.goto('/#/components/description-list');
	const descriptionDemo = demo(page, 'description-list-basic');
	await expect(descriptionDemo.locator('dl dt')).toHaveText(['版本', '区域']);
	await expect(descriptionDemo.locator('dl dd')).toHaveText(['v2.4.0', 'cn-east-1']);

	await page.goto('/#/components/tag');
	const tagDemo = demo(page, 'tag-remove');
	await tagDemo.getByRole('button', { name: '移除 production', exact: true }).click();
	await expect(tagDemo.getByText('visible = false')).toBeVisible();
	await expect(tagDemo.getByRole('button', { name: '移除 production', exact: true })).toHaveCount(
		0
	);
});

test('keeps feedback live regions, progress values and Toast queue actions explicit', async ({
	page
}) => {
	await page.goto('/#/components/alert');
	const alertDemo = demo(page, 'alert-live');
	await expect(alertDemo.getByRole('status')).toContainText('配置已保存');
	await alertDemo.getByRole('button', { name: '关闭配置保存提示', exact: true }).click();
	await expect(alertDemo.getByText('visible = false')).toBeVisible();

	await page.goto('/#/components/loading-bar');
	const loadingDemo = demo(page, 'loading-bar-values');
	const progress = loadingDemo.getByRole('progressbar', { name: '发布进度', exact: true });
	await expect(progress).toHaveAttribute('aria-valuenow', '42');
	await loadingDemo.getByRole('button', { name: '增加10%', exact: true }).click();
	await expect(progress).toHaveAttribute('aria-valuenow', '52');
	await expect(
		loadingDemo.getByRole('progressbar', { name: '正在连接构建服务', exact: true })
	).not.toHaveAttribute('aria-valuenow');

	await page.goto('/#/components/toast');
	await demo(page, 'toast-queue').getByRole('button', { name: '发送通知', exact: true }).click();
	const toast = page.locator('article[role="status"]').filter({ hasText: '发布制品已就绪' });
	await expect(toast).toBeVisible();
	await toast.getByRole('button', { name: 'Dismiss 发布制品已就绪', exact: true }).click();
	await expect(toast).toHaveCount(0);
});

test('keeps progress, meter, empty, timeline and statistic native semantics explicit', async ({
	page
}) => {
	await page.goto('/#/components/progress');
	const progressDemo = demo(page, 'progress-views');
	const progress = progressDemo.getByRole('progressbar', { name: '部署进度', exact: true });
	await expect(progress).toHaveAttribute('aria-valuenow', '68');
	await progressDemo.getByRole('button', { name: '增加8%', exact: true }).click();
	await expect(progress).toHaveAttribute('aria-valuenow', '76');
	await expect(
		progressDemo.getByRole('progressbar', { name: '正在分析依赖', exact: true })
	).not.toHaveAttribute('aria-valuenow');

	await page.goto('/#/components/meter');
	await expect(
		demo(page, 'meter-thresholds').getByRole('meter', { name: 'CPU容量', exact: true })
	).toHaveAttribute('data-state', 'suboptimal');

	await page.goto('/#/components/empty');
	await expect(
		demo(page, 'empty-recovery').getByRole('heading', {
			level: 4,
			name: '没有发布记录',
			exact: true
		})
	).toBeVisible();

	await page.goto('/#/components/timeline');
	const timeline = demo(page, 'timeline-release').getByRole('list', {
		name: '发布进度时间线',
		exact: true
	});
	await expect(timeline.getByRole('listitem')).toHaveCount(3);
	await expect(timeline.locator('time[datetime="2026-08-30T09:10:00+08:00"]')).toHaveCount(1);

	await page.goto('/#/components/statistic');
	const statisticDemo = demo(page, 'statistic-format');
	const requestStatistic = statisticDemo
		.locator('dl')
		.filter({ has: statisticDemo.getByText('请求总数', { exact: true }) });
	await expect(requestStatistic.locator('data')).toHaveAttribute('value', '128430');
	await expect(requestStatistic.locator('[data-trend="up"]')).toContainText('+12.4%');
});

test('keeps native Table structure and VirtualList DOM bounded across large scroll offsets', async ({
	page
}) => {
	await page.goto('/#/components/table');
	const table = demo(page, 'table-native').getByRole('table', {
		name: '最近发布',
		exact: true
	});
	await expect(table.getByRole('columnheader')).toHaveCount(3);
	await expect(table.getByRole('rowheader')).toHaveCount(2);

	await page.goto('/#/components/virtual-list');
	const list = demo(page, 'virtual-list-large').getByRole('list', {
		name: '一万条部署记录',
		exact: true
	});
	await expect(list.getByRole('listitem')).toHaveCount(10);
	await list.evaluate((element) => {
		element.scrollTop = 4000;
		element.dispatchEvent(new Event('scroll'));
	});
	await expect(list).toHaveAttribute('data-range-start', '96');
	await expect(list).toContainText('部署记录 101');
	await expect(list.getByRole('listitem')).toHaveCount(14);
});

test('keeps DataTable sorting, stable selection and virtual row count synchronized', async ({
	page
}) => {
	await page.goto('/#/components/data-table');
	const dataTableDemo = demo(page, 'data-table-virtual');
	const viewport = dataTableDemo.getByTestId('docs-data-table');
	const table = dataTableDemo.getByRole('table', { name: '一千条部署记录', exact: true });
	await expect(table.locator('tbody tr[data-slot="row"]')).toHaveCount(11);
	await table.getByRole('checkbox', { name: '选择 部署 1', exact: true }).check();
	await expect(dataTableDemo.getByText(/selected = deploy-0/u)).toBeVisible();
	await table.getByRole('button', { name: '耗时(ms)', exact: true }).click();
	await table.getByRole('button', { name: '耗时(ms)', exact: true }).click();
	await expect(table.getByRole('columnheader', { name: /耗时/u })).toHaveAttribute(
		'aria-sort',
		'descending'
	);
	await expect(dataTableDemo.getByText(/sort = duration\/descending/u)).toBeVisible();
	await expect(dataTableDemo.getByText(/selected = deploy-0/u)).toBeVisible();
	await expect(viewport).toHaveAttribute('data-virtualized', 'true');
});

test('keeps Carousel rotation control, direct navigation and stable value synchronized', async ({
	page
}) => {
	await page.goto('/#/components/carousel');
	const carouselDemo = demo(page, 'carousel-controls');
	const carousel = carouselDemo.getByRole('region', { name: '发布摘要轮播', exact: true });
	await expect(carousel.getByRole('group', { name: /1 of 3/u })).toBeVisible();
	await carousel.getByRole('button', { name: 'Next slide' }).click();
	await expect(carouselDemo.getByText('value = metrics')).toBeVisible();
	await expect(carousel.getByRole('group', { name: /2 of 3/u })).toBeVisible();
	await carousel.getByRole('button', { name: 'Pause automatic rotation' }).click();
	await expect(carousel.getByRole('button', { name: 'Start automatic rotation' })).toBeVisible();
	await carousel.getByRole('button', { name: /Go to slide 3/u }).click();
	await expect(carouselDemo.getByText('value = events')).toBeVisible();
});

test('keeps Tour spotlight, modal focus, step positioning and restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tour');
	const start = demo(page, 'tour-guided').getByRole('button', { name: '开始导览', exact: true });
	await start.click();
	let dialog = page.getByRole('dialog', { name: '发布摘要', exact: true });
	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole('button', { name: '关闭导览', exact: true })).toBeFocused();
	await expect(page.locator('[data-slot="mask"]')).toHaveCount(4);
	await dialog.getByRole('button', { name: '下一步' }).click();
	dialog = page.getByRole('dialog', { name: '生产指标', exact: true });
	await expect(dialog).toHaveAttribute('data-step', 'metrics');
	await dialog.getByRole('button', { name: '完成' }).click();
	await expect(dialog).toHaveCount(0);
	await expect(start).toBeFocused();
});

test('keeps PinInput roving entry, completion, single FormData value and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/pin-input');
	const pinDemo = demo(page, 'pin-input-otp');
	const first = pinDemo.getByRole('textbox', { name: '一次性验证码', exact: true });
	await first.focus();
	await page.keyboard.type('123456');
	await expect(pinDemo.getByText('value = 123456 · complete = 1')).toBeVisible();
	await expect
		.poll(() =>
			pinDemo.locator('form').evaluate((form) => new FormData(form as HTMLFormElement).get('otp'))
		)
		.toBe('123456');
	await page.keyboard.press('Backspace');
	await expect(pinDemo.getByText('value = 12345 · complete = 1')).toBeVisible();
	await pinDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(pinDemo.getByText('value = empty · complete = 1')).toBeVisible();
});

test('keeps toggle button state native, bindable and keyboard accessible', async ({ page }) => {
	await page.goto('/#/components/toggle-button');
	const toggleDemo = demo(page, 'toggle-button-interactive');
	const toggle = toggleDemo.getByTestId('toggle-button-controlled');
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-pressed', 'true');
	await expect(toggle).toHaveAttribute('data-state', 'on');
	await expect(toggleDemo.getByText('pressed = true · 用户变更次数 = 1')).toBeVisible();
	await toggle.press('Space');
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await expect(toggleDemo.getByText('pressed = false · 用户变更次数 = 2')).toBeVisible();
});

test('keeps checkbox indeterminate, FormData and reset synchronized', async ({ page }) => {
	await page.goto('/#/components/checkbox');
	const checkboxDemo = demo(page, 'checkbox-form');
	const checkbox = checkboxDemo.getByTestId('checkbox-reports');
	await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
	await expect(checkbox).toHaveJSProperty('indeterminate', true);
	await checkbox.check();
	await expect(checkbox).toBeChecked();
	await expect(checkboxDemo.getByText(/state = true · 用户变更次数 = 1/u)).toBeVisible();
	await checkboxDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(checkboxDemo.getByText(/weekly/u)).toBeVisible();
	await checkboxDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
	await expect(checkbox).toHaveJSProperty('indeterminate', true);
	await expect(checkboxDemo.getByText(/state = indeterminate · 用户变更次数 = 1/u)).toBeVisible();
});

test('keeps ColorPicker hex, alpha, Popover focus, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/color-picker');
	const colorDemo = demo(page, 'color-picker-alpha');
	const trigger = colorDemo.locator('button[aria-haspopup="dialog"]');
	await trigger.click();
	const hex = page.getByRole('textbox', { name: 'Hex颜色', exact: true });
	await expect(page.getByLabel('选择基础颜色', { exact: true })).toBeFocused();
	await hex.fill('#ff000080');
	await expect(colorDemo.getByText('value = #ff000080')).toBeVisible();
	await page.getByRole('slider', { name: '透明度', exact: true }).fill('25');
	await expect(colorDemo.getByText('value = #ff000040')).toBeVisible();
	await expect
		.poll(() =>
			colorDemo
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('accent'))
		)
		.toBe('#ff000040');
	await page.keyboard.press('Escape');
	await expect(trigger).toBeFocused();
	await colorDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(colorDemo.getByText('value = #2563ebcc')).toBeVisible();
});

test('keeps switch semantics, keyboard state, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/switch');
	const switchDemo = demo(page, 'switch-form');
	const control = switchDemo.getByTestId('switch-alerts');
	await expect(control).toHaveRole('switch');
	await expect(control).toHaveAttribute('aria-checked', 'false');
	await setDisplayPreference(page, '动画', '减少');
	await setDisplayPreference(page, '方向', '从右到左');
	await expect(control).toHaveCSS('transition-duration', '0s');
	await expect
		.poll(() => control.evaluate((element) => getComputedStyle(element, '::before').transform))
		.toBe('matrix(1, 0, 0, 1, 18, 0)');
	await control.press('Space');
	await expect(control).toHaveAttribute('aria-checked', 'true');
	await expect
		.poll(() => control.evaluate((element) => getComputedStyle(element, '::before').transform))
		.toBe('matrix(1, 0, 0, 1, 0, 0)');
	await expect(switchDemo.getByText(/checked = true · 用户变更次数 = 1/u)).toBeVisible();
	await switchDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(switchDemo.getByText(/enabled/u)).toBeVisible();
	await switchDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(control).toHaveAttribute('aria-checked', 'false');
	await expect(
		switchDemo.getByText(/checked = false · 用户变更次数 = 1 · 尚未提交/u)
	).toBeVisible();
});

test('keeps radio group roving focus, selection, RTL and FormData synchronized', async ({
	page
}) => {
	await page.goto('/#/components/radio-group');
	const radioDemo = demo(page, 'radio-group-form');
	const starter = radioDemo.getByRole('radio', { name: '入门版', exact: true });
	const team = radioDemo.getByRole('radio', { name: '团队版', exact: true });
	const legacy = radioDemo.getByRole('radio', { name: '旧版', exact: true });
	const enterprise = radioDemo.getByRole('radio', { name: '企业版', exact: true });
	await expect(team).toBeChecked();
	await expect(team).toHaveAttribute('tabindex', '0');
	await expect(legacy).toBeDisabled();
	await team.press('ArrowRight');
	await expect(enterprise).toBeChecked();
	await expect(enterprise).toBeFocused();
	await enterprise.press('Home');
	await expect(starter).toBeChecked();
	await radioDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(radioDemo.getByText(/starter/u)).toBeVisible();

	await setDisplayPreference(page, '方向', '从右到左');
	await starter.press('ArrowRight');
	await expect(enterprise).toBeChecked();
	await radioDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(team).toBeChecked();
	await expect(radioDemo.getByText(/value = team · 用户变更次数 = 3 · 尚未提交/u)).toBeVisible();
});

test('keeps Tabs ARIA relationships, disabled skipping and RTL activation synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tabs');
	const tabsDemo = demo(page, 'tabs-interactive');
	const overview = tabsDemo.getByRole('tab', { name: '概览', exact: true });
	const metrics = tabsDemo.getByRole('tab', { name: '指标', exact: true });
	const legacy = tabsDemo.getByRole('tab', { name: '旧版', exact: true });
	const events = tabsDemo.getByRole('tab', { name: '事件', exact: true });
	await expect(overview).toHaveAttribute('aria-selected', 'true');
	const panelId = await overview.getAttribute('aria-controls');
	await expect(tabsDemo.locator(`#${panelId}`)).toBeVisible();
	await expect(legacy).toBeDisabled();
	await overview.press('ArrowRight');
	await expect(metrics).toHaveAttribute('aria-selected', 'true');
	await metrics.press('ArrowRight');
	await expect(events).toHaveAttribute('aria-selected', 'true');
	await events.press('Home');
	await expect(overview).toHaveAttribute('aria-selected', 'true');

	await setDisplayPreference(page, '方向', '从右到左');
	await overview.press('ArrowRight');
	await expect(events).toHaveAttribute('aria-selected', 'true');
	await expect(tabsDemo.getByText(/value = events · 用户变更次数 = 4/u)).toBeVisible();
});

test('keeps pagination locale labels, current page and window synchronized', async ({ page }) => {
	await page.goto('/#/components/pagination');
	const paginationDemo = demo(page, 'pagination-interactive');
	const navigation = paginationDemo.getByRole('navigation', { name: '分页导航', exact: true });
	await expect(navigation.getByRole('button', { name: '第6页', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await navigation.getByRole('button', { name: '第7页', exact: true }).click();
	await expect(navigation.getByRole('button', { name: '第7页', exact: true })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await expect(paginationDemo.getByText('page = 7 · 用户变更次数 = 1')).toBeVisible();
	await navigation.getByRole('button', { name: '下一页', exact: true }).click();
	await expect(paginationDemo.getByText('page = 8 · 用户变更次数 = 2')).toBeVisible();
	await expect(navigation.locator('[data-slot="ellipsis"]')).toHaveCount(2);
});

test('keeps Menu roving focus, disabled skipping, typeahead and actions synchronized', async ({
	page
}) => {
	await page.goto('/#/components/menu');
	const menuDemo = demo(page, 'menu-collection-navigation');
	const open = menuDemo.getByRole('menuitem', { name: '打开详情', exact: true });
	await open.focus();
	await page.keyboard.press('ArrowDown');
	await expect(menuDemo.getByRole('menuitem', { name: '复制部署', exact: true })).toBeFocused();
	await page.keyboard.type('删');
	await expect(menuDemo.getByRole('menuitem', { name: '删除部署', exact: true })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(menuDemo.getByText('action = delete')).toBeVisible();
	await expect(menuDemo.getByRole('menuitem', { name: /回滚/u })).toHaveAttribute(
		'aria-disabled',
		'true'
	);
});

test('keeps DropdownMenu positioning, focus, action dismiss and restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/dropdown-menu');
	const dropdownDemo = demo(page, 'dropdown-menu-actions');
	const trigger = dropdownDemo.getByTestId('dropdown-menu-trigger');
	await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
	await trigger.click();
	const menu = page.getByRole('menu', { name: '部署操作', exact: true });
	await expect(menu).toBeVisible();
	await expect(menu.getByRole('menuitem', { name: '查看详情', exact: true })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(menu.getByRole('menuitem', { name: '复制配置', exact: true })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(menu).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(dropdownDemo.getByText(/open = false · action = duplicate/u)).toBeVisible();
});

test('anchors ContextMenu to pointer coordinates and supports the keyboard entry path', async ({
	page
}) => {
	await page.goto('/#/components/context-menu');
	const trigger = demo(page, 'context-menu-coordinate-anchor').getByTestId('context-menu-trigger');
	const box = await trigger.boundingBox();
	expect(box).not.toBeNull();
	await trigger.click({ button: 'right', position: { x: 80, y: 20 } });
	const menu = page.getByRole('menu', { name: '部署上下文菜单', exact: true });
	await expect(menu).toBeVisible();
	const menuBox = await menu.boundingBox();
	expect(menuBox?.x).toBeCloseTo((box?.x ?? 0) + 80, 0);
	expect(menuBox?.y).toBeCloseTo((box?.y ?? 0) + 22, 0);
	await page.keyboard.press('Escape');
	await expect(trigger).toBeFocused();
	await page.keyboard.press('Shift+F10');
	await expect(menu).toBeVisible();
});

test('keeps Slider keyboard, value text, FormData and reset synchronized', async ({ page }) => {
	await page.goto('/#/components/slider');
	const sliderDemo = demo(page, 'slider-form');
	const slider = sliderDemo.getByRole('slider', { name: '告警阈值', exact: true });
	await expect(slider).toHaveValue('35');
	await expect(slider).toHaveAttribute('aria-valuetext', '35%');
	await slider.press('ArrowRight');
	await expect(slider).toHaveValue('40');
	await expect(sliderDemo.getByText(/value = 40% · 用户变更次数 = 1/u)).toBeVisible();
	await sliderDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(sliderDemo.getByText(/ · 40$/u)).toBeVisible();
	await setDisplayPreference(page, '方向', '从右到左');
	await slider.press('ArrowRight');
	await expect(slider).toHaveValue('35');
	await expect(sliderDemo.getByText(/value = 35% · 用户变更次数 = 2/u)).toBeVisible();
	await sliderDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(slider).toHaveValue('35');
	await expect(sliderDemo.getByText(/value = 35% · 用户变更次数 = 2 · 尚未提交/u)).toBeVisible();
});

test('keeps Select listbox, keyboard, form value and reset synchronized', async ({ page }) => {
	await page.goto('/#/components/select');
	const selectDemo = demo(page, 'select-form');
	const trigger = selectDemo.getByTestId('select-trigger');
	await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
	await trigger.click();
	const listbox = page.getByRole('listbox', { name: '部署环境', exact: true });
	await expect(listbox).toBeVisible();
	await expect(listbox.getByRole('option', { name: '生产', exact: true })).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(listbox.getByRole('option', { name: '预发', exact: true })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(listbox).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveText('预发');
	await selectDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(selectDemo.getByText(/value = 预发 · 用户变更次数 = 1 · 预发/u)).toBeVisible();
	await selectDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(trigger).toHaveText('生产');
});

test('keeps Combobox focus, filtering, active descendant and stable form value synchronized', async ({
	page
}) => {
	await page.goto('/#/components/combobox');
	const comboboxDemo = demo(page, 'combobox-filter-form');
	const input = comboboxDemo.getByRole('combobox', { name: '搜索部署环境', exact: true });
	await input.focus();
	const listbox = page.getByRole('listbox', { name: '部署环境建议', exact: true });
	await expect(listbox).toBeVisible();
	await input.fill('预');
	await expect(listbox.getByRole('option', { name: '预发', exact: true })).toBeVisible();
	await expect(listbox.getByRole('option', { name: '生产', exact: true })).toBeHidden();
	await expect(input).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(listbox).toHaveCount(0);
	await expect(input).toHaveValue('预发');
	await comboboxDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(
		comboboxDemo.getByText(/value = staging · input = 预发 · 变更 = 1 · staging/u)
	).toBeVisible();
});

test('keeps MultiSelect tags, persistent toggles, form values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/multi-select');
	const multiSelectDemo = demo(page, 'multi-select-form');
	const trigger = multiSelectDemo.getByTestId('multi-select-trigger');
	await trigger.click();
	const listbox = page.getByRole('listbox', { name: '部署环境', exact: true });
	await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
	await listbox.getByRole('option', { name: '预发', exact: true }).click();
	await expect(listbox).toBeVisible();
	await expect(listbox.getByRole('option', { name: '预发', exact: true })).toHaveAttribute(
		'aria-selected',
		'true'
	);
	await page.keyboard.press('Escape');
	await expect(trigger).toContainText('预发');
	await multiSelectDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(
		multiSelectDemo.getByText(/values = 开发,生产,预发 · 变更 = 1 · 开发,生产,预发/u)
	).toBeVisible();
	await multiSelectDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(trigger).not.toContainText('预发');
});

test('keeps Segmented radio semantics, roving selection and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/segmented');
	const segmentedDemo = demo(page, 'segmented-form');
	const week = segmentedDemo.getByRole('radio', { name: '周', exact: true });
	await expect(week).toHaveAttribute('aria-checked', 'true');
	await week.focus();
	await page.keyboard.press('ArrowRight');
	await expect(segmentedDemo.getByRole('radio', { name: '月', exact: true })).toBeFocused();
	await expect(segmentedDemo.getByText('value = month · 变更 = 1')).toBeVisible();
	await segmentedDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(week).toHaveAttribute('aria-checked', 'true');
});

test('keeps TagsInput commits, removals, repeated form values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tags-input');
	const tagsDemo = demo(page, 'tags-input-form');
	const input = tagsDemo.getByRole('textbox', { name: '添加部署标签', exact: true });
	await input.fill('critical');
	await page.keyboard.press('Enter');
	await expect(
		tagsDemo.getByRole('button', { name: 'Remove critical', exact: true })
	).toBeVisible();
	await tagsDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(
		tagsDemo.getByText(/values = production,critical · 变更 = 1 · production,critical/u)
	).toBeVisible();
	await tagsDemo.getByRole('button', { name: 'Remove production', exact: true }).click();
	await expect(tagsDemo.getByText(/values = critical · 变更 = 2/u)).toBeVisible();
	await tagsDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(
		tagsDemo.getByRole('button', { name: 'Remove production', exact: true })
	).toBeVisible();
});

test('keeps Textarea autosize, Field semantics, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/textarea');
	const textareaDemo = demo(page, 'textarea-autosize');
	const textarea = textareaDemo.getByRole('textbox', { name: '变更说明', exact: true });
	const initialBox = await textarea.boundingBox();
	await textarea.fill('第一行\n第二行\n第三行\n第四行\n第五行');
	await expect(
		textareaDemo.getByText('value = 第一行 / 第二行 / 第三行 / 第四行 / 第五行')
	).toBeVisible();
	const expandedBox = await textarea.boundingBox();
	expect(expandedBox!.height).toBeGreaterThan(initialBox!.height);
	await expect
		.poll(() =>
			textareaDemo
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('description'))
		)
		.toBe('第一行\n第二行\n第三行\n第四行\n第五行');
	await textareaDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(textarea).toHaveValue('生产变更说明');
	await expect(textareaDemo.getByText(/value = 生产变更说明 · height =/u)).toBeVisible();
});

test('keeps Accordion selection, roving focus and Presence synchronized', async ({ page }) => {
	await page.goto('/#/components/accordion');
	const accordionDemo = demo(page, 'accordion-interactive');
	const runtime = accordionDemo.getByRole('button', { name: /运行时合同/u });
	const delivery = accordionDemo.getByRole('button', { name: /交付门禁/u });
	const legacy = accordionDemo.getByRole('button', { name: /旧版合同/u });
	await expect(runtime).toHaveAttribute('aria-expanded', 'true');
	await expect(
		accordionDemo.getByText('Collection、Selection与Presence拥有独立生命周期。')
	).toBeVisible();
	await expect(legacy).toBeDisabled();
	await delivery.click();
	await expect(delivery).toHaveAttribute('aria-expanded', 'true');
	await expect(runtime).toHaveAttribute('aria-expanded', 'false');
	await expect(accordionDemo.getByText(/value = delivery · 用户变更次数 = 1/u)).toBeVisible();
	await delivery.press('ArrowDown');
	await expect(runtime).toBeFocused();

	await setDisplayPreference(page, '动画', '减少');
	await delivery.click();
	await expect(delivery).toHaveAttribute('aria-expanded', 'false');
	await expect(accordionDemo.getByText('类型、浏览器、bundle与外部安装在CI中验收。')).toHaveCount(
		0
	);
	await expect(accordionDemo.getByText(/value = none · 用户变更次数 = 2/u)).toBeVisible();
});

test('keeps Tree hierarchy, visible keyboard navigation, selection and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tree');
	const treeDemo = demo(page, 'tree-navigation');
	const tree = treeDemo.getByRole('tree', { name: '项目结构', exact: true });
	const docs = tree.getByRole('treeitem', { name: '文档站', exact: true });
	await expect(docs).toHaveAttribute('aria-selected', 'true');
	await docs.focus();
	await page.keyboard.press('ArrowDown');
	const worker = tree.getByRole('treeitem', { name: '任务执行器', exact: true });
	await expect(worker).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(worker).toHaveAttribute('aria-selected', 'true');
	await expect(treeDemo.getByText(/selected = worker/u)).toBeVisible();
	await page.keyboard.press('ArrowLeft');
	await expect(tree.getByRole('treeitem', { name: '平台', exact: true })).toBeFocused();
	await treeDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(docs).toHaveAttribute('aria-selected', 'true');
});

test('keeps virtual Tree DOM bounded while keyboard focus reaches the global final node', async ({
	page
}) => {
	await page.goto('/#/components/tree');
	const virtualTreeDemo = demo(page, 'tree-virtual');
	const tree = virtualTreeDemo.getByRole('tree', { name: '五千节点树', exact: true });
	await expect(tree.getByRole('treeitem')).toHaveCount(11);
	await tree.getByRole('treeitem', { name: '节点 1', exact: true }).focus();
	await page.keyboard.press('End');
	await expect(tree.getByRole('treeitem', { name: '节点 5000', exact: true })).toBeFocused();
	await expect(tree.getByRole('treeitem')).toHaveCount(11);
	await page.keyboard.press('Enter');
	await expect(virtualTreeDemo.getByText('selected = node-4999')).toBeVisible();
});

test('keeps TreeSelect popup tree, selection, form value and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tree-select');
	const treeSelectDemo = demo(page, 'tree-select-form');
	const trigger = treeSelectDemo.locator('button[aria-haspopup="tree"]');
	await trigger.click();
	const tree = page.getByRole('tree', { name: '选择项目节点', exact: true });
	await expect(tree).toBeVisible();
	await tree.getByRole('treeitem', { name: '任务执行器', exact: true }).click();
	await expect(tree).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAccessibleName('任务执行器');
	await expect(treeSelectDemo.getByText('value = worker')).toBeVisible();
	await treeSelectDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(trigger).toHaveAccessibleName('文档站');
});

test('keeps Cascader columns, path commit, focus restoration and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/cascader');
	const cascaderDemo = demo(page, 'cascader-path');
	const trigger = cascaderDemo.locator('button[aria-haspopup="listbox"]');
	await expect(trigger).toHaveAccessibleName('平台 / Web应用 / 文档站');
	await trigger.click();
	await expect(page.getByRole('listbox')).toHaveCount(3);
	await page.getByRole('option', { name: '任务执行器', exact: true }).click();
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAccessibleName('平台 / 任务执行器');
	await expect(cascaderDemo.getByText('path = platform/worker')).toBeVisible();
	await cascaderDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(trigger).toBeVisible();
	await expect(cascaderDemo.getByText('path = platform/web/docs')).toBeVisible();
});

test('keeps Transfer filter, selection, move, repeated form values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/transfer');
	const transferDemo = demo(page, 'transfer-filter');
	const source = transferDemo.getByRole('listbox', { name: '可用通道', exact: true });
	await source.getByRole('option', { name: /生产环境/u }).click();
	await transferDemo.getByRole('button', { name: '加入已选通道', exact: true }).click();
	await expect(transferDemo.getByRole('listbox', { name: '已选通道', exact: true })).toContainText(
		'生产环境'
	);
	await expect(transferDemo.getByText('selected = production/staging')).toBeVisible();
	await transferDemo.getByRole('textbox', { name: '可用通道: 筛选通道', exact: true }).fill('预览');
	await expect(source.getByRole('option')).toHaveCount(1);
	await transferDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(transferDemo.getByText('selected = staging')).toBeVisible();
	await expect(source.getByRole('option')).toHaveCount(3);
});

test('keeps Mention textarea focus, active descendant, insertion, form value and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/mention');
	const mentionDemo = demo(page, 'mention-caret');
	const editor = mentionDemo.getByRole('textbox', { name: '发布通知', exact: true });
	await editor.fill('发布通知：@li');
	await expect(page.getByRole('listbox', { name: '成员建议', exact: true })).toBeVisible();
	await expect(editor).toHaveAttribute('aria-activedescendant', /option/u);
	await page.keyboard.press('Enter');
	await expect(editor).toBeFocused();
	await expect(editor).toHaveValue('发布通知：@lilei ');
	await expect(mentionDemo.getByText('message = 发布通知：@lilei ')).toBeVisible();
	await mentionDemo.getByRole('button', { name: '重置', exact: true }).click();
	await expect(editor).toHaveValue('发布通知：');
	await expect(mentionDemo.getByText('message = 发布通知：')).toBeVisible();
});

test('keeps Command ranking, active descendant and action synchronized', async ({ page }) => {
	await page.goto('/#/components/command');
	const commandDemo = demo(page, 'command-ranked');
	const input = commandDemo.getByRole('combobox', { name: '搜索管理命令', exact: true });
	await input.fill('deploy');
	await expect(
		commandDemo.getByRole('listbox', { name: '管理命令', exact: true }).getByRole('option')
	).toHaveCount(2);
	await expect(input).toHaveAttribute('aria-activedescendant', /option/u);
	await page.keyboard.press('Enter');
	await expect(commandDemo.getByText('query = deploy · action = preview')).toBeVisible();
});

test('keeps CommandPalette shortcut, modal focus, action close and focus restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/command-palette');
	const commandPaletteDemo = demo(page, 'command-palette-dialog');
	const trigger = commandPaletteDemo.getByRole('button', { name: '打开快速操作', exact: true });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: '快速操作', exact: true });
	await expect(dialog).toBeVisible();
	const input = dialog.getByRole('combobox', { name: '搜索快捷命令', exact: true });
	await expect(input).toBeFocused();
	await input.fill('dark');
	await page.keyboard.press('Enter');
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(commandPaletteDemo.getByText('open = false · action = theme')).toBeVisible();
	await page.keyboard.press('Control+k');
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
});

test('keeps Popover portal, ARIA, focus, positioning and dismiss synchronized', async ({
	page
}) => {
	await page.goto('/#/components/popover');
	const popoverDemo = demo(page, 'popover-interactive');
	const trigger = popoverDemo.getByTestId('popover-trigger');
	await trigger.click();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	const content = page.getByTestId('popover-content');
	await expect(content).toBeVisible();
	await expect(content).toHaveAttribute('role', 'dialog');
	await expect(content).toHaveCSS('position', 'absolute');
	await expect(content.getByRole('textbox', { name: '部署备注', exact: true })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await expect(content).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(popoverDemo.getByText(/open = false · 用户变更次数 = 2/u)).toBeVisible();
});

test('keeps Tooltip hover, focus, delay and Escape synchronized', async ({ page }) => {
	await page.goto('/#/components/tooltip');
	const tooltipDemo = demo(page, 'tooltip-interactive');
	const trigger = tooltipDemo.getByTestId('tooltip-trigger');
	await trigger.hover();
	const tooltip = page.getByRole('tooltip');
	await expect(tooltip).toHaveText('所有生产探针均正常');
	const tooltipId = await tooltip.getAttribute('id');
	await expect(trigger).toHaveAttribute('aria-describedby', tooltipId!);
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
	await expect(tooltipDemo.getByText(/open = false · 用户变更次数 = 2/u)).toBeVisible();
	await trigger.focus();
	await expect(page.getByRole('tooltip')).toBeVisible();
});

test('keeps Dialog modal focus, inert, scroll, ARIA and dismiss synchronized', async ({ page }) => {
	await page.goto('/#/components/dialog');
	const dialogDemo = demo(page, 'dialog-interactive');
	const trigger = dialogDemo.getByTestId('dialog-trigger');
	await trigger.click();
	const dialog = page.getByTestId('dialog-content');
	await expect(dialog).toHaveAttribute('role', 'dialog');
	await expect(dialog).toHaveAttribute('aria-modal', 'true');
	const titleId = await dialog.getAttribute('aria-labelledby');
	const descriptionId = await dialog.getAttribute('aria-describedby');
	await expect(page.locator(`#${titleId}`)).toHaveText('编辑生产部署');
	await expect(page.locator(`#${descriptionId}`)).toContainText('关闭后焦点会返回');
	await expect(dialog.getByRole('textbox', { name: '部署名称', exact: true })).toBeFocused();
	await expect(page.locator('#app')).toHaveJSProperty('inert', true);
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
	await page.getByTestId('dialog-close').click();
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.locator('#app')).toHaveJSProperty('inert', false);
	await expect(dialogDemo.getByText(/open = false · 用户变更次数 = 2/u)).toBeVisible();

	await trigger.click();
	await page.getByTestId('dialog-overlay').click({ position: { x: 2, y: 2 } });
	await expect(page.getByTestId('dialog-content')).toHaveCount(0);
	await expect(dialogDemo.getByText(/open = false · 用户变更次数 = 4/u)).toBeVisible();
});

test('requires an explicit AlertDialog action and restores focus after the decision', async ({
	page
}) => {
	await page.goto('/#/components/alert-dialog');
	const alertDialogDemo = demo(page, 'alert-dialog-explicit-action');
	const trigger = alertDialogDemo.getByTestId('alert-dialog-trigger');
	await trigger.click();
	const dialog = page.getByTestId('alert-dialog-content');
	await expect(dialog).toHaveAttribute('role', 'alertdialog');
	await expect(dialog).toHaveAttribute('aria-modal', 'true');
	await expect(page.getByTestId('alert-dialog-cancel')).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(dialog).toBeVisible();
	await page.getByTestId('alert-dialog-overlay').click({ position: { x: 2, y: 2 } });
	await expect(dialog).toBeVisible();
	await page.getByTestId('alert-dialog-action').click();
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(alertDialogDemo.getByText(/open = false · 结果 = 已确认删除/u)).toBeVisible();
});

test('positions Drawer on logical edges and restores modal resources', async ({ page }) => {
	await page.goto('/#/components/drawer');
	const trigger = demo(page, 'drawer-logical-placement').getByTestId('drawer-trigger');
	await trigger.click();
	const drawer = page.getByTestId('drawer-content');
	await expect(drawer).toHaveAttribute('role', 'dialog');
	await expect(drawer).toHaveCSS('position', 'fixed');
	await expect(drawer).toHaveCSS('right', '0px');
	await expect(drawer).toHaveCSS('width', '400px');
	await expect(drawer.getByRole('textbox', { name: '发布通道', exact: true })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(drawer).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('keeps Popconfirm labelled, positioned and focused through explicit action', async ({
	page
}) => {
	await page.goto('/#/components/popconfirm');
	const popconfirmDemo = demo(page, 'popconfirm-danger-action');
	const trigger = popconfirmDemo.getByTestId('popconfirm-trigger');
	await trigger.click();
	const dialog = page.getByTestId('popconfirm-content');
	await expect(dialog).toHaveAttribute('role', 'dialog');
	await expect(dialog).not.toHaveAttribute('aria-modal');
	const titleId = await dialog.getAttribute('aria-labelledby');
	const descriptionId = await dialog.getAttribute('aria-describedby');
	await expect(page.locator(`#${titleId}`)).toHaveText('删除这条发布记录？');
	await expect(page.locator(`#${descriptionId}`)).toContainText('不能再次部署');
	await expect(page.getByTestId('popconfirm-cancel')).toBeFocused();
	await expect(dialog).toHaveCSS('position', 'absolute');
	await page.getByTestId('popconfirm-action').click();
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(popconfirmDemo.getByText(/open = false · 结果 = 已删除/u)).toBeVisible();
});

test('keeps S1 primitives semantic and display preferences effective', async ({ page }) => {
	await page.goto('/#/guides/theme');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('主题不是一组颜色');
	const semanticColors = page.locator('[data-slot="semantic-colors"]');
	await expect(
		semanticColors.getByRole('heading', { name: '语义颜色', exact: true })
	).toBeVisible();
	await expect(semanticColors.locator('[data-slot="semantic-color"]')).toHaveCount(19);

	await page.goto('/#/components/link');
	const linkDemo = demo(page, 'link-basic');
	await expect(linkDemo.locator('a[aria-disabled="true"]')).not.toHaveAttribute('href');
	await expect(linkDemo.locator('a[target="_blank"]')).toHaveAttribute(
		'rel',
		'noopener noreferrer'
	);

	await page.goto('/#/components/separator');
	const separatorDemo = demo(page, 'separator-basic');
	await expect(separatorDemo.locator('hr[data-orientation="horizontal"]')).toHaveCount(1);
	await expect(
		separatorDemo.locator('[role="separator"][aria-orientation="vertical"]')
	).toHaveCount(1);

	await page.goto('/#/components/visually-hidden');
	await expect(page.getByRole('button', { name: '搜索文档', exact: true })).toBeVisible();

	await setDisplayPreference(page, '密度', '紧凑');
	await setDisplayPreference(page, '对比度', '高对比');
	await setDisplayPreference(page, '动画', '减少');
	await setDisplayPreference(page, '方向', '从右到左');
	await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
	await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
	await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('has no automatically detectable accessibility violations', async ({ page }) => {
	for (const route of [
		'#/',
		'#/guides/theme',
		'#/guides/getting-started',
		'#/guides/icss',
		'#/guides/accessibility',
		'#/guides/ssr-csp',
		'#/guides/hmr',
		'#/guides/webview',
		'#/guides/package',
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
		'#/components/avatar',
		'#/components/badge',
		'#/components/card',
		'#/components/description-list',
		'#/components/list',
		'#/components/tag',
		'#/components/progress',
		'#/components/meter',
		'#/components/skeleton',
		'#/components/empty',
		'#/components/timeline',
		'#/components/statistic',
		'#/components/table',
		'#/components/virtual-list',
		'#/components/data-table',
		'#/components/carousel',
		'#/components/alert',
		'#/components/loading-bar',
		'#/components/result',
		'#/components/spinner',
		'#/components/toast',
		'#/components/checkbox',
		'#/components/calendar',
		'#/components/color-picker',
		'#/components/cascader',
		'#/components/combobox',
		'#/components/date-field',
		'#/components/date-picker',
		'#/components/date-range-picker',
		'#/components/input',
		'#/components/input-group',
		'#/components/mention',
		'#/components/multi-select',
		'#/components/number-field',
		'#/components/pin-input',
		'#/components/field',
		'#/components/file-upload',
		'#/components/form',
		'#/components/radio-group',
		'#/components/select',
		'#/components/segmented',
		'#/components/tags-input',
		'#/components/textarea',
		'#/components/time-field',
		'#/components/tree-select',
		'#/components/transfer',
		'#/components/switch',
		'#/components/slider',
		'#/components/accordion',
		'#/components/command',
		'#/components/command-palette',
		'#/components/context-menu',
		'#/components/dropdown-menu',
		'#/components/menu',
		'#/components/pagination',
		'#/components/tabs',
		'#/components/tree',
		'#/components/alert-dialog',
		'#/components/dialog',
		'#/components/drawer',
		'#/components/popconfirm',
		'#/components/popover',
		'#/components/tooltip',
		'#/components/tour'
	]) {
		await page.goto(`/${route}`);
		await expect(page.locator('main'), `${route} must expose one main landmark`).toHaveCount(1);
		const currentLink = page.locator('nav[aria-label="组件导航"] a[aria-current="page"]');
		await expect(currentLink, `${route} must expose one current navigation link`).toHaveCount(1);
		await expect(currentLink).toHaveAttribute('href', route);
		await expect(page).toHaveTitle(route === '#/' ? 'ZUI Components' : /.+ · ZUI Components$/u);
		const unnamedFields = await page
			.locator(
				'main input:not([type="hidden"]):not([hidden]), main textarea:not([hidden]), main select:not([hidden])'
			)
			.evaluateAll((elements) =>
				elements
					.filter((element) => !element.id && !element.getAttribute('name'))
					.map((element) => ({
						ariaLabel: element.getAttribute('aria-label'),
						placeholder: element.getAttribute('placeholder'),
						tag: element.tagName,
						type: element.getAttribute('type')
					}))
			);
		expect(unnamedFields, `${route} has form fields without id or name`).toEqual([]);
		const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
			const counts = new Map<string, number>();
			for (const element of elements) counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
			return [...counts].filter(([, count]) => count > 1).map(([id, count]) => ({ count, id }));
		});
		expect(duplicateIds, `${route} has duplicate DOM ids`).toEqual([]);
		await expect(
			page.locator('main h1'),
			`${route} must expose exactly one page heading`
		).toHaveCount(1);
		const hasHorizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
		);
		expect(hasHorizontalOverflow, `${route} overflows the document horizontally`).toBe(false);
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
	for (const [route, heading] of [
		['#/', '看见组件，运行组件，复制真实源码。'],
		['#/guides/getting-started', '从真实Provider和原生语义开始。'],
		['#/guides/package', '从公开entrypoint消费，而不是依赖工作区路径。'],
		['#/components/button', 'ZButton']
	] as const) {
		await page.goto(`/${route}`);
		await expect(page.getByRole('navigation', { name: '组件导航' })).toBeVisible();
		await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			)
		).toBeLessThanOrEqual(0);
	}
	await expect(page.locator('[data-slot="search-shortcut"]')).toBeHidden();
	await page.keyboard.press('/');
	await expect(page.getByRole('textbox', { name: '搜索组件' })).toBeFocused();
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
	const variantsBlock = page.locator('#button-variants');
	await variantsBlock.getByRole('button', { name: '复制', exact: true }).click();
	await expect(variantsBlock.getByRole('button', { name: '复制失败', exact: true })).toBeVisible();
	expect(errors).toEqual([]);
});
