import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import CheckboxFixture from './CheckboxFixture.svelte';
import SliderFixture from './SliderFixture.svelte';
import SwitchProductionFixture from './SwitchProductionFixture.svelte';

describe('foundation controls production contracts', () => {
	it('ZCheckbox preserves mixed state, native FormData and reset', async () => {
		render(CheckboxFixture);
		const checkbox = document.querySelector<HTMLInputElement>('[data-testid="checkbox"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="checkbox-form"]')!;
		expect(checkbox.type).toBe('checkbox');
		expect(checkbox.indeterminate).toBe(true);
		expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
		expect(new FormData(form).get('choice')).toBeNull();
		checkbox.click();
		await tick();
		expect(checkbox.checked).toBe(true);
		expect(checkbox.indeterminate).toBe(false);
		expect(new FormData(form).get('choice')).toBe('selected');
		form.reset();
		await expect.poll(() => checkbox.indeterminate).toBe(true);
		expect(new FormData(form).get('choice')).toBeNull();
	});

	it('ZSwitch preserves required semantics, readonly boundaries and external reset owners', async () => {
		render(SwitchProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="switch-production-form"]')!;
		const control = document.querySelector<HTMLInputElement>(
			'[data-testid="switch-production-control"]'
		)!;
		const readonly = document.querySelector<HTMLInputElement>(
			'[data-testid="switch-production-readonly"]'
		)!;
		const blockedClicks = document.querySelector<HTMLOutputElement>(
			'[data-testid="switch-production-blocked-clicks"]'
		)!;
		expect(control.role).toBe('switch');
		expect(control.required).toBe(true);
		expect(new FormData(form).get('alerts')).toBe('enabled');
		expect(readonly.getAttribute('aria-readonly')).toBe('true');
		readonly.click();
		await tick();
		expect(readonly.checked).toBe(true);
		expect(blockedClicks.textContent).toBe('0');
		expect(new FormData(form).get('policy')).toBe('fixed');
		control.click();
		await tick();
		expect(new FormData(form).get('alerts')).toBeNull();
		form.reset();
		await expect.poll(() => control.checked).toBe(true);
		expect(new FormData(form).get('alerts')).toBe('enabled');
	});

	it('ZSlider keeps native range keyboard values, FormData and reset', async () => {
		render(SliderFixture);
		const slider = document.querySelector<HTMLInputElement>('[data-testid="slider"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="slider-form"]')!;
		expect(slider.type).toBe('range');
		expect(slider.valueAsNumber).toBe(35);
		slider.focus();
		await userEvent.keyboard('{ArrowRight}');
		await tick();
		expect(slider.valueAsNumber).toBe(40);
		expect(new FormData(form).get('threshold')).toBe('40');
		form.reset();
		await expect.poll(() => slider.valueAsNumber).toBe(35);
	});
});
