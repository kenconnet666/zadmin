import { describe, expect, it, vi } from 'vitest';

import { createToastQueue } from '../src/runtime/toast.svelte.js';

describe('ToastQueue', () => {
	it('updates stable ids and reports explicit dismiss reasons', () => {
		const onDismiss = vi.fn();
		const queue = createToastQueue();
		queue.push({ duration: null, id: 'release', onDismiss, title: 'Building' });
		queue.push({ duration: null, id: 'release', onDismiss, title: 'Ready', tone: 'success' });

		expect(queue.items).toHaveLength(1);
		expect(queue.items[0]).toMatchObject({ id: 'release', title: 'Ready', tone: 'success' });
		queue.dismiss('release', 'close');
		expect(queue.items).toHaveLength(0);
		expect(onDismiss).toHaveBeenCalledWith('release', 'close');
	});

	it('rejects invalid durations and clears persistent messages', () => {
		const queue = createToastQueue();
		expect(() => queue.push({ duration: 0, title: 'Invalid' })).toThrow(/positive finite/u);
		expect(() => queue.push({ duration: Infinity, title: 'Invalid' })).toThrow(/positive finite/u);
		queue.dismiss('missing');
		queue.push({ duration: null, title: 'One' });
		queue.push({ duration: null, title: 'Two' });
		queue.clear();
		expect(queue.items).toHaveLength(0);
		const disconnect = queue.connectVisibility();
		disconnect();
		queue.dispose();
	});
});
