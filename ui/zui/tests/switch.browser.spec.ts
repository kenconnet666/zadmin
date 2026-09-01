import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import SwitchProductionFixture from './SwitchProductionFixture.svelte';

function control(testId: string): HTMLInputElement {
	return document.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`)!;
}

describe('ZSwitch production contract', () => {
	it('keeps native FormData, required validation and reset synchronized', async () => {
		render(SwitchProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="switch-production-form"]')!;
		const editable = control('switch-production-control');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="switch-production-output"]'
		)!;

		expect(editable.role).toBe('switch');
		expect(editable.required).toBe(true);
		expect(editable.getAttribute('aria-invalid')).toBe('true');
		expect(editable.getAttribute('aria-describedby')).toContain('description');
		expect(new FormData(form).get('alerts')).toBe('enabled');

		await userEvent.click(editable);
		await tick();
		expect(editable.checked).toBe(false);
		expect(editable.validity.valueMissing).toBe(true);
		expect(new FormData(form).get('alerts')).toBeNull();
		expect(output.textContent).toBe('false:1');

		form.reset();
		await tick();
		expect(editable.checked).toBe(true);
		expect(new FormData(form).get('alerts')).toBe('enabled');
		expect(output.textContent).toBe('true:1');
	});

	it('blocks busy, readonly and cancelled changes without dropping their submitted values', async () => {
		render(SwitchProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="switch-production-form"]')!;
		const loading = control('switch-production-loading');
		const readonly = control('switch-production-readonly');
		const disabled = control('switch-production-disabled');
		const cancelled = control('switch-production-cancelled');
		const blockedClicks = document.querySelector<HTMLOutputElement>(
			'[data-testid="switch-production-blocked-clicks"]'
		)!;

		expect(loading.getAttribute('aria-busy')).toBe('true');
		expect(loading.getAttribute('aria-disabled')).toBe('true');
		expect(readonly.getAttribute('aria-readonly')).toBe('true');
		expect(disabled.disabled).toBe(true);
		loading.focus();
		expect(document.activeElement).toBe(loading);
		expect(getComputedStyle(loading.closest<HTMLElement>('[data-slot="root"]')!).outlineStyle).toBe(
			'solid'
		);
		readonly.focus();
		expect(document.activeElement).toBe(readonly);

		await userEvent.click(loading);
		await userEvent.click(readonly);
		await userEvent.click(cancelled);
		await tick();
		expect(loading.checked).toBe(true);
		expect(readonly.checked).toBe(true);
		expect(cancelled.checked).toBe(false);
		expect(blockedClicks.textContent).toBe('0');
		expect(new FormData(form).get('pending')).toBe('kept');
		expect(new FormData(form).get('policy')).toBe('fixed');
		expect(new FormData(form).get('disabled')).toBeNull();
	});

	it('tracks a DOM-external native form owner through FormData and reset', async () => {
		render(SwitchProductionFixture);
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="switch-production-external-form"]'
		)!;
		const external = control('switch-production-external-control');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="switch-production-external-output"]'
		)!;

		expect(external.form).toBe(form);
		expect(new FormData(form).get('external')).toBe('linked');
		await userEvent.click(external);
		await tick();
		expect(output.textContent).toBe('false');
		expect(new FormData(form).get('external')).toBeNull();

		form.reset();
		await tick();
		expect(external.checked).toBe(true);
		expect(output.textContent).toBe('true');
		expect(new FormData(form).get('external')).toBe('linked');
	});

	it('distinguishes external synchronization from native Space changes', async () => {
		render(SwitchProductionFixture);
		const editable = control('switch-production-control');
		const external = document.querySelector<HTMLButtonElement>(
			'[data-testid="switch-production-external"]'
		)!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="switch-production-output"]'
		)!;

		await userEvent.click(external);
		await tick();
		expect(output.textContent).toBe('false:0');

		editable.focus();
		await userEvent.keyboard(' ');
		await tick();
		expect(editable.checked).toBe(true);
		expect(output.textContent).toBe('true:1');
	});

	it('projects RTL, compact density and reduced motion onto the visual root', () => {
		render(SwitchProductionFixture);
		const preferences = control('switch-production-preferences');
		const root = preferences.closest<HTMLElement>('[data-slot="root"]')!;

		expect(root.dataset.reducedMotion).toBe('true');
		expect(root.dataset.state).toBe('unchecked');
		expect(root.getBoundingClientRect().width).toBeLessThan(40);
	});
});
