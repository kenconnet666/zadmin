import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';

import SortableLayoutMotionFixture from './SortableLayoutMotionFixture.svelte';

let originalViewport: { height: number; width: number };
const cleanup: (() => void)[] = [];
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	for (const dispose of cleanup.splice(0).reverse()) dispose();
	await page.viewport(originalViewport.width, originalViewport.height);
});

function root(target: HTMLElement): HTMLElement {
	return target.querySelector<HTMLElement>('[data-testid="sortable-layout-motion"]')!;
}

function nextAction(root: HTMLElement): HTMLButtonElement {
	return root.querySelector<HTMLButtonElement>('[data-slot="row"] [data-slot="move-next"]')!;
}

function recordRowMotions(root: HTMLElement): {
	readonly count: () => number;
	restore(): void;
} {
	const animations: Animation[] = [];
	const nativeAnimate = Element.prototype.animate;
	const spy = vi.spyOn(Element.prototype, 'animate').mockImplementation(function (
		this: Element,
		keyframes,
		options
	) {
		const animation = Reflect.apply(nativeAnimate, this, [keyframes, options]) as Animation;
		const frames = (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
		if (
			this.matches('[data-slot="row"]') &&
			root.contains(this) &&
			frames.some((frame) => frame.transform !== undefined)
		) {
			animation.pause();
			animations.push(animation);
		}
		return animation;
	});
	return {
		count: () => animations.length,
		restore: () => {
			for (const animation of animations) animation.cancel();
			spy.mockRestore();
		}
	};
}

async function begin(target: HTMLElement): Promise<HTMLElement> {
	const sortable = root(target);
	await userEvent.click(nextAction(sortable));
	await expect.poll(() => sortable.dataset.state).toBe('pending');
	return sortable;
}

function order(target: HTMLElement): string | null {
	return target.querySelector('[data-testid="sortable-layout-order"]')?.textContent ?? null;
}

function waitForWidth(root: HTMLElement, maximum: number): Promise<void> {
	return new Promise<void>((resolve) => {
		const observer = new ResizeObserver((entries) => {
			if (
				entries.some(
					(entry) => entry.target === root && root.getBoundingClientRect().width <= maximum
				)
			) {
				observer.disconnect();
				resolve();
			}
		});
		cleanup.push(() => observer.disconnect());
		observer.observe(root);
	});
}

function waitForScroll(root: HTMLElement): Promise<void> {
	return new Promise<void>((resolve) => {
		const listener = (): void => resolve();
		root.addEventListener('scroll', listener, { once: true });
		cleanup.push(() => root.removeEventListener('scroll', listener));
	});
}

describe('ZSortable async layout motion', () => {
	it('animates a same-batch owner echo and acceptance', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(SortableLayoutMotionFixture, { target });
		const sortable = root(target);
		const motions = recordRowMotions(sortable);
		try {
			await begin(target);
			app.echoAndResolve();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			expect(motions.count()).toBeGreaterThan(0);
		} finally {
			motions.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('does not animate a previously presented early owner echo', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(SortableLayoutMotionFixture, { target });
		const sortable = root(target);
		const motions = recordRowMotions(sortable);
		try {
			await begin(target);
			app.echo();
			await tick();
			expect(order(target)).toBe(
				'row-2,row-1,row-3,row-4,row-5,row-6,row-7,row-8,row-9,row-10,row-11,row-12'
			);
			app.resolve(true);
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			expect(motions.count()).toBe(0);
		} finally {
			motions.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('skips a pending animation after a real container resize', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(SortableLayoutMotionFixture, { target });
		const sortable = root(target);
		const motions = recordRowMotions(sortable);
		try {
			await begin(target);
			const width = sortable.getBoundingClientRect().width;
			const resized = waitForWidth(sortable, 460);
			app.resize(460);
			await tick();
			expect(sortable.getBoundingClientRect().width).toBeLessThan(width);
			await resized;
			app.echoAndResolve();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			expect(motions.count()).toBe(0);
		} finally {
			motions.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('skips a pending animation after scrolling its real overflow root', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(SortableLayoutMotionFixture, { target });
		const sortable = root(target);
		const motions = recordRowMotions(sortable);
		try {
			await begin(target);
			const before = sortable.scrollTop;
			const scrolled = waitForScroll(sortable);
			sortable.scrollTop = 80;
			await scrolled;
			expect(sortable.scrollTop).toBeGreaterThan(before);
			app.echoAndResolve();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			expect(motions.count()).toBe(0);
		} finally {
			motions.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('cleans rejected and cancelled pending captures before the next accepted move', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(SortableLayoutMotionFixture, { target });
		const sortable = root(target);
		const motions = recordRowMotions(sortable);
		try {
			await begin(target);
			app.resolve(false);
			await expect.poll(() => app.lastEnd()?.result).toBe('rejected');

			await begin(target);
			target.querySelector<HTMLButtonElement>('[data-slot="cancel"]')!.click();
			await expect.poll(() => app.lastEnd()?.result).toBe('cancelled');

			await begin(target);
			app.echoAndResolve();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			expect(motions.count()).toBeGreaterThan(0);
		} finally {
			motions.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('does not create row motion when the owner has reduced motion enabled', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(SortableLayoutMotionFixture, { target });
		const sortable = root(target);
		const motions = recordRowMotions(sortable);
		try {
			app.setReduced(true);
			await tick();
			await begin(target);
			app.echoAndResolve();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			expect(motions.count()).toBe(0);
		} finally {
			motions.restore();
			await unmount(app);
			target.remove();
		}
	});
});
