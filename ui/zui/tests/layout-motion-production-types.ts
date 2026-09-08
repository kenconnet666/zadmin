import {
	animateKeyedLayout,
	animateReorderLayout,
	captureKeyedLayout,
	captureReorderLayout,
	type KeyedLayoutElement,
	type ReorderLayoutAnimationOptions,
	type ReorderLayoutSnapshot
} from '../src/runtime/drag-drop/layout-motion.js';

declare const elements: Iterable<HTMLElement>;
const before: ReadonlyMap<HTMLElement, ReorderLayoutSnapshot> = captureReorderLayout(elements);
const options: ReorderLayoutAnimationOptions = {
	duration: 160,
	easing: 'ease-out',
	reduced: false
};
const cancel: () => void = animateReorderLayout(before, options);
cancel();

declare const keyedElements: Iterable<KeyedLayoutElement<1 | '1'>>;
const keyedBefore: ReadonlyMap<1 | '1', ReorderLayoutSnapshot> = captureKeyedLayout(keyedElements);
const cancelKeyed: () => void = animateKeyedLayout(keyedBefore, keyedElements, options);
cancelKeyed();

// @ts-expect-error Layout motion accepts DOM elements rather than logical keys or indices.
captureReorderLayout(['item']);
