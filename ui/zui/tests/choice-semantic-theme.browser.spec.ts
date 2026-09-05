import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ChoiceSemanticThemeFixture from './ChoiceSemanticThemeFixture.svelte';

describe('choice item semantic theme colors', () => {
	it('uses custom semantic tokens for selected, selected-active and unselected-active states', async () => {
		render(ChoiceSemanticThemeFixture);
		await tick();

		for (const listbox of document.querySelectorAll<HTMLElement>('[role="listbox"]'))
			listbox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		document
			.querySelector<HTMLInputElement>('[aria-label="Custom combo"]')
			?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await tick();
		document
			.querySelector<HTMLElement>('[data-testid="combo-plain"]')
			?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		await tick();

		for (const id of ['select-plain', 'multi-plain', 'combo-plain']) {
			expect(
				getComputedStyle(document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!)
					.backgroundColor,
				id
			).toBe('rgb(48, 64, 80)');
		}
		for (const id of ['select-selected', 'multi-selected', 'combo-selected']) {
			expect(
				getComputedStyle(document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!)
					.backgroundColor,
				id
			).toBe('rgb(16, 32, 48)');
		}
		expect(
			getComputedStyle(document.querySelector<HTMLElement>('[data-testid="menu-selected"]')!)
				.backgroundColor
		).toBe('rgb(32, 48, 64)');
	});

	it('renders non-empty default dark theme colors without collapsing selected and plain states', async () => {
		render(ChoiceSemanticThemeFixture);
		await tick();
		const selected = document.querySelector<HTMLElement>('[data-testid="default-menu-selected"]')!;
		const plain = document.querySelector<HTMLElement>('[data-testid="default-menu-item"]')!;
		expect(getComputedStyle(selected).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
		expect(getComputedStyle(plain).backgroundColor).not.toBe(
			getComputedStyle(selected).backgroundColor
		);
	});
});
