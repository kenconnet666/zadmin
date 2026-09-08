import {
	captureKeyedLayout,
	type KeyedLayoutElement,
	type ReorderLayoutSnapshot
} from './layout-motion.js';

export interface LayoutMotionCapture<TKey> {
	readonly before: ReadonlyMap<TKey, ReorderLayoutSnapshot>;
	valid(): boolean;
	invalidate(): void;
	stop(): void;
}

interface LayoutMotionCaptureOptions {
	readonly enabled?: boolean;
	readonly signal?: AbortSignal;
}

/** Owns only the lifetime of a measured layout, never a component's items or transaction. */
export function captureLayoutMotion<TKey>(
	root: HTMLElement,
	getElements: () => Iterable<KeyedLayoutElement<TKey>>,
	{ enabled = true, signal }: LayoutMotionCaptureOptions = {}
): LayoutMotionCapture<TKey> {
	if (!enabled || signal?.aborted) {
		return {
			before: new Map<TKey, ReorderLayoutSnapshot>(),
			valid: () => false,
			invalidate: () => undefined,
			stop: () => undefined
		};
	}
	const elements = [...getElements()];
	const before = captureKeyedLayout(elements);
	const view = root.ownerDocument.defaultView;
	const dimensions = new Map<Element, Pick<DOMRectReadOnly, 'width' | 'height'>>([
		[root, root.getBoundingClientRect()]
	]);
	for (const { key, element } of elements) dimensions.set(element, before.get(key)!.rect);
	elements.length = 0;
	let invalid = false;
	let tracking = true;
	let resize: ResizeObserver | undefined;
	function stop(): void {
		if (!tracking) return;
		tracking = false;
		resize?.disconnect();
		dimensions.clear();
		root.removeEventListener('scroll', invalidate, true);
		view?.removeEventListener('scroll', invalidate, true);
		view?.removeEventListener('resize', invalidate);
		signal?.removeEventListener('abort', invalidate);
	}
	function invalidate(): void {
		invalid = true;
		stop();
	}
	try {
		resize = view?.ResizeObserver
			? new view.ResizeObserver((entries) => {
					if (!tracking) return;
					for (const entry of entries) {
						const previous = dimensions.get(entry.target);
						if (!previous) continue;
						const current = entry.target.getBoundingClientRect();
						if (
							Math.abs(current.width - previous.width) > 0.01 ||
							Math.abs(current.height - previous.height) > 0.01
						) {
							invalidate();
							return;
						}
					}
				})
			: undefined;
		root.addEventListener('scroll', invalidate, { capture: true, passive: true });
		view?.addEventListener('scroll', invalidate, { capture: true, passive: true });
		view?.addEventListener('resize', invalidate, { passive: true });
		signal?.addEventListener('abort', invalidate, { once: true });
		for (const element of dimensions.keys()) resize?.observe(element, { box: 'border-box' });
		if (signal?.aborted) invalidate();
	} catch (error) {
		stop();
		throw error;
	}
	return { before, valid: () => !invalid, invalidate, stop };
}
