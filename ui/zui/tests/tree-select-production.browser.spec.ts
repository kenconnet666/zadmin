import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TreeProductionFixture from './TreeProductionFixture.svelte';
import { activateFormReset } from './form-reset.js';

describe('ZTreeSelect production contract', () => {
	// @zui-visual ZTreeSelect intrinsic popup geometry
	it('keeps ZTreeSelect popup ARIA, Field focus owner, selection, clear and FormData reset real', async () => {
		render(TreeProductionFixture);
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="tree-production-select-form"]'
		)!;
		const label = form.querySelector<HTMLLabelElement>(
			'label[for="tree-production-select-trigger"]'
		)!;
		const trigger = form.querySelector<HTMLButtonElement>('#tree-production-select-trigger')!;
		label.click();
		expect(document.activeElement).toBe(trigger);
		expect(trigger.getAttribute('aria-haspopup')).toBe('tree');
		trigger.click();
		await tick();
		const popup = document.querySelector<HTMLElement>(
			'[role="tree"][aria-label="Choose deployment node"]'
		)!;
		const content = popup.parentElement!;
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(popup.getAttribute('aria-activedescendant')).toBeTruthy();
		expect(content.getBoundingClientRect().width).toBeGreaterThan(
			trigger.getBoundingClientRect().width
		);
		expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
		expect(getComputedStyle(content).overflowY).toBe('auto');
		popup.querySelector<HTMLElement>('[data-key="beta"]')!.click();
		await tick();
		expect(trigger.textContent?.trim()).toBe('Beta');
		expect(new FormData(form).get('tree-node')).toBe('beta');
		form.querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(new FormData(form).get('tree-node')).toBeNull();
		await activateFormReset(form);
		await expect.poll(() => trigger.textContent?.trim()).toBe('Alpha');
	});

	it('keeps ZTreeSelect readonly trigger closed and does not create a second popup owner', async () => {
		render(TreeProductionFixture);
		const readonly = document.querySelector<HTMLElement>(
			'[data-testid="tree-production-readonly"]'
		)!;
		const trigger = readonly.querySelector<HTMLButtonElement>('[aria-haspopup="tree"]')!;
		expect(readonly.getAttribute('data-state')).toBe('closed');
		trigger.click();
		await tick();
		expect(readonly.getAttribute('data-state')).toBe('closed');
		expect(
			document.querySelectorAll('[role="tree"][aria-label="Readonly tree select"]').length
		).toBe(0);
	});
});
