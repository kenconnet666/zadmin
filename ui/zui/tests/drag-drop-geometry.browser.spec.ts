import { AutoScroller, DragDropManager, Draggable } from '@dnd-kit/dom';
import { describe, expect, it } from 'vitest';

import { connectDragGeometry } from '../src/runtime/drag-drop/geometry.js';

const createDOMRect = (
	ownerWindow: Pick<typeof globalThis, 'DOMRect'>,
	x: number,
	y: number,
	w: number,
	h: number
) => new ownerWindow.DOMRect(x, y, w, h);

function createGeometryHarness() {
	const element = document.createElement('div');
	document.body.append(element);
	Object.defineProperty(element, 'getBoundingClientRect', {
		configurable: true,
		value: () => createDOMRect(window, 10, 20, 100, 40)
	});
	const manager = new DragDropManager({ plugins: [], sensors: [] });
	const source = new Draggable({ element, id: 'source', register: false }, manager);
	const unregister = source.register();
	return { element, manager, source, unregister };
}

async function startDrag({ manager, source }: ReturnType<typeof createGeometryHarness>) {
	manager.actions.start({ coordinates: { x: 0, y: 0 }, source });
	await Promise.resolve();
}

describe('class-only drag geometry bridge', () => {
	it('publishes translated iframe geometry without writing element styles', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const ownerWindow = ownerDocument.defaultView!;
		const element = ownerDocument.createElement('div');
		ownerDocument.body.append(element);
		Object.defineProperty(element, 'getBoundingClientRect', {
			configurable: true,
			value: () => createDOMRect(ownerWindow, 10, 20, 100, 40)
		});

		const manager = new DragDropManager({ plugins: [], sensors: [] });
		const source = new Draggable({ element, id: 'source', register: false }, manager);
		const unregister = source.register();
		const disconnect = connectDragGeometry(manager);
		try {
			manager.actions.start({ coordinates: { x: 0, y: 0 }, source });
			expect(manager.dragOperation.shape?.initial.boundingRectangle).toMatchObject({
				height: 40,
				left: 10,
				top: 20,
				width: 100
			});

			await Promise.resolve();
			manager.actions.move({ by: { x: 15, y: 7 } });
			// The bridge must publish inside dragmove before a sortable collision observer resumes.
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				bottom: 67,
				left: 25,
				right: 125,
				top: 27
			});
			await Promise.resolve();
			expect(manager.dragOperation.transform).toEqual({ x: 15, y: 7 });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 25,
				top: 27
			});

			manager.actions.move({ to: { x: 30, y: 14 } });
			// Absolute pointer coordinates are not a relative `by` projection. The reactive bridge
			// publishes them only after DragActions commits its real position.
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 25,
				top: 27
			});
			await Promise.resolve();
			expect(manager.dragOperation.transform).toEqual({ x: 30, y: 14 });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 40,
				top: 34
			});
			expect(element.hasAttribute('style')).toBe(false);

			disconnect();
			expect(manager.dragOperation.shape).toBeNull();
		} finally {
			disconnect();
			unregister?.();
			manager.destroy();
			frame.remove();
		}
	});

	it('does not project a move cancelled by an earlier listener', async () => {
		const harness = createGeometryHarness();
		const { element, manager, unregister } = harness;
		const stopCancellation = manager.monitor.addEventListener('dragmove', (event) =>
			event.preventDefault()
		);
		const disconnect = connectDragGeometry(manager);
		try {
			await startDrag(harness);
			manager.actions.move({ by: { x: 15, y: 7 } });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 10,
				top: 20
			});
			await Promise.resolve();
			expect(manager.dragOperation.transform).toEqual({ x: 0, y: 0 });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 10,
				top: 20
			});
		} finally {
			disconnect();
			stopCancellation();
			unregister?.();
			manager.destroy();
			element.remove();
		}
	});

	it('rolls back a projection cancelled by a later listener', async () => {
		const harness = createGeometryHarness();
		const { element, manager, unregister } = harness;
		const disconnect = connectDragGeometry(manager);
		const stopCancellation = manager.monitor.addEventListener('dragmove', (event) =>
			event.preventDefault()
		);
		try {
			await startDrag(harness);
			manager.actions.move({ by: { x: 15, y: 7 } });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 25,
				top: 27
			});
			await Promise.resolve();
			expect(manager.dragOperation.transform).toEqual({ x: 0, y: 0 });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 10,
				top: 20
			});
		} finally {
			stopCancellation();
			disconnect();
			unregister?.();
			manager.destroy();
			element.remove();
		}
	});

	it('does not let an older cancelled move roll back its replacement projection', async () => {
		const harness = createGeometryHarness();
		const { element, manager, unregister } = harness;
		const disconnect = connectDragGeometry(manager);
		let replace = true;
		const stopReplacement = manager.monitor.addEventListener('dragmove', (event) => {
			if (!replace) return;
			replace = false;
			event.preventDefault();
			manager.actions.move({ by: { x: 30, y: 14 } });
		});
		try {
			await startDrag(harness);
			manager.actions.move({ by: { x: 15, y: 7 } });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 40,
				top: 34
			});
			await Promise.resolve();
			expect(manager.dragOperation.transform).toEqual({ x: 30, y: 14 });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 40,
				top: 34
			});
		} finally {
			stopReplacement();
			disconnect();
			unregister?.();
			manager.destroy();
			element.remove();
		}
	});

	it('leaves real keyboard movement unprojected when it is cancelled without a replacement', async () => {
		const harness = createGeometryHarness();
		const { element, manager, unregister } = harness;
		const disconnect = connectDragGeometry(manager);
		const stopCancellation = manager.monitor.addEventListener('dragmove', (event) =>
			event.preventDefault()
		);
		try {
			await startDrag(harness);
			manager.actions.move({
				by: { x: 15, y: 7 },
				event: new KeyboardEvent('keydown', { key: 'ArrowDown' })
			});
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 10,
				top: 20
			});
			await Promise.resolve();
			expect(manager.dragOperation.transform).toEqual({ x: 0, y: 0 });
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				left: 10,
				top: 20
			});
		} finally {
			stopCancellation();
			disconnect();
			unregister?.();
			manager.destroy();
			element.remove();
		}
	});

	it('recaptures a source rectangle settled by a later dragstart cleanup', async () => {
		const element = document.createElement('div');
		document.body.append(element);
		let top = 20;
		Object.defineProperty(element, 'getBoundingClientRect', {
			configurable: true,
			value: () => createDOMRect(window, 10, top, 100, 40)
		});
		const manager = new DragDropManager({ plugins: [], sensors: [] });
		const source = new Draggable({ element, id: 'settling-source', register: false }, manager);
		const unregister = source.register();
		const disconnect = connectDragGeometry(manager);
		const stopSettling = manager.monitor.addEventListener('dragstart', () => {
			top = 60;
		});
		try {
			manager.actions.start({ coordinates: { x: 0, y: 0 }, source });
			await Promise.resolve();
			await Promise.resolve();
			expect(manager.dragOperation.shape?.current.boundingRectangle.top).toBe(60);
		} finally {
			stopSettling();
			disconnect();
			unregister?.();
			manager.destroy();
			element.remove();
		}
	});

	it('does not revive an owned shape when disconnected before cancellation rollback', async () => {
		const harness = createGeometryHarness();
		const { element, manager, unregister } = harness;
		const disconnect = connectDragGeometry(manager);
		const stopCancellation = manager.monitor.addEventListener('dragmove', (event) =>
			event.preventDefault()
		);
		try {
			await startDrag(harness);
			manager.actions.move({ by: { x: 15, y: 7 } });
			expect(manager.dragOperation.shape?.current.boundingRectangle.left).toBe(25);
			disconnect();
			expect(manager.dragOperation.shape).toBeNull();
			await Promise.resolve();
			expect(manager.dragOperation.shape).toBeNull();
		} finally {
			stopCancellation();
			disconnect();
			unregister?.();
			manager.destroy();
			element.remove();
		}
	});

	it('keeps viewport drag coordinates stable through scroll and clears an equal retained shape', async () => {
		const scroller = document.createElement('div');
		const firstElement = document.createElement('div');
		const replacementElement = document.createElement('div');
		scroller.append(firstElement);
		document.body.append(scroller);
		let scrolledBy = 0;
		const rectangle = () => createDOMRect(window, 40, 60 - scrolledBy, 80, 30);
		Object.defineProperty(firstElement, 'getBoundingClientRect', {
			configurable: true,
			value: rectangle
		});
		Object.defineProperty(replacementElement, 'getBoundingClientRect', {
			configurable: true,
			value: () => createDOMRect(window, 40, 60, 80, 30)
		});

		const manager = new DragDropManager({ plugins: [AutoScroller], sensors: [] });
		const firstSource = new Draggable(
			{ element: firstElement, id: 'replaceable', register: false },
			manager
		);
		let unregister = firstSource.register();
		const disconnect = connectDragGeometry(manager);
		try {
			manager.actions.start({ coordinates: { x: 40, y: 60 }, source: firstSource });
			await manager.renderer.rendering;
			await Promise.resolve();
			const initial = manager.dragOperation.shape?.current;
			expect(initial?.boundingRectangle.top).toBe(60);

			scrolledBy = 25;
			scroller.scrollTop = 25;
			scroller.dispatchEvent(new Event('scroll', { bubbles: true }));
			await new Promise((resolve) => setTimeout(resolve, 60));
			expect(firstElement.getBoundingClientRect().top).toBe(35);
			expect(manager.dragOperation.shape?.current.boundingRectangle.top).toBe(60);

			unregister?.();
			scroller.replaceChildren(replacementElement);
			const replacementSource = new Draggable(
				{ element: replacementElement, id: 'replaceable', register: false },
				manager
			);
			unregister = replacementSource.register();
			await Promise.resolve();
			// dnd-kit ValueHistory keeps the old object when the replacement has equal geometry.
			expect(manager.dragOperation.shape?.current).toBe(initial);
			expect(replacementElement.hasAttribute('style')).toBe(false);

			disconnect();
			expect(manager.dragOperation.shape).toBeNull();
		} finally {
			disconnect();
			unregister?.();
			manager.destroy();
			scroller.remove();
		}
	});
});
