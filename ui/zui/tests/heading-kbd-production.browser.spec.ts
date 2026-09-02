import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FoundationPrimitivesFixture from './FoundationPrimitivesFixture.svelte';
import TypographyFixture from './TypographyFixture.svelte';

describe('ZHeading and ZKbd production browser contracts', () => {
	it('keeps ZHeading semantic levels independent from visual tokens', () => {
		render(TypographyFixture);
		const h1 = document.querySelector<HTMLElement>('[data-testid="heading-h1"]')!;
		const h4 = document.querySelector<HTMLElement>('[data-testid="heading-h4-large"]')!;
		expect(h1.tagName).toBe('H1');
		expect(h4.tagName).toBe('H4');
		expect(h1.dataset.level).toBe('1');
		expect(h4.dataset.level).toBe('4');
		expect(h1.dataset.size).toBe('medium');
		expect(h4.dataset.size).toBe('xlarge');
		expect(h1.getAttribute('aria-label')).toBeNull();
	});

	it('keeps ZKbd native, nestable and independent from platform detection', () => {
		render(FoundationPrimitivesFixture);
		const single = document.querySelector<HTMLElement>('[data-testid="kbd-single"]')!;
		const combination = document.querySelector<HTMLElement>('[data-testid="kbd-combination"]')!;
		expect(single.tagName).toBe('KBD');
		expect(combination.querySelectorAll('kbd')).toHaveLength(2);
		expect(combination.textContent).toContain('Ctrl + K');
		expect(single.getAttribute('role')).toBeNull();
		expect(getComputedStyle(single).fontFamily).not.toBe('');
	});
});
