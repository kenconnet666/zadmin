import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TimeGridProductionFixture from './TimeGridProductionFixture.svelte';
import { resetForm } from './form-reset.js';

function element<T extends HTMLElement>(testId: string): T {
	return document.querySelector<T>(`[data-testid="${testId}"]`)!;
}

function slot(root: HTMLElement, value: string): HTMLButtonElement {
	return root.querySelector<HTMLButtonElement>(`[data-slot="slot"][data-value="${value}"]`)!;
}

describe('ZTimeGrid and ZTimeValue production contracts', () => {
	it('selects explicit Time slots with roving focus, constraints, FormData and reset', async () => {
		// @zui-visual ZTimeGrid typed slots, selected/disabled states, five sizes and ZTimeValue text
		render(TimeGridProductionFixture);
		await tick();
		const form = element<HTMLFormElement>('time-grid-form');
		const grid = element('time-grid-main');
		expect(grid.getAttribute('role')).toBe('radiogroup');
		expect(grid.getAttribute('aria-labelledby')).toBeTruthy();
		expect(grid.querySelectorAll('[role="radio"]')).toHaveLength(5);
		expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		expect(grid.querySelectorAll('[data-selected="true"]')).toHaveLength(1);
		expect(slot(grid, '08:00:00').disabled).toBe(true);
		expect(slot(grid, '11:00:00').disabled).toBe(true);
		expect(new FormData(form).get('appointment')).toBe('09:00:00');

		const current = slot(grid, '09:00:00');
		current.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(slot(grid, '10:30:15.25'));
		await expect
			.poll(() => grid.querySelector('[data-selected="true"]')?.textContent)
			.toBe('Lunch window');
		expect(new FormData(form).get('appointment')).toBe('10:30:15.25');
		expect(element('time-grid-output').textContent).toContain('10:30:15.25|1|');

		await userEvent.keyboard('{Enter}');
		await expect.poll(() => new FormData(form).has('appointment')).toBe(false);
		expect(grid.dataset.invalid).toBe('true');
		expect(grid.getAttribute('aria-describedby')).toContain('feedback');
		await resetForm(form);
		expect(new FormData(form).get('appointment')).toBe('09:00:00');
		expect(grid.dataset.invalid).toBeUndefined();
	});

	it('keeps controlled rejection, readonly, native disabledness and participation ownership explicit', async () => {
		render(TimeGridProductionFixture);
		await tick();
		const form = element<HTMLFormElement>('time-grid-form');
		const rejected = element('time-grid-rejected');
		await userEvent.click(slot(rejected, '10:30:15.25'));
		await tick();
		expect(rejected.querySelector('[data-selected="true"]')?.dataset.value).toBe('09:00:00');
		expect(element('time-grid-output').textContent).toContain('|09:00:00|1');

		const readonly = element('time-grid-readonly');
		slot(readonly, '09:00:00').focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(slot(readonly, '10:30:15.25'));
		expect(readonly.querySelector('[data-selected="true"]')?.dataset.value).toBe('09:00:00');
		expect(new FormData(form).get('readonly-time')).toBe('09:00:00');
		expect(new FormData(form).has('disabled-time')).toBe(false);
		expect(new FormData(form).has('fieldset-time')).toBe(false);
		expect(new FormData(form).has('ignored-time')).toBe(false);
		expect(
			[...element('time-grid-native-disabled').querySelectorAll('button')].every((button) =>
				button.matches(':disabled')
			)
		).toBe(true);
	});

	it('uses rendered RTL direction for arrows and exposes all five Theme sizes', async () => {
		render(TimeGridProductionFixture);
		await tick();
		const rtl = element('time-grid-rtl');
		const selected = slot(rtl, '09:00:00');
		selected.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(slot(rtl, '08:00:00'));
		expect(rtl.dataset.value).toBe('08:00:00');
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(slot(rtl, '12:00:00'));
		expect(rtl.dataset.value).toBe('12:00:00');

		const heights: number[] = [];
		for (const size of ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const) {
			const grid = element(`time-grid-size-${size}`);
			expect(grid.dataset.size).toBe(size);
			heights.push(grid.querySelector('button')!.getBoundingClientRect().height);
		}
		expect(heights).toEqual([...heights].sort((left, right) => left - right));
		expect(new Set(heights).size).toBe(5);
	});

	it('cleans up removed slot mounts and reconnects roving focus when they return', async () => {
		const component = render(TimeGridProductionFixture);
		await tick();
		const grid = element('time-grid-dynamic');
		slot(grid, '09:00:00').focus();
		component.removeDynamicMiddle();
		await tick();
		expect(grid.querySelectorAll('[data-slot="slot"]')).toHaveLength(2);
		expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		expect(grid.querySelector<HTMLElement>('[tabindex="0"]')?.dataset.value).toBe('10:30:15.25');

		component.restoreDynamicMiddle();
		await tick();
		expect(grid.querySelectorAll('[data-slot="slot"]')).toHaveLength(3);
		expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		const active = grid.querySelector<HTMLButtonElement>('[tabindex="0"]')!;
		active.focus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(document.activeElement).toBe(slot(grid, '09:00:00'));
	});

	it('keeps invalid external owners visible to form validation without inventing slots', async () => {
		const component = render(TimeGridProductionFixture);
		await tick();
		const form = element<HTMLFormElement>('time-grid-form');
		const grid = element('time-grid-main');
		component.setExternalUnavailable();
		await tick();
		expect(grid.dataset.invalid).toBe('true');
		expect(grid.querySelector('[data-selected="true"]')?.dataset.value).toBe('11:00:00');
		expect(new FormData(form).get('appointment')).toBe('11:00:00');

		component.setExternalMissing();
		await tick();
		expect(grid.dataset.invalid).toBe('true');
		expect(grid.querySelector('[data-selected="true"]')).toBeNull();
		expect(new FormData(form).get('appointment')).toBe('13:00:00');
	});

	it('renders localized semantic time values with shared ZText typography', async () => {
		render(TimeGridProductionFixture);
		await tick();
		const value = element<HTMLTimeElement>('time-value-main');
		expect(value.tagName).toBe('TIME');
		expect(value.dateTime).toBe('13:05:09.125');
		expect(value.textContent).toMatch(/^1:05:09\sPM$/u);
		expect(value.dataset.granularity).toBe('second');
		expect(value.dataset.hourCycle).toBe('12');
		expect(value.dataset.tabularNumbers).toBe('true');
		expect(getComputedStyle(value).fontWeight).toBe('600');
	});
});
