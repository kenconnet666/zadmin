import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import SizeVisualContractFixture from './SizeVisualContractFixture.svelte';

const sizes = [
	['small', 28, 12],
	['medium', 32, 14],
	['large', 40, 16]
] as const;

describe('size visual contracts for foundational controls', () => {
	// @zui-visual ZButton size geometry and typography
	it('keeps Button size geometry and typography distinct', () => {
		render(SizeVisualContractFixture);
		for (const [size, height, fontSize] of sizes) {
			const node = document.querySelector<HTMLButtonElement>(`[data-testid="button-${size}"]`)!;
			const style = getComputedStyle(node);
			expect(node.dataset.size).toBe(size);
			expect(node.getBoundingClientRect().height).toBe(height);
			expect(style.fontSize).toBe(`${fontSize}px`);
			expect(style.lineHeight).toBe(`${fontSize}px`);
		}
	});

	// @zui-visual ZInput size geometry and box sizing
	// @zui-visual ZTextarea size typography and box sizing
	it('keeps text controls border-box and size geometry', () => {
		render(SizeVisualContractFixture);
		for (const [size, height, fontSize] of sizes) {
			for (const kind of ['input', 'textarea'] as const) {
				const node = document.querySelector<HTMLElement>(`[data-testid="${kind}-${size}"]`)!;
				const style = getComputedStyle(node);
				expect(node.dataset.size).toBe(size);
				expect(style.boxSizing).toBe('border-box');
				expect(style.fontSize).toBe(`${fontSize}px`);
				if (kind === 'input') expect(node.getBoundingClientRect().height).toBe(height);
			}
		}
	});

	// @zui-visual ZCheckbox native size geometry
	// @zui-visual ZSwitch size geometry
	// @zui-visual ZSlider native size geometry
	it('keeps native control visual size mappings explicit', () => {
		render(SizeVisualContractFixture);
		const checkboxWidths: number[] = [];
		const switchWidths: number[] = [];
		const sliderHeights: number[] = [];
		for (const [size] of sizes) {
			const checkbox = document.querySelector<HTMLElement>(`[data-testid="checkbox-${size}"]`)!;
			const checkboxStyle = getComputedStyle(checkbox);
			expect(checkbox.dataset.size).toBe(size);
			expect(checkboxStyle.appearance).toBe('auto');
			checkboxWidths.push(checkbox.getBoundingClientRect().width);
			const switchControl = document.querySelector<HTMLElement>(`[data-testid="switch-${size}"]`)!;
			expect(switchControl.dataset.size).toBe(size);
			switchWidths.push(switchControl.getBoundingClientRect().width);
			const slider = document.querySelector<HTMLElement>(`[data-testid="slider-${size}"]`)!;
			expect(slider.dataset.size).toBe(size);
			sliderHeights.push(slider.getBoundingClientRect().height);
		}
		expect(checkboxWidths[0]).toBeLessThan(checkboxWidths[1]!);
		expect(checkboxWidths[1]).toBeLessThan(checkboxWidths[2]!);
		expect(switchWidths[0]).toBeLessThan(switchWidths[1]!);
		expect(switchWidths[1]).toBeLessThan(switchWidths[2]!);
		expect(sliderHeights[0]).toBeLessThan(sliderHeights[1]!);
		expect(sliderHeights[1]).toBeLessThan(sliderHeights[2]!);
	});

	// @zui-visual ZNumberField size geometry
	// @zui-visual ZPinInput size geometry
	it('keeps composite control size state and primary geometry', () => {
		render(SizeVisualContractFixture);
		for (const [size, height] of sizes) {
			for (const kind of ['number', 'pin'] as const) {
				const node = document.querySelector<HTMLElement>(`[data-testid="${kind}-${size}"]`)!;
				expect(node.dataset.size).toBe(size);
				expect(node.getBoundingClientRect().height).toBeGreaterThanOrEqual(height);
			}
		}
	});

	// @zui-visual ZTag size typography and geometry
	// @zui-visual ZBadge size typography and geometry
	it('keeps compact display sizes distinct', () => {
		render(SizeVisualContractFixture);
		const smallTag = document.querySelector<HTMLElement>('[data-testid="tag-small"]')!;
		const mediumTag = document.querySelector<HTMLElement>('[data-testid="tag-medium"]')!;
		expect(getComputedStyle(smallTag).fontSize).toBe('12px');
		expect(getComputedStyle(mediumTag).fontSize).toBe('14px');
		expect(smallTag.getBoundingClientRect().height).toBeLessThan(
			mediumTag.getBoundingClientRect().height
		);
		for (const [size, dimension] of [
			['small', 16],
			['medium', 20]
		] as const) {
			const badge = document.querySelector<HTMLElement>(`[data-testid="badge-${size}"]`)!;
			const indicator = badge.querySelector<HTMLElement>('[data-slot="indicator"]')!;
			expect(badge.dataset.size).toBe(size);
			expect(getComputedStyle(indicator).fontSize).toBe(size === 'small' ? '11px' : '12px');
			expect(indicator.getBoundingClientRect().width).toBe(dimension);
			expect(indicator.getBoundingClientRect().height).toBe(dimension);
		}
	});

	// @zui-visual ZAvatar size geometry
	// @zui-visual ZSpinner size geometry
	// @zui-visual ZIcon size geometry
	it('keeps avatars and indicators on their independent token scales', () => {
		render(SizeVisualContractFixture);
		for (const [size, avatarSize, indicatorSize, fontSize] of [
			['small', 32, 14, 12],
			['medium', 40, 16, 14],
			['large', 48, 20, 16]
		] as const) {
			const avatar = document.querySelector<HTMLElement>(`[data-testid="avatar-${size}"]`)!;
			expect(avatar.getBoundingClientRect().width).toBe(avatarSize);
			expect(avatar.getBoundingClientRect().height).toBe(avatarSize);
			for (const kind of ['spinner', 'icon']) {
				const indicator = document.querySelector<HTMLElement>(`[data-testid="${kind}-${size}"]`)!;
				expect(indicator.getBoundingClientRect().width).toBe(indicatorSize);
				expect(indicator.getBoundingClientRect().height).toBe(indicatorSize);
			}
			expect(getComputedStyle(avatar).fontSize).toBe(`${fontSize}px`);
		}
	});

	// @zui-visual ZText typography
	// @zui-visual ZHeading typography
	it('keeps typography size families separate from control heights', () => {
		render(SizeVisualContractFixture);
		for (const [size, , fontSize] of sizes) {
			const text = document.querySelector<HTMLElement>(`[data-testid="text-${size}"]`)!;
			const heading = document.querySelector<HTMLElement>(`[data-testid="heading-${size}"]`)!;
			expect(getComputedStyle(text).fontSize).toBe(`${fontSize}px`);
			expect(getComputedStyle(heading).fontSize).toBe(`${fontSize}px`);
		}
	});

	// @zui-visual ZContainer size max-width
	it('keeps surface size families mapped to max-width tokens', () => {
		render(SizeVisualContractFixture);
		for (const [size, expected] of [
			['small', '640px'],
			['medium', '1024px'],
			['large', '1280px']
		] as const) {
			const container = document.querySelector<HTMLElement>(`[data-testid="container-${size}"]`)!;
			expect(container.dataset.size).toBe(size);
			expect(getComputedStyle(container).maxWidth).toBe(expected);
		}
	});

	// @zui-visual ZForm size propagation geometry
	// @zui-visual ZFormField inherited size geometry
	// @zui-visual ZInputGroup size geometry
	it('propagates form-family sizes to the owned control', () => {
		render(SizeVisualContractFixture);
		const form = document.querySelector<HTMLElement>('[data-testid="form-large"]')!;
		const directInput = document.querySelector<HTMLInputElement>('[data-testid="form-input"]')!;
		const formFieldInput = document.querySelector<HTMLInputElement>(
			'[data-testid="form-field-input"]'
		)!;
		expect(form.dataset.size).toBe('large');
		// ZForm publishes size through ZFormField. Unowned direct controls intentionally keep
		// their own fallback instead of treating every descendant as an implicit form field.
		expect(directInput.dataset.size).toBe('medium');
		expect(directInput.getBoundingClientRect().height).toBe(32);
		expect(formFieldInput.dataset.size).toBe('large');
		expect(formFieldInput.getBoundingClientRect().height).toBe(40);
		const group = document.querySelector<HTMLElement>('[data-testid="group-small"]')!;
		const groupInput = document.querySelector<HTMLInputElement>('[data-testid="group-input"]')!;
		expect(group.dataset.size).toBe('small');
		expect(groupInput.dataset.size).toBe('small');
		expect(group.getBoundingClientRect().height).toBe(28);
		expect(groupInput.getBoundingClientRect().height).toBe(group.clientHeight);
	});
});
