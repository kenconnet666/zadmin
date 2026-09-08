import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { tick } from 'svelte';

import { mount, unmount } from './browser-lifecycle.js';
import SplitterFixture from './SplitterFixture.svelte';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1280, 900);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function host(): HTMLDivElement {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

function mainParts(target: HTMLElement) {
	const root = target.querySelector<HTMLElement>('[data-testid="splitter-main"]')!;
	return {
		handles: [...root.querySelectorAll<HTMLElement>(':scope > [data-slot="handle"]')],
		panels: [...root.querySelectorAll<HTMLElement>(':scope > [data-slot="panel"]')],
		root
	};
}

describe('ZSplitter production contract', () => {
	it('allocates px, percent and rem against real content geometry and nests an independent vertical splitter', async () => {
		// @zui-visual ZSplitter mixed-unit panel geometry, five-size handle and nested axes
		const target = host();
		const component = mount(SplitterFixture, { target });
		await tick();
		const { handles, panels, root } = mainParts(target);
		await expect.poll(() => panels[0].getBoundingClientRect().width).toBeCloseTo(240, 0);
		expect(root.dataset.measured).toBe('true');
		expect(root.getBoundingClientRect().width).toBe(900);
		expect(handles).toHaveLength(2);
		expect(handles[0].tabIndex).toBe(0);
		expect(handles[0].getAttribute('role')).toBe('separator');
		expect(handles[0].getAttribute('aria-controls')).toBe(panels[0].id);
		expect(handles[0].getAttribute('aria-label')).toBe('Project files');
		expect(handles[0].getAttribute('aria-orientation')).toBe('vertical');
		expect(Number(handles[0].getAttribute('aria-valuenow'))).toBeGreaterThan(0);
		expect(panels.reduce((sum, entry) => sum + entry.getBoundingClientRect().width, 0)).toBeCloseTo(
			900 - handles.reduce((sum, entry) => sum + entry.getBoundingClientRect().width, 0),
			0
		);
		const nested = root.querySelector<HTMLElement>('[data-testid="splitter-nested"]')!;
		expect(nested.dataset.orientation).toBe('vertical');
		const nestedHandle = nested.querySelector<HTMLElement>('[data-slot="handle"]')!;
		expect(nestedHandle.getAttribute('aria-orientation')).toBe('horizontal');
		const nestedPanels = [...nested.querySelectorAll<HTMLElement>(':scope > [data-slot="panel"]')];
		const initialNestedHeight = nestedPanels[0]!.getBoundingClientRect().height;
		await userEvent.click(nestedHandle);
		await userEvent.keyboard('{ArrowDown}');
		await tick();
		expect(nestedPanels[0]!.getBoundingClientRect().height).toBeGreaterThan(initialNestedHeight);
		await unmount(component);
		target.remove();
	});

	it('supports keyboard steps, Home/End and collapse/restore while preserving declared units', async () => {
		const target = host();
		const component = mount(SplitterFixture, { target });
		await tick();
		await expect
			.poll(() => mainParts(target).panels[0].getBoundingClientRect().width)
			.toBeCloseTo(240, 0);
		const { handles, panels } = mainParts(target);
		const output = target.querySelector<HTMLOutputElement>('[data-testid="splitter-events"]')!;
		await userEvent.click(handles[0]);
		expect(document.activeElement).toBe(handles[0]);
		const startCount = Number(output.dataset.starts);
		const endCount = Number(output.dataset.ends);
		const initial = panels[0].getBoundingClientRect().width;
		await userEvent.keyboard('{ArrowRight}');
		await tick();
		const afterArrow = panels[0].getBoundingClientRect().width;
		expect(afterArrow).toBeGreaterThan(initial);
		const arrowDelta = afterArrow - initial;
		expect(output.textContent?.split('|')[0]).toMatch(/px$/u);
		expect(output.textContent?.split('|')[1]).not.toMatch(/px|rem|%/u);
		expect(output.textContent?.split('|')[2]).toMatch(/rem$/u);
		expect(output.dataset.source).toBe('keyboard');
		expect(output.dataset.frozen).toBe('true');
		expect(Number(output.dataset.starts)).toBe(startCount + 1);
		expect(Number(output.dataset.ends)).toBe(endCount + 1);

		await userEvent.keyboard('{End}');
		await tick();
		const boundary = panels[0].getBoundingClientRect().width;
		expect(boundary).toBeGreaterThan(afterArrow);
		await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
		await tick();
		const remembered = panels[0].getBoundingClientRect().width;
		expect(boundary - remembered).toBeGreaterThan(arrowDelta);
		await userEvent.keyboard('{Home}');
		await tick();
		expect(panels[0].dataset.collapsed).toBe('true');
		await userEvent.keyboard('{Enter}');
		await tick();
		expect(panels[0].dataset.collapsed).toBeUndefined();
		expect(panels[0].getBoundingClientRect().width).toBeCloseTo(remembered, 0);
		await unmount(component);
		target.remove();
	});

	it('uses physical RTL geometry and accepts controlled reset and keyed reorder without corrective events', async () => {
		const target = host();
		const component = mount(SplitterFixture, { target });
		await tick();
		await expect
			.poll(() => mainParts(target).panels[0].getBoundingClientRect().width)
			.toBeCloseTo(240, 0);
		const rtl = target.querySelector<HTMLElement>('[data-testid="splitter-rtl"]')!;
		const rtlPanels = [...rtl.querySelectorAll<HTMLElement>(':scope > [data-slot="panel"]')];
		expect(getComputedStyle(rtl).direction).toBe('rtl');
		expect(rtlPanels[0].getBoundingClientRect().left).toBeGreaterThan(
			rtlPanels[1].getBoundingClientRect().left
		);
		const rtlHandle = rtl.querySelector<HTMLElement>(':scope > [data-slot="handle"]')!;
		const rtlInitial = rtlPanels[0].getBoundingClientRect().width;
		await userEvent.click(rtlHandle);
		await userEvent.keyboard('{ArrowRight}');
		await tick();
		expect(rtlPanels[0].getBoundingClientRect().width).toBeLessThan(rtlInitial);

		component.setControlled([40, 40, '10rem']);
		await tick();
		let parts = mainParts(target);
		expect(parts.panels[0].getBoundingClientRect().width).toBeGreaterThan(0);
		component.reorder();
		await tick();
		parts = mainParts(target);
		expect(parts.panels.map((entry) => entry.dataset.key)).toEqual([
			'editor',
			'sidebar',
			'inspector'
		]);
		component.resetThroughMember();
		await tick();
		expect(target.querySelector('[data-testid="splitter-events"]')?.textContent).toBe(
			'240px|60|12rem'
		);
		await unmount(component);
		target.remove();
	});

	it('captures pointer on the owner realm and reports cancellation with restored geometry', async () => {
		const target = host();
		const component = mount(SplitterFixture, { target });
		await tick();
		await expect
			.poll(() => mainParts(target).panels[0].getBoundingClientRect().width)
			.toBeCloseTo(240, 0);
		const { handles, panels } = mainParts(target);
		const output = target.querySelector<HTMLOutputElement>('[data-testid="splitter-events"]')!;
		const initial = panels[0].getBoundingClientRect().width;
		const rect = handles[0].getBoundingClientRect();
		handles[0].dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				button: 0,
				clientX: rect.left + rect.width / 2,
				isPrimary: true,
				pointerId: 41
			})
		);
		window.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: rect.left + rect.width / 2 + 80,
				isPrimary: true,
				pointerId: 41
			})
		);
		await tick();
		expect(panels[0].getBoundingClientRect().width).toBeGreaterThan(initial);
		window.dispatchEvent(
			new PointerEvent('pointercancel', { bubbles: true, isPrimary: true, pointerId: 41 })
		);
		await tick();
		expect(panels[0].getBoundingClientRect().width).toBeCloseTo(initial, 0);
		expect(output.dataset.cancels).toBe('1');
		expect(output.dataset.reason).toBe('pointer-cancel');
		expect(output.dataset.starts).toBe('1');
		await unmount(component);
		target.remove();
	});
});
