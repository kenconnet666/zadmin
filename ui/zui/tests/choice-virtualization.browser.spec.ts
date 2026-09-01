import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import ChoiceVirtualizationFixture from './ChoiceVirtualizationFixture.svelte';

afterEach(cleanup);

function keydown(target: Element | null, key: string): void {
	target?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key }));
}

describe('virtual Select and Combobox choices', () => {
	it('focuses the Select virtual listbox and exposes an id only after ensure-key mounts the option', async () => {
		render(ChoiceVirtualizationFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="virtual-select-trigger"]'
		);
		trigger?.click();
		await tick();
		const shell = document.querySelector<HTMLElement>('[data-testid="virtual-select-shell"]');
		const listbox = shell?.querySelector<HTMLElement>('[role="listbox"]');
		expect(document.activeElement).toBe(listbox);
		expect(listbox?.textContent).not.toContain('Virtual option 1000');

		keydown(listbox, 'End');
		await tick();
		const activeId = listbox?.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		const active = activeId ? listbox?.querySelector<HTMLElement>(`#${activeId}`) : null;
		expect(active?.textContent).toContain('Virtual option 1000');
		expect(active?.getAttribute('aria-selected')).toBe('false');

		keydown(listbox, 'Enter');
		await tick();
		expect(document.querySelector('[data-testid="virtual-select-output"]')?.textContent).toBe(
			'999'
		);
	});

	it('keeps Combobox input focus while virtual navigation mounts the real active option', async () => {
		render(ChoiceVirtualizationFixture);
		const input = document.querySelector<HTMLInputElement>(
			'[data-testid="virtual-combobox-input"]'
		);
		input?.focus();
		input?.click();
		await tick();
		const shell = document.querySelector<HTMLElement>('[data-testid="virtual-combobox-shell"]');
		const listbox = shell?.querySelector<HTMLElement>('[role="listbox"]');
		expect(document.activeElement).toBe(input);
		expect(listbox?.getAttribute('tabindex')).toBe('-1');
		expect(listbox?.textContent).not.toContain('Virtual option 1000');

		keydown(input, 'End');
		await tick();
		expect(document.activeElement).toBe(input);
		const activeId = input?.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		const active = activeId ? listbox?.querySelector<HTMLElement>(`#${activeId}`) : null;
		expect(active?.textContent).toContain('Virtual option 1000');

		keydown(input, 'Enter');
		await tick();
		expect(document.activeElement).toBe(input);
		expect(document.querySelector('[data-testid="virtual-combobox-output"]')?.textContent).toBe(
			'999:Virtual option 1000'
		);
	});
});
