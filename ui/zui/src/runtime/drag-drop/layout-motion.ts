export interface ReorderLayoutSnapshot {
	readonly rect: DOMRectReadOnly;
	readonly scaleX: number;
	readonly scaleY: number;
}

export interface ReorderLayoutAnimationOptions {
	readonly duration: number;
	readonly easing: string;
	readonly reduced: boolean;
}

function layoutScale(rectSize: number, offsetSize: number): number {
	const scale = offsetSize > 0 ? rectSize / offsetSize : 1;
	return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

function snapshot(element: HTMLElement): ReorderLayoutSnapshot {
	const rect = element.getBoundingClientRect();
	const Rect = element.ownerDocument.defaultView?.DOMRectReadOnly ?? DOMRectReadOnly;
	return Object.freeze({
		rect: new Rect(rect.x, rect.y, rect.width, rect.height),
		scaleX: layoutScale(rect.width, element.offsetWidth),
		scaleY: layoutScale(rect.height, element.offsetHeight)
	});
}

/** Captures stable viewport geometry without writing layout or style state to the elements. */
export function captureReorderLayout(
	elements: Iterable<HTMLElement>
): ReadonlyMap<HTMLElement, ReorderLayoutSnapshot> {
	const result = new Map<HTMLElement, ReorderLayoutSnapshot>();
	for (const element of elements) result.set(element, snapshot(element));
	return result;
}

function animationOptions(options: ReorderLayoutAnimationOptions): KeyframeAnimationOptions {
	if (!Number.isFinite(options.duration) || options.duration < 0)
		throw new RangeError('Reorder layout duration must be a finite non-negative number.');
	if (typeof options.easing !== 'string' || options.easing.trim().length === 0)
		throw new TypeError('Reorder layout easing must be a non-empty string.');
	return { duration: options.duration, easing: options.easing };
}

/**
 * Animates connected elements from their captured viewport position to their current layout.
 * Additive transform keyframes retain class/computed transforms and coexist with caller animations.
 */
export function animateReorderLayout(
	before: ReadonlyMap<HTMLElement, ReorderLayoutSnapshot>,
	options: ReorderLayoutAnimationOptions
): () => void {
	const timing = animationOptions(options);
	if (options.reduced || options.duration === 0) return () => undefined;
	const animations = new Set<Animation>();
	const cancel = () => {
		for (const animation of animations) animation.cancel();
		animations.clear();
	};
	try {
		for (const [element, previous] of before) {
			if (!element.isConnected) continue;
			const current = snapshot(element);
			const deltaX = previous.rect.left - current.rect.left;
			const deltaY = previous.rect.top - current.rect.top;
			if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) continue;
			const translateX = deltaX / current.scaleX;
			const translateY = deltaY / current.scaleY;
			const animation = element.animate(
				[
					{
						composite: 'add',
						transform: `translate(${translateX}px, ${translateY}px)`
					},
					{ composite: 'add', transform: 'translate(0px, 0px)' }
				],
				timing
			);
			animations.add(animation);
			const cleanup = () => animations.delete(animation);
			void animation.finished.then(cleanup, cleanup);
		}
	} catch (error) {
		cancel();
		throw error;
	}
	return cancel;
}
