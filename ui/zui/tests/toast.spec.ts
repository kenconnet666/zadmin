import { describe, expect, it, vi } from 'vitest';

import { createToastQueue } from '../src/runtime/toast.svelte.js';

describe('ToastQueue', () => {
	it('updates stable ids and reports explicit dismiss reasons', () => {
		const onDismiss = vi.fn();
		const queue = createToastQueue();
		queue.push({ duration: null, id: 'release', onDismiss, title: 'Building' });
		queue.push({ duration: null, id: 'release', onDismiss, title: 'Ready', tone: 'success' });

		expect(queue.items).toHaveLength(1);
		expect(queue.items[0]).toMatchObject({
			id: 'release',
			phase: 'visible',
			title: 'Ready',
			tone: 'success'
		});
		queue.dismiss('release', 'close');
		expect(queue.items).toHaveLength(0);
		expect(onDismiss).toHaveBeenCalledWith('release', 'close');
	});

	it('rejects invalid durations and clears persistent messages', () => {
		const queue = createToastQueue();
		expect(() => queue.push({ duration: 0, title: 'Invalid' })).toThrow(/positive finite/u);
		expect(() => queue.push({ duration: Infinity, title: 'Invalid' })).toThrow(/positive finite/u);
		expect(() => queue.push({ duration: null, id: '', title: 'Invalid' })).toThrow(
			/must not be empty/u
		);
		expect(() => queue.setMaxVisible(0)).toThrow(/positive integer/u);
		queue.dismiss('missing');
		queue.push({ duration: null, title: 'One' });
		queue.push({ duration: null, title: 'Two' });
		queue.clear();
		expect(queue.items).toHaveLength(0);
		const disconnect = queue.connectVisibility();
		disconnect();
		queue.dispose();
	});

	it('admits FIFO records fairly and keeps exiting records in their viewport slot', () => {
		const queue = createToastQueue({ maxVisible: 1 });
		const first = queue.push({ duration: null, title: 'First' });
		const second = queue.push({ duration: 100, title: 'Second' });
		expect(queue.items.map(({ id, phase }) => `${id}:${phase}`)).toEqual([
			`${first}:visible`,
			`${second}:queued`
		]);
		expect(queue.queuedCount).toBe(1);

		const disconnect = queue.connectViewport();
		expect(() => queue.connectViewport()).toThrow(/one ZToaster viewport/u);
		queue.setMaxVisible(2);
		expect(queue.items.map(({ phase }) => phase)).toEqual(['visible', 'visible']);
		queue.setMaxVisible(1);
		expect(queue.items.map(({ phase }) => phase)).toEqual(['visible', 'queued']);
		queue.dismiss(first, 'close');
		expect(queue.items.map(({ id, phase }) => `${id}:${phase}`)).toEqual([
			`${first}:exiting`,
			`${second}:queued`
		]);

		queue.completeExit(first);
		expect(queue.items).toHaveLength(1);
		expect(queue.items[0]).toMatchObject({ id: second, phase: 'visible' });
		disconnect();
		queue.dispose();
	});

	it('keeps server timers inert while pause and resume remain idempotent', () => {
		const queue = createToastQueue();
		const id = queue.push({ duration: 25, priority: 'assertive', title: 'Server timer' });
		const disconnect = queue.connectViewport();
		queue.pause('missing', 'hover');
		queue.resume('missing', 'hover');
		queue.pause(id, 'focus');
		queue.pause(id, 'hover');
		queue.resume(id, 'focus');
		expect(queue.items[0]).toMatchObject({ id, priority: 'assertive', tone: 'info' });
		disconnect();
		queue.dispose();
		expect(queue.items).toHaveLength(0);
	});
});
