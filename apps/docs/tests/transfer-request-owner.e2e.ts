import { expect, test, type Locator } from '@playwright/test';

async function installAnimationProbe(widget: Locator): Promise<void> {
	await widget.evaluate((root) => {
		const original = Element.prototype.animate;
		const calls: string[] = [];
		const state = root as HTMLElement & {
			__transferAnimationProbe?: { calls: string[]; original: typeof Element.prototype.animate };
		};
		state.__transferAnimationProbe = { calls, original };
		Element.prototype.animate = function (keyframes, options) {
			if (root.contains(this)) {
				calls.push(JSON.stringify(keyframes));
				const animation = original.call(this, keyframes, options);
				animation.pause();
				return animation;
			}
			return original.call(this, keyframes, options);
		};
	});
}

async function animationCalls(widget: Locator): Promise<readonly string[]> {
	return widget.evaluate((root) => {
		const state = root as HTMLElement & {
			__transferAnimationProbe?: { calls: string[] };
		};
		return state.__transferAnimationProbe?.calls ?? [];
	});
}

async function restoreAnimationProbe(widget: Locator): Promise<void> {
	await widget.evaluate((root) => {
		const state = root as HTMLElement & {
			__transferAnimationProbe?: {
				calls: string[];
				original: typeof Element.prototype.animate;
			};
		};
		if (state.__transferAnimationProbe) {
			Element.prototype.animate = state.__transferAnimationProbe.original;
			delete state.__transferAnimationProbe;
		}
	});
}

test('Transfer request demo preserves native value ownership across manual decisions, stale snapshots, reset and unmount', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/#/components/transfer');
	const demo = page.getByTestId('demo-transfer-request-owner');
	const widget = demo.getByRole('group', { name: '需要外部确认的发布通道转移', exact: true });
	const source = demo.getByRole('listbox', { name: '可请求移动', exact: true });
	const status = demo.getByTestId('transfer-request-status');
	const move = widget.locator('[data-slot="controls"] button').first();
	const read = demo.getByRole('button', { name: '读取原生FormData', exact: true });
	const accept = demo.getByRole('button', { name: '接受请求', exact: true });
	const reset = demo.getByRole('button', { name: 'Reset', exact: true });

	await source.getByRole('option', { name: /候选集群/u }).click();
	await move.click();
	await expect(widget).toHaveAttribute('data-state', 'pending');
	await expect(move).toBeDisabled();
	await read.click();
	await expect(status).toContainText('FormData=["stable"]');
	await accept.click();
	await expect(widget).toHaveAttribute('data-state', 'idle');
	await expect(status).toContainText('移动结果：accepted');
	await read.click();
	await expect(status).toContainText('FormData=["stable","candidate"]');

	const backup = source.getByRole('option', { name: /灾备集群/u });
	await backup.click();
	await move.click();
	await demo.getByRole('button', { name: '拒绝请求', exact: true }).click();
	await expect(status).toContainText('移动结果：rejected');
	await expect(backup).toHaveAttribute('aria-selected', 'true');
	await read.click();
	await expect(status).toContainText('FormData=["stable","candidate"]');
	await move.click();
	await demo.getByRole('button', { name: '模拟错误', exact: true }).click();
	await expect(status).toContainText('移动结果：error');
	await expect(backup).toHaveAttribute('aria-selected', 'true');

	await move.click();
	await demo.getByRole('button', { name: 'Owner替换items', exact: true }).click();
	await expect(status).toContainText('移动结果：stale');
	await expect(accept).toBeDisabled();
	await move.click();
	await expect(widget).toHaveAttribute('data-state', 'pending');
	await reset.click();
	await expect(status).toContainText('移动结果：cancelled');
	await read.click();
	await expect(status).toContainText('FormData=["stable"]');

	await source.getByRole('option', { name: /候选集群/u }).click();
	await move.click();
	await demo.getByRole('button', { name: 'Owner清空value', exact: true }).click();
	await expect(status).toContainText('移动结果：stale');
	await read.click();
	await expect(status).toContainText('FormData=[]');
	await reset.click();
	await source.getByRole('option', { name: /候选集群/u }).click();
	await move.click();
	await expect(widget).toHaveAttribute('data-state', 'pending');
	await page.evaluate(() => {
		location.hash = '#/';
	});
	await expect(demo).toHaveCount(0);
	await page.evaluate(() => {
		location.hash = '#/components/transfer';
	});
	await expect(demo).toBeVisible();
	await expect(widget).toHaveAttribute('data-state', 'idle');
	await expect(status).toContainText('等待移动请求');
	await read.click();
	await expect(status).toContainText('FormData=["stable"]');
	expect(errors).toEqual([]);
});

test('Transfer request keyboard move keeps FormData unchanged until owner acceptance', async ({
	page
}) => {
	await page.goto('/#/components/transfer');
	const demo = page.getByTestId('demo-transfer-request-owner');
	const widget = demo.getByRole('group', { name: '需要外部确认的发布通道转移', exact: true });
	const source = demo.getByRole('listbox', { name: '可请求移动', exact: true });
	const status = demo.getByTestId('transfer-request-status');
	const motionState = demo.getByTestId('transfer-motion-state');
	const read = demo.getByRole('button', { name: '读取原生FormData', exact: true });
	const accept = demo.getByRole('button', { name: '接受请求', exact: true });
	const candidate = source.getByRole('option', { name: /候选集群/u });

	await expect(motionState).toHaveText('motion=auto');
	await demo.getByRole('button', { name: '动画：full', exact: true }).click();
	await expect(motionState).toHaveText('motion=full');
	await installAnimationProbe(widget);
	try {
		await candidate.click();
		await expect(source).toBeFocused();
		await source.press('Alt+ArrowRight');
		await expect(widget).toHaveAttribute('data-state', 'pending');
		await expect(status).toContainText('等待外部确认：keyboard→target');
		await read.click();
		await expect(status).toContainText('FormData=["stable"]');

		await accept.click();
		await expect(status).toContainText('移动结果：accepted · source=keyboard');
		await expect.poll(async () => (await animationCalls(widget)).length).toBeGreaterThan(0);
		await expect
			.poll(async () =>
				(await animationCalls(widget)).some((keyframes) => keyframes.includes('transform'))
			)
			.toBe(true);
		await read.click();
		await expect(status).toContainText('FormData=["stable","candidate"]');

		await demo.getByRole('button', { name: '动画：reduced', exact: true }).click();
		await expect(motionState).toHaveText('motion=reduced');
		const callsBeforeReduced = (await animationCalls(widget)).length;
		const backup = source.getByRole('option', { name: /灾备集群/u });
		await backup.click();
		await expect(source).toBeFocused();
		await source.press('Alt+ArrowRight');
		await expect(widget).toHaveAttribute('data-state', 'pending');
		await read.click();
		await expect(status).toContainText('FormData=["stable","candidate"]');
		await accept.click();
		await expect(status).toContainText('移动结果：accepted · source=keyboard');
		expect((await animationCalls(widget)).length).toBe(callsBeforeReduced);
		await read.click();
		await expect(status).toContainText('FormData=["stable","candidate","backup"]');
	} finally {
		await restoreAnimationProbe(widget);
	}
});
