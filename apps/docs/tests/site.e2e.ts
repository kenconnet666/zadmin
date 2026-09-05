import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { guideDocs } from '../src/content/guides.js';
import { componentCatalogManifest } from '../src/framework/catalog-manifest.generated.js';

const demo = (page: Page, id: string) => page.locator(`[data-testid="demo-${id}"]:visible`);

async function resetDemo(scope: Locator): Promise<void> {
	// WebKit pointer actionability can lose form-control clicks while a long docs page is settling.
	// Enter is a real native reset-button activation and keeps the form contract cross-browser.
	await scope.getByRole('button', { name: '重置', exact: true }).press('Enter');
}

async function gotoComponent(page: Page, id: string): Promise<void> {
	await page.goto(`/#/components/${id}`);
	await expect(page).toHaveURL(new RegExp(`#/components/${id}$`, 'u'));
	const route = page.locator(`main [data-doc-route="component:${id}"]`);
	await expect(route).toBeVisible();
	await expect(route.getByRole('heading', { level: 1 })).toBeVisible();
}

async function gotoGuide(page: Page, id: string): Promise<void> {
	await page.goto(`/#/guides/${id}`);
	await expect(page).toHaveURL(new RegExp(`#/guides/${id}$`, 'u'));
	await expect(page.locator(`main [data-doc-route="guide:${id}"]`)).toBeVisible();
}

async function setDisplayPreference(
	page: Page,
	preference: '动画' | '对比度' | '方向' | '密度',
	option: string
): Promise<void> {
	await page.getByRole('button', { name: '调整显示偏好', exact: true }).click();
	await page.getByRole('button', { name: preference, exact: true }).click();
	await page.getByRole('option', { name: option, exact: true }).click();
	const preferenceAttribute = {
		动画: ['data-motion', option === '减少' ? 'reduced' : 'full'],
		对比度: ['data-contrast', option === '高对比' ? 'high' : 'normal'],
		方向: ['dir', option === '从右到左' ? 'rtl' : 'ltr'],
		密度: ['data-density', option === '紧凑' ? 'compact' : 'comfortable']
	} as const;
	const [attribute, expected] = preferenceAttribute[preference];
	await expect(page.locator('html')).toHaveAttribute(attribute, expected);
	await page.keyboard.press('Escape');
}

type AccessibilityRoute =
	| { readonly hash: '#/'; readonly kind: 'home' }
	| { readonly hash: string; readonly id: string; readonly kind: 'component' | 'guide' };

const accessibilityRoutes: readonly AccessibilityRoute[] = [
	{ hash: '#/', kind: 'home' },
	...componentCatalogManifest.map(({ id }) => ({
		hash: `#/components/${id}`,
		id,
		kind: 'component' as const
	})),
	{ hash: '#/guides/theme', id: 'theme', kind: 'guide' },
	...guideDocs.map(({ id }) => ({ hash: `#/guides/${id}`, id, kind: 'guide' as const }))
];

async function assertAccessibilityRoute(page: Page, route: AccessibilityRoute): Promise<void> {
	await page.goto(`/${route.hash}`);
	await expect(page).toHaveURL(new RegExp(`${route.hash.replaceAll('/', '\\/')}$`, 'u'));
	await expect(page.locator('main'), `${route.hash} must expose one main landmark`).toHaveCount(1);
	if (route.kind !== 'home') {
		const currentLink = page.locator('nav[aria-label="组件导航"] a[aria-current="page"]');
		await expect(currentLink, `${route.hash} must expose one current navigation link`).toHaveCount(
			1
		);
		await expect(currentLink).toHaveAttribute('href', route.hash);
		await expect(page).toHaveTitle(/.+ · ZUI Components$/u);
		await expect(
			page.locator(
				`main [data-doc-route="${route.kind === 'component' ? 'component' : 'guide'}:${route.id}"]`
			)
		).toBeVisible();
	} else {
		await expect(page).toHaveTitle('ZUI Components');
	}
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
	expect(unnamedFields, `${route.hash} has form fields without id or name`).toEqual([]);
	const duplicateIds = await page.locator('[id]').evaluateAll((elements) => {
		const counts = new Map<string, number>();
		for (const element of elements) counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
		return [...counts].filter(([, count]) => count > 1).map(([id, count]) => ({ count, id }));
	});
	expect(duplicateIds, `${route.hash} has duplicate DOM ids`).toEqual([]);
	await expect(
		page.locator('main [data-doc-page-title]'),
		`${route.hash} must expose exactly one page title`
	).toHaveCount(1);
	const hasHorizontalOverflow = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
	);
	expect(hasHorizontalOverflow, `${route.hash} overflows the document horizontally`).toBe(false);
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations, route.hash).toEqual([]);
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
	await expect(guideCards).toHaveCount(guideDocs.length);
	await expect(page.getByRole('heading', { level: 2, name: '生产指南' })).toBeVisible();
	for (const category of [
		'通用组件',
		'布局组件',
		'输入组件',
		'导航组件',
		'浮层组件',
		'展示组件',
		'反馈组件'
	]) {
		await expect(
			page.getByRole('heading', { level: 3, name: category, exact: true })
		).toBeVisible();
	}

	await page.goto('/#/components/button');
	await expect(page).toHaveTitle('ZButton · ZUI Components');
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
	for (const [label, height, fontSize] of [
		['Small', 24, '12px'],
		['Medium', 32, '14px'],
		['Large', 48, '18px']
	] as const) {
		const button = buttonStatesDemo.getByRole('button', { name: label, exact: true });
		await expect(button).toHaveCSS('font-size', fontSize);
		await expect(button).toHaveCSS('font-weight', '600');
		expect(await button.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(
			height,
			0
		);
	}
	expect(errors).toEqual([]);
});

test('keeps component page section spacing outside card surfaces', async ({ page }) => {
	await gotoComponent(page, 'button');
	const metrics = await page.evaluate(() => {
		const rect = (element: Element) => element.getBoundingClientRect();
		const demos = document.querySelector<HTMLElement>('#demos')!;
		const demoTitle = demos.querySelector('h2')!;
		const firstDemo = document.querySelector('#button-variants')!;
		const apiSections = [...document.querySelectorAll('#api > section')];
		const accessibility = document.querySelector<HTMLElement>('#accessibility')!;
		const accessibilityStyle = getComputedStyle(accessibility);
		const accessibilityBodyStyle = getComputedStyle(
			accessibility.querySelector('[data-slot="body"]')!
		);
		return {
			accessibilityMarginTop: accessibilityStyle.marginTop,
			accessibilityPadding: [
				accessibilityBodyStyle.paddingTop,
				accessibilityBodyStyle.paddingRight,
				accessibilityBodyStyle.paddingBottom,
				accessibilityBodyStyle.paddingLeft
			],
			apiGaps: apiSections
				.slice(1)
				.map((section, index) => Math.round(rect(section).top - rect(apiSections[index]!).bottom)),
			demoPaddingTop: getComputedStyle(demos).paddingTop,
			titleToFirstDemo: Math.round(rect(firstDemo).top - rect(demoTitle).bottom)
		};
	});
	expect(metrics.accessibilityMarginTop).toBe('64px');
	expect(metrics.accessibilityPadding).toEqual(['16px', '16px', '16px', '16px']);
	expect(metrics.apiGaps.length).toBeGreaterThan(0);
	expect([...new Set(metrics.apiGaps)]).toEqual([24]);
	expect(metrics.demoPaddingTop).toBe('0px');
	expect(metrics.titleToFirstDemo).toBe(16);
});

test('preserves docs typography and code geometry across themes', async ({ page }) => {
	await page.setViewportSize({ width: 1920, height: 1080 });
	await gotoComponent(page, 'button');
	for (const theme of [
		'极光明亮',
		'纸张暖白',
		'霓虹暗色',
		'午夜专业',
		'高对比亮色',
		'高对比暗色'
	]) {
		await page.getByRole('button', { name: '选择文档主题', exact: true }).click();
		await page.getByRole('option', { name: theme, exact: true }).click();
		const title = page.getByRole('heading', { level: 1 });
		await expect(title).toHaveCSS('font-size', '32px');
		for (const label of ['选择文档主题', '调整显示偏好', '搜索组件与指南']) {
			const control = page.getByRole('button', { name: label, exact: true });
			expect(await control.evaluate((element) => element.getBoundingClientRect().height)).toBe(32);
			await expect(control).toHaveCSS('font-size', '14px');
		}
		const github = page.getByRole('link', { name: 'GitHub', exact: true });
		expect(await github.evaluate((element) => element.getBoundingClientRect().height)).toBe(32);
		const inlineCode = page.locator('main code[data-highlight-status="highlighted"]').first();
		await expect(inlineCode).toBeVisible();
		await expect(inlineCode).toHaveCSS('font-size', '14px');
		expect(await inlineCode.textContent()).toBe("import { ZButton } from '@zadmin/zui';");
		const metrics = await page.evaluate(() => {
			const active = document.querySelector('nav[aria-label="组件导航"] a[aria-current="page"]')!;
			const inactive = document.querySelector('nav[aria-label="组件导航"] a:not([aria-current])')!;
			const code = document.querySelector('main code[data-highlight-status="highlighted"]')!;
			const style = getComputedStyle(code);
			return {
				active: getComputedStyle(active).color,
				inactive: getComputedStyle(inactive).color,
				codeHeight: code.getBoundingClientRect().height,
				oneLineHeight:
					Number.parseFloat(style.lineHeight) +
					Number.parseFloat(style.paddingTop) +
					Number.parseFloat(style.paddingBottom) +
					Number.parseFloat(style.borderTopWidth) +
					Number.parseFloat(style.borderBottomWidth),
				activeBorderWidth: getComputedStyle(active).borderInlineStartWidth,
				navHeight: active.getBoundingClientRect().height,
				selectedBackground: getComputedStyle(active).backgroundColor,
				navBackground: getComputedStyle(active.closest('aside')!).backgroundColor,
				fontFamily: getComputedStyle(document.querySelector('#button-variants p')!).fontFamily
			};
		});
		expect(metrics.active).not.toBe(metrics.inactive);
		expect(metrics.codeHeight).toBeCloseTo(metrics.oneLineHeight, 0);
		expect(metrics.activeBorderWidth).toBe('2px');
		expect(metrics.navHeight).toBe(32);
		expect(metrics.selectedBackground).not.toBe(metrics.navBackground);
		expect(metrics.fontFamily).not.toContain('Times New Roman');
		await expect(page.locator('#button-variants')).not.toContainText('basic-render');
		await expect(page.locator('#button-variants')).not.toContainText('variants-and-states');
	}
});

test('aligns reference headings and keeps explanatory lists readable', async ({ page }) => {
	await gotoComponent(page, 'list');
	const accessibility = page.locator('#accessibility');
	const title = accessibility.getByRole('heading', { level: 2 });
	await expect(title).toHaveCSS('font-size', '24px');
	const metrics = await page.evaluate(() => {
		const section = document.querySelector('#accessibility')!;
		const heading = section.querySelector('h2')!.getBoundingClientRect();
		const body = section.querySelector('[data-slot="body"]')!;
		const card = body.parentElement!.getBoundingClientRect();
		const apiHeading = document.querySelector('#api-states h2')!.getBoundingClientRect();
		return {
			x: heading.left - apiHeading.left,
			gap: card.top - heading.bottom,
			weights: [...section.querySelectorAll('li [data-slot="content"] > span')].map(
				(element) => getComputedStyle(element).fontWeight
			)
		};
	});
	expect(metrics.x).toBeCloseTo(0, 0);
	expect(metrics.gap).toBeCloseTo(16, 0);
	expect(metrics.weights.length).toBeGreaterThan(0);
	expect(new Set(metrics.weights)).toEqual(new Set(['400']));
});

test('exposes API table hierarchy and scroll-region semantics', async ({ page }) => {
	await page.setViewportSize({ width: 769, height: 900 });
	await gotoComponent(page, 'list');
	const apiSection = page.locator('main section[id^="api-"]').first();
	const heading = apiSection.getByRole('heading', { level: 2 }).first();
	const description = apiSection.locator('p').first();
	const region = apiSection.getByRole('region');
	await expect(heading).toBeVisible();
	const headingId = await heading.getAttribute('id');
	expect(headingId).toBeTruthy();
	await expect(region).toHaveAttribute('aria-labelledby', headingId!);
	if (await description.count()) {
		const descriptionId = await description.getAttribute('id');
		expect(descriptionId).toBeTruthy();
		await expect(region).toHaveAttribute('aria-describedby', descriptionId!);
	}
	await expect(region).toHaveAttribute('tabindex', '0');
	await expect(region.locator('table caption')).toHaveCount(1);
	await expect(region.locator('th[scope="col"]')).toHaveCount(5);
	expect(await region.locator('[data-api-depth]').count()).toBeGreaterThan(0);
	expect(await page.locator('[data-api-required-when]').count()).toBeGreaterThan(0);
	await expect(page.locator('[data-api-deprecated]')).toHaveCount(0);
});

test('searches every component and guide through the site CommandPalette', async ({ page }) => {
	await page.goto('/#/');
	const trigger = page.getByRole('button', { name: '搜索组件与指南', exact: true });
	const shortcuts = page.locator('[data-slot="search-shortcuts"]');
	await expect(shortcuts).toBeVisible();
	await expect(shortcuts).toHaveAttribute('aria-hidden', 'true');
	await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
	await expect(trigger).toHaveAttribute('aria-keyshortcuts', '/ Control+K Meta+K');

	await page.keyboard.press('/');
	let dialog = page.getByRole('dialog', { name: '搜索 ZUI 文档', exact: true });
	let search = dialog.getByRole('combobox', { name: '搜索组件与指南', exact: true });
	await expect(search).toBeFocused();
	await search.press('/');
	await expect(search).toHaveValue('/');
	await search.fill('definitely-no-component-or-guide');
	await expect(dialog.getByText('没有匹配的组件或指南', { exact: true })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog).toHaveCount(0);

	await trigger.click();
	dialog = page.getByRole('dialog', { name: '搜索 ZUI 文档', exact: true });
	search = dialog.getByRole('combobox', { name: '搜索组件与指南', exact: true });
	await expect(search).toHaveValue('');
	await search.fill('autosize');
	await expect(dialog.getByRole('option', { name: /ZTextarea/u })).toHaveCount(1);
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#\/components\/textarea$/u);
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();

	await page.keyboard.press('Control+K');
	dialog = page.getByRole('dialog', { name: '搜索 ZUI 文档', exact: true });
	search = dialog.getByRole('combobox', { name: '搜索组件与指南', exact: true });
	await expect(search).toBeFocused();
	await search.fill('PACKAGE');
	await expect(dialog.getByRole('option', { name: /PACKAGE/u })).toBeVisible();
	await page.keyboard.press('ArrowDown');
	await page.keyboard.press('Home');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/#\/guides\/package$/u);
	await expect(dialog).toHaveCount(0);
	await expect(trigger).toBeFocused();
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
		await gotoGuide(page, id);
		const guide = page.locator(`main [data-doc-route="guide:${id}"]`);
		await expect(guide.getByRole('heading', { level: 1 })).toHaveText(heading);
		expect(await guide.locator('section[id]').count()).toBeGreaterThanOrEqual(3);
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

test('keeps the header theme listbox readable and viewport bounded', async ({ page }) => {
	await page.setViewportSize({ height: 600, width: 769 });
	await page.goto('/#/components/button');
	const trigger = page.getByRole('button', { name: '选择文档主题', exact: true });
	await trigger.click();
	const content = page.getByRole('listbox');
	await expect(content).toBeVisible();
	const geometry = await page.evaluate(() => {
		const triggerElement = document.querySelector<HTMLElement>(
			'button[aria-label="选择文档主题"]'
		)!;
		const contentElement = document.querySelector<HTMLElement>('[role="listbox"]')!;
		const triggerRect = triggerElement.getBoundingClientRect();
		const contentRect = contentElement.getBoundingClientRect();
		return {
			content: {
				bottom: contentRect.bottom,
				right: contentRect.right,
				width: contentRect.width
			},
			options: [...contentElement.querySelectorAll<HTMLElement>('[role="option"]')].map(
				(option) => getComputedStyle(option).whiteSpace
			),
			overflowY: getComputedStyle(contentElement).overflowY,
			triggerWidth: triggerRect.width,
			viewport: { height: window.innerHeight, width: window.innerWidth }
		};
	});
	expect(geometry.content.width).toBeGreaterThan(geometry.triggerWidth);
	expect(geometry.content.width).toBeGreaterThan(120);
	expect(geometry.content.right).toBeLessThanOrEqual(geometry.viewport.width);
	expect(geometry.content.bottom).toBeLessThanOrEqual(geometry.viewport.height);
	expect(geometry.options).toEqual(Array(6).fill('nowrap'));
	expect(geometry.overflowY).toBe('auto');
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
	await gotoComponent(page, 'provider');
	const preferencesDemo = demo(page, 'provider-preferences');
	const compactButton = preferencesDemo.getByTestId('provider-density-button');
	const explicitButton = preferencesDemo.getByTestId('provider-explicit-button');
	const compactInput = preferencesDemo.getByTestId('provider-density-input');
	const compactTextarea = preferencesDemo.getByTestId('provider-density-textarea');

	await expect(compactButton).toHaveCSS('min-height', '24px');
	await expect(compactInput).toHaveCSS('min-height', '24px');
	await expect(compactTextarea).toHaveCSS('min-height', '64px');
	await expect(explicitButton).toHaveCSS('min-height', '48px');
	await expect(compactButton).toHaveCSS('font-size', '12px');
	await expect(compactInput).toHaveCSS('font-size', '12px');
	await expect(compactTextarea).toHaveCSS('font-size', '12px');
	await expect(explicitButton).toHaveCSS('font-size', '18px');
	expect(
		await compactButton.evaluate((element) => element.getBoundingClientRect().height)
	).toBeCloseTo(24, 0);
	expect(
		await explicitButton.evaluate((element) => element.getBoundingClientRect().height)
	).toBeCloseTo(48, 0);
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
	await gotoComponent(page, 'file-upload');
	const uploadDemo = demo(page, 'file-upload-form-queue');
	const input = uploadDemo.locator('input[type="file"]');
	await input.setInputFiles({
		buffer: Buffer.from('{"ready":true}'),
		mimeType: 'application/json',
		name: 'production.json'
	});
	const queueStatus = uploadDemo.getByText(/queue =/u);
	await expect(queueStatus).toContainText('production.json:queued');
	await expect(queueStatus).toContainText(/rejected\s*=\s*0/u);
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
	await expect(queueStatus).toContainText('production.json:queued');
	await expect(queueStatus).toContainText(/rejected\s*=\s*1/u);
	await uploadDemo.getByRole('button', { name: '移除 production.json', exact: true }).click();
	await expect(queueStatus).toContainText(/queue\s*=\s*none/u);
	await expect(queueStatus).toContainText(/rejected\s*=\s*1/u);
	await resetDemo(uploadDemo);
	const resetInput = uploadDemo.locator('input[type="file"]');
	await expect
		.poll(() => resetInput.evaluate((element: HTMLInputElement) => element.files?.length))
		.toBe(0);
	await expect(queueStatus).toContainText(/queue\s*=\s*none/u);
	await expect(queueStatus).toContainText(/rejected\s*=\s*0/u);
});

test('keeps Form schema errors, async state, first-error focus, valid submit and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'form');
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
	).toBeVisible({ timeout: 10_000 });
	await resetDemo(schemaDemo);
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
	await gotoComponent(page, 'form');
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
	await gotoComponent(page, 'input-group');
	const inputGroupDemo = demo(page, 'input-group-affixes');
	const group = inputGroupDemo.getByRole('group', { name: '服务地址', exact: true });
	const input = inputGroupDemo.getByRole('textbox', { name: '服务地址', exact: true });
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
	await resetDemo(inputGroupDemo);
	await expect(input).toHaveValue('api');
	await expect(inputGroupDemo.getByText('url = https://api.internal')).toBeVisible();
});

test('keeps NumberField locale parsing, spinbutton keys, FormData and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'number-field');
	const numberDemo = demo(page, 'number-field-locale-form');
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
	await resetDemo(numberDemo);
	const resetInput = numberDemo.getByRole('spinbutton', { name: '并发上限', exact: true });
	await expect(resetInput).toHaveAttribute('aria-valuenow', '1234.5');
	await expect(numberDemo.getByText('value = 1234.5')).toBeVisible();
});

test('keeps Calendar grid keyboard, selection, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/calendar');
	const calendarDemo = demo(page, 'calendar-grid-form');
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
	await resetDemo(calendarDemo);
	await expect(calendarDemo.getByText('value = 2026-08-18')).toBeVisible();
});

test('keeps DateField and TimeField segment keys, values and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-field');
	const dateFieldDemo = demo(page, 'date-field-segments-form');
	await dateFieldDemo.getByRole('textbox', { name: '月', exact: true }).press('ArrowUp');
	await expect(dateFieldDemo.getByText('value = 2026-09-18')).toBeVisible();
	await resetDemo(dateFieldDemo);
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
	const timeFieldDemo = demo(page, 'time-field-segments-form');
	const timeForm = timeFieldDemo.locator('form');
	const minute = timeFieldDemo.getByRole('textbox', { name: '分钟', exact: true });
	await minute.press('ArrowUp');
	await expect(timeFieldDemo.getByText('value = 09:31:15')).toBeVisible();
	await expect
		.poll(() => timeForm.evaluate((form) => new FormData(form as HTMLFormElement).get('time')))
		.toBe('09:31:15');
	await resetDemo(timeFieldDemo);
	await expect
		.poll(() => timeForm.evaluate((form) => new FormData(form as HTMLFormElement).get('time')))
		.toBe('09:30:15');
	await expect(minute).toHaveValue('30');
	await expect(timeFieldDemo.getByText('value = 09:30:15')).toBeVisible();
});

test('keeps DatePicker Calendar selection, form value and focus restoration synchronized', async ({
	page
}) => {
	await page.goto('/#/components/date-picker');
	const datePickerDemo = demo(page, 'date-picker-editable-form');
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
	const rangeDemo = demo(page, 'date-range-picker-form');
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
	const nativeAvatar = demo(page, 'avatar-native-image').locator('img');
	await expect(nativeAvatar).toHaveAttribute('loading', 'lazy');
	await expect(nativeAvatar).toHaveAttribute('decoding', 'async');
	await expect(nativeAvatar).toHaveAttribute('referrerpolicy', 'no-referrer');
	await expect(
		demo(page, 'avatar-decorative').locator('[data-slot="fallback"][role="img"]')
	).toHaveCount(1);

	await page.goto('/#/components/card');
	const card = demo(page, 'card-anatomy').locator('article:has(> [data-slot="body"])');
	await expect(card).toHaveCount(1);
	await expect(card.locator(':scope > header')).toContainText('生产部署');
	await expect(card.locator(':scope > footer')).toContainText('更新于刚刚');
	const loadingCard = demo(page, 'card-loading').locator('[data-loading="true"]');
	await expect(loadingCard).toHaveAttribute('aria-busy', 'true');
	await expect(loadingCard.locator('[data-slot="loading"] > [aria-hidden="true"]')).toHaveCount(3);
	await demo(page, 'card-loading').getByRole('button', { name: '显示正文', exact: true }).click();
	await expect(demo(page, 'card-loading').locator('[data-slot="body"]')).toContainText(
		'正文由调用方拥有'
	);
	const semanticCards = demo(page, 'card-semantic-roots');
	await expect(semanticCards.locator(':scope [data-variant="outlined"]')).toHaveCount(3);
	await expect(semanticCards.locator('section[aria-labelledby="card-section-title"]')).toHaveCount(
		1
	);
	await expect(semanticCards.locator('article[aria-labelledby="card-article-title"]')).toHaveCount(
		1
	);

	await page.goto('/#/components/list');
	await expect(demo(page, 'list-ordered-data').locator('ol > li')).toHaveCount(2);

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
	const dynamicAlertDemo = demo(page, 'alert-dynamic-insertion');
	const politeTrigger = dynamicAlertDemo.getByRole('button', {
		name: '插入普通状态',
		exact: true
	});
	await politeTrigger.click();
	await expect(politeTrigger).toBeFocused();
	await expect(dynamicAlertDemo.getByRole('status')).toContainText('后台检查已完成');

	await page.goto('/#/components/loading-bar');
	const loadingDemo = demo(page, 'loading-bar-values');
	const progress = loadingDemo.getByRole('progressbar', { name: '发布进度', exact: true });
	await expect(progress).toHaveAttribute('aria-valuenow', '42');
	await loadingDemo.getByRole('button', { name: '增加10%', exact: true }).click();
	await expect(progress).toHaveAttribute('aria-valuenow', '52');
	await expect(
		loadingDemo.getByRole('progressbar', { name: '正在连接构建服务', exact: true })
	).not.toHaveAttribute('aria-valuenow');
	const controllerDemo = demo(page, 'loading-bar-controller');
	const controlledProgress = controllerDemo.getByRole('progressbar', {
		name: '受控发布生命周期',
		exact: true
	});
	await controllerDemo.getByRole('button', { name: 'start不确定任务', exact: true }).click();
	await expect(controlledProgress).toBeVisible();
	await expect(controlledProgress).not.toHaveAttribute('aria-valuenow');
	await controllerDemo.getByRole('button', { name: 'update到48%', exact: true }).click();
	await expect(controlledProgress).toHaveAttribute('aria-valuenow', '48');
	await controllerDemo.getByRole('button', { name: 'error持久化', exact: true }).click();
	await expect(controlledProgress).toHaveAttribute('data-state', 'error');
	await controllerDemo.getByRole('button', { name: 'reset', exact: true }).click();
	await expect(controlledProgress).toBeHidden();

	await page.goto('/#/components/spinner');
	const spinnerTones = demo(page, 'spinner-tones');
	await expect(spinnerTones.locator('[role="status"][data-tone="primary"]')).toHaveCount(1);
	await expect(spinnerTones.locator('[role="status"][data-tone="muted"]')).toHaveCount(1);
	await expect(spinnerTones.locator('[role="status"][data-tone="inherit"]')).toHaveCount(1);

	await page.goto('/#/components/result');
	const result = demo(page, 'result-success').locator('section[aria-labelledby]');
	await expect(
		result.getByRole('heading', { level: 4, name: '发布完成', exact: true })
	).toBeVisible();
	await expect(result.locator('[data-slot="icon"]')).toHaveAttribute('aria-hidden', 'true');
	await expect(result).not.toHaveAttribute('role', 'status');

	await page.goto('/#/components/toast');
	await demo(page, 'toast-queue').getByRole('button', { name: '发送通知', exact: true }).click();
	const toaster = page.locator('[data-slot="viewport"][aria-label="发布通知"]');
	await expect(toaster.locator('[data-slot="polite-announcer"]')).toContainText('发布制品已就绪');
	const toast = toaster.locator('article').filter({ hasText: '发布制品已就绪' });
	await expect(toast).toBeVisible();
	await toast.getByRole('button', { name: '关闭通知：发布制品已就绪', exact: true }).click();
	await expect(toast).toHaveCount(0);
});

test('keeps progress, meter, skeleton, empty, timeline and statistic semantics explicit', async ({
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
	const progressTones = demo(page, 'progress-tones');
	await expect(
		progressTones.getByRole('progressbar', { name: '失败任务', exact: true })
	).toHaveAttribute('data-tone', 'danger');
	await expect(
		progressTones.getByRole('progressbar', { name: '圆形成功任务', exact: true })
	).toHaveAttribute('data-tone', 'success');

	await page.goto('/#/components/meter');
	await expect(
		demo(page, 'meter-thresholds').getByRole('meter', { name: 'CPU容量', exact: true })
	).toHaveAttribute('data-state', 'suboptimal');
	await expect(
		demo(page, 'meter-custom-range').getByRole('meter', { name: '存储容量', exact: true })
	).toHaveAttribute('aria-valuetext', '88 GiB / 128 GiB，警戒');

	await page.goto('/#/components/skeleton');
	await expect(demo(page, 'skeleton-lines').locator('[data-slot="line"]')).toHaveCount(3);
	await expect(demo(page, 'skeleton-motion').locator('[data-static="true"]')).toHaveCount(2);

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
	const pendingTimelineDemo = demo(page, 'timeline-pending-reverse');
	const pendingTimeline = pendingTimelineDemo.getByRole('list', {
		name: '带未完成尾项的计算时间线',
		exact: true
	});
	await expect(pendingTimeline).toHaveAttribute('aria-busy', 'true');
	await expect(pendingTimeline.locator('li').last()).toHaveAttribute('data-slot', 'pending');
	await pendingTimelineDemo.getByRole('button', { name: '查看倒序', exact: true }).click();
	await expect(pendingTimeline.locator('li').first()).toHaveAttribute('data-slot', 'pending');
	await expect(demo(page, 'timeline-typed-keys').getByRole('listitem')).toHaveCount(2);

	await page.goto('/#/components/statistic');
	const statisticDemo = demo(page, 'statistic-format');
	const requestStatistic = statisticDemo.locator('dl').filter({ hasText: '请求总数' });
	await expect(requestStatistic.locator('data')).toHaveAttribute('value', '128430');
	await expect(requestStatistic.locator('[data-trend="up"]')).toContainText('+12.4%');
	const bigintStatistic = demo(page, 'statistic-formatter').locator('dl').filter({
		hasText: '精确事件序号'
	});
	await expect(bigintStatistic.locator('data')).toHaveAttribute('value', '12345678901234567890');
	await expect(bigintStatistic.locator('data')).toContainText('#12,345,678,901,234,567,890');
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
	await expect(carousel.getByRole('group', { name: /第1张，共3张/u })).toBeVisible();
	await carousel.getByRole('button', { name: '下一张' }).click();
	await expect(carouselDemo.getByText('value = metrics')).toBeVisible();
	await expect(carousel.getByRole('group', { name: /第2张，共3张/u })).toBeVisible();
	await carousel.getByRole('button', { name: '暂停自动轮播' }).click();
	await expect(carousel.getByRole('button', { name: '开始自动轮播' })).toBeVisible();
	await carousel.getByRole('button', { name: /转到第3张/u }).click();
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
	await gotoComponent(page, 'pin-input');
	const pinDemo = demo(page, 'pin-input-otp');
	const pinGroup = pinDemo.getByRole('group', { name: '一次性验证码', exact: true });
	const first = pinGroup.getByRole('textbox', { name: '验证码第1位，共6位', exact: true });
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
	await resetDemo(pinDemo);
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
	await resetDemo(checkboxDemo);
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
	await resetDemo(colorDemo);
	await expect(colorDemo.getByText('value = #2563ebcc')).toBeVisible();

	const controlledDemo = demo(page, 'color-picker-controlled');
	await controlledDemo.getByRole('button', { name: '外部清空', exact: true }).click();
	await expect(
		controlledDemo.getByText(/value = null · open = false · 用户变更 = 0/u)
	).toBeVisible();
	await controlledDemo.getByRole('button', { name: '外部设置蓝色', exact: true }).click();
	await expect(controlledDemo.getByText(/value = #0ea5e9/u)).toBeVisible();

	const presetsDemo = demo(page, 'color-picker-presets');
	await presetsDemo.locator('button[aria-haspopup="dialog"]').click();
	await page.getByRole('button', { name: '警告半透明', exact: true }).click();
	await expect(presetsDemo.getByText('preset value = #d9770680')).toBeVisible();
});

test('keeps switch semantics, keyboard state, FormData and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'switch');
	const switchDemo = demo(page, 'switch-form');
	const control = switchDemo.getByTestId('switch-alerts');
	const thumb = switchDemo.locator('[data-slot="thumb"]');
	await expect(control).toHaveRole('switch');
	await expect(control).toHaveAttribute('aria-checked', 'true');
	await setDisplayPreference(page, '动画', '减少');
	await setDisplayPreference(page, '方向', '从右到左');
	await expect
		.poll(() =>
			control.evaluate((element) => {
				const duration = getComputedStyle(element).transitionDuration.split(',')[0] ?? '0s';
				return duration.endsWith('ms')
					? Number.parseFloat(duration) / 1000
					: Number.parseFloat(duration);
			})
		)
		.toBeLessThanOrEqual(0.00001);
	await expect
		.poll(() =>
			thumb.evaluate((element) => {
				const transform = getComputedStyle(element).transform;
				return transform === 'none' ? 'matrix(1, 0, 0, 1, 0, 0)' : transform;
			})
		)
		.toBe('matrix(1, 0, 0, 1, 0, 0)');
	await control.press('Space');
	await expect(control).toHaveAttribute('aria-checked', 'false');
	await expect
		.poll(() =>
			thumb.evaluate((element) => {
				const transform = getComputedStyle(element).transform;
				return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m41;
			})
		)
		.toBeGreaterThan(0);
	await expect(switchDemo.getByText(/checked = false · 用户变更次数 = 1/u)).toBeVisible();
	await control.press('Space');
	await expect(control).toHaveAttribute('aria-checked', 'true');
	await expect(switchDemo.getByText(/checked = true · 用户变更次数 = 2/u)).toBeVisible();
	await switchDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(switchDemo.getByText(/enabled/u)).toBeVisible();
	await resetDemo(switchDemo);
	await expect(control).toHaveAttribute('aria-checked', 'true');
	await expect(switchDemo.getByText(/checked = true · 用户变更次数 = 2 · 尚未提交/u)).toBeVisible();
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
	await resetDemo(radioDemo);
	await expect(team).toBeChecked();
	await expect(radioDemo.getByText(/value = team · 用户变更次数 = 3 · 尚未提交/u)).toBeVisible();
});

test('keeps Tabs ARIA relationships, disabled skipping and RTL activation synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tabs');
	const tabsDemo = demo(page, 'tabs-automatic');
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
	await expect(
		navigation.getByRole('button', { name: '第6页，当前页', exact: true })
	).toHaveAttribute('aria-current', 'page');
	await navigation.getByRole('button', { name: '第7页', exact: true }).click();
	await expect(
		navigation.getByRole('button', { name: '第7页，当前页', exact: true })
	).toHaveAttribute('aria-current', 'page');
	await expect(paginationDemo.getByText('page = 7 / 42 · 用户变更次数 = 1')).toBeVisible();
	await navigation.getByRole('button', { name: '下一页', exact: true }).click();
	await expect(paginationDemo.getByText('page = 8 / 42 · 用户变更次数 = 2')).toBeVisible();
	await expect(navigation.locator('[data-slot="ellipsis"]')).toHaveCount(2);
});

test('keeps pagination item totals, page size and compact owners synchronized', async ({
	page
}) => {
	await page.goto('/#/components/pagination');
	const sizeDemo = demo(page, 'pagination-page-size');
	const sizePicker = sizeDemo.getByRole('combobox', { name: '每页条数', exact: true });
	await expect(sizeDemo.getByText('共96条', { exact: true })).toBeVisible();
	await sizePicker.selectOption('50');
	await expect(
		sizeDemo.getByText(/page = 2 · pageSize = 50 · 页码回调1次 · 页尺寸回调1次/u)
	).toBeVisible();

	const modesDemo = demo(page, 'pagination-modes');
	const pageInput = modesDemo.getByRole('spinbutton', { name: '页码', exact: true });
	await pageInput.fill('27');
	await pageInput.press('Enter');
	await expect(modesDemo.getByText('三个视图共享外部owner：page = 27')).toBeVisible();
	await expect(modesDemo.getByRole('navigation', { name: 'RTL分页', exact: true })).toHaveAttribute(
		'dir',
		'rtl'
	);
});

test('keeps Menu roving focus, disabled skipping, typeahead and actions synchronized', async ({
	page
}) => {
	await page.goto('/#/components/menu');
	const menuDemo = demo(page, 'menu-collection-navigation');
	const open = menuDemo.getByRole('menuitem', { name: '打开详情', exact: true });
	await open.focus();
	await page.keyboard.press('ArrowDown');
	const duplicate = menuDemo.getByRole('menuitem', { name: '复制部署', exact: true });
	await expect(duplicate).toBeFocused();
	await duplicate.dispatchEvent('keydown', { bubbles: true, key: '删' });
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
	await gotoComponent(page, 'context-menu');
	const trigger = demo(page, 'context-menu-coordinate-anchor').getByTestId('context-menu-trigger');
	await trigger.scrollIntoViewIfNeeded();
	const box = await trigger.boundingBox();
	expect(box).not.toBeNull();
	const clickX = (box?.x ?? 0) + 80;
	const clickY = (box?.y ?? 0) + 20;
	await page.mouse.click(clickX, clickY, { button: 'right' });
	const menu = page.getByRole('menu', { name: '部署上下文菜单', exact: true });
	await expect(menu).toBeVisible();
	const surfaceBox = await page.getByTestId('context-menu-content').boundingBox();
	expect(surfaceBox).not.toBeNull();
	expect(surfaceBox!.x).toBeCloseTo(clickX, 0);
	expect(
		Math.min(
			Math.abs(surfaceBox!.y - clickY),
			Math.abs(surfaceBox!.y + surfaceBox!.height - clickY)
		)
	).toBeLessThanOrEqual(4);
	expect(surfaceBox!.x).toBeGreaterThanOrEqual(0);
	expect(surfaceBox!.y).toBeGreaterThanOrEqual(0);
	expect(surfaceBox!.x + surfaceBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
	expect(surfaceBox!.y + surfaceBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
	await page.keyboard.press('Escape');
	await expect(trigger).toBeFocused();
	await page.keyboard.press('Shift+F10');
	await expect(menu).toBeVisible();
});

test('keeps Slider keyboard, value text, FormData and reset synchronized', async ({ page }) => {
	await gotoComponent(page, 'slider');
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
	await resetDemo(sliderDemo);
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
	await expect(listbox).toBeFocused();
	const production = listbox.getByRole('option', { name: '生产', exact: true });
	await expect(listbox).toHaveAttribute(
		'aria-activedescendant',
		(await production.getAttribute('id'))!
	);
	await page.keyboard.press('ArrowUp');
	const staging = listbox.getByRole('option', { name: '预发', exact: true });
	await expect(listbox).toHaveAttribute(
		'aria-activedescendant',
		(await staging.getAttribute('id'))!
	);
	await page.keyboard.press('Enter');
	await expect(listbox).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveText('预发');
	await selectDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(selectDemo.getByText(/value = 预发 · 用户变更次数 = 1 · 预发/u)).toBeVisible();
	await resetDemo(selectDemo);
	await expect(trigger).toHaveText('生产');
});

test('keeps Combobox focus, filtering, active descendant and stable form value synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'combobox');
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

test('keeps Select and Combobox data options grouped with distinct typed keys', async ({
	page
}) => {
	await page.goto('/#/components/select');
	const selectDemo = demo(page, 'select-options');
	await selectDemo.getByRole('button', { name: '选择typed key', exact: true }).click();
	const selectListbox = page.getByRole('listbox', { name: '选择typed key', exact: true });
	await expect(selectListbox.getByRole('group', { name: '数字 key', exact: true })).toBeVisible();
	await expect(selectListbox.getByRole('group', { name: '字符串 key', exact: true })).toBeVisible();
	await selectListbox.getByRole('option', { name: /字符串 "1"/u }).click();
	await expect(selectDemo.getByText(/value = 1 · typeof = string/u)).toBeVisible();

	await gotoComponent(page, 'combobox');
	const comboDemo = demo(page, 'combobox-options');
	const input = comboDemo.getByRole('combobox', { name: '搜索typed key', exact: true });
	await input.fill('字符串');
	const comboListbox = page.getByRole('listbox', { name: '选择选项', exact: true });
	await expect(comboListbox.getByRole('option')).toHaveCount(2);
	const stringOption = comboListbox.getByRole('option', { name: /字符串 "1"/u });
	const stringOptionId = await stringOption.getAttribute('id');
	expect(stringOptionId).not.toBeNull();
	await expect(input).toHaveAttribute('aria-activedescendant', stringOptionId!);
	await input.press('Enter');
	await expect(
		comboDemo.getByText(/value = 1 · typeof = string · input = 字符串 "1"/u)
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
		multiSelectDemo.getByText(/value = 开发,生产,预发 · 变更 = 1 · 开发,生产,预发/u)
	).toBeVisible();
	await resetDemo(multiSelectDemo);
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
	await resetDemo(segmentedDemo);
	await expect(week).toHaveAttribute('aria-checked', 'true');
});

test('keeps TagsInput commits, removals, repeated form values and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'tags-input');
	const tagsDemo = demo(page, 'tags-input-form');
	const input = tagsDemo.getByRole('textbox', { name: '添加部署标签', exact: true });
	await input.fill('critical');
	await page.keyboard.press('Enter');
	await expect(
		tagsDemo.getByRole('button', { name: '移除标签 critical', exact: true })
	).toBeVisible();
	await expect
		.poll(() =>
			tagsDemo
				.locator('form')
				.evaluate((form) => new FormData(form as HTMLFormElement).getAll('tag'))
		)
		.toEqual(['production', 'critical']);
	await tagsDemo.getByRole('button', { name: '读取FormData', exact: true }).click();
	await expect(
		tagsDemo.getByText(/values = production,critical · 变更 = 1 · production,critical/u)
	).toBeVisible();
	await tagsDemo.getByRole('button', { name: '移除标签 production', exact: true }).click();
	await expect(tagsDemo.getByText(/values = critical · 变更 = 2/u)).toBeVisible();
	await resetDemo(tagsDemo);
	await expect(
		tagsDemo.getByRole('button', { name: '移除标签 production', exact: true })
	).toBeVisible();

	const editingDemo = demo(page, 'tags-input-editing');
	await editingDemo.getByRole('button', { name: '编辑标签 staging', exact: true }).click();
	const editInput = editingDemo.getByRole('textbox', { name: '编辑标签 staging', exact: true });
	await editInput.fill('Release Candidate');
	await editInput.press('Enter');
	await expect(editingDemo.getByText(/values = production,release-candidate/u)).toBeVisible();

	const overflowDemo = demo(page, 'tags-input-overflow');
	await expect(overflowDemo.locator('[data-slot="tag"]')).toHaveCount(3);
	await expect(overflowDemo.getByText('还有 9 个标签', { exact: true })).toBeVisible();
	const overflowGroup = overflowDemo.getByRole('group', { name: '大量发布标签', exact: true });
	await overflowGroup.getByRole('textbox', { name: '添加标签', exact: true }).focus();
	await expect(overflowDemo.locator('[data-slot="tag"]')).toHaveCount(12);
});

test('keeps Textarea autosize, Field semantics, FormData and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/textarea');
	const autosizeDemo = demo(page, 'textarea-autosize');
	const autosize = autosizeDemo.getByRole('textbox', { name: '有界Autosize', exact: true });
	const initialBox = await autosize.boundingBox();
	await autosize.fill('第一行\n第二行\n第三行\n第四行\n第五行');
	const expandedBox = await autosize.boundingBox();
	expect(expandedBox!.height).toBeGreaterThan(initialBox!.height);

	const textareaDemo = demo(page, 'textarea-form');
	const textarea = textareaDemo.getByRole('textbox', { name: '变更说明', exact: true });
	await textarea.fill('第一行\n第二行\n第三行\n第四行\n第五行');
	await expect(
		textareaDemo.getByText('binding：第一行 / 第二行 / 第三行 / 第四行 / 第五行')
	).toBeVisible();
	await expect
		.poll(() =>
			textareaDemo
				.locator('#textarea-external-form')
				.evaluate((form) => new FormData(form as HTMLFormElement).get('description'))
		)
		.toBe('第一行\n第二行\n第三行\n第四行\n第五行');
	await textareaDemo.getByRole('button', { name: '重置外部控件', exact: true }).click();
	await expect(textarea).toHaveValue('生产变更说明');
	await expect(textareaDemo.getByText('binding：生产变更说明')).toBeVisible();
	await expect(textareaDemo.getByText('提交结果：已恢复默认值')).toBeVisible();
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
	await expect(accordionDemo.getByText(/value = null · 用户变更次数 = 2/u)).toBeVisible();
});

test('keeps Tree hierarchy, visible keyboard navigation, selection and reset synchronized', async ({
	page
}) => {
	await page.goto('/#/components/tree');
	const treeDemo = demo(page, 'tree-navigation');
	const tree = treeDemo.getByRole('tree', { name: '项目结构', exact: true });
	const docs = tree.getByRole('treeitem', { name: '文档站', exact: true });
	await expect(docs).toHaveAttribute('aria-selected', 'true');
	await tree.focus();
	await expect(tree).toBeFocused();
	await expect(tree).toHaveAttribute('aria-activedescendant', (await docs.getAttribute('id'))!);
	await page.keyboard.press('ArrowDown');
	const worker = tree.getByRole('treeitem', { name: '任务执行器', exact: true });
	await expect(tree).toHaveAttribute('aria-activedescendant', (await worker.getAttribute('id'))!);
	await expect(tree).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(worker).toHaveAttribute('aria-selected', 'true');
	await expect(treeDemo.getByText(/selected = worker/u)).toBeVisible();
	await page.keyboard.press('ArrowLeft');
	const platform = tree.getByRole('treeitem', { name: '平台', exact: true });
	await expect(tree).toHaveAttribute('aria-activedescendant', (await platform.getAttribute('id'))!);
	await resetDemo(treeDemo);
	await expect(docs).toHaveAttribute('aria-selected', 'true');
});

test('keeps virtual Tree DOM bounded while keyboard focus reaches the global final node', async ({
	page
}) => {
	await page.goto('/#/components/tree');
	const virtualTreeDemo = demo(page, 'tree-virtual');
	const tree = virtualTreeDemo.getByRole('tree', { name: '五千节点树', exact: true });
	await expect(tree.getByRole('treeitem')).toHaveCount(11);
	await tree.focus();
	await page.keyboard.press('End');
	const finalNode = tree.getByRole('treeitem', { name: '节点 5000', exact: true });
	await expect(tree).toHaveAttribute(
		'aria-activedescendant',
		(await finalNode.getAttribute('id'))!
	);
	await expect(tree).toBeFocused();
	await expect(tree.getByRole('treeitem')).toHaveCount(11);
	await page.keyboard.press('Enter');
	await expect(virtualTreeDemo.getByText('selected = node-4999')).toBeVisible();
});

test('keeps TreeSelect popup tree, selection, form value and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'tree-select');
	const treeSelectDemo = demo(page, 'tree-select-form');
	const trigger = treeSelectDemo.locator('button[aria-haspopup="tree"]');
	await trigger.click();
	const tree = page.getByRole('tree', { name: '选择项目节点', exact: true });
	await expect(tree).toBeVisible();
	await tree.getByRole('treeitem', { name: '任务执行器', exact: true }).click();
	await expect(tree).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAccessibleName('选择项目节点');
	await expect(trigger).toContainText('任务执行器');
	await expect(treeSelectDemo.getByText('value = worker')).toBeVisible();
	await resetDemo(treeSelectDemo);
	await expect(trigger).toHaveAccessibleName('选择项目节点');
	await expect(trigger).toContainText('文档站');
});

test('keeps Cascader columns, path commit, focus restoration and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'cascader');
	const cascaderDemo = demo(page, 'cascader-path');
	const trigger = cascaderDemo.locator('button[aria-haspopup="listbox"]');
	await expect(trigger).toHaveAccessibleName('部署路径');
	await expect(trigger).toContainText('平台 / Web应用 / 文档站');
	await trigger.click();
	await expect(page.getByRole('listbox')).toHaveCount(3);
	await page.getByRole('option', { name: '任务执行器', exact: true }).click();
	await expect(trigger).toBeFocused();
	await expect(trigger).toHaveAccessibleName('部署路径');
	await expect(trigger).toContainText('平台 / 任务执行器');
	await expect(cascaderDemo.getByText('path = platform/worker')).toBeVisible();
	await resetDemo(cascaderDemo);
	await expect(trigger).toBeVisible();
	await expect(cascaderDemo.getByText('path = platform/web/docs')).toBeVisible();

	const searchDemo = demo(page, 'cascader-loaded-search');
	await searchDemo.locator('button[aria-haspopup="listbox"]').click();
	await page.getByRole('textbox', { name: '筛选已加载路径', exact: true }).fill('desktop');
	await page.getByRole('option', { name: '平台 / Native / 桌面端', exact: true }).click();
	await expect(searchDemo.getByText('loaded search path = platform/native/desktop')).toBeVisible();

	const lazyDemo = demo(page, 'cascader-lazy-retry');
	const lazyTrigger = lazyDemo.locator('button[aria-haspopup="listbox"]');
	await lazyTrigger.click();
	await page.getByRole('option', { name: '远程空间', exact: true }).click();
	await lazyDemo.getByRole('button', { name: '使加载失败', exact: true }).click();
	await expect(lazyDemo.getByText(/error = 模拟网络失败/u)).toBeVisible();
	await expect(page.getByRole('listbox')).toHaveCount(0);
	await lazyTrigger.click();
	const retryOption = page
		.locator('[role="option"][data-load-state="error"]')
		.filter({ hasText: '远程空间' });
	await expect(retryOption).toHaveAttribute('data-load-state', 'error');
	await retryOption.click();
	await expect(lazyDemo.getByText(/pending = true/u)).toBeVisible();
	const completeLoad = lazyDemo.getByRole('button', { name: '完成加载', exact: true });
	await expect(completeLoad).toBeEnabled();
	await completeLoad.click();
	await expect(page.getByRole('listbox')).toHaveCount(0);
	await lazyTrigger.click();
	await page.getByRole('option', { name: '远程空间', exact: true }).click();
	const productionOption = page.getByRole('option', { name: '生产环境', exact: true });
	await expect(productionOption).toBeVisible();
	await productionOption.click();
	await expect(lazyDemo.locator('button[aria-haspopup="listbox"]')).toContainText(
		'远程空间 / 生产环境'
	);

	const virtualDemo = demo(page, 'cascader-virtual');
	await virtualDemo.getByRole('button', { name: '打开千项Cascader', exact: true }).click();
	await page.getByRole('option', { name: '服务目录', exact: true }).click();
	const virtualColumn = page.getByRole('listbox', { name: '第2级', exact: true });
	expect(await virtualColumn.getByRole('option').count()).toBeLessThan(30);
	await virtualColumn.press('End');
	await virtualColumn.press('Enter');
	await expect(virtualDemo.getByText('virtual path = services/service-999')).toBeVisible();
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
	await resetDemo(transferDemo);
	await expect(transferDemo.getByText('selected = staging')).toBeVisible();
	await expect(source.getByRole('option')).toHaveCount(3);
});

test('keeps Mention textarea focus, active descendant, insertion, form value and reset synchronized', async ({
	page
}) => {
	await gotoComponent(page, 'mention');
	const mentionDemo = demo(page, 'mention-caret');
	const editor = mentionDemo.getByRole('textbox', { name: '发布通知', exact: true });
	await editor.fill('发布通知：@li');
	await expect(page.getByRole('listbox', { name: '成员建议', exact: true })).toBeVisible();
	await expect(editor).toHaveAttribute('aria-activedescendant', /option/u);
	await page.keyboard.press('Enter');
	await expect(editor).toBeFocused();
	await expect(editor).toHaveValue('发布通知：@lilei ');
	await expect(mentionDemo.getByText('message = 发布通知：@lilei ')).toBeVisible();
	await resetDemo(mentionDemo);
	await expect(editor).toHaveValue('发布通知：');
	await expect(mentionDemo.getByText('message = 发布通知：')).toBeVisible();

	const asyncDemo = demo(page, 'mention-async');
	const asyncEditor = asyncDemo.getByRole('textbox', { name: '异步成员', exact: true });
	await asyncEditor.fill('Assign @a');
	await expect(page.getByRole('listbox', { name: '提及建议', exact: true })).toContainText(
		'正在加载选项'
	);
	await asyncDemo
		.getByRole('button', { name: '返回异步结果', exact: true })
		.evaluate((element) =>
			element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
		);
	const asyncOption = page.getByRole('option', { name: /Alan a/u });
	await expect(asyncOption).toBeVisible();
	await asyncOption.click();
	await expect(asyncEditor).toHaveValue('Assign @alan ');

	const virtualDemo = demo(page, 'mention-virtual');
	const virtualEditor = virtualDemo.getByRole('textbox', { name: '千人成员目录', exact: true });
	await virtualEditor.fill('@');
	const virtualList = page.getByRole('listbox', { name: '提及建议', exact: true });
	expect(await virtualList.getByRole('option').count()).toBeLessThan(30);
	await virtualEditor.press('End');
	await expect(virtualEditor).toHaveAttribute('aria-activedescendant', /option/u);
	const activeVirtualOption = page.locator(
		`#${await virtualEditor.getAttribute('aria-activedescendant')}`
	);
	await expect(activeVirtualOption).toContainText('user-0999');
	await virtualEditor.press('Enter');
	await expect(virtualEditor).toHaveValue('@user-0999 ');
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
	await expect(semanticColors.locator('[data-slot="semantic-color"]')).toHaveCount(29);

	await page.goto('/#/components/link');
	const disabledLink = demo(page, 'link-disabled').locator('a[aria-disabled="true"]');
	await expect(disabledLink).not.toHaveAttribute('href');
	await expect(disabledLink).toHaveAttribute('tabindex', '-1');
	const externalLink = demo(page, 'link-external').getByRole('link', {
		name: /新窗口外链/u
	});
	await expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
	await expect(externalLink.locator('[data-slot="external-icon"]')).toHaveCount(1);
	const nativeBlank = demo(page, 'link-native-attributes').getByRole('link', {
		name: /许可证/u
	});
	await expect(nativeBlank).toHaveAttribute('rel', 'license nofollow noopener noreferrer');

	await page.goto('/#/components/heading');
	const headingLevels = demo(page, 'heading-levels');
	for (const level of [1, 2, 3, 4, 5, 6] as const) {
		await expect(headingLevels.getByRole('heading', { level })).toHaveCount(1);
	}

	await page.goto('/#/components/separator');
	const separatorDemo = demo(page, 'separator-basic');
	await expect(separatorDemo.locator('hr[data-orientation="horizontal"]')).toHaveCount(1);
	await expect(
		separatorDemo.locator('[role="separator"][aria-orientation="vertical"]')
	).toHaveCount(1);
	await expect(
		demo(page, 'separator-named').getByRole('separator', {
			name: '构建与发布配置的边界',
			exact: true
		})
	).toBeVisible();

	await page.goto('/#/components/visually-hidden');
	await expect(page.getByRole('button', { name: '搜索文档', exact: true })).toBeVisible();
	const hiddenLiveDemo = demo(page, 'visually-hidden-live-region');
	await hiddenLiveDemo.getByRole('button', { name: '增加任务', exact: true }).click();
	await expect(hiddenLiveDemo.getByRole('status')).toHaveText('当前有1个待处理任务');

	await page.goto('/#/components/kbd');
	await expect(demo(page, 'kbd-nested').locator('kbd > kbd')).toHaveCount(3);

	await page.goto('/#/components/aspect-ratio');
	const ratio = demo(page, 'aspect-ratio-responsive').locator('[data-ratio-owner="custom"]');
	await expect(ratio).toHaveAttribute('data-ratio', '21 / 9');
	await expect(ratio).toHaveCSS('aspect-ratio', '21 / 9');

	await page.goto('/#/components/container');
	const responsiveContainers = demo(page, 'container-responsive').locator('[data-size]');
	await expect(responsiveContainers).toHaveCount(2);
	await expect(responsiveContainers.first()).toHaveCSS('box-sizing', 'border-box');
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
		.toBeLessThanOrEqual(0);

	await setDisplayPreference(page, '密度', '紧凑');
	await setDisplayPreference(page, '对比度', '高对比');
	await setDisplayPreference(page, '动画', '减少');
	await setDisplayPreference(page, '方向', '从右到左');
	await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');
	await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
	await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
	await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test.describe('accessibility route sweep', () => {
	for (const route of accessibilityRoutes) {
		test(`${route.hash} has no automatically detectable accessibility violations`, async ({
			page
		}) => {
			await assertAccessibilityRoute(page, route);
		});
	}
});

test('highlights code on demand and supports section deep links', async ({ page }) => {
	await page.goto('/#/components/code');
	const code = page.getByLabel('Svelte按钮示例');
	await expect(code).toHaveAttribute('data-highlight-status', 'highlighted');
	await expect(code.locator('[data-highlighted="true"]')).toHaveCount(2);
	const copyDemo = demo(page, 'code-copy');
	await expect(copyDemo.getByRole('button', { name: '复制代码', exact: true })).toBeVisible();
	await expect(copyDemo.locator('[data-slot="copy-status"]')).toHaveAttribute(
		'aria-live',
		'polite'
	);

	await page.goto('/#/components/button/api');
	await expect(page.locator('main [data-doc-route="component:button"]')).toBeVisible();
	await expect(
		page.locator('main [data-doc-route="component:button"] h2', { hasText: 'Props' })
	).toBeInViewport();
});

test('renders data-driven not-found routes with one recoverable 404 surface', async ({ page }) => {
	const invalidRoutes = [
		'#/components/unknown-component',
		'#/guides/unknown-guide',
		'#/components/unknown-component/api',
		'#/components/%E0%A4%A'
	] as const;
	const consoleErrors: string[] = [];
	const pageErrors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error') consoleErrors.push(message.text());
	});
	page.on('pageerror', (error) => pageErrors.push(error.message));

	for (const hash of invalidRoutes) {
		await page.goto(`/${hash}`);
		await expect(page).toHaveURL(new RegExp(`${hash.replaceAll('/', '\\/')}$`, 'u'));
		await expect(page.locator('main')).toHaveCount(1);
		await expect(page.locator('main [data-doc-page-title]')).toHaveCount(0);
		await expect(
			page.getByRole('heading', { level: 1, name: '没有这个页面。', exact: true })
		).toHaveCount(1);
		await expect(
			page.getByText('当前展示站只列出已经实现的ZUI组件与生产指南。', { exact: true })
		).toBeVisible();
		await expect(page.getByRole('link', { name: '返回文档概览', exact: true })).toHaveAttribute(
			'href',
			'#/'
		);
		const currentLinks = page.locator('nav[aria-label="组件导航"] a[aria-current="page"]');
		expect(await currentLinks.count()).toBeLessThanOrEqual(1);
		if ((await currentLinks.count()) === 1)
			await expect(currentLinks).not.toHaveAttribute('href', hash);
		if (hash.includes('/api')) {
			await page.reload();
			await expect(
				page.getByRole('heading', { level: 1, name: '没有这个页面。', exact: true })
			).toHaveCount(1);
		}
	}

	expect(consoleErrors).toEqual([]);
	expect(pageErrors).toEqual([]);
});

test('keeps the not-found route accessible and returns to the Docs overview', async ({ page }) => {
	await page.goto('/#/components/unknown-component');
	await expect(
		page.getByRole('heading', { level: 1, name: '没有这个页面。', exact: true })
	).toBeVisible();
	await expect(new AxeBuilder({ page }).analyze()).resolves.toMatchObject({ violations: [] });
	await page.getByRole('link', { name: '返回文档概览', exact: true }).click();
	await expect(page).toHaveURL(/#\/$/u);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('看见组件');
});

test('keeps navigation usable at a narrow viewport', async ({ page }) => {
	await page.setViewportSize({ height: 800, width: 390 });
	await page.goto('/#/');
	const desktopNavigation = page.getByRole('navigation', { name: '组件导航', exact: true });
	const trigger = page.getByRole('button', { name: '打开组件导航', exact: true });
	await expect(desktopNavigation).toBeHidden();
	await expect(trigger).toBeVisible();
	await trigger.click();
	let drawer = page.getByTestId('docs-mobile-navigation-drawer');
	await expect(drawer).toHaveAccessibleName('浏览 ZUI');
	await expect(drawer).toHaveAttribute('role', 'dialog');
	await expect(drawer.getByRole('navigation', { name: '移动组件导航' })).toBeVisible();
	await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
	await drawer.getByRole('link', { name: 'PACKAGE', exact: true }).click();
	await expect(page).toHaveURL(/#\/guides\/package$/u);
	await expect(drawer).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
	await expect(
		page.getByRole('heading', {
			level: 1,
			name: '从公开entrypoint消费，而不是依赖工作区路径。'
		})
	).toBeVisible();

	await setDisplayPreference(page, '动画', '减少');
	await setDisplayPreference(page, '方向', '从右到左');
	await trigger.click();
	drawer = page.getByTestId('docs-mobile-navigation-drawer');
	await expect(drawer).toHaveAttribute('data-reduced-motion', 'true');
	await expect(drawer).toHaveCSS('right', '0px');
	await drawer.getByRole('link', { name: 'ZButton', exact: true }).click();
	await expect(page).toHaveURL(/#\/components\/button$/u);
	await expect(page.getByRole('heading', { level: 1, name: 'ZButton' })).toBeVisible();

	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth - document.documentElement.clientWidth
		)
	).toBeLessThanOrEqual(0);
	await expect(page.locator('[data-slot="search-shortcuts"]')).toBeHidden();
	await page.keyboard.press('/');
	await expect(
		page.getByRole('dialog', { name: '搜索 ZUI 文档' }).getByRole('combobox')
	).toBeFocused();
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
	await variantsBlock.getByRole('button', { name: '查看源码', exact: true }).click();
	await variantsBlock.getByRole('button', { name: '复制代码', exact: true }).click();
	await expect(variantsBlock.getByRole('button', { name: '复制失败', exact: true })).toBeVisible();
	expect(errors).toEqual([]);
});
