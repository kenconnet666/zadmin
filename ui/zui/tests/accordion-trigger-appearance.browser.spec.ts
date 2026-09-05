import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AccordionTriggerAppearanceFixture from './AccordionTriggerAppearanceFixture.svelte';

describe('ZAccordionTrigger appearance contract', () => {
	it('supports block and inline geometry, open state and disabled hover semantics', async () => {
		// @zui-visual ZAccordionTrigger block and inline appearance geometry
		render(AccordionTriggerAppearanceFixture);
		const block = document.querySelector<HTMLButtonElement>('[data-testid="trigger-block"]')!;
		const inline = document.querySelector<HTMLButtonElement>('[data-testid="trigger-inline"]')!;
		const disabled = document.querySelector<HTMLButtonElement>('[data-testid="trigger-disabled"]')!;

		expect(block.dataset.appearance).toBe('block');
		expect(inline.dataset.appearance).toBe('inline');
		expect(block.getBoundingClientRect().width).toBeGreaterThan(
			inline.getBoundingClientRect().width
		);
		expect(inline.getBoundingClientRect().height).toBe(32);
		expect(getComputedStyle(inline).paddingBlock).toBe('4px');
		expect(getComputedStyle(inline).paddingInline).toBe('8px');
		expect(getComputedStyle(inline).color).toBe('rgb(15, 23, 42)');
		expect(block.getAttribute('aria-expanded')).toBe('true');
		expect(inline.getAttribute('aria-expanded')).toBe('false');

		await userEvent.click(inline);
		expect(inline.getAttribute('aria-expanded')).toBe('true');
		expect(inline.dataset.state).toBe('open');
		expect(getComputedStyle(inline).color).toBe('rgb(0, 128, 96)');

		const disabledColor = getComputedStyle(disabled).color;
		expect(disabled).toBeDisabled();
		await userEvent.hover(disabled);
		expect(getComputedStyle(disabled).color).toBe(disabledColor);
	});
});
