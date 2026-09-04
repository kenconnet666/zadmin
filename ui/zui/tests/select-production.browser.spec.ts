import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import SelectFixture from './SelectFixture.svelte';
import { resetForm } from './form-reset.js';

describe('ZSelect production contract', () => {
	it('supports default, controlled updates, Field/Form reset and vetoed selection', async () => {
		render(SelectFixture, { defaultOpen: true, prevent: true });
		const form = document.querySelector<HTMLFormElement>('[data-testid="select-form"]')!;
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="select-trigger"]')!;
		await tick();
		expect(trigger.getAttribute('aria-label')).toBe('Choice');
		expect(trigger.textContent).toContain('Beta');
		expect(new FormData(form).get('choice')).toBe('b');

		document.querySelector<HTMLElement>('[data-testid="select-d"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="select-output"]')?.textContent).toMatch(/^b:/u);

		document.querySelector<HTMLButtonElement>('[data-testid="select-owner-clear"]')?.click();
		await tick();
		expect(new FormData(form).get('choice')).toBeNull();
		await resetForm(form);
		await expect.poll(() => new FormData(form).get('choice')).toBe('b');
	});

	it('keeps ZSelectTrigger, ZSelectContent and ZSelectItem ARIA, keyboard and Field boundaries real', async () => {
		render(SelectFixture, { defaultOpen: true });
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="select-trigger"]')!;
		const content = document.querySelector<HTMLElement>('[data-testid="select-content"]')!;
		const items = [...content.querySelectorAll<HTMLElement>('[role="option"]')];
		expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
		expect(trigger.getAttribute('aria-controls')).toBe(content.id);
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(content.getAttribute('role')).toBe('listbox');
		expect(content.getAttribute('aria-labelledby')).toBeTruthy();
		expect(items).toHaveLength(4);
		expect(items[1]?.getAttribute('aria-selected')).toBe('true');
		expect(items[2]?.getAttribute('aria-disabled')).toBe('true');
		expect(document.querySelector<HTMLLabelElement>('label[for]')?.htmlFor).toBe(trigger.id);

		trigger.focus();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		expect(document.activeElement).toBe(content);
		content.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		expect(content.getAttribute('aria-activedescendant')).toBe(items[3]?.id);
		content.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(document.activeElement).toBe(trigger);
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
	});

	it('allows intrinsic content width when matchWidth is disabled', async () => {
		// @zui-visual ZSelect
		// @zui-visual ZSelectTrigger
		// @zui-visual ZSelectContent
		// @zui-visual ZSelectItem
		render(SelectFixture, { defaultOpen: true, longLabels: true, matchWidth: false });
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="select-trigger"]')!;
		const content = document.querySelector<HTMLElement>('[data-testid="select-content"]')!;
		const item = document.querySelector<HTMLElement>('[data-testid="select-c"]')!;
		await tick();
		expect(trigger.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(trigger.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(getComputedStyle(trigger).boxSizing).toBe('border-box');
		expect(content.getBoundingClientRect().width).toBeGreaterThanOrEqual(
			trigger.getBoundingClientRect().width
		);
		expect(content.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(getComputedStyle(content).borderTopWidth).not.toBe('0px');
		expect(getComputedStyle(content).overflowY).toBe('auto');
		expect(item.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(
			getComputedStyle(document.querySelector<HTMLElement>('[data-testid="select-b"]')!)
				.backgroundColor
		).not.toBe('rgba(0, 0, 0, 0)');
		expect(getComputedStyle(item).whiteSpace).toBe('nowrap');
		await expect
			.poll(() => getComputedStyle(content).getPropertyValue('--zui-floating-reference-width'))
			.toMatch(/px$/u);
	});
});
