import type { DragDropManager } from '@dnd-kit/dom';
import { DOMRectangle } from '@dnd-kit/dom/utilities';
import { effect, untracked } from '@dnd-kit/state';

/** Supplies collision geometry without enabling dnd-kit's DOM-writing Feedback plugin. */
export function connectDragGeometry(manager: DragDropManager): () => void {
	let sourceElement: Element | undefined;
	let initialShape: DOMRectangle | undefined;
	let publishedShape: ReturnType<typeof DOMRectangle.from> | undefined;
	const ownedShapes = new WeakSet<object>();

	const clear = (): void => {
		sourceElement = undefined;
		initialShape = undefined;
		untracked(() => {
			if (publishedShape && manager.dragOperation.shape?.current === publishedShape)
				manager.dragOperation.shape = null;
			publishedShape = undefined;
		});
	};

	const dispose = effect(() => {
		const operation = manager.dragOperation;
		const idle = operation.status.idle;
		const element = operation.source?.element;
		const { x, y } = operation.transform;
		if (idle || !element) {
			clear();
			return;
		}

		if (element !== sourceElement || !initialShape) {
			sourceElement = element;
			initialShape = new DOMRectangle(element);
		}
		const next = DOMRectangle.from(initialShape.boundingRectangle).translate(x, y);
		untracked(() => {
			operation.shape = next;
			const current = operation.shape?.current;
			if (current === next) {
				ownedShapes.add(next);
				publishedShape = next;
			} else {
				// ValueHistory retains its existing object when Shape.equals() reports the same
				// geometry. Preserve ownership only when that retained object came from this bridge.
				publishedShape = current && ownedShapes.has(current) ? (current as typeof next) : undefined;
			}
		});
	});

	return () => {
		dispose();
		clear();
	};
}
