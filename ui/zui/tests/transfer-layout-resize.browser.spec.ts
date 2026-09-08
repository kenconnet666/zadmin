import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import TransferLayoutResizeFixture from './TransferLayoutResizeFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

function root(target: HTMLElement): HTMLElement {
	return target.querySelector<HTMLElement>('[data-testid="transfer-layout-resize"]')!;
}

function list(root: HTMLElement, label: string): HTMLElement {
	return root.querySelector<HTMLElement>(`[role="listbox"][aria-label="${label}"]`)!;
}

function option(listbox: HTMLElement, label: string): HTMLElement {
	return [...listbox.querySelectorAll<HTMLElement>('[role="option"]')].find(
		(candidate) => candidate.textContent?.trim() === label
	)!;
}

function observeRootResize(root: HTMLElement): {
	readonly deliveries: () => number;
	disconnect(): void;
} {
	let rootDeliveries = 0;
	const observer = new ResizeObserver((entries) => {
		if (entries.some((entry) => entry.target === root)) rootDeliveries += 1;
	});
	observer.observe(root);
	return {
		deliveries: () => rootDeliveries,
		disconnect: () => observer.disconnect()
	};
}

function recordTransformMotions(scope: HTMLElement): {
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
			scope.contains(this) &&
			this.matches('[role="option"]') &&
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

async function beginRequest(transfer: HTMLElement): Promise<void> {
	await userEvent.click(option(list(transfer, 'Resize source'), 'Alpha'));
	transfer.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')!.click();
	await expect.poll(() => transfer.dataset.state).toBe('pending');
}

describe('ZTransfer layout motion during an async container resize', () => {
	it('keeps normal pending acceptance animated after ResizeObserver establishes its initial baseline', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferLayoutResizeFixture, { target });
		const transfer = root(target);
		const observer = observeRootResize(transfer);
		const motions = recordTransformMotions(transfer);
		try {
			await beginRequest(transfer);
			await expect.poll(() => observer.deliveries()).toBeGreaterThan(0);
			app.acceptRequest();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			await tick();
			expect(motions.count()).toBeGreaterThan(0);
		} finally {
			motions.restore();
			observer.disconnect();
			await unmount(app);
			target.remove();
		}
	});

	it('accepts an owner echo but skips FLIP after a real container resize observer delivery', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const app = mount(TransferLayoutResizeFixture, { target });
		const transfer = root(target);
		const observer = observeRootResize(transfer);
		const motions = recordTransformMotions(transfer);
		try {
			await beginRequest(transfer);
			await expect.poll(() => observer.deliveries()).toBeGreaterThan(0);
			const deliveriesBeforeResize = observer.deliveries();
			const widthBeforeResize = transfer.getBoundingClientRect().width;
			app.resizeContainer(600);
			await tick();
			expect(transfer.getBoundingClientRect().width).toBeLessThan(widthBeforeResize);
			await expect.poll(() => observer.deliveries()).toBeGreaterThan(deliveriesBeforeResize);

			app.acceptRequest();
			await expect.poll(() => app.lastEnd()?.result).toBe('accepted');
			await tick();
			expect(motions.count()).toBe(0);
		} finally {
			motions.restore();
			observer.disconnect();
			await unmount(app);
			target.remove();
		}
	});
});
