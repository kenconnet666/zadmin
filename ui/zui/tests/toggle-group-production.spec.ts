import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZToggleGroup from '../src/components/input/ZToggleGroup.svelte';

const items = [
	{ value: 1, label: 'One' },
	{ value: '1', label: 'String one' }
] as const;

describe('ZToggleGroup server contract', () => {
	it('renders a native group of pressed buttons without radiogroup semantics', () => {
		const body = render(ZToggleGroup, {
			props: { 'aria-invalid': true, items, value: [1] }
		}).body;
		const root = body.match(/<div[^>]*role="group"[^>]*>/u)?.[0];
		expect(body).toContain('role="group"');
		expect(body).not.toContain('role="radiogroup"');
		expect(root).toContain('data-invalid="true"');
		expect(root).not.toContain('aria-invalid=');
		expect(root).not.toContain('tabindex=');
		expect(body.match(/aria-pressed="true"/gu)).toHaveLength(1);
		expect(body.match(/aria-pressed="false"/gu)).toHaveLength(1);
		expect(body).toContain('data-state="on"');
		expect(body).toContain('data-selection-mode="single"');
		expect(body).toContain('data-orientation="horizontal"');
		expect(body).toContain('data-size="medium"');
	});

	it('keeps typed selections distinct while emitting repeated native form entries', () => {
		const body = render(ZToggleGroup, {
			props: { items, name: 'choice', selectionMode: 'multiple', value: [1, '1'] }
		}).body;
		expect(body.match(/aria-pressed="true"/gu)).toHaveLength(2);
		expect(body.match(/data-zui-form-value=""/gu)).toHaveLength(2);
		expect(body.match(/name="choice"/gu)).toHaveLength(2);
		expect(body.match(/value="1"/gu)).toHaveLength(2);
	});

	it('rejects duplicate keys and invalid single owner arrays after reading SSR body', () => {
		expect(
			() =>
				render(ZToggleGroup, {
					props: {
						items: [
							{ value: 1, label: 'One' },
							{ value: 1, label: 'Again' }
						]
					}
				}).body
		).toThrow('items require unique keys');
		expect(
			() =>
				render(ZToggleGroup, { props: { items, selectionMode: 'single', value: [1, '1'] } }).body
		).toThrow('single mode accepts at most one value');
	});
});
