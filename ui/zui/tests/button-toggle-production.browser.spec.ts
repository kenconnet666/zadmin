import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import ButtonToggleProductionFixture from './ButtonToggleProductionFixture.svelte';

describe('Button and ToggleButton production browser contract', () => {
	it('keeps variant, tone, shape and native form semantics orthogonal', async () => {
		render(ButtonToggleProductionFixture);
		const primary = document.querySelector<HTMLButtonElement>('[data-testid="button-default"]')!;
		const danger = document.querySelector<HTMLButtonElement>(
			'[data-testid="button-danger-secondary"]'
		)!;
		const circle = document.querySelector<HTMLButtonElement>('[data-testid="button-circle"]')!;
		expect(primary.type).toBe('button');
		expect(primary.dataset.variant).toBe('primary');
		expect(primary.dataset.tone).toBe('default');
		expect(danger.dataset.variant).toBe('secondary');
		expect(danger.dataset.tone).toBe('danger');
		expect(circle.dataset.shape).toBe('circle');
		expect(circle.getAttribute('aria-label')).toBe('Favorite');
		await userEvent.click(document.querySelector('[data-testid="button-submit"]')!);
		expect(document.querySelector('[data-testid="button-output"]')?.textContent).toBe('false:0:1');
	});

	it('uses an aria-hidden ZSpinner overlay while preserving loading width and busy ownership', async () => {
		render(ButtonToggleProductionFixture);
		const button = document.querySelector<HTMLButtonElement>('[data-testid="button-loading"]')!;
		const initialWidth = button.getBoundingClientRect().width;
		await userEvent.click(document.querySelector('[data-testid="button-loading-on"]')!);
		await tick();
		expect(button.disabled).toBe(true);
		expect(button.getAttribute('aria-busy')).toBe('true');
		expect(button.getAttribute('aria-label')).toBe('Saving deployment');
		expect(button.getBoundingClientRect().width).toBe(initialWidth);
		const loading = button.querySelector<HTMLElement>('[data-slot="loading"]')!;
		expect(loading.getAttribute('aria-hidden')).toBe('true');
		expect(loading.querySelector('[role="status"]')).toBeNull();
		button.click();
		expect(document.querySelector('[data-testid="button-output"]')?.textContent).toBe('true:0:0');
	});

	it('keeps ToggleButton user callbacks distinct from owner writes and prevented clicks', async () => {
		render(ButtonToggleProductionFixture);
		const toggle = document.querySelector<HTMLButtonElement>('[data-testid="toggle-controlled"]')!;
		expect(toggle.getAttribute('aria-pressed')).toBe('false');
		await userEvent.click(toggle);
		expect(toggle.getAttribute('aria-pressed')).toBe('true');
		expect(document.querySelector('[data-testid="toggle-output"]')?.textContent).toBe(
			'true:1:false'
		);
		await userEvent.click(document.querySelector('[data-testid="toggle-owner-off"]')!);
		expect(toggle.getAttribute('aria-pressed')).toBe('false');
		expect(document.querySelector('[data-testid="toggle-output"]')?.textContent).toBe(
			'false:1:false'
		);

		const prevented = document.querySelector<HTMLButtonElement>(
			'[data-testid="toggle-prevented"]'
		)!;
		await userEvent.click(prevented);
		expect(prevented.getAttribute('aria-pressed')).toBe('false');
		expect(document.querySelector('[data-testid="toggle-output"]')?.textContent).toBe(
			'false:1:true'
		);
	});

	it('supports icon-only, danger tone, disabled and native keyboard ToggleButton behavior', async () => {
		render(ButtonToggleProductionFixture);
		const icon = document.querySelector<HTMLButtonElement>('[data-testid="toggle-icon"]')!;
		const disabled = document.querySelector<HTMLButtonElement>('[data-testid="toggle-disabled"]')!;
		expect(icon.getAttribute('aria-label')).toBe('Favorite toggle');
		expect(icon.dataset.shape).toBe('square');
		expect(icon.dataset.tone).toBe('danger');
		icon.focus();
		await userEvent.keyboard(' ');
		expect(icon.getAttribute('aria-pressed')).toBe('true');
		expect(disabled.disabled).toBe(true);
		disabled.click();
		expect(disabled.getAttribute('aria-pressed')).toBe('false');
	});
});
