import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureLayoutMotion } from '../src/runtime/drag-drop/layout-motion-capture.js';

const cleanup: (() => void)[] = [];
afterEach(() => {
	for (const dispose of cleanup.splice(0).reverse()) dispose();
	vi.restoreAllMocks();
});

function fixture() {
	const root = document.createElement('div');
	root.style.cssText = 'width: 200px; height: 100px;';
	const row = document.createElement('div');
	row.style.cssText = 'width: 70px; height: 20px;';
	root.append(row);
	document.body.append(root);
	cleanup.push(() => root.remove());
	return { root, row };
}

function widthObserved(root: HTMLElement, width: number): Promise<void> {
	return new Promise((resolve) => {
		let frame: number | undefined;
		const observer = new ResizeObserver(() => {
			if (Math.abs(root.getBoundingClientRect().width - width) >= 0.01) return;
			observer.disconnect();
			// Resume test mutations outside the current ResizeObserver delivery cycle.
			frame = requestAnimationFrame(() => {
				frame = undefined;
				resolve();
			});
		});
		cleanup.push(() => {
			observer.disconnect();
			if (frame !== undefined) cancelAnimationFrame(frame);
		});
		observer.observe(root);
	});
}

describe('layout motion capture lifetime', () => {
	it('does not enumerate elements or read layout when motion is disabled or already aborted', () => {
		const { root, row } = fixture();
		const read = vi.spyOn(root, 'getBoundingClientRect');
		const elements = vi.fn(() => [{ key: 1, element: row }]);
		const controller = new AbortController();
		controller.abort();
		for (const options of [{ enabled: false }, { signal: controller.signal }]) {
			const capture = captureLayoutMotion(root, elements, options);
			expect(capture.before.size).toBe(0);
			expect(capture.valid()).toBe(false);
			capture.invalidate();
			capture.stop();
		}
		expect(elements).not.toHaveBeenCalled();
		expect(read).not.toHaveBeenCalled();
	});

	it('captures typed keys and disconnects tracking exactly once on abort', () => {
		const { root, row } = fixture();
		const controller = new AbortController();
		const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
		const remove = vi.spyOn(root, 'removeEventListener');
		const capture = captureLayoutMotion(root, () => [{ key: 'row', element: row }], {
			signal: controller.signal
		});
		cleanup.push(capture.stop);
		expect(capture.valid()).toBe(true);
		expect(capture.before.get('row')?.rect.width).toBe(70);
		controller.abort();
		expect(capture.valid()).toBe(false);
		expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true);
		capture.stop();
		capture.invalidate();
		expect(disconnect).toHaveBeenCalledTimes(1);
	});

	it('invalidates on descendant scroll or owner resize, but stopping preserves usable geometry', () => {
		const { root, row } = fixture();
		for (const dispatch of [
			() => row.dispatchEvent(new Event('scroll')),
			() => window.dispatchEvent(new Event('resize'))
		]) {
			const capture = captureLayoutMotion(root, () => [{ key: 1, element: row }]);
			cleanup.push(capture.stop);
			dispatch();
			expect(capture.valid()).toBe(false);
		}
		const stopped = captureLayoutMotion(root, () => [{ key: 1, element: row }]);
		stopped.stop();
		row.dispatchEvent(new Event('scroll'));
		expect(stopped.valid()).toBe(true);
		expect(stopped.before.size).toBe(1);
	});

	it('keeps its initial resize baseline valid and invalidates a real root width change', async () => {
		const { root, row } = fixture();
		const capture = captureLayoutMotion(root, () => [{ key: 1, element: row }]);
		cleanup.push(capture.stop);
		await widthObserved(root, 200);
		expect(capture.valid()).toBe(true);
		root.style.width = '260px';
		await widthObserved(root, 260);
		expect(capture.valid()).toBe(false);
	});

	it('invalidates measured item resizing even when the host dimensions remain fixed', async () => {
		const { root, row } = fixture();
		const capture = captureLayoutMotion(root, () => [{ key: 1, element: row }]);
		cleanup.push(capture.stop);
		await widthObserved(row, 70);
		expect(capture.valid()).toBe(true);
		row.style.width = '90px';
		await widthObserved(row, 90);
		expect(root.getBoundingClientRect().width).toBe(200);
		expect(capture.valid()).toBe(false);
	});

	it('invalidates border-only resizing of a measured row', async () => {
		const { root, row } = fixture();
		const capture = captureLayoutMotion(root, () => [{ key: 1, element: row }]);
		cleanup.push(capture.stop);
		await widthObserved(row, 70);
		expect(capture.valid()).toBe(true);
		row.style.border = '4px solid transparent';
		await widthObserved(row, 78);
		expect(root.getBoundingClientRect().width).toBe(200);
		expect(capture.valid()).toBe(false);
	});

	it('cleans listeners when the native observation setup fails', () => {
		const { root, row } = fixture();
		const remove = vi.spyOn(root, 'removeEventListener');
		const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
		vi.spyOn(ResizeObserver.prototype, 'observe').mockImplementation(() => {
			throw new Error('Observation setup failed');
		});
		expect(() => captureLayoutMotion(root, () => [{ key: 1, element: row }])).toThrow(
			'Observation setup failed'
		);
		expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true);
		expect(disconnect).toHaveBeenCalledOnce();
	});
});
