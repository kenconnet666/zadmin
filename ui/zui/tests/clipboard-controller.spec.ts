import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClipboardController } from '../src/runtime/clipboard.svelte.js';

function deferred() {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<void>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}
function owner(writeText: (value: string) => Promise<void>): Window {
	return { navigator: { clipboard: { writeText } }, setTimeout, clearTimeout } as unknown as Window;
}
afterEach(() => vi.useRealTimers());
describe('ClipboardController ownership', () => {
	it('starts the native write synchronously and publishes immutable feedback only after fulfillment', async () => {
		vi.useFakeTimers();
		const pending = deferred();
		const write = vi.fn(() => pending.promise);
		const view = owner(write);
		const clipboard = new ClipboardController({ getWindow: () => view });
		const task = clipboard.copy('line 1\nline 2');
		expect(write).toHaveBeenCalledWith('line 1\nline 2');
		expect(clipboard.pending).toBe(true);
		expect(clipboard.copied).toBe(false);
		pending.resolve();
		expect(await task).toEqual({ status: 'copied', value: 'line 1\nline 2' });
		expect(Object.isFrozen(clipboard.snapshot)).toBe(true);
		await vi.advanceTimersByTimeAsync(1999);
		expect(clipboard.copied).toBe(true);
		await vi.advanceTimersByTimeAsync(1);
		expect(clipboard.status).toBe('idle');
		clipboard.destroy();
	});
	it('retains the actual rejection as failure, without a successful-copy signal', async () => {
		const error = new Error('write denied');
		const view = owner(() => Promise.reject(error));
		const clipboard = new ClipboardController({ getWindow: () => view });
		expect(await clipboard.copy('value', 0)).toEqual({ status: 'failed', value: 'value', error });
		expect(clipboard.error).toBe(error);
		expect(clipboard.copied).toBe(false);
		clipboard.reset();
		expect(clipboard.error).toBeNull();
		expect(clipboard.status).toBe('idle');
		clipboard.destroy();
	});
	it('ignores older request feedback while acknowledging that native writes cannot be canceled', async () => {
		const first = deferred();
		const second = deferred();
		const write = vi
			.fn()
			.mockImplementationOnce(() => first.promise)
			.mockImplementationOnce(() => second.promise);
		const view = owner(write);
		const clipboard = new ClipboardController({ getWindow: () => view });
		const old = clipboard.copy('old', 0);
		const current = clipboard.copy('new', 0);
		second.resolve();
		expect(await current).toEqual({ status: 'copied', value: 'new' });
		first.resolve();
		expect(await old).toEqual({ status: 'stale', value: 'old' });
		expect(write).toHaveBeenCalledTimes(2);
		expect(clipboard.copied).toBe(true);
		clipboard.destroy();
	});
	it('invalidates pending work on reset, owner change and destruction', async () => {
		for (const boundary of ['reset', 'owner', 'destroy'] as const) {
			const pending = deferred();
			const original = owner(() => pending.promise);
			let current: Window | null = original;
			const clipboard = new ClipboardController({ getWindow: () => current });
			const task = clipboard.copy(boundary);
			if (boundary === 'owner') current = null;
			else clipboard[boundary]();
			pending.resolve();
			expect((await task).status).toBe('stale');
			expect(clipboard.status).toBe('idle');
			clipboard.destroy();
		}
	});
	it('supports explicit persistent feedback and treats unavailable clipboard as a real failure', async () => {
		vi.useFakeTimers();
		const view = owner(() => Promise.resolve());
		const clipboard = new ClipboardController({ getWindow: () => view });
		await clipboard.copy('', 0);
		await vi.advanceTimersByTimeAsync(10000);
		expect(clipboard.copied).toBe(true);
		expect(vi.getTimerCount()).toBe(0);
		clipboard.destroy();
		const absent = new ClipboardController({ getWindow: () => null });
		expect((await absent.copy('value')).status).toBe('failed');
		expect(absent.status).toBe('failed');
		absent.destroy();
	});
	it('does not write with invalid timeout or after destruction', async () => {
		const write = vi.fn(() => Promise.resolve());
		const view = owner(write);
		const clipboard = new ClipboardController({ getWindow: () => view });
		await expect(clipboard.copy('bad', -1)).rejects.toThrow(/timeout/);
		expect(write).not.toHaveBeenCalled();
		clipboard.destroy();
		expect((await clipboard.copy('later')).status).toBe('stale');
		expect(write).not.toHaveBeenCalled();
	});
});
