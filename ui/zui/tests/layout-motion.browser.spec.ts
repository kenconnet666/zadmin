import { describe, expect, it } from 'vitest';

import {
	animateKeyedLayout,
	animateReorderLayout,
	captureKeyedLayout,
	captureReorderLayout
} from '../src/runtime/drag-drop/layout-motion.js';

function fixture(): {
	first: HTMLDivElement;
	host: HTMLDivElement;
	remove(): void;
	second: HTMLDivElement;
} {
	const style = document.createElement('style');
	style.textContent = `
		[data-layout-motion-scale] { transform: scale(2); transform-origin: top left; }
		[data-layout-motion-host] { display: flex; gap: 10px; width: 150px; }
		[data-layout-motion-host] > div { box-sizing: border-box; height: 20px; width: 40px; }
		[data-layout-motion-host][data-moved] [data-first] { order: 2; }
		[data-layout-motion-host][data-moved] [data-second] { order: 1; }
		[data-layout-motion-host] [data-first] { transform: translateX(3px); }
	`;
	const scale = document.createElement('div');
	scale.dataset.layoutMotionScale = '';
	const host = document.createElement('div');
	host.dataset.layoutMotionHost = '';
	const first = document.createElement('div');
	first.dataset.first = '';
	const second = document.createElement('div');
	second.dataset.second = '';
	host.append(first, second);
	scale.append(host);
	document.head.append(style);
	document.body.append(scale);
	return {
		first,
		host,
		remove() {
			scale.remove();
			style.remove();
		},
		second
	};
}

describe('reorder layout motion', () => {
	it('uses scaled viewport geometry, preserves computed transforms and cancels only owned animations', () => {
		const { first, host, remove, second } = fixture();
		try {
			const originalTransform = getComputedStyle(first).transform;
			const before = captureReorderLayout([first, second]);
			expect(before.get(first)?.scaleX).toBeCloseTo(2, 1);
			host.dataset.moved = '';
			const afterLeft = first.getBoundingClientRect().left;
			const viewportDelta = before.get(first)!.rect.left - afterLeft;
			const caller = first.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 1_000 });
			const cancel = animateReorderLayout(before, {
				duration: 200,
				easing: 'ease-out',
				reduced: false
			});
			const animations = first.getAnimations();
			expect(animations).toHaveLength(2);
			const owned = animations.find((animation) => animation !== caller)!;
			const firstFrame = (owned.effect as KeyframeEffect).getKeyframes()[0]!;
			expect(firstFrame.composite).toBe('add');
			const matrix = new DOMMatrixReadOnly(String(firstFrame.transform));
			expect(matrix.m41).toBeCloseTo(viewportDelta / 2, 1);
			expect(first.hasAttribute('style')).toBe(false);

			cancel();
			expect(caller.playState).not.toBe('idle');
			expect(first.getAnimations()).toEqual([caller]);
			expect(getComputedStyle(first).transform).toBe(originalTransform);
			expect(first.hasAttribute('style')).toBe(false);
			cancel();
			caller.cancel();
		} finally {
			remove();
		}
	});

	it('skips unchanged, reduced, zero-duration and detached elements', () => {
		const { first, host, remove, second } = fixture();
		try {
			const unchanged = captureReorderLayout([first, second]);
			animateReorderLayout(unchanged, { duration: 200, easing: 'linear', reduced: false });
			expect(first.getAnimations()).toHaveLength(0);

			const reduced = captureReorderLayout([first, second]);
			host.dataset.moved = '';
			animateReorderLayout(reduced, { duration: 200, easing: 'linear', reduced: true });
			expect(first.getAnimations()).toHaveLength(0);

			delete host.dataset.moved;
			const zero = captureReorderLayout([first, second]);
			host.dataset.moved = '';
			animateReorderLayout(zero, { duration: 0, easing: 'linear', reduced: false });
			expect(first.getAnimations()).toHaveLength(0);

			delete host.dataset.moved;
			const detached = captureReorderLayout([first]);
			first.remove();
			const cancel = animateReorderLayout(detached, {
				duration: 200,
				easing: 'linear',
				reduced: false
			});
			expect(first.getAnimations()).toHaveLength(0);
			cancel();
			expect(first.hasAttribute('style')).toBe(false);
		} finally {
			remove();
		}
	});

	it('maps captured geometry to a replacement DOM node by typed key', () => {
		const { first, host, remove, second } = fixture();
		try {
			const before = captureKeyedLayout<number | string>([
				{ element: first, key: 1 },
				{ element: second, key: '1' }
			]);
			const previousLeft = before.get(1)!.rect.left;
			first.remove();
			const replacement = document.createElement('div');
			replacement.dataset.replacement = '';
			host.append(replacement);

			const caller = replacement.animate([{ opacity: 0.5 }, { opacity: 1 }], {
				duration: 1_000
			});
			const currentLeft = replacement.getBoundingClientRect().left;
			const cancel = animateKeyedLayout(
				before,
				[
					{ element: replacement, key: 1 },
					{ element: second, key: '1' }
				],
				{ duration: 200, easing: 'ease-out', reduced: false }
			);
			const owned = replacement.getAnimations().find((animation) => animation !== caller)!;
			const firstFrame = (owned.effect as KeyframeEffect).getKeyframes()[0]!;
			const delta = previousLeft - currentLeft;
			const scale = replacement.getBoundingClientRect().width / replacement.offsetWidth;
			expect(new DOMMatrixReadOnly(String(firstFrame.transform)).m41).toBeCloseTo(delta / scale, 1);
			expect(first.getAnimations()).toHaveLength(0);
			expect(replacement.hasAttribute('style')).toBe(false);

			cancel();
			expect(replacement.getAnimations()).toEqual([caller]);
			caller.cancel();
			expect(() =>
				captureKeyedLayout([
					{ element: replacement, key: 1 },
					{ element: second, key: 1 }
				])
			).toThrow(/unique keys/u);
			expect(() =>
				animateKeyedLayout(
					before,
					[
						{ element: replacement, key: 1 },
						{ element: second, key: 1 }
					],
					{ duration: 200, easing: 'linear', reduced: false }
				)
			).toThrow(/unique keys/u);
		} finally {
			remove();
		}
	});
});
