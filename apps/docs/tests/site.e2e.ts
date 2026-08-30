import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { Buffer } from 'node:buffer';

test('renders the component catalog and real demo source', async ({ page }) => {
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	await page.goto('/#/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('看见组件');
	const cards = page.getByTestId('component-card');
	await expect(cards.first()).toBeVisible();
	expect(await cards.count()).toBeGreaterThanOrEqual(50);
	await expect(page.getByRole('heading', { level: 3 })).toHaveText([
		'通用组件',
		'布局组件',
		'输入组件',
		'导航组件',
		'浮层组件',
		'展示组件'
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

test('keeps FileUpload validation, native FormData, removal and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/file-upload');
	const input = page.locator('input[type="file"]');
	await input.setInputFiles({
		buffer: Buffer.from('{"ready":true}'),
		mimeType: 'application/json',
		name: 'production.json'
	});
	await expect(page.getByText('files = production.json · rejected = 0')).toBeVisible();
	await expect
		.poll(() =>
			page
				.locator('form')
				.evaluate((form) => (new FormData(form as HTMLFormElement).get('config') as File).name)
		)
		.toBe('production.json');
	await input.setInputFiles({
		buffer: Buffer.from('plain text'),
		mimeType: 'text/plain',
		name: 'invalid.txt'
	});
	await expect(page.getByText('files = production.json · rejected = 1')).toBeVisible();
	await page.getByRole('button', { name: '移除 production.json' }).click();
	await expect(page.getByText('files = none · rejected = 1')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect
		.poll(() => input.evaluate((element: HTMLInputElement) => element.files?.length))
		.toBe(0);
});

test('keeps Form schema errors, async state, first-error focus, valid submit and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/form');
	await page.getByRole('button', { name: '保存' }).click();
	const account = page.getByRole('textbox', { name: '账号' });
	const email = page.getByRole('textbox', { name: '邮箱' });
	await expect(account).toBeFocused();
	await expect(page.getByText('账号至少需要3个字符')).toBeVisible();
	await expect(page.getByText('请输入有效邮箱')).toBeVisible();
	await account.fill('alice');
	await email.fill('alice@example.com');
	await page.getByRole('button', { name: '保存' }).click();
	await expect(page.getByText('submitted = true · errors = 0 · result = alice')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('submitted = false · errors = 0 · result = alice')).toBeVisible();
	await expect(page.locator('[data-dirty="true"]')).toHaveCount(0);
});

test('keeps InputGroup focus boundary, Field context, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/input-group');
	const group = page.getByRole('group', { name: '服务地址组合' });
	const input = page.getByRole('textbox', { name: '服务主机' });
	await input.focus();
	await expect(group).toHaveCSS('outline-style', 'solid');
	await expect(input).toHaveCSS('border-style', 'none');
	await input.fill('gateway');
	await expect(page.getByText('url = https://gateway.internal')).toBeVisible();
	await expect
		.poll(() =>
			page.locator('form').evaluate((form) => new FormData(form as HTMLFormElement).get('host'))
		)
		.toBe('gateway');
	await page.getByRole('button', { name: '重置' }).click();
	await expect(input).toHaveValue('api');
});

test('keeps NumberField locale parsing, spinbutton keys, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/number-field');
	const input = page.getByRole('spinbutton', { name: '并发上限' });
	await expect(input).toHaveAttribute('aria-valuenow', '1234.5');
	await input.fill('12.75');
	await page.keyboard.press('ArrowUp');
	await expect(input).toHaveAttribute('aria-valuenow', '13');
	await expect(page.getByText('value = 13')).toBeVisible();
	await expect
		.poll(() =>
			page
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('concurrency'))
		)
		.toBe('13');
	await page.getByRole('button', { name: '重置' }).click();
	await expect(input).toHaveAttribute('aria-valuenow', '1234.5');
});

test('keeps Calendar grid keyboard, selection, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/calendar');
	const selected = page.getByRole('button', { name: '2026年8月18日星期二' });
	await selected.focus();
	await page.keyboard.press('ArrowRight');
	await expect(page.getByRole('button', { name: '2026年8月19日星期三' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.getByText('value = 2026-08-19')).toBeVisible();
	await expect
		.poll(() =>
			page.locator('form').evaluate((form) => new FormData(form as HTMLFormElement).get('date'))
		)
		.toBe('2026-08-19');
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('value = 2026-08-18')).toBeVisible();
});

test('keeps DateField and TimeField segment keys, values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-field');
	await page.getByRole('textbox', { name: 'Month' }).press('ArrowUp');
	await expect(page.getByText('value = 2026-09-18')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('value = 2026-08-18')).toBeVisible();

	await page.goto('/#/components/time-field');
	await page.getByRole('textbox', { name: 'Minute' }).press('ArrowUp');
	await expect(page.getByText('value = 09:31:15')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('value = 09:30:15')).toBeVisible();
});

test('keeps DatePicker Calendar selection, form value and focus restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-picker');
	const trigger = page.getByRole('button', { name: /上线日期/u });
	await trigger.click();
	await page.getByRole('button', { name: '2026年8月20日星期四' }).click();
	await expect(trigger).toBeFocused();
	await expect(page.getByText('value = 2026-08-20')).toBeVisible();
});

test('keeps DateRangePicker two-step normalized selection and dual form fields synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-range-picker');
	const trigger = page.getByRole('button', { name: /2026/u });
	await trigger.click();
	await page.getByRole('button', { name: '2026年8月25日星期二' }).click();
	await page.getByRole('button', { name: '2026年8月22日星期六' }).click();
	await expect(trigger).toBeFocused();
	await expect(page.getByText('range = 2026-08-22 / 2026-08-25')).toBeVisible();
	await expect
		.poll(() =>
			page
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
	await expect(page.getByRole('img', { name: '林墨' })).toHaveText('林');
	await expect(page.getByRole('img', { name: '部署机器人' })).toHaveText('机');

	await page.goto('/#/components/card');
	const card = page.locator('main article:has(> [data-slot="body"])');
	await expect(card).toHaveCount(1);
	await expect(card.locator(':scope > header')).toContainText('生产部署');
	await expect(card.locator(':scope > footer')).toContainText('更新于刚刚');

	await page.goto('/#/components/list');
	await expect(page.locator('main ol > li')).toHaveCount(2);

	await page.goto('/#/components/description-list');
	await expect(page.locator('main dl dt')).toHaveText(['版本', '区域']);
	await expect(page.locator('main dl dd')).toHaveText(['v2.4.0', 'cn-east-1']);

	await page.goto('/#/components/tag');
	await page.getByRole('button', { name: '移除 production' }).click();
	await expect(page.getByText('visible = false')).toBeVisible();
	await expect(page.getByRole('button', { name: '移除 production' })).toHaveCount(0);
});

test('keeps PinInput roving entry, completion, single FormData value and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/pin-input');
	const first = page.getByRole('textbox', { name: '一次性验证码' });
	await first.focus();
	await page.keyboard.type('123456');
	await expect(page.getByText('value = 123456 · complete = 1')).toBeVisible();
	await expect
		.poll(() =>
			page.locator('form').evaluate((form) => new FormData(form as HTMLFormElement).get('otp'))
		)
		.toBe('123456');
	await page.keyboard.press('Backspace');
	await expect(page.getByText('value = 12345 · complete = 1')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('value = empty · complete = 1')).toBeVisible();
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

test('keeps ColorPicker hex, alpha, Popover focus, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/color-picker');
	const trigger = page.getByRole('button', { name: '主题强调色 #2563ebcc' });
	await trigger.click();
	const hex = page.getByRole('textbox', { name: 'Hex颜色' });
	await expect(page.getByLabel('选择基础颜色')).toBeFocused();
	await hex.fill('#ff000080');
	await expect(page.getByText('value = #ff000080')).toBeVisible();
	await page.getByRole('slider', { name: '透明度' }).fill('25');
	await expect(page.getByText('value = #ff000040')).toBeVisible();
	await expect
		.poll(() =>
			page.locator('form').evaluate((form) => new FormData(form as HTMLFormElement).get('accent'))
		)
		.toBe('#ff000040');
	await page.keyboard.press('Escape');
	await expect(trigger).toBeFocused();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('value = #2563ebcc')).toBeVisible();
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

test('keeps pagination locale labels, current page and window synchronized', async ({ page }) => {
	await page.goto('/#/components/pagination');
	const navigation = page.getByRole('navigation', { name: '分页导航' });
	await expect(navigation.getByRole('button', { name: '第6页' })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await navigation.getByRole('button', { name: '第7页' }).click();
	await expect(navigation.getByRole('button', { name: '第7页' })).toHaveAttribute(
		'aria-current',
		'page'
	);
	await expect(page.getByText('page = 7 · 用户变更次数 = 1')).toBeVisible();
	await navigation.getByRole('button', { name: '下一页' }).click();
	await expect(page.getByText('page = 8 · 用户变更次数 = 2')).toBeVisible();
	await expect(navigation.locator('[data-slot="ellipsis"]')).toHaveCount(2);
});

test('keeps Menu roving focus, disabled skipping, typeahead and actions synchronized', async ({
	page
}) => {
	await page.goto('/#/components/menu');
	const open = page.getByRole('menuitem', { name: '打开详情' });
	await open.focus();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: '复制部署' })).toBeFocused();
	await page.keyboard.type('删');
	await expect(page.getByRole('menuitem', { name: '删除部署' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.getByText('action = delete')).toBeVisible();
	await expect(page.getByRole('menuitem', { name: /回滚/u })).toHaveAttribute(
		'aria-disabled',
		'true'
	);
});

test('keeps DropdownMenu positioning, focus, action dismiss and restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/dropdown-menu');
	const trigger = page.getByTestId('dropdown-menu-trigger');
	await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
	await trigger.click();
	const menu = page.getByRole('menu', { name: '部署操作' });
	await expect(menu).toBeVisible();
	await expect(page.getByRole('menuitem', { name: '查看详情' })).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(page.getByRole('menuitem', { name: '复制配置' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(menu).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.getByText(/open = false · action = duplicate/u)).toBeVisible();
});

test('anchors ContextMenu to pointer coordinates and supports the keyboard entry path', async ({
	page
}) => {
	await page.goto('/#/components/context-menu');
	const trigger = page.getByTestId('context-menu-trigger');
	const box = await trigger.boundingBox();
	expect(box).not.toBeNull();
	await trigger.click({ button: 'right', position: { x: 80, y: 20 } });
	const menu = page.getByRole('menu', { name: '部署上下文菜单' });
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
	const slider = page.getByRole('slider', { name: '告警阈值' });
	await expect(slider).toHaveValue('35');
	await expect(slider).toHaveAttribute('aria-valuetext', '35%');
	await slider.press('ArrowRight');
	await expect(slider).toHaveValue('40');
	await expect(page.getByText(/value = 40% · 用户变更次数 = 1/u)).toBeVisible();
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(page.getByText(/ · 40$/u)).toBeVisible();
	await page.locator('summary[aria-label="调整显示偏好"]').click();
	await page.locator('#zui-docs-direction').selectOption('rtl');
	await slider.press('ArrowRight');
	await expect(slider).toHaveValue('35');
	await expect(page.getByText(/value = 35% · 用户变更次数 = 2/u)).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(slider).toHaveValue('35');
	await expect(page.getByText(/value = 35% · 用户变更次数 = 2 · 尚未提交/u)).toBeVisible();
});

test('keeps Select listbox, keyboard, form value and reset synchronized', async ({ page }) => {
	await page.goto('/#/components/select');
	const trigger = page.getByTestId('select-trigger');
	await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
	await trigger.click();
	const listbox = page.getByRole('listbox', { name: '部署环境' });
	await expect(listbox).toBeVisible();
	await expect(page.getByRole('option', { name: '生产' })).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(page.getByRole('option', { name: '预发' })).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(listbox).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveText('预发');
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(page.getByText(/value = 预发 · 用户变更次数 = 1 · 预发/u)).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(trigger).toHaveText('生产');
});

test('keeps Combobox focus, filtering, active descendant and stable form value synchronized', async ({
	page
}) => {
	await page.goto('/#/components/combobox');
	const input = page.getByRole('combobox', { name: '搜索部署环境' });
	await input.focus();
	const listbox = page.getByRole('listbox', { name: '部署环境建议' });
	await expect(listbox).toBeVisible();
	await input.fill('预');
	await expect(page.getByRole('option', { name: '预发' })).toBeVisible();
	await expect(page.locator('[role="option"]', { hasText: '生产' })).toBeHidden();
	await expect(input).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(listbox).toHaveCount(0);
	await expect(input).toHaveValue('预发');
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(
		page.getByText(/value = staging · input = 预发 · 变更 = 1 · staging/u)
	).toBeVisible();
});

test('keeps MultiSelect tags, persistent toggles, form values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/multi-select');
	const trigger = page.getByTestId('multi-select-trigger');
	await trigger.click();
	const listbox = page.getByRole('listbox', { name: '部署环境' });
	await expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
	await page.getByRole('option', { name: '预发' }).click();
	await expect(listbox).toBeVisible();
	await expect(page.getByRole('option', { name: '预发' })).toHaveAttribute('aria-selected', 'true');
	await page.keyboard.press('Escape');
	await expect(trigger).toContainText('预发');
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(
		page.getByText(/values = 开发,生产,预发 · 变更 = 1 · 开发,生产,预发/u)
	).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(trigger).not.toContainText('预发');
});

test('keeps Segmented radio semantics, roving selection and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/segmented');
	const week = page.getByRole('radio', { name: '周' });
	await expect(week).toHaveAttribute('aria-checked', 'true');
	await week.focus();
	await page.keyboard.press('ArrowRight');
	await expect(page.getByRole('radio', { name: '月' })).toBeFocused();
	await expect(page.getByText('value = month · 变更 = 1')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(week).toHaveAttribute('aria-checked', 'true');
});

test('keeps TagsInput commits, removals, repeated form values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tags-input');
	const input = page.getByRole('textbox', { name: '添加部署标签' });
	await input.fill('critical');
	await page.keyboard.press('Enter');
	await expect(page.getByRole('button', { name: 'Remove critical' })).toBeVisible();
	await page.getByRole('button', { name: '读取FormData' }).click();
	await expect(
		page.getByText(/values = production,critical · 变更 = 1 · production,critical/u)
	).toBeVisible();
	await page.getByRole('button', { name: 'Remove production' }).click();
	await expect(page.getByText(/values = critical · 变更 = 2/u)).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByRole('button', { name: 'Remove production' })).toBeVisible();
});

test('keeps Textarea autosize, Field semantics, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/textarea');
	const textarea = page.getByRole('textbox', { name: '变更说明' });
	const initialBox = await textarea.boundingBox();
	await textarea.fill('第一行\n第二行\n第三行\n第四行\n第五行');
	await expect(page.getByText('value = 第一行 / 第二行 / 第三行 / 第四行 / 第五行')).toBeVisible();
	const expandedBox = await textarea.boundingBox();
	expect(expandedBox!.height).toBeGreaterThan(initialBox!.height);
	await expect
		.poll(() =>
			page
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('description'))
		)
		.toBe('第一行\n第二行\n第三行\n第四行\n第五行');
	await page.getByRole('button', { name: '重置' }).click();
	await expect(textarea).toHaveValue('生产变更说明');
});

test('keeps Accordion selection, roving focus and Presence synchronized', async ({ page }) => {
	await page.goto('/#/components/accordion');
	const runtime = page.getByRole('button', { name: /运行时合同/u });
	const delivery = page.getByRole('button', { name: /交付门禁/u });
	const legacy = page.getByRole('button', { name: /旧版合同/u });
	await expect(runtime).toHaveAttribute('aria-expanded', 'true');
	await expect(page.getByText('Collection、Selection与Presence拥有独立生命周期。')).toBeVisible();
	await expect(legacy).toBeDisabled();
	await delivery.click();
	await expect(delivery).toHaveAttribute('aria-expanded', 'true');
	await expect(runtime).toHaveAttribute('aria-expanded', 'false');
	await expect(page.getByText(/value = delivery · 用户变更次数 = 1/u)).toBeVisible();
	await delivery.press('ArrowDown');
	await expect(runtime).toBeFocused();

	await page.locator('summary[aria-label="调整显示偏好"]').click();
	await page.locator('#zui-docs-motion').selectOption('reduced');
	await delivery.click();
	await expect(delivery).toHaveAttribute('aria-expanded', 'false');
	await expect(page.getByText('类型、浏览器、bundle与外部安装在CI中验收。')).toHaveCount(0);
	await expect(page.getByText(/value = none · 用户变更次数 = 2/u)).toBeVisible();
});

test('keeps Tree hierarchy, visible keyboard navigation, selection and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tree');
	const docs = page.getByRole('treeitem', { name: /文档站/u });
	await expect(docs).toHaveAttribute('aria-selected', 'true');
	await docs.focus();
	await page.keyboard.press('ArrowDown');
	const worker = page.getByRole('treeitem', { name: /任务执行器/u });
	await expect(worker).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(worker).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByText(/selected = worker/u)).toBeVisible();
	await page.keyboard.press('ArrowLeft');
	await expect(page.getByRole('treeitem', { name: /平台/u })).toBeFocused();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(docs).toHaveAttribute('aria-selected', 'true');
});

test('keeps TreeSelect popup tree, selection, form value and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tree-select');
	const trigger = page.getByRole('button', { name: '文档站' });
	await trigger.click();
	const tree = page.getByRole('tree', { name: '选择项目节点' });
	await expect(tree).toBeVisible();
	await page.getByRole('treeitem', { name: /任务执行器/u }).click();
	await expect(tree).toHaveCount(0);
	await expect(page.getByRole('button', { name: '任务执行器' })).toBeFocused();
	await expect(page.getByText('value = worker')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByRole('button', { name: '文档站' })).toBeVisible();
});

test('keeps Cascader columns, path commit, focus restoration and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/cascader');
	const trigger = page.getByRole('button', { name: '平台 / Web应用 / 文档站' });
	await trigger.click();
	await expect(page.getByRole('listbox')).toHaveCount(3);
	await page.getByRole('option', { name: '任务执行器' }).click();
	await expect(page.getByRole('button', { name: '平台 / 任务执行器' })).toBeFocused();
	await expect(page.getByText('path = platform/worker')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(trigger).toBeVisible();
});

test('keeps Transfer filter, selection, move, repeated form values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/transfer');
	const source = page.getByRole('listbox', { name: '可用通道' });
	await source.getByRole('option', { name: /生产环境/u }).click();
	await page.getByRole('button', { name: '加入已选通道' }).click();
	await expect(page.getByRole('listbox', { name: '已选通道' })).toContainText('生产环境');
	await expect(page.getByText('selected = production/staging')).toBeVisible();
	await page.getByRole('textbox', { name: '可用通道: 筛选通道' }).fill('预览');
	await expect(source.getByRole('option')).toHaveCount(1);
	await page.getByRole('button', { name: '重置' }).click();
	await expect(page.getByText('selected = staging')).toBeVisible();
	await expect(source.getByRole('option')).toHaveCount(3);
});

test('keeps Mention textarea focus, active descendant, insertion, form value and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/mention');
	const editor = page.getByRole('textbox', { name: '发布通知' });
	await editor.fill('发布通知：@li');
	await expect(page.getByRole('listbox', { name: '成员建议' })).toBeVisible();
	await expect(editor).toHaveAttribute('aria-activedescendant', /option/u);
	await page.keyboard.press('Enter');
	await expect(editor).toBeFocused();
	await expect(editor).toHaveValue('发布通知：@lilei ');
	await expect(page.getByText('message = 发布通知：@lilei ')).toBeVisible();
	await page.getByRole('button', { name: '重置' }).click();
	await expect(editor).toHaveValue('发布通知：');
});

test('keeps Command ranking, active descendant and action synchronized', async ({ page }) => {
	await page.goto('/#/components/command');
	const input = page.getByRole('combobox', { name: '搜索管理命令' });
	await input.fill('deploy');
	await expect(page.getByRole('listbox', { name: '管理命令' }).getByRole('option')).toHaveCount(2);
	await expect(input).toHaveAttribute('aria-activedescendant', /option/u);
	await page.keyboard.press('Enter');
	await expect(page.getByText('query = deploy · action = preview')).toBeVisible();
});

test('keeps CommandPalette shortcut, modal focus, action close and focus restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/command-palette');
	const trigger = page.getByRole('button', { name: '打开快速操作' });
	await trigger.click();
	const dialog = page.getByRole('dialog', { name: '快速操作' });
	await expect(dialog).toBeVisible();
	const input = page.getByRole('combobox', { name: '搜索快捷命令' });
	await expect(input).toBeFocused();
	await input.fill('dark');
	await page.keyboard.press('Enter');
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.getByText('open = false · action = theme')).toBeVisible();
	await page.keyboard.press('Control+k');
	await expect(dialog).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);
});

test('keeps Popover portal, ARIA, focus, positioning and dismiss synchronized', async ({
	page
}) => {
	await page.goto('/#/components/popover');
	const trigger = page.getByTestId('popover-trigger');
	await trigger.click();
	await expect(trigger).toHaveAttribute('aria-expanded', 'true');
	const content = page.getByTestId('popover-content');
	await expect(content).toBeVisible();
	await expect(content).toHaveAttribute('role', 'dialog');
	await expect(content).toHaveCSS('position', 'absolute');
	await expect(page.getByRole('textbox', { name: '部署备注' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await expect(content).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.getByText(/open = false · 用户变更次数 = 2/u)).toBeVisible();
});

test('keeps Tooltip hover, focus, delay and Escape synchronized', async ({ page }) => {
	await page.goto('/#/components/tooltip');
	const trigger = page.getByTestId('tooltip-trigger');
	await trigger.hover();
	const tooltip = page.getByRole('tooltip');
	await expect(tooltip).toHaveText('所有生产探针均正常');
	const tooltipId = await tooltip.getAttribute('id');
	await expect(trigger).toHaveAttribute('aria-describedby', tooltipId!);
	await page.keyboard.press('Escape');
	await expect(tooltip).toHaveCount(0);
	await expect(page.getByText(/open = false · 用户变更次数 = 2/u)).toBeVisible();
	await trigger.focus();
	await expect(page.getByRole('tooltip')).toBeVisible();
});

test('keeps Dialog modal focus, inert, scroll, ARIA and dismiss synchronized', async ({ page }) => {
	await page.goto('/#/components/dialog');
	const trigger = page.getByTestId('dialog-trigger');
	await trigger.click();
	const dialog = page.getByTestId('dialog-content');
	await expect(dialog).toHaveAttribute('role', 'dialog');
	await expect(dialog).toHaveAttribute('aria-modal', 'true');
	const titleId = await dialog.getAttribute('aria-labelledby');
	const descriptionId = await dialog.getAttribute('aria-describedby');
	await expect(page.locator(`#${titleId}`)).toHaveText('编辑生产部署');
	await expect(page.locator(`#${descriptionId}`)).toContainText('关闭后焦点会返回');
	await expect(page.getByRole('textbox', { name: '部署名称' })).toBeFocused();
	await expect(page.locator('#app')).toHaveJSProperty('inert', true);
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
	await page.getByTestId('dialog-close').click();
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.locator('#app')).toHaveJSProperty('inert', false);
	await expect(page.getByText(/open = false · 用户变更次数 = 2/u)).toBeVisible();

	await trigger.click();
	await page.getByTestId('dialog-overlay').click({ position: { x: 2, y: 2 } });
	await expect(page.getByTestId('dialog-content')).toHaveCount(0);
	await expect(page.getByText(/open = false · 用户变更次数 = 4/u)).toBeVisible();
});

test('requires an explicit AlertDialog action and restores focus after the decision', async ({
	page
}) => {
	await page.goto('/#/components/alert-dialog');
	const trigger = page.getByTestId('alert-dialog-trigger');
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
	await expect(page.getByText(/open = false · 结果 = 已确认删除/u)).toBeVisible();
});

test('positions Drawer on logical edges and restores modal resources', async ({ page }) => {
	await page.goto('/#/components/drawer');
	const trigger = page.getByTestId('drawer-trigger');
	await trigger.click();
	const drawer = page.getByTestId('drawer-content');
	await expect(drawer).toHaveAttribute('role', 'dialog');
	await expect(drawer).toHaveCSS('position', 'fixed');
	await expect(drawer).toHaveCSS('right', '0px');
	await expect(drawer).toHaveCSS('width', '400px');
	await expect(page.getByRole('textbox', { name: '发布通道' })).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(drawer).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('keeps Popconfirm labelled, positioned and focused through explicit action', async ({
	page
}) => {
	await page.goto('/#/components/popconfirm');
	const trigger = page.getByTestId('popconfirm-trigger');
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
	await expect(page.getByText(/open = false · 结果 = 已删除/u)).toBeVisible();
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
		'#/components/avatar',
		'#/components/badge',
		'#/components/card',
		'#/components/description-list',
		'#/components/list',
		'#/components/tag',
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
		'#/components/tooltip'
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
