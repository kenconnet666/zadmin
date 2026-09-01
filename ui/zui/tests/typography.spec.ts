import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZHeading from '../src/components/gene/ZHeading.svelte';
import ZText from '../src/components/gene/ZText.svelte';
import { headingElement, resolveTypographyOverflow } from '../src/components/gene/typography.js';
import TypographyFixture from './TypographyFixture.svelte';

describe('typography production contract', () => {
	it('renders real heading levels independently from visual size', () => {
		const first = render(ZHeading, { props: { level: 1, size: 'small' } }).body;
		const fourth = render(ZHeading, { props: { level: 4, size: 'xlarge' } }).body;
		expect(first).toContain('<h1');
		expect(first).toContain('data-level="1"');
		expect(first).toContain('data-size="small"');
		expect(fourth).toContain('<h4');
		expect(fourth).toContain('data-level="4"');
		expect(fourth).toContain('data-size="xlarge"');
	});

	it('serializes multi-line clamp and tabular numbers without changing text semantics', () => {
		const result = render(ZText, {
			props: { as: 'p', lineClamp: 3, tabularNumbers: true }
		}).body;
		expect(result).toContain('<p');
		expect(result).toContain('-webkit-line-clamp:3');
		expect(result).toContain('-webkit-box-orient:vertical');
		expect(result).toContain('font-variant-numeric:tabular-nums');
		expect(result).toContain('data-line-clamp="3"');
	});

	it('rejects ambiguous or invalid overflow contracts immediately', () => {
		expect(() => resolveTypographyOverflow({ lineClamp: 0 })).toThrow(/positive integer/u);
		expect(() => resolveTypographyOverflow({ lineClamp: 2.5 })).toThrow(/positive integer/u);
		expect(() => resolveTypographyOverflow({ lineClamp: 2, truncate: true })).toThrow(
			/mutually exclusive/u
		);
		expect(() => headingElement(0)).toThrow(/1 through 6/u);
		expect(() => headingElement(7)).toThrow(/1 through 6/u);
	});

	it('keeps the dedicated SSR fixture deterministic', () => {
		const first = render(TypographyFixture).body;
		const second = render(TypographyFixture).body;
		expect(first).toBe(second);
		expect(first).toContain('data-testid="heading-h1"');
		expect(first).toContain('data-testid="text-clamp"');
	});
});
