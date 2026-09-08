import { expect, test, type Page } from '@playwright/test';

interface TimerSnapshot {
	readonly cleared: readonly number[];
	readonly created: readonly { readonly delay: number; readonly id: number }[];
	readonly fired: readonly number[];
	readonly identity: string;
}

async function installTimerProbe(page: Page): Promise<TimerSnapshot> {
	return page.evaluate(`
		(() => {
			if (window.__formDemoTimerProbe) return window.__formDemoTimerProbe.snapshot();
			const probe = {
				cleared: new Set(),
				created: [],
				fired: new Set(),
				identity: crypto.randomUUID(),
				pending: new Set(),
				snapshot() {
					return {
						cleared: [...this.cleared],
						created: this.created.map(({ delay, id }) => ({ delay, id })),
						fired: [...this.fired],
						identity: this.identity
					};
				}
			};
			const set = window.setTimeout.bind(window);
			const clear = window.clearTimeout.bind(window);
			window.setTimeout = (handler, timeout, ...args) => {
				let id;
				id = set(() => {
					const numericId = Number(id);
					if (probe.pending.delete(numericId)) probe.fired.add(numericId);
					if (typeof handler === 'function') handler(...args);
					else Function(handler)();
				}, timeout);
				const numericId = Number(id);
				if (timeout === 140 || timeout === 500) {
					probe.created.push({ delay: Number(timeout), id: numericId });
					probe.pending.add(numericId);
				}
				return id;
			};
			window.clearTimeout = (id) => {
				const numericId = Number(id);
				if (probe.pending.delete(numericId)) probe.cleared.add(numericId);
				return clear(id);
			};
			window.__formDemoTimerProbe = probe;
			return probe.snapshot();
		})()
	`);
}

async function timerSnapshot(page: Page): Promise<TimerSnapshot> {
	return page.evaluate(`window.__formDemoTimerProbe.snapshot()`);
}

function idsCreatedSince(
	snapshot: TimerSnapshot,
	baseline: TimerSnapshot,
	delay: number
): number[] {
	const before = new Set(baseline.created.map(({ id }) => id));
	return snapshot.created
		.filter((timer) => timer.delay === delay && !before.has(timer.id))
		.map((timer) => timer.id);
}

function formControls(page: Page) {
	const demo = page.getByTestId('demo-form-schema');
	return {
		age: demo.getByRole('textbox', { name: '年龄', exact: true }),
		demo,
		email: demo.getByRole('textbox', { name: '邮箱', exact: true }),
		form: demo.locator('form'),
		submit: demo.getByRole('button', { name: '异步提交', exact: true })
	};
}

async function openFormDemo(page: Page) {
	await page.goto('/#/components/form');
	const controls = formControls(page);
	await expect(controls.demo).toBeVisible();
	return controls;
}

async function navigateWithinDocument(page: Page, hash: string): Promise<void> {
	const before = await timerSnapshot(page);
	await page.evaluate((nextHash) => {
		location.hash = nextHash;
	}, hash);
	await expect(page).toHaveURL(new RegExp(`${hash.replace('/', '\\/')}$`, 'u'));
	// The URL changes before the hashchange render; await the real route teardown/mount.
	await expect(page.getByTestId('demo-form-schema')).toHaveCount(
		hash === '#/components/form' ? 1 : 0
	);
	const after = await timerSnapshot(page);
	expect(after.identity).toBe(before.identity);
}

test('Form schema demo settles owned validation and submission timers across success, failure and SPA unmount', async ({
	page
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.clock.install({ time: new Date('2026-09-08T00:00:00Z') });
	let controls = await openFormDemo(page);
	await page.clock.pauseAt(new Date('2026-09-08T02:00:00Z'));
	await installTimerProbe(page);

	await controls.email.fill('invalid');
	await controls.age.fill('10');
	await controls.submit.press('Enter');
	await page.clock.runFor(140);
	await expect(controls.demo.getByText('请输入有效邮箱')).toBeVisible();
	await expect(controls.demo.getByText('年龄必须是至少18岁的整数')).toBeVisible();

	await controls.email.fill('Alice@Example.com');
	await controls.age.fill('20');
	await controls.submit.press('Enter');
	await page.clock.runFor(140);
	await expect(controls.form).toHaveAttribute('data-submitting', 'true');
	await page.clock.runFor(500);
	await expect(
		controls.demo.getByText('typed age=20 (number)；FormData age=20 (string)', { exact: true })
	).toBeVisible();
	await expect(controls.demo.getByText('提交错误：无', { exact: true })).toBeVisible();

	await controls.email.fill('owner@blocked.example');
	await controls.submit.press('Enter');
	await page.clock.runFor(140);
	await expect(controls.form).toHaveAttribute('data-submitting', 'true');
	await page.clock.runFor(500);
	await expect(
		controls.demo.getByText('提交错误：服务端拒绝该域名', { exact: true })
	).toBeVisible();

	const beforeSchemaUnmount = await timerSnapshot(page);
	await controls.email.fill('invalid-again');
	await controls.submit.press('Enter');
	const schemaTimers = idsCreatedSince(await timerSnapshot(page), beforeSchemaUnmount, 140);
	expect(schemaTimers.length).toBeGreaterThan(0);
	await navigateWithinDocument(page, '#/');
	const afterSchemaUnmount = await timerSnapshot(page);
	for (const id of schemaTimers) {
		expect(afterSchemaUnmount.cleared).toContain(id);
		expect(afterSchemaUnmount.fired).not.toContain(id);
	}

	await navigateWithinDocument(page, '#/components/form');
	controls = formControls(page);
	await expect(controls.demo).toBeVisible();
	await controls.email.fill('release@example.com');
	await controls.age.fill('20');
	const beforeSubmissionUnmount = await timerSnapshot(page);
	await controls.submit.press('Enter');
	await page.clock.runFor(140);
	await expect(controls.form).toHaveAttribute('data-submitting', 'true');
	const submitTimers = idsCreatedSince(await timerSnapshot(page), beforeSubmissionUnmount, 500);
	expect(submitTimers.length).toBeGreaterThan(0);
	await navigateWithinDocument(page, '#/');
	const afterSubmissionUnmount = await timerSnapshot(page);
	for (const id of submitTimers) {
		expect(afterSubmissionUnmount.cleared).toContain(id);
		expect(afterSubmissionUnmount.fired).not.toContain(id);
	}
	expect(errors).toEqual([]);
});
