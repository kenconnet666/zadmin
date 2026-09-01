import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AccordionPropsFixture from './AccordionPropsFixture.svelte';

describe('ZAccordion flat component props', () => {
	it('switches an AccordionValue owner atomically between single and multiple runtime contracts', async () => {
		render(AccordionPropsFixture);
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="accordion-props-output"]'
		)!;
		expect(output.textContent?.trim()).toBe('single:a');

		document.querySelector<HTMLButtonElement>('[data-testid="accordion-props-multiple"]')?.click();
		await tick();
		expect(output.textContent?.trim()).toBe('multiple:a');

		document.querySelector<HTMLButtonElement>('[data-testid="accordion-props-b"]')?.click();
		await tick();
		expect(output.textContent?.trim()).toBe('multiple:a,b');
	});
});
