import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { commands, page } from 'vitest/browser';

import TransferDragDropFixture from './TransferDragDropFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

let originalViewport: { height: number; width: number };
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function transfer(target: HTMLElement, testId: string): HTMLElement {
	return target.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function list(root: HTMLElement, label: string): HTMLElement {
	return root.querySelector<HTMLElement>(`[role="listbox"][aria-label="${label}"]`)!;
}

function option(listbox: HTMLElement, label: string): HTMLElement {
	return [...listbox.querySelectorAll<HTMLElement>('[role="option"]')].find(
		(candidate) => candidate.textContent?.trim() === label
	)!;
}

function expectHorizontalPanes(root: HTMLElement, sourceLabel: string, targetLabel: string): void {
	const source = list(root, sourceLabel).closest<HTMLElement>('[data-slot="panel"]')!;
	const target = list(root, targetLabel).closest<HTMLElement>('[data-slot="panel"]')!;
	const sourceRect = source.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	expect(targetRect.left).toBeGreaterThan(sourceRect.right);
	expect(Math.abs(targetRect.top - sourceRect.top)).toBeLessThan(2);
}

function transformAnimations(element: Element): Animation[] {
	return element
		.getAnimations()
		.filter((animation) =>
			(animation.effect as KeyframeEffect | null)
				?.getKeyframes()
				.some((frame) => frame.transform !== undefined)
		);
}

interface RecordedMotion {
	readonly animation: Animation;
	readonly frames: readonly ComputedKeyframe[];
	readonly target: Element;
	readonly timing: ComputedEffectTiming;
}

function recordTargetMotion(label: string): {
	readonly motions: RecordedMotion[];
	restore(): void;
} {
	const motions: RecordedMotion[] = [];
	const nativeAnimate = Element.prototype.animate;
	const spy = vi.spyOn(Element.prototype, 'animate').mockImplementation(function (
		this: Element,
		keyframes,
		options
	) {
		const animation = Reflect.apply(nativeAnimate, this, [keyframes, options]) as Animation;
		const effect = animation.effect as KeyframeEffect | null;
		const frames = effect?.getKeyframes() ?? [];
		if (
			this.closest(`[role="listbox"][aria-label="${label}"]`) &&
			frames.some((frame) => frame.transform !== undefined)
		) {
			animation.pause();
			motions.push({ animation, frames, target: this, timing: effect!.getComputedTiming() });
		}
		return animation;
	});
	return {
		motions,
		restore() {
			for (const { animation } of motions) animation.cancel();
			spy.mockRestore();
		}
	};
}

async function beginRequest(target: HTMLElement): Promise<HTMLElement> {
	const root = transfer(target, 'transfer-drag-request');
	expectHorizontalPanes(root, 'Request source', 'Request target');
	await commands.dragElements(
		'[data-testid="transfer-drag-request"] [aria-label="Request source"] [role="option"]:nth-child(1)',
		'[data-testid="transfer-drag-request"] [aria-label="Request target"]'
	);
	await expect.poll(() => root.dataset.state).toBe('pending');
	return root;
}

describe('ZTransfer cross-pane layout motion', () => {
	it('animates the replacement target node and cancels owned WAAPI when motion becomes reduced', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const recorded = recordTargetMotion('Pointer target');
		const app = mount(TransferDragDropFixture, {
			target,
			props: { scenario: 'immediate', virtual: true }
		});
		try {
			const root = transfer(target, 'transfer-drag-immediate');
			expectHorizontalPanes(root, 'Pointer source', 'Pointer target');
			await commands.dragElements(
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer source"] [role="option"]:nth-child(1)',
				'[data-testid="transfer-drag-immediate"] [aria-label="Pointer target"]'
			);
			const moved = option(list(root, 'Pointer target'), 'Number one');
			await expect.poll(() => recorded.motions.some(({ target }) => target === moved)).toBe(true);
			const motion = recorded.motions.find(({ target }) => target === moved)!;
			expect(motion.target).toBe(moved);
			expect(motion.timing.duration).toBe(1_000);
			expect(motion.timing.easing).toBe('linear');
			const firstFrame = motion.frames[0]!;
			const transform = new DOMMatrixReadOnly(String(firstFrame.transform));
			expect(Math.abs(transform.m41)).toBeGreaterThan(100);

			app.setReduced(true);
			await tick();
			expect(motion.animation.playState).toBe('idle');
		} finally {
			recorded.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('animates same-batch owner acceptance but not an independently presented early echo', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const recorded = recordTargetMotion('Request target');
		let app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
		try {
			let root = await beginRequest(target);
			app.echoAndResolveRequest();
			await expect.poll(() => app.lastRequestEnd()?.result).toBe('accepted');
			let moved = option(list(root, 'Request target'), 'Number one');
			await expect.poll(() => recorded.motions.some(({ target }) => target === moved)).toBe(true);
			const acceptedMotion = recorded.motions.find(({ target }) => target === moved)!;
			expect(acceptedMotion.timing.duration).toBe(1_000);
			expect(acceptedMotion.timing.easing).toBe('linear');
			expect(moved.hasAttribute('style')).toBe(false);
			const acceptedMotionCount = recorded.motions.length;
			await unmount(app);

			target.replaceChildren();
			app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
			root = await beginRequest(target);
			app.echoRequest();
			await tick();
			moved = option(list(root, 'Request target'), 'Number one');
			expect(transformAnimations(moved)).toHaveLength(0);
			target.querySelector<HTMLButtonElement>('[data-testid="clone-transfer-snapshot"]')!.focus();
			app.resolveOwnerRequest(true);
			await expect.poll(() => app.lastRequestEnd()?.result).toBe('accepted');
			await tick();
			expect(recorded.motions).toHaveLength(acceptedMotionCount);
			await unmount(app);

			target.replaceChildren();
			app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
			root = await beginRequest(target);
			app.echoRequest();
			app.resolveOwnerRequest(false);
			await expect.poll(() => app.lastRequestEnd()?.result).toBe('rejected');
			moved = option(list(root, 'Request target'), 'Number one');
			await tick();
			expect(recorded.motions).toHaveLength(acceptedMotionCount);
		} finally {
			recorded.restore();
			await unmount(app);
			target.remove();
		}
	});

	it('does not animate accepted membership from geometry invalidated by scrolling', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferDragDropFixture, { target, props: { scenario: 'request' } });
		try {
			const root = await beginRequest(target);
			list(root, 'Request source').dispatchEvent(new Event('scroll'));
			app.echoAndResolveRequest();
			await expect.poll(() => app.lastRequestEnd()?.result).toBe('accepted');
			const moved = option(list(root, 'Request target'), 'Number one');
			await tick();
			expect(transformAnimations(moved)).toHaveLength(0);
		} finally {
			await unmount(app);
			target.remove();
		}
	});
});
