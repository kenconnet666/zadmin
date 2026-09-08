import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commands, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TransferTouchFixture from './TransferTouchFixture.svelte';

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
	if (named) {
		const rect = named.getBoundingClientRect();
		if (rect.top > bounds.top + 8 && rect.bottom < bounds.bottom - 8) return named;
	}
	const middle = candidates.find((candidate) => {
		const rect = candidate.getBoundingClientRect();
		return rect.top > bounds.top + 24 && rect.bottom < bounds.bottom - 24;
	});
	return (
		middle ??
		candidates.find((candidate) => candidate.getBoundingClientRect().bottom <= bounds.bottom)!
	);
}

describe('ZTransfer Chromium CDP touch probe', () => {
	it('keeps taps, vertical touch scrolling and touchcancel from moving an item', async () => {
		await render(TransferTouchFixture);
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
		expect(stream.textContent).toContain('pointerdown:true:option');

		await commands.touchSequence(immediateSource, [{ dx: 32, dy: 0 }], 'cancel');
		await tick();
		expect(output.textContent).toBe('item-24|0');
		expect(stream.textContent).toContain('touchcancel:true:touch');

		const scrollBefore = sourceList.scrollTop;
		await commands.touchSequence(
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
		expect(sourceList.scrollTop).toBeGreaterThan(scrollBefore);
		expect(stream.textContent).toContain('pointermove:true:option');
	});

	it('moves an item across horizontally visible panes after touch activation', async () => {
		await render(TransferTouchFixture);
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

		await commands.touchSequence(
			selectorFor(source),
			[
				{ dx: 8, dy: 0 },
				{ dx: move.dx - 8, dy: move.dy }
			],
			'end'
		);
		await expect
			.poll(() => root('transfer-touch-immediate-output').textContent)
			// Loaded keys follow items order; Transfer does not append by drop chronology.
			.toBe('item-3,item-24|1');
	});

	it('keeps readonly Transfer unchanged across the same cross-pane touch trajectory', async () => {
		await render(TransferTouchFixture, { scenario: 'readonly' });
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

		await commands.touchSequence(
			selectorFor(readonlySource),
			[
				{ dx: 8, dy: 0 },
				{ dx: readonlyMove.dx - 8, dy: readonlyMove.dy }
			],
			'end'
		);
		await tick();
		expect(root('transfer-touch-readonly-output').textContent).toBe('item-24');
	});

	it('keeps disabled Transfer unchanged across the same cross-pane touch trajectory', async () => {
		await render(TransferTouchFixture, { scenario: 'disabled' });
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
		await commands.touchSequence(
			selectorFor(disabledSource),
			[
				{ dx: 8, dy: 0 },
				{ dx: disabledMove.dx - 8, dy: disabledMove.dy }
			],
			'end'
		);
		await tick();
		expect(root('transfer-touch-disabled-output').textContent).toBe('item-24');
	});
});
