import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ZRating, { type ZRatingItemContext } from '../src/components/input/ZRating.svelte';

describe('ZRating server contract', () => {
	it('renders one labelled radiogroup with native fraction radios and no form bridge', () => {
		const body = render(ZRating, {
			props: {
				count: 5,
				defaultValue: 2.5,
				fractions: 2,
				itemLabel: (value) => value + ' of 5',
				label: 'Quality',
				name: 'quality',
				size: 'large',
				tone: 'success'
			}
		}).body;
		expect(body).toContain('role="radiogroup"');
		expect(body).toContain('aria-label="Quality"');
		expect(body.match(/type="radio"/gu)).toHaveLength(10);
		expect(body.match(/checked/gu)).toHaveLength(1);
		expect(body).toContain('value="2.5"');
		expect(body).toContain('aria-label="2.5 of 5"');
		expect(body).toContain('data-value="2.5"');
		expect(body).not.toContain('type="range"');
		expect(body).not.toContain('data-zui-form-bridge');
	});

	it('renders readonly and disabled as distinct native form states with custom content', () => {
		const item = createRawSnippet<[ZRatingItemContext]>(() => ({
			render: () => '<span>Diamond</span>'
		}));
		const readonlyBody = render(ZRating, {
			props: { item, label: 'Readonly', name: 'score', readonly: true, value: 3 }
		}).body;
		expect(readonlyBody).toContain('aria-readonly="true"');
		expect(readonlyBody).not.toMatch(/type="radio"[^>]* disabled/gu);
		expect(readonlyBody.match(/Diamond/gu)).toHaveLength(10);
		const disabledBody = render(ZRating, {
			props: { disabled: true, label: 'Disabled', name: 'score', value: 3 }
		}).body;
		expect(disabledBody).toContain('data-disabled="true"');
		expect(disabledBody.match(/disabled/gu)?.length).toBeGreaterThanOrEqual(5);
	});

	it('rejects invalid count, fractions, value alignment and labels when body is read', () => {
		for (const props of [
			{ count: 0, label: 'Count' },
			{ fractions: 0, label: 'Fractions' },
			{ fractions: 2, label: 'Alignment', value: 2.3 },
			{ count: 5, label: 'Range', value: 6 }
		])
			expect(() => render(ZRating, { props }).body).toThrow(/ZRating/u);
		expect(() => render(ZRating, { props: {} }).body).toThrow('requires a non-empty label');
		expect(
			() =>
				render(ZRating, {
					props: { itemLabel: () => '', label: 'Items' }
				}).body
		).toThrow('itemLabel must return a non-empty string');
	});
});
