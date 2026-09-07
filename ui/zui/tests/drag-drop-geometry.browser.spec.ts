import { AutoScroller, DragDropManager, Draggable } from '@dnd-kit/dom';
import { describe, expect, it } from 'vitest';

import { connectDragGeometry } from '../src/runtime/drag-drop/geometry.js';

describe('class-only drag geometry bridge', () => {
	it('publishes translated iframe geometry without writing element styles', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const ownerWindow = frame.contentWindow!;
		const element = ownerDocument.createElement('div');
		ownerDocument.body.append(element);
		Object.defineProperty(element, 'getBoundingClientRect', {
			configurable: true,
			value: () => new ownerWindow.DOMRect(10, 20, 100, 40)
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
			await Promise.resolve();
			expect(manager.dragOperation.shape?.current.boundingRectangle).toMatchObject({
				bottom: 67,
				left: 25,
				right: 125,
				top: 27
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

	it('keeps viewport drag coordinates stable through scroll and clears an equal retained shape', async () => {
		const scroller = document.createElement('div');
		const firstElement = document.createElement('div');
		const replacementElement = document.createElement('div');
		scroller.append(firstElement);
		document.body.append(scroller);
		let scrolledBy = 0;
		const rectangle = () => new DOMRect(40, 60 - scrolledBy, 80, 30);
		Object.defineProperty(firstElement, 'getBoundingClientRect', {
			configurable: true,
			value: rectangle
		});
		Object.defineProperty(replacementElement, 'getBoundingClientRect', {
			configurable: true,
			value: () => new DOMRect(40, 60, 80, 30)
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
