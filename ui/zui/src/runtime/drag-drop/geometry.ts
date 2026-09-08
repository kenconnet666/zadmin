import type { DragDropManager } from '@dnd-kit/dom';
import { DOMRectangle } from '@dnd-kit/dom/utilities';
import { effect, untracked } from '@dnd-kit/state';

/** Supplies collision geometry without enabling dnd-kit's DOM-writing Feedback plugin. */
export function connectDragGeometry(manager: DragDropManager): () => void {
	let connected = true;
	let projectionGeneration = 0;
	let sourceElement: Element | undefined;
	let initialShape: DOMRectangle | undefined;
	let publishedShape: ReturnType<typeof DOMRectangle.from> | undefined;
	const ownedShapes = new WeakSet<object>();

	const clear = (): void => {
		projectionGeneration += 1;
		sourceElement = undefined;
		initialShape = undefined;
		untracked(() => {
			if (publishedShape && manager.dragOperation.shape?.current === publishedShape)
				manager.dragOperation.shape = null;
			publishedShape = undefined;
		});
	};

	const publish = (projectedBy?: { readonly x: number; readonly y: number }): void => {
		const operation = manager.dragOperation;
		const idle = operation.status.idle;
		const element = operation.source?.element;
		const current = operation.transform;
		const x = current.x + (projectedBy?.x ?? 0);
		const y = current.y + (projectedBy?.y ?? 0);
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
	};
	const dispose = effect(publish);
	const unsubscribeStart = manager.monitor.addEventListener('dragstart', (event) => {
		const startedElement = event.operation.source?.element;
		queueMicrotask(() => {
			const operation = manager.dragOperation;
			if (
				!connected ||
				!operation.status.dragging ||
				operation.source?.element !== startedElement ||
				operation.transform.x !== 0 ||
				operation.transform.y !== 0
			)
				return;
			// Later dragstart listeners may synchronously cancel an existing layout animation. Capture
			// the settled source rectangle before the first sensor move without rebasing after scroll.
			projectionGeneration += 1;
			sourceElement = undefined;
			initialShape = undefined;
			publish();
		});
	});
	// DragMove listeners run inside the manager action, before collision observers are re-enabled.
	// Publish the translated shape synchronously so the keyboard sortable plugin does not
	// recompute against the source rectangle and replace its newly selected target.
	const unsubscribeMove = manager.monitor.addEventListener('dragmove', (event) => {
		// Raw sensor events carry their native event and remain at the real transform until
		// DragActions accepts them. SortableKeyboardPlugin consumes that raw event, computes a
		// geometry-aligned delta, then issues a native-event-free `move({by})` immediately before
		// it resumes collision observation. Only that programmatic move needs synchronous shape.
		if (event.nativeEvent || !event.by || event.defaultPrevented) return;
		const generation = ++projectionGeneration;
		publish(event.by);
		const projectedSource = sourceElement;
		const projectedInitial = initialShape;
		queueMicrotask(() => {
			// A later synchronous listener may cancel the default-preventable move. DragActions then
			// keeps the real transform unchanged. A newer move, source replacement, clear or disconnect
			// owns the shape by then and must not be overwritten by this stale rollback.
			if (
				connected &&
				event.defaultPrevented &&
				projectionGeneration === generation &&
				sourceElement === projectedSource &&
				initialShape === projectedInitial
			)
				publish();
		});
	});

	return () => {
		if (!connected) return;
		connected = false;
		unsubscribeStart();
		unsubscribeMove();
		dispose();
		clear();
	};
}
