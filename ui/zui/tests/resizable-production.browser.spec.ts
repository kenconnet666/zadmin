import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type {
	ZResizableCancelReason,
	ZResizableResizeDetail
} from '../src/components/layout/ZResizable.svelte';
import { createBrowserIcssRuntime } from '../src/icss/runtime.js';
import ResizableFixture from './ResizableFixture.svelte';
import ResizableOwnerRealmFixture from './ResizableOwnerRealmFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function host(ownerDocument: Document = document): HTMLDivElement {
	const element = ownerDocument.createElement('div');
	element.style.inlineSize = '800px';
	element.style.blockSize = '600px';
	ownerDocument.body.append(element);
	return element;
}

function root(target: ParentNode, testId = 'resizable-main'): HTMLElement {
	return target.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function handle(target: HTMLElement, name: string): HTMLElement {
	return target.querySelector<HTMLElement>(`[data-slot="handle"][data-handle="${name}"]`)!;
}

function events(target: ParentNode): HTMLOutputElement {
	return target.querySelector<HTMLOutputElement>('[data-testid="resizable-events"]')!;
}

function pointer(
	target: EventTarget,
	view: Window & typeof globalThis,
	type: string,
	init: PointerEventInit
): PointerEvent {
	const event = new view.PointerEvent(type, {
		bubbles: true,
		button: 0,
		cancelable: true,
		isPrimary: true,
		...init
	});
	target.dispatchEvent(event);
	return event;
}

function begin(
	handle: HTMLElement,
	pointerId: number
): { event: PointerEvent; x: number; y: number } {
	const view = handle.ownerDocument.defaultView as Window & typeof globalThis;
	const rect = handle.getBoundingClientRect();
	const x = rect.left + rect.width / 2;
	const y = rect.top + rect.height / 2;
	const event = pointer(handle, view, 'pointerdown', { clientX: x, clientY: y, pointerId });
	return { event, x, y };
}

describe('ZResizable production browser contract', () => {
	it('measures one element, exposes logical ARIA handles, usable handle snippets and five sizes', async () => {
		// @zui-visual ZResizable logical handles and five-size pointer geometry
		const target = host();
		const component = mount(ResizableFixture, { target });
		try {
			await tick();
			const main = root(target);
			await expect.poll(() => main.dataset.measured).toBe('true');
			expect(main.getBoundingClientRect().width).toBeCloseTo(320, 0);
			expect(main.getBoundingClientRect().height).toBeCloseTo(240, 0);
			expect(main.dataset.axis).toBe('both');
			expect(main.querySelector('[data-testid="resizable-content"]')).not.toBeNull();
			const inline = handle(main, 'inline-end');
			const block = handle(main, 'block-end');
			const corner = handle(main, 'block-end-inline-end');
			expect(inline.getAttribute('role')).toBe('separator');
			expect(inline.getAttribute('aria-orientation')).toBe('vertical');
			expect(inline.getAttribute('aria-label')).toBe('Resize test inline-end');
			expect(Number(inline.getAttribute('aria-valuemin'))).toBeCloseTo(160, 4);
			expect(Number(inline.getAttribute('aria-valuemax'))).toBeCloseTo(480, 4);
			expect(Number(inline.getAttribute('aria-valuenow'))).toBeCloseTo(320, 4);
			expect(block.getAttribute('role')).toBe('separator');
			expect(block.getAttribute('aria-orientation')).toBe('horizontal');
			expect(corner.tagName).toBe('BUTTON');
			expect((corner as HTMLButtonElement).type).toBe('button');
			expect(corner.getAttribute('role')).toBeNull();
			for (const name of ['inline-end', 'block-end', 'block-end-inline-end']) {
				const custom = main.querySelector<HTMLElement>(`[data-testid="resizable-custom-${name}"]`)!;
				expect(custom.dataset.axis).toBe('both');
				expect(custom.textContent).toBe(name);
			}

			const percent = root(target, 'resizable-percent');
			await expect.poll(() => percent.getBoundingClientRect().width).toBeCloseTo(200, 0);
			expect(percent.getBoundingClientRect().height).toBeCloseTo(100, 0);
			expect(target.querySelector('[data-testid="resizable-percent-output"]')?.textContent).toBe(
				'string:50%'
			);

			for (const [size, expected] of [
				['xsmall', 12],
				['small', 14],
				['medium', 16],
				['large', 20],
				['xlarge', 24]
			] as const) {
				const sized = root(target, `resizable-size-${size}`);
				await expect.poll(() => sized.dataset.measured).toBe('true');
				expect(sized.dataset.size).toBe(size);
				expect(handle(sized, 'inline-end').getBoundingClientRect().width).toBeCloseTo(expected, 1);
			}

			const disabled = root(target, 'resizable-disabled');
			await expect.poll(() => disabled.dataset.measured).toBe('true');
			expect(disabled.dataset.disabled).toBe('true');
			expect(handle(disabled, 'inline-end').getAttribute('aria-disabled')).toBe('true');
			expect((handle(disabled, 'block-end-inline-end') as HTMLButtonElement).disabled).toBe(true);
			expect(
				[...disabled.querySelectorAll<HTMLElement>('[data-slot="handle"]')].every(
					(entry) => entry.tabIndex === -1
				)
			).toBe(true);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('uses pixel keyboard steps on each axis, preserves units and resets without resize lifecycle', async () => {
		const target = host();
		const component = mount(ResizableFixture, { target });
		try {
			await tick();
			const main = root(target);
			await expect.poll(() => main.dataset.measured).toBe('true');
			const inline = handle(main, 'inline-end');
			const block = handle(main, 'block-end');
			const corner = handle(main, 'block-end-inline-end');
			const output = events(target);

			inline.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(328, 0);
			expect(output.textContent).toBe('328px|240px');
			expect(output.dataset.source).toBe('keyboard');
			expect(output.dataset.starts).toBe('1');
			expect(output.dataset.resizes).toBe('1');
			expect(output.dataset.ends).toBe('1');
			expect(output.dataset.changes).toBe('1');
			expect(output.dataset.frozen).toBe('true');
			expect(output.dataset.valueFrozen).toBe('true');

			await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(360, 0);
			block.focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => main.getBoundingClientRect().height).toBeCloseTo(248, 0);
			await userEvent.keyboard('{Home}');
			await expect.poll(() => main.getBoundingClientRect().height).toBeCloseTo(120, 0);
			await userEvent.keyboard('{End}');
			await expect.poll(() => main.getBoundingClientRect().height).toBeCloseTo(360, 0);

			corner.focus();
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(352, 0);
			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(() => main.getBoundingClientRect().height).toBeCloseTo(352, 0);
			expect(output.dataset.starts).toBe('7');
			expect(output.dataset.resizes).toBe('7');
			expect(output.dataset.ends).toBe('7');
			expect(output.dataset.changes).toBe('7');

			component.resetMain();
			await expect.poll(() => output.textContent).toBe('320px|240px');
			expect(main.getBoundingClientRect().width).toBeCloseTo(320, 0);
			expect(main.getBoundingClientRect().height).toBeCloseTo(240, 0);
			expect(output.dataset.changes).toBe('8');
			expect(output.dataset.starts).toBe('7');
			expect(output.dataset.resizes).toBe('7');
			expect(output.dataset.ends).toBe('7');

			const percent = root(target, 'resizable-percent');
			const percentHandle = handle(percent, 'inline-end');
			percentHandle.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => percent.getBoundingClientRect().width).toBeCloseTo(208, 0);
			expect(target.querySelector('[data-testid="resizable-percent-output"]')?.textContent).toBe(
				'string:52%'
			);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('maps physical arrow keys through logical RTL start and end handles', async () => {
		const target = host();
		const component = mount(ResizableFixture, { target });
		try {
			await tick();
			const rtl = root(target, 'resizable-rtl');
			await expect.poll(() => rtl.dataset.measured).toBe('true');
			expect(getComputedStyle(rtl).direction).toBe('rtl');
			expect(getComputedStyle(handle(rtl, 'block-start-inline-start')).cursor).toBe('nesw-resize');
			expect(getComputedStyle(handle(rtl, 'block-end-inline-end')).cursor).toBe('nesw-resize');
			expect(getComputedStyle(handle(rtl, 'block-start-inline-end')).cursor).toBe('nwse-resize');
			expect(getComputedStyle(handle(rtl, 'block-end-inline-start')).cursor).toBe('nwse-resize');
			const end = handle(rtl, 'inline-end');
			end.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => rtl.getBoundingClientRect().width).toBeCloseTo(190, 0);

			const start = handle(rtl, 'inline-start');
			start.focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => rtl.getBoundingClientRect().width).toBeCloseTo(200, 0);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('captures and releases a pointer while publishing one continuous resize lifecycle', async () => {
		const target = host();
		const component = mount(ResizableFixture, { target });
		try {
			await tick();
			const main = root(target);
			await expect.poll(() => main.dataset.measured).toBe('true');
			const corner = handle(main, 'block-end-inline-end');
			const captured: number[] = [];
			const released: number[] = [];
			let activeCapture: number | undefined;
			Object.defineProperties(corner, {
				hasPointerCapture: {
					configurable: true,
					value: (pointerId: number) => activeCapture === pointerId
				},
				releasePointerCapture: {
					configurable: true,
					value: (pointerId: number) => {
						released.push(pointerId);
						activeCapture = undefined;
					}
				},
				setPointerCapture: {
					configurable: true,
					value: (pointerId: number) => {
						captured.push(pointerId);
						activeCapture = pointerId;
					}
				}
			});
			const start = begin(corner, 41);
			await tick();
			expect(start.event.defaultPrevented).toBe(true);
			expect(document.activeElement).toBe(corner);
			expect(captured).toEqual([41]);
			expect(main.dataset.resizing).toBe('true');
			expect(
				main
					.querySelector('[data-testid="resizable-custom-block-end-inline-end"]')
					?.getAttribute('data-resizing')
			).toBe('true');

			pointer(window, window, 'pointermove', {
				clientX: start.x + 40,
				clientY: start.y + 20,
				pointerId: 41
			});
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(360, 0);
			expect(main.getBoundingClientRect().height).toBeCloseTo(260, 0);
			pointer(window, window, 'pointerup', { pointerId: 41 });
			await tick();
			expect(released).toEqual([41]);
			expect(main.dataset.resizing).toBeUndefined();
			expect(events(target).dataset.starts).toBe('1');
			expect(events(target).dataset.resizes).toBe('1');
			expect(events(target).dataset.ends).toBe('1');
			expect(events(target).dataset.source).toBe('pointer');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('restores cancelled and lost-capture drags and cancels external, geometry and owner changes', async () => {
		const target = host();
		const component = mount(ResizableFixture, { target });
		try {
			await tick();
			const main = root(target);
			const owner = target.querySelector<HTMLElement>('[data-testid="resizable-owner"]')!;
			const corner = handle(main, 'block-end-inline-end');
			await expect.poll(() => main.dataset.measured).toBe('true');

			let start = begin(corner, 51);
			pointer(window, window, 'pointermove', {
				clientX: start.x + 40,
				clientY: start.y + 20,
				pointerId: 51
			});
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(360, 0);
			pointer(window, window, 'pointercancel', { pointerId: 51 });
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(320, 0);
			expect(main.getBoundingClientRect().height).toBeCloseTo(240, 0);
			expect(events(target).dataset.reason).toBe('pointer-cancel');

			start = begin(corner, 52);
			pointer(window, window, 'pointermove', {
				clientX: start.x + 20,
				clientY: start.y + 20,
				pointerId: 52
			});
			await tick();
			pointer(corner, window, 'lostpointercapture', { pointerId: 52 });
			await expect.poll(() => main.getBoundingClientRect().width).toBeCloseTo(320, 0);
			expect(events(target).dataset.reason).toBe('lost-capture');

			start = begin(corner, 53);
			pointer(window, window, 'pointermove', {
				clientX: start.x + 20,
				clientY: start.y,
				pointerId: 53
			});
			await tick();
			component.setControlled('400px', '200px');
			await expect.poll(() => events(target).dataset.reason).toBe('external-update');
			expect(main.getBoundingClientRect().width).toBeCloseTo(400, 0);

			start = begin(corner, 54);
			owner.style.inlineSize = '700px';
			await expect.poll(() => events(target).dataset.reason).toBe('geometry-change');
			expect(main.dataset.resizing).toBeUndefined();

			const alternate = document.createElement('div');
			alternate.style.inlineSize = '600px';
			alternate.style.blockSize = '400px';
			target.append(alternate);
			begin(corner, 55);
			alternate.append(main);
			await expect.poll(() => events(target).dataset.reason).toBe('owner-change');
			expect(main.dataset.resizing).toBeUndefined();
			owner.append(main);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('uses the element owner Window for pointer listeners and reports active unmount cancellation', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerWindow = frame.contentWindow as (Window & typeof globalThis) | null;
		const ownerDocument = frame.contentDocument;
		if (!ownerWindow || !ownerDocument) throw new Error('Expected a same-origin iframe realm.');
		const target = host(ownerDocument);
		const runtime = createBrowserIcssRuntime({ root: ownerDocument });
		let lastDetail: ZResizableResizeDetail | undefined;
		let cancelReason: ZResizableCancelReason | undefined;
		const component = mount(ResizableOwnerRealmFixture, {
			props: {
				onResize: (detail) => (lastDetail = detail),
				onResizeCancel: (detail) => (cancelReason = detail.reason),
				runtime
			},
			target
		});
		try {
			await tick();
			const resizable = target.querySelector<HTMLElement>('[data-testid="resizable-owner-realm"]')!;
			await expect.poll(() => resizable.dataset.measured).toBe('true');
			const edge = handle(resizable, 'inline-end');
			const start = begin(edge, 61);
			pointer(window, window, 'pointermove', {
				clientX: start.x + 50,
				clientY: start.y,
				pointerId: 61
			});
			await tick();
			expect(resizable.getBoundingClientRect().width).toBeCloseTo(200, 0);
			pointer(ownerWindow, ownerWindow, 'pointermove', {
				clientX: start.x + 50,
				clientY: start.y,
				pointerId: 61
			});
			await expect.poll(() => resizable.getBoundingClientRect().width).toBeCloseTo(250, 0);
			expect(lastDetail?.source).toBe('pointer');
			await unmount(component);
			expect(cancelReason).toBe('unmount');
		} finally {
			runtime.registry.clear();
			if (target.isConnected) target.remove();
			frame.remove();
		}
	});

	it('keeps disabled handles inert for real keyboard input without lifecycle notifications', async () => {
		const target = host();
		const component = mount(ResizableFixture, { target });
		try {
			await tick();
			const disabled = root(target, 'resizable-disabled');
			await expect.poll(() => disabled.dataset.measured).toBe('true');
			const edge = handle(disabled, 'inline-end');
			edge.focus();
			await userEvent.keyboard('{ArrowRight}');
			await tick();
			expect(disabled.getBoundingClientRect().width).toBeCloseTo(200, 0);
			expect(events(target).dataset.starts).toBe('0');
			expect(events(target).dataset.resizes).toBe('0');
			expect(events(target).dataset.ends).toBe('0');
			expect(events(target).dataset.changes).toBe('0');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
