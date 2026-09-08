import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commands, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TransferTouchFixture from './TransferTouchFixture.svelte';

const modes = [
	{ label: 'normal', virtual: false },
	{ label: 'virtual', virtual: true }
] as const;

let originalViewport: { height: number; width: number };
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function root(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function offsets(source: Element, target: Element): { dx: number; dy: number } {
	const from = source.getBoundingClientRect();
	const to = target.getBoundingClientRect();
	return {
		dx: to.left + to.width / 2 - (from.left + from.width / 2),
		dy: to.top + to.height / 2 - (from.top + from.height / 2)
	};
}

function assertVisibleInViewport(source: Element, viewport: HTMLElement): void {
	const point = source.getBoundingClientRect();
	const bounds = viewport.getBoundingClientRect();
	expect(point.left + point.width / 2).toBeGreaterThan(bounds.left);
	expect(point.right - point.width / 2).toBeLessThan(bounds.right);
	expect(point.top + point.height / 2).toBeGreaterThan(bounds.top);
	expect(point.bottom - point.height / 2).toBeLessThan(bounds.bottom);
}

function selectorFor(element: HTMLElement): string {
	if (!element.id) throw new Error('Touch source is missing an id.');
	return `#${CSS.escape(element.id)}`;
}

function visibleOption(listbox: HTMLElement, label = 'Touch item 3'): HTMLElement {
	const bounds = listbox.getBoundingClientRect();
	const candidates = [...listbox.querySelectorAll<HTMLElement>('[role="option"]')];
	const named = candidates.find((candidate) => candidate.textContent?.trim() === label);
	if (!named) throw new Error(`Missing touch item: ${label}`);
	const rect = named.getBoundingClientRect();
	expect(rect.top).toBeGreaterThan(bounds.top + 8);
	expect(rect.bottom).toBeLessThan(bounds.bottom - 8);
	return named;
}

describe('ZTransfer Chromium CDP touch probe', () => {
	it.each(modes)(
		'keeps taps, vertical touch scrolling and touchcancel from moving an item ($label)',
		async ({ virtual }) => {
			await render(TransferTouchFixture, { virtual });
			const scroll = root('transfer-touch-scroll');
			const transfer = root('transfer-touch-immediate');
			const sourceList = transfer.querySelector<HTMLElement>('[aria-label="Touch source"]')!;
			const source = visibleOption(sourceList);
			const output = root('transfer-touch-immediate-output');
			const stream = root('transfer-touch-stream');
			assertVisibleInViewport(source, scroll);

			const immediateSource = selectorFor(source);
			await commands.touchSequence(immediateSource, [], 'end');
			await tick();
			expect(output.textContent).toBe('item-24|0');
			expect(document.activeElement).toBe(sourceList);
			expect(stream.textContent).toContain('pointerdown:true:option');

			await commands.touchSequence(immediateSource, [{ dx: 32, dy: 0 }], 'cancel');
			await tick();
			expect(output.textContent).toBe('item-24|0');
			expect(stream.textContent).toContain('touchcancel:true:touch');

			const scrollBefore = sourceList.scrollTop;
			const scrollCheckpoints = await commands.touchSequence(
				immediateSource,
				[
					{ dx: 0, dy: -18 },
					{ dx: 0, dy: -78 }
				],
				'end'
			);
			await tick();
			expect(output.textContent).toBe('item-24|0');
			expect(source.isConnected).toBe(true);
			expect(scrollCheckpoints.every((entry) => entry.dragging.length === 0)).toBe(true);
			expect(sourceList.scrollTop, JSON.stringify(scrollCheckpoints)).toBeGreaterThan(scrollBefore);
			expect(stream.textContent).toContain('pointermove:true:option');
		}
	);

	it.each(modes)(
		'moves an item across horizontally visible panes after a touch hold ($label)',
		async ({ virtual }) => {
			await render(TransferTouchFixture, { virtual });
			const immediate = root('transfer-touch-immediate');
			const source = visibleOption(
				immediate.querySelector<HTMLElement>('[aria-label="Touch source"]')!
			);
			const target = immediate.querySelector<HTMLElement>('[aria-label="Touch target"]')!;
			assertVisibleInViewport(source, root('transfer-touch-scroll'));
			assertVisibleInViewport(target, root('transfer-touch-scroll'));
			expect(target.getBoundingClientRect().left).toBeGreaterThan(
				source.getBoundingClientRect().right
			);
			const move = offsets(source, target);

			const checkpoints = await commands.touchSequence(
				selectorFor(source),
				[
					{ dx: 8, dy: 0 },
					{ dx: move.dx - 8, dy: move.dy }
				],
				'end',
				300
			);
			expect(checkpoints.find((entry) => entry.phase === 'hold')?.dragging).toContain(
				'Touch item 3'
			);
			await expect
				.poll(() => root('transfer-touch-immediate-output').textContent)
				// Loaded keys follow items order; Transfer does not append by drop chronology.
				.toBe('item-3,item-24|1');
		}
	);

	it.each(modes)(
		'cancels an activated touch hold without moving membership ($label)',
		async ({ virtual }) => {
			await render(TransferTouchFixture, { virtual });
			const sourceList = root('transfer-touch-immediate').querySelector<HTMLElement>(
				'[aria-label="Touch source"]'
			)!;
			const checkpoints = await commands.touchSequence(
				selectorFor(visibleOption(sourceList)),
				[{ dx: 32, dy: 0 }],
				'cancel',
				300
			);
			expect(checkpoints.find((entry) => entry.phase === 'hold')?.dragging).toContain(
				'Touch item 3'
			);
			expect(checkpoints.at(-1)?.dragging).toEqual([]);
			await tick();
			expect(root('transfer-touch-immediate-output').textContent).toBe('item-24|0');
		}
	);

	it.each(modes)(
		'keeps readonly Transfer unchanged across the same cross-pane touch trajectory ($label)',
		async ({ virtual }) => {
			// Inactive controls intentionally leave native gestures alone. Isolate the runner's
			// initial about:blank history, not the component input; active cases keep real history.
			await commands.isolateTouchBrowserHistory();
			await render(TransferTouchFixture, { scenario: 'readonly', virtual });
			const readonly = root('transfer-touch-readonly');
			const readonlySource = visibleOption(
				readonly.querySelector<HTMLElement>('[aria-label="Readonly touch source"]')!
			);
			const readonlyTarget = readonly.querySelector<HTMLElement>(
				'[aria-label="Readonly touch target"]'
			)!;
			const readonlyMove = offsets(readonlySource, readonlyTarget);
			expect(readonlyTarget.getBoundingClientRect().left).toBeGreaterThan(
				readonlySource.getBoundingClientRect().right
			);

			const checkpoints = await commands.touchSequence(
				selectorFor(readonlySource),
				[
					{ dx: 8, dy: 0 },
					{ dx: readonlyMove.dx - 8, dy: readonlyMove.dy }
				],
				'end',
				300
			);
			expect(checkpoints.every((entry) => entry.dragging.length === 0)).toBe(true);
			await tick();
			expect(root('transfer-touch-readonly-output').textContent).toBe('item-24');
		}
	);

	it.each(modes)(
		'keeps disabled Transfer unchanged across the same cross-pane touch trajectory ($label)',
		async ({ virtual }) => {
			await commands.isolateTouchBrowserHistory();
			await render(TransferTouchFixture, { scenario: 'disabled', virtual });
			const disabled = root('transfer-touch-disabled');
			const disabledSource = visibleOption(
				disabled.querySelector<HTMLElement>('[aria-label="Disabled touch source"]')!
			);
			const disabledTarget = disabled.querySelector<HTMLElement>(
				'[aria-label="Disabled touch target"]'
			)!;
			const disabledMove = offsets(disabledSource, disabledTarget);
			expect(disabledTarget.getBoundingClientRect().left).toBeGreaterThan(
				disabledSource.getBoundingClientRect().right
			);
			const checkpoints = await commands.touchSequence(
				selectorFor(disabledSource),
				[
					{ dx: 8, dy: 0 },
					{ dx: disabledMove.dx - 8, dy: disabledMove.dy }
				],
				'end',
				300
			);
			expect(checkpoints.every((entry) => entry.dragging.length === 0)).toBe(true);
			await tick();
			expect(root('transfer-touch-disabled-output').textContent).toBe('item-24');
		}
	);
});
