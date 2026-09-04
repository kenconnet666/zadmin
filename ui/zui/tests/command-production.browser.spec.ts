import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CommandFixture from './CommandFixture.svelte';
import CommandPaletteFixture from './CommandPaletteFixture.svelte';
import { resetForm } from './form-reset.js';

describe('ZCommand and ZCommandPalette production contracts', () => {
	it('ZCommand preserves typed identities, disabled filtering, roving Enter and empty reset', async () => {
		render(CommandFixture);
		const input = document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="command-form"]')!;
		const output = document.querySelector<HTMLOutputElement>('[data-testid="command-output"]')!;
		const list = document.querySelector<HTMLElement>('[role="listbox"][aria-label="Commands"]')!;
		const numeric = [...list.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Numeric one')
		)!;
		const string = [...list.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('String one')
		)!;
		const disabled = [...list.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Deploy production')
		)!;
		expect(numeric.id).not.toBe(string.id);
		expect(disabled.getAttribute('aria-disabled')).toBe('true');
		expect(input.getAttribute('aria-controls')).toBe(list.id);
		input.focus();
		input.value = 'dep';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		expect(list.querySelectorAll('[role="option"]')).toHaveLength(2);
		await expect
			.poll(() => input.getAttribute('aria-activedescendant'))
			.toBe(list.querySelector('[role="option"]')?.id);
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(output.textContent).toBe('dep:preview:0');
		await resetForm(form);
		await expect.poll(() => input.value).toBe('');
		input.value = 'missing';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-slot="empty"]')?.textContent).toContain(
			'No commands found'
		);
	});

	// @zui-visual ZCommand active option and list geometry
	it('keeps command list usable and active option visibly addressable', async () => {
		render(CommandFixture);
		const input = document.querySelector<HTMLInputElement>('input[aria-label="Search commands"]')!;
		const list = document.querySelector<HTMLElement>('[role="listbox"][aria-label="Commands"]')!;
		const inputRect = input.getBoundingClientRect();
		const listRect = list.getBoundingClientRect();
		expect(listRect.width).toBeGreaterThan(0);
		expect(listRect.width).toBeLessThanOrEqual(window.innerWidth);
		expect(listRect.height).toBeGreaterThan(0);
		expect(inputRect.width).toBeGreaterThan(0);
		expect(getComputedStyle(list).overflowY).toMatch(/auto|scroll/);
		input.focus();
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		const activeId = input.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(document.getElementById(activeId!)?.getAttribute('aria-selected')).toBe('true');
	});

	it('ZCommandPalette owns dialog portal focus, action close, shortcut reopen and Escape', async () => {
		// @zui-visual ZCommandPalette modal command surface geometry
		render(CommandPaletteFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[aria-label="Open palette"]')!;
		trigger.focus();
		trigger.click();
		await tick();
		const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
		const input = dialog.querySelector<HTMLInputElement>('input[aria-label="Search palette"]')!;
		expect(dialog.parentNode).toBe(document.body);
		expect(getComputedStyle(dialog).position).toBe('fixed');
		expect(dialog.getBoundingClientRect().width).toBeGreaterThan(0);
		expect(dialog.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth + 1);
		expect(input.getAttribute('aria-controls')).toBeTruthy();
		expect(document.activeElement).toBe(input);
		input.value = 'dark';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(document.querySelector('[data-testid="command-palette-output"]')?.textContent).toBe(
			'false:theme'
		);
		document.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, ctrlKey: true, key: 'k' })
		);
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});
});
