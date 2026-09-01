import { describe, expect, it } from 'vitest';

import { createToastQueue } from '../src/runtime/toast.svelte.js';

const flushPromises = async (): Promise<void> => {
	await Promise.resolve();
	await Promise.resolve();
};

describe('ToastQueue production update and task contracts', () => {
	it('partially updates an existing instance and preserves omitted fields', () => {
		const queue = createToastQueue();
		const id = queue.push({
			description: 'Preserved',
			duration: null,
			id: 'release',
			title: 'Building'
		});
		const instance = queue.items[0]?.instance;

		expect(queue.update(id, { title: 'Ready', tone: 'success' })).toBe(true);
		expect(queue.update('missing', { title: 'Ignored' })).toBe(false);
		expect(queue.items[0]).toMatchObject({
			description: 'Preserved',
			duration: null,
			id,
			instance,
			priority: 'polite',
			title: 'Ready',
			tone: 'success'
		});
		queue.dispose();
	});

	it('rejects blank stable ids without affecting ordinary generated ids', () => {
		const queue = createToastQueue();
		expect(() => queue.push({ id: '   ', title: 'Invalid' })).toThrow(/must not be empty/u);
		expect(queue.push({ title: 'Generated' })).toMatch(/^toast-/u);
		queue.dispose();
	});

	it('uses one id across task stages and rejects late generations', async () => {
		const queue = createToastQueue();
		let resolveOld!: (value: string) => void;
		let resolveNew!: (value: string) => void;
		const oldTask = new Promise<string>((resolve) => (resolveOld = resolve));
		const newTask = new Promise<string>((resolve) => (resolveNew = resolve));
		const stages = {
			error: (error: unknown) => `Failed: ${String(error)}`,
			id: 'deployment',
			loading: 'Loading',
			success: (value: string) => `Ready: ${value}`
		} as const;

		expect(queue.task(oldTask, stages)).toBe('deployment');
		const instance = queue.items[0]?.instance;
		expect(queue.task(newTask, stages)).toBe('deployment');
		expect(queue.update('deployment', { description: '50%' })).toBe(true);
		resolveNew('new');
		await flushPromises();
		expect(queue.items[0]).toMatchObject({
			instance,
			description: '50%',
			priority: 'polite',
			title: 'Ready: new',
			tone: 'success'
		});

		resolveOld('old');
		await flushPromises();
		expect(queue.items[0]?.title).toBe('Ready: new');
		queue.dispose();
	});

	it('maps failures to assertive danger without recreating dismissed work', async () => {
		const queue = createToastQueue();
		let rejectTask!: (reason: unknown) => void;
		const task = new Promise<string>((_resolve, reject) => (rejectTask = reject));
		queue.task(task, {
			error: (error) => ({ description: String(error), title: 'Failed' }),
			id: 'failure',
			loading: 'Loading',
			success: 'Ready'
		});
		rejectTask('network');
		await flushPromises();
		expect(queue.items[0]).toMatchObject({
			priority: 'assertive',
			title: 'Failed',
			tone: 'danger'
		});

		let resolveDismissed!: (value: string) => void;
		const dismissed = new Promise<string>((resolve) => (resolveDismissed = resolve));
		queue.task(dismissed, {
			error: 'Failed',
			id: 'dismissed',
			loading: 'Loading',
			success: 'Should not return'
		});
		queue.dismiss('dismissed');
		resolveDismissed('done');
		await flushPromises();
		expect(queue.items.some((item) => item.id === 'dismissed')).toBe(false);
		queue.dispose();
	});
});
