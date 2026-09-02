import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TypographyFixture from './TypographyFixture.svelte';

describe('ZHeading and ZText production browser semantics', () => {
	it('binds real heading/text elements and applies overflow contracts', async () => {
		render(TypographyFixture);
		await tick();
		const h1 = document.querySelector<HTMLElement>('[data-testid="heading-h1"]');
		const h4 = document.querySelector<HTMLElement>('[data-testid="heading-h4-large"]');
		const clamp = document.querySelector<HTMLElement>('[data-testid="text-clamp"]');
		const numbers = document.querySelector<HTMLElement>('[data-testid="text-numbers"]');
		expect(h1?.tagName).toBe('H1');
		expect(h4?.tagName).toBe('H4');
		expect(h1?.dataset.size).toBe('medium');
		expect(h4?.dataset.size).toBe('xlarge');
		expect(clamp?.style.webkitLineClamp).toBe('2');
		expect(clamp?.style.webkitBoxOrient).toBe('vertical');
		expect(numbers?.style.fontVariantNumeric).toBe('tabular-nums');
		expect(
			document.querySelector('[data-testid="typography-ref-output"]')?.textContent?.trim()
		).toBe('H1:P');
	});
});
