import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commands, page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import SortableTouchFixture from './SortableTouchFixture.svelte';

const initialOrder = [
	'row-1',
	'row-2',
	'row-3',
	'row-4',
	'row-5',
	'row-6',
	'row-7',
	'row-8',
	'row-9',
	'row-10',
	'row-11',
	'row-12'
].join(',');

let originalViewport: { height: number; width: number };
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(768, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function root(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function selector(
	scenario: 'accept' | 'disabled' | 'readonly' | 'reject',
	row: number,
	part: string
): string {
	return `[data-testid="sortable-touch-${scenario}"] [data-slot="row"]:nth-child(${row}) > [data-slot="${part}"]`;
}

function offsetTo(source: Element, target: Element): { dx: number; dy: number } {
	const from = source.getBoundingClientRect();
	const to = target.getBoundingClientRect();
	return {
		dx: to.left + to.width / 2 - (from.left + from.width / 2),
		dy: to.top + to.height / 2 - (from.top + from.height / 2)
	};
}

function row(sortable: HTMLElement, index: number): HTMLElement {
	return sortable.querySelector<HTMLElement>(`[data-slot="row"]:nth-child(${index})`)!;
}

function assertPointVisible(point: { x: number; y: number }, viewport: HTMLElement): void {
	const bounds = viewport.getBoundingClientRect();
	expect(point.x).toBeGreaterThan(bounds.left + 8);
	expect(point.x).toBeLessThan(bounds.right - 8);
	expect(point.y).toBeGreaterThan(bounds.top + 8);
	expect(point.y).toBeLessThan(bounds.bottom - 8);
	expect(point.x).toBeGreaterThan(0);
	expect(point.x).toBeLessThan(window.innerWidth);
	expect(point.y).toBeGreaterThan(0);
	expect(point.y).toBeLessThan(window.innerHeight);
}

function center(element: Element): { x: number; y: number } {
	const rect = element.getBoundingClientRect();
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

async function nextFrame(): Promise<void> {
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function visibleMove(
	scenario: 'accept' | 'disabled' | 'readonly' | 'reject',
	sourceIndex: number,
	targetIndex: number
): Promise<{ readonly move: { dx: number; dy: number } }> {
	const scroll = root('sortable-touch-scroll');
	const sortable = root(`sortable-touch-${scenario}`);
	const source = row(sortable, sourceIndex).querySelector<HTMLElement>('[data-slot="handle"]')!;
	const target = row(sortable, targetIndex);
	source.scrollIntoView({ block: 'center' });
	await nextFrame();
	assertPointVisible(center(source), scroll);
	assertPointVisible(center(target), scroll);
	return { move: offsetTo(source, target) };
}

describe('ZSortable Chromium CDP touch probe', () => {
	it('lets a short vertical touch from row content scroll without starting a reorder', async () => {
		await render(SortableTouchFixture);
		const scroll = root('sortable-touch-scroll');
		const before = scroll.scrollTop;
		const content = root('sortable-touch-accept').querySelector<HTMLElement>(
			'[data-slot="row"]:nth-child(4) > [data-slot="content"]'
		)!;
		const start = center(content);
		assertPointVisible(start, scroll);
		assertPointVisible({ x: start.x, y: start.y - 96 }, scroll);
		const checkpoints = await commands.touchSequence(
			selector('accept', 4, 'content'),
			[
				{ dx: 0, dy: -18 },
				{ dx: 0, dy: -78 }
			],
			'end'
		);

		expect(checkpoints.every((entry) => entry.dragging.length === 0)).toBe(true);
		expect(scroll.scrollTop, JSON.stringify(checkpoints)).toBeGreaterThan(before);
		expect(root('sortable-touch-order').textContent).toBe(initialOrder);
		expect(root('sortable-touch-ends').textContent).toBe('');
		expect(root('sortable-touch-stream').textContent).toContain('pointerdown:true');
	});

	it('moves a row only after a touch hold on its dedicated grip', async () => {
		await render(SortableTouchFixture);
		const { move } = await visibleMove('accept', 1, 2);
		const checkpoints = await commands.touchSequence(
			selector('accept', 1, 'handle'),
			[
				{ dx: 0, dy: 8 },
				{ dx: move.dx, dy: move.dy - 8 }
			],
			'end',
			300
		);

		expect(checkpoints.find((entry) => entry.phase === 'hold')?.dragging).toContain(
			'Sortable row 1'
		);
		await expect
			.poll(() => root('sortable-touch-order').textContent)
			.toBe('row-2,row-1,row-3,row-4,row-5,row-6,row-7,row-8,row-9,row-10,row-11,row-12');
		expect(root('sortable-touch-ends').textContent).toBe('accepted');
	});

	it('cancels an activated grip hold without requesting a reorder', async () => {
		await render(SortableTouchFixture);
		const { move } = await visibleMove('accept', 1, 2);
		const checkpoints = await commands.touchSequence(
			selector('accept', 1, 'handle'),
			[
				{ dx: 0, dy: 8 },
				{ dx: move.dx, dy: move.dy - 8 }
			],
			'cancel',
			300
		);

		expect(checkpoints.find((entry) => entry.phase === 'hold')?.dragging).toContain(
			'Sortable row 1'
		);
		expect(checkpoints.at(-1)?.dragging).toEqual([]);
		await tick();
		expect(root('sortable-touch-order').textContent).toBe(initialOrder);
		expect(root('sortable-touch-ends').textContent).toBe('');
	});

	it('preserves order for disabled controls', async () => {
		await commands.isolateTouchBrowserHistory();
		await render(SortableTouchFixture, { scenario: 'disabled' });
		const { move } = await visibleMove('disabled', 1, 2);
		const disabled = await commands.touchSequence(
			selector('disabled', 1, 'handle'),
			[
				{ dx: 0, dy: 8 },
				{ dx: move.dx, dy: move.dy - 8 }
			],
			'end',
			300
		);
		expect(disabled.every((entry) => entry.dragging.length === 0)).toBe(true);
		expect(root('sortable-touch-order').textContent).toBe(initialOrder);
		expect(root('sortable-touch-ends').textContent).toBe('');
	});

	it('preserves order when an existing item is disabled', async () => {
		await commands.isolateTouchBrowserHistory();
		await render(SortableTouchFixture);
		const { move } = await visibleMove('accept', 6, 7);
		const locked = await commands.touchSequence(
			selector('accept', 6, 'handle'),
			[
				{ dx: 0, dy: 8 },
				{ dx: move.dx, dy: move.dy - 8 }
			],
			'end',
			300
		);
		expect(locked.every((entry) => entry.dragging.length === 0)).toBe(true);
		expect(root('sortable-touch-order').textContent).toBe(initialOrder);
		expect(root('sortable-touch-ends').textContent).toBe('');
	});

	it('preserves order for readonly controls', async () => {
		await commands.isolateTouchBrowserHistory();
		await render(SortableTouchFixture, { scenario: 'readonly' });
		const { move } = await visibleMove('readonly', 1, 2);
		const readonly = await commands.touchSequence(
			selector('readonly', 1, 'handle'),
			[
				{ dx: 0, dy: 8 },
				{ dx: move.dx, dy: move.dy - 8 }
			],
			'end',
			300
		);
		expect(readonly.every((entry) => entry.dragging.length === 0)).toBe(true);
		expect(root('sortable-touch-order').textContent).toBe(initialOrder);
		expect(root('sortable-touch-ends').textContent).toBe('');
	});

	it('preserves order when the owner rejects a completed touch drag', async () => {
		await render(SortableTouchFixture, { scenario: 'reject' });
		const { move } = await visibleMove('reject', 1, 2);
		const rejected = await commands.touchSequence(
			selector('reject', 1, 'handle'),
			[
				{ dx: 0, dy: 8 },
				{ dx: move.dx, dy: move.dy - 8 }
			],
			'end',
			300
		);
		expect(rejected.find((entry) => entry.phase === 'hold')?.dragging).toContain('Sortable row 1');
		await expect.poll(() => root('sortable-touch-ends').textContent).toBe('rejected');
		expect(root('sortable-touch-order').textContent).toBe(initialOrder);
	});
});
