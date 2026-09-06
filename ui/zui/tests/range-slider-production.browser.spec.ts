import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { commands, page, userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import { resetForm } from './form-reset.js';
import RangeSliderProductionFixture from './RangeSliderProductionFixture.svelte';

let originalViewport: { height: number; width: number };
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

function inputs(root: ParentNode): readonly [HTMLInputElement, HTMLInputElement] {
	const elements = root.querySelectorAll<HTMLInputElement>('input[type="range"]');
	expect(elements).toHaveLength(2);
	return [elements[0]!, elements[1]!];
}

async function inputValue(input: HTMLInputElement, value: number): Promise<void> {
	input.value = String(value);
	input.dispatchEvent(new InputEvent('input', { bubbles: true }));
	await tick();
}
interface PointerAction {
	readonly coords?: { readonly x: number; readonly y: number };
	readonly keys?: string;
	readonly target?: HTMLElement;
}
async function pointer(actions: readonly PointerAction[]): Promise<void> {
	let target: HTMLElement | undefined;
	let captured = false;
	for (const action of actions) {
		target = action.target ?? target;
		if (!target) throw new Error('Pointer action requires an initial target.');
		Object.defineProperties(target, {
			hasPointerCapture: { configurable: true, value: () => captured },
			releasePointerCapture: { configurable: true, value: () => (captured = false) },
			setPointerCapture: { configurable: true, value: () => (captured = true) }
		});
		const type =
			action.keys === '[MouseLeft>]'
				? 'pointerdown'
				: action.keys === '[/MouseLeft]'
					? 'pointerup'
					: 'pointermove';
		target.dispatchEvent(
			new PointerEvent(type, {
				bubbles: true,
				button: 0,
				cancelable: true,
				clientX: action.coords?.x,
				clientY: action.coords?.y,
				pointerId: 1
			})
		);
		await tick();
	}
}

describe('ZRangeSlider production contract', () => {
	it('keeps two common-domain native owners, collision policies, FormData and reset coherent', async () => {
		const target = host();
		const component = mount(RangeSliderProductionFixture, { target });
		const rangeRoot = target.querySelector<HTMLElement>('[data-testid="range-main"]')!;
		const form = target.querySelector<HTMLFormElement>('[data-testid="range-form"]')!;
		const output = target.querySelector<HTMLOutputElement>('[data-testid="range-output"]')!;
		const [lower, upper] = inputs(rangeRoot);

		expect([lower.min, upper.min]).toEqual(['0', '0']);
		expect([lower.max, upper.max]).toEqual(['100', '100']);
		expect([lower.step, upper.step]).toEqual(['1', '1']);
		expect([lower.name, upper.name]).toEqual(['price', 'price']);
		expect([lower.ariaLabel, upper.ariaLabel]).toEqual(['Minimum price', 'Maximum price']);
		expect(Array.from(new FormData(form).getAll('price'))).toEqual(['20', '80']);

		await inputValue(lower, 78);
		expect(output.textContent).toBe('70:80:1:0:1:0');
		lower.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		expect(output.textContent).toBe('70:80:1:1:1:1');

		component.setCollision('push');
		await tick();
		await inputValue(lower, 75);
		expect([lower.valueAsNumber, upper.valueAsNumber]).toEqual([75, 85]);

		component.setCollision('swap');
		await tick();
		lower.focus();
		await inputValue(lower, 95);
		expect([lower.valueAsNumber, upper.valueAsNumber]).toEqual([85, 95]);
		await expect.poll(() => document.activeElement).toBe(upper);
		expect(Array.from(new FormData(form).getAll('price'))).toEqual(['85', '95']);

		await resetForm(form);
		await expect.poll(() => output.textContent?.startsWith('20:80:')).toBe(true);
		expect(Array.from(new FormData(form).getAll('price'))).toEqual(['20', '80']);
		await unmount(component);
		target.remove();
	});

	it('keeps pointer ownership through ties and always cleans capture without cancelled commits', async () => {
		const target = host();
		const component = mount(RangeSliderProductionFixture, { target });
		const overlap = target.querySelector<HTMLElement>('[data-testid="range-overlap"]')!;
		const [overlapLower, overlapUpper] = inputs(overlap);
		overlapUpper.focus();
		await commands.dragSliderTrack('[data-testid="range-overlap"] [data-slot="track"]', 0.5, 1.1);
		await expect.poll(() => overlap.dataset.value).toBe('50,100');
		expect(overlapLower.valueAsNumber).toBe(50);
		expect(document.activeElement).toBe(overlapUpper);

		const main = target.querySelector<HTMLElement>('[data-testid="range-main"]')!;
		expect(
			main.querySelector<HTMLElement>('[data-slot="track"]')?.getBoundingClientRect().height
		).toBeCloseTo(32, 0);
		const track = main.querySelector<HTMLElement>('[data-slot="track"]')!;
		const output = target.querySelector<HTMLOutputElement>('[data-testid="range-output"]')!;
		const rect = track.getBoundingClientRect();
		const trackY = rect.top + rect.height / 2;
		const initialCommits = Number(output.dataset.commits);
		await pointer([
			{
				keys: '[MouseLeft>]',
				target: track,
				coords: { x: rect.left + rect.width * 0.2, y: trackY }
			},
			{ target: track, coords: { x: rect.left + rect.width * 0.25, y: trackY } },
			{
				keys: '[/MouseLeft]',
				target: track,
				coords: { x: rect.left + rect.width * 0.25, y: trackY }
			}
		]);
		expect(Number(output.dataset.commits)).toBe(initialCommits + 1);
		expect(main.dataset.dragging).toBeUndefined();

		component.setCancelPointerUp(true);
		const commits = output.dataset.commits;
		await pointer([
			{
				keys: '[MouseLeft>]',
				target: track,
				coords: { x: rect.left + rect.width * 0.2, y: trackY }
			},
			{ target: track, coords: { x: rect.left + rect.width * 0.3, y: trackY } },
			{
				keys: '[/MouseLeft]',
				target: track,
				coords: { x: rect.left + rect.width * 0.3, y: trackY }
			}
		]);
		expect(main.dataset.dragging).toBeUndefined();
		expect(output.dataset.commits).toBe(commits);

		component.setCancelPointerUp(false);
		await pointer([
			{
				keys: '[MouseLeft>]',
				target: track,
				coords: { x: rect.left + rect.width * 0.3, y: trackY }
			}
		]);
		expect(main.dataset.dragging).toBe('true');
		track.dispatchEvent(new PointerEvent('lostpointercapture', { bubbles: true, pointerId: 1 }));
		await expect.poll(() => main.dataset.dragging).toBeUndefined();
		expect(output.dataset.commits).toBe(commits);
		await pointer([{ keys: '[/MouseLeft]' }]);
		await unmount(component);
		target.remove();
	});

	it('keeps independent keyboard focus and honors native fieldset disabled plus readonly', async () => {
		const target = host();
		const component = mount(RangeSliderProductionFixture, { target });
		const rangeRoot = target.querySelector<HTMLElement>('[data-testid="range-main"]')!;
		const [lower, upper] = inputs(rangeRoot);

		upper.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect([lower.valueAsNumber, upper.valueAsNumber]).toEqual([20, 81]);
		expect(document.activeElement).toBe(upper);
		lower.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect([lower.valueAsNumber, upper.valueAsNumber]).toEqual([21, 81]);
		expect(document.activeElement).toBe(lower);

		component.setReadonly(true);
		await tick();
		await userEvent.keyboard('{ArrowRight}');
		expect(lower.valueAsNumber).toBe(21);
		expect(lower.getAttribute('aria-readonly')).toBe('true');

		component.setReadonly(false);
		component.setFieldsetDisabled(true);
		await tick();
		expect(lower.matches(':disabled')).toBe(true);
		const blockedKey = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'ArrowRight'
		});
		lower.dispatchEvent(blockedKey);
		expect(blockedKey.defaultPrevented).toBe(false);
		expect(lower.valueAsNumber).toBe(21);
		await unmount(component);
		target.remove();
	});

	it('shares vertical, reversed, RTL, marks, value labels and five visual sizes', async () => {
		const target = host();
		const component = mount(RangeSliderProductionFixture, { target });
		const vertical = target.querySelector<HTMLInputElement>('[data-testid="slider-extended"]')!;
		expect(vertical.getAttribute('aria-orientation')).toBe('vertical');
		const verticalRoot = vertical.closest<HTMLElement>('[data-orientation="vertical"]')!;
		vertical.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, cancelable: true, pointerId: 71 })
		);
		expect(verticalRoot.dataset.dragging).toBe('true');
		vertical.dispatchEvent(
			new PointerEvent('lostpointercapture', { bubbles: true, pointerId: 71 })
		);
		expect(verticalRoot.dataset.dragging).toBeUndefined();
		vertical.focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(vertical.valueAsNumber).toBe(39);

		const instanceDirection = target.querySelector<HTMLInputElement>(
			'[data-testid="slider-instance-direction"]'
		)!;
		expect(instanceDirection.closest<HTMLElement>('[data-orientation]')?.dir).toBe('ltr');
		instanceDirection.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(instanceDirection.valueAsNumber).toBe(41);

		const rtlRoot = target.querySelector<HTMLElement>('[data-testid="range-rtl"]')!;
		const [rtlLower] = inputs(rtlRoot);
		rtlLower.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(rtlLower.valueAsNumber).toBe(9);

		const main = target.querySelector<HTMLElement>('[data-testid="range-main"]')!;
		expect(main.querySelectorAll('[data-slot="marks"] [data-slot="value-label"]')).toHaveLength(0);
		expect(main.querySelectorAll('[data-slot="marks"] > span')).toHaveLength(2);
		const track = main.querySelector<HTMLElement>('[data-slot="track"]')!.getBoundingClientRect();
		const markLabels = main.querySelectorAll<HTMLElement>(
			'[data-slot="marks"] [data-slot="mark-label"]'
		);
		expect(markLabels[0]!.getBoundingClientRect().left).toBeGreaterThanOrEqual(track.left - 1);
		expect(markLabels[1]!.getBoundingClientRect().right).toBeLessThanOrEqual(track.right + 1);
		expect(main.querySelectorAll('[data-slot="value-label"]')).toHaveLength(2);

		const verticalRange = target.querySelector<HTMLElement>('[data-testid="range-vertical"]')!;
		expect(
			verticalRange.querySelector<HTMLElement>('[data-slot="track"]')?.getBoundingClientRect().width
		).toBeCloseTo(32, 0);
		for (const input of inputs(verticalRange)) {
			expect(input.getAttribute('aria-orientation')).toBe('vertical');
			expect(input.style.writingMode).toBe('vertical-lr');
		}

		const thumbWidths = ['xsmall', 'small', 'medium', 'large', 'xlarge'].map((size) => {
			const root = target.querySelector<HTMLElement>(`[data-testid="range-${size}"]`)!;
			expect(root.dataset.size).toBe(size);
			return root.querySelector<HTMLElement>('[data-thumb="lower"]')!.getBoundingClientRect().width;
		});
		for (let index = 1; index < thumbWidths.length; index += 1) {
			expect(thumbWidths[index]).toBeGreaterThan(thumbWidths[index - 1]!);
		}
		await unmount(component);
		target.remove();
	});
});
