import { expect, test, type Page } from '@playwright/test';
import { DEFAULT_THEME_SCHEMA } from '../../../ui/zui/src/theme/schema.js';

async function openPausedDemo(page: Page, component: 'button' | 'data-table', demoId: string) {
	// install() alone still lets timers advance with wall time. Freeze only after the
	// page loads, so slow CI assertions cannot race the 280ms simulated response.
	await page.clock.install({ time: new Date('2026-09-08T00:00:00Z') });
	await page.goto(`/#/components/${component}`);
	const demo = page.getByTestId(`demo-${demoId}`);
	await expect(demo).toBeVisible();
	await page.clock.pauseAt(new Date('2026-09-08T02:00:00Z'));
	return demo;
}

test('Button teaches variants once and keeps all five size contracts in the state demo', async ({
	page
}) => {
	await page.goto('/#/components/button');
	const variants = page.getByTestId('demo-button-variants');
	await expect(variants.getByRole('button')).toHaveCount(3);
	const states = page.getByTestId('demo-button-states');
	for (const [label, size] of [
		['XSmall', 'xsmall'],
		['Small', 'small'],
		['Medium', 'medium'],
		['Large', 'large'],
		['XLarge', 'xlarge']
	] as const) {
		const button = states.getByRole('button', { name: label, exact: true });
		await expect(button).toHaveAttribute('data-size', size);
		await expect(button).toHaveCSS(
			'font-size',
			`${DEFAULT_THEME_SCHEMA.fontSize[size === 'xlarge' ? 'large' : size]}px`
		);
		expect(await button.evaluate((element) => element.getBoundingClientRect().height)).toBeCloseTo(
			DEFAULT_THEME_SCHEMA.size[size],
			0
		);
	}
	await states.getByTestId('button-counter').click();
	await expect(states).toContainText('count = 1');
});

test('Button async demo blocks repeat activation, reports a rejected task and can retry', async ({
	page
}) => {
	const demo = await openPausedDemo(page, 'button', 'button-async');
	const run = demo.getByTestId('button-async-run');
	await demo.getByRole('button', { name: '模拟失败', exact: true }).click();
	await run.click();
	await expect(run).toBeDisabled();
	await expect(run).toHaveAttribute('aria-busy', 'true');
	// The selected outcome belongs to the active task, not later preference changes.
	await demo.getByRole('button', { name: '模拟成功', exact: true }).click();
	await page.clock.runFor(1000);
	await expect(demo.getByRole('status')).toContainText('模拟任务失败');
	await expect(run).toBeEnabled();
	await run.click();
	await page.clock.runFor(1000);
	await expect(demo.getByRole('status')).toContainText('模拟任务成功');
	await expect(run).toBeEnabled();
});

test('DataTable keeps its last successful rows during loading and failure, then retries and accepts empty results', async ({
	page
}) => {
	const demo = await openPausedDemo(page, 'data-table', 'data-table-async-states');
	const table = demo.getByRole('table', { name: '服务状态' });
	await expect(table.getByRole('row')).toHaveCount(3);
	await demo.getByRole('button', { name: '保留旧数据刷新', exact: true }).click();
	await expect(demo.locator('[data-slot="viewport"]')).toHaveAttribute('aria-busy', 'true');
	await expect(table.getByRole('row')).toHaveCount(3);
	await page.clock.runFor(400);
	await expect(table.getByRole('row')).toHaveCount(4);
	await demo.getByRole('button', { name: '模拟确定性失败', exact: true }).click();
	await page.clock.runFor(400);
	await expect(demo.getByRole('alert')).toContainText('模拟服务请求失败');
	await expect(table.getByRole('row')).toHaveCount(4);
	await demo.getByRole('button', { name: '重试并成功', exact: true }).click();
	await page.clock.runFor(400);
	await expect(demo.getByRole('alert')).toHaveCount(0);
	await expect(demo).toContainText('status = success');
	await demo.getByRole('button', { name: '返回空结果', exact: true }).click();
	await page.clock.runFor(400);
	await expect(demo).toContainText('当前快照 = 0');
	await expect(table).toContainText('没有符合条件的服务');
});

test('DataTable cancellation and later requests prevent an old snapshot from becoming current', async ({
	page
}) => {
	const demo = await openPausedDemo(page, 'data-table', 'data-table-async-states');
	const table = demo.getByRole('table', { name: '服务状态' });
	await demo.getByRole('button', { name: '启动慢请求', exact: true }).click();
	await demo.getByRole('button', { name: '取消当前请求', exact: true }).click();
	await page.clock.runFor(1000);
	await expect(demo).toContainText('status = idle');
	await expect(table.getByRole('row')).toHaveCount(3);
	await demo.getByRole('button', { name: '启动慢请求', exact: true }).click();
	await demo.getByRole('button', { name: '后发成功请求覆盖前发请求', exact: true }).click();
	await page.clock.runFor(1000);
	await expect(demo).toContainText('status = success');
	await expect(table).toContainText('Async Worker');
	await expect(table).not.toContainText('旧版本慢响应');
	await expect(demo.getByRole('button', { name: '取消当前请求', exact: true })).toBeDisabled();
});

test('DataTable server owner preserves global row semantics, empty filtering and cross-page selection', async ({
	page
}) => {
	const demo = await openPausedDemo(page, 'data-table', 'data-table-server-owner');
	const table = demo.getByRole('table', { name: '服务检索结果', exact: true });
	const pagination = demo.getByRole('navigation', { name: '服务结果分页', exact: true });
	const filter = demo.getByRole('textbox', { name: '筛选服务', exact: true });

	await expect(table).toHaveAttribute('aria-rowcount', '9');
	await expect(table.locator('tbody tr[data-slot="row"]').first()).toHaveAttribute(
		'aria-rowindex',
		'2'
	);
	await pagination.locator('[data-page-number="2"]').click();
	await expect(demo).toContainText('第2/3页');
	await expect(table.locator('tbody tr[data-slot="row"]').first()).toHaveAttribute(
		'aria-rowindex',
		'5'
	);
	await expect(table).toHaveAttribute('aria-rowcount', '9');
	await table.getByRole('checkbox', { name: '选择 Docs', exact: true }).check();
	await expect(demo).toContainText('跨页selected = api, docs');

	await filter.fill('不存在的服务');
	await expect(demo).toContainText('外部owner：0条结果 · 第1/1页');
	await expect(table.getByText('没有匹配服务', { exact: true })).toBeVisible();
	await expect(demo).toContainText('跨页selected = api, docs');

	await filter.fill('');
	await expect(demo).toContainText('外部owner：8条结果 · 第1/3页');
	await expect(table.getByRole('row', { name: /API Gateway/u })).toBeVisible();
	await expect(demo).toContainText('跨页selected = api, docs');
});

test('leaving async demos releases their tasks without late page errors or state on remount', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await openPausedDemo(page, 'button', 'button-async');
	await page.getByTestId('button-async-run').click();
	await page.evaluate(() => {
		location.hash = '#/components/data-table';
	});
	const tableDemo = page.getByTestId('demo-data-table-async-states');
	await tableDemo.getByRole('button', { name: '启动慢请求', exact: true }).click();
	await page.evaluate(() => {
		location.hash = '#/components/button';
	});
	await expect(page.getByTestId('button-async-run')).toBeEnabled();
	await page.clock.runFor(1200);
	await expect(page.getByTestId('demo-button-async').getByRole('status')).toContainText('尚未运行');
	expect(errors).toEqual([]);
});
