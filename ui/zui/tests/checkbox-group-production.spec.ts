import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZCheckboxGroup from '../src/components/compound/checkbox-group/ZCheckboxGroup.svelte';
import CheckboxGroupSsrFixture from './CheckboxGroupSsrFixture.svelte';
import {
	checkboxGroupSelectionState,
	normalizeCheckboxGroupValue,
	orderCheckboxGroupValue,
	toggleAllCheckboxGroupValues
} from '../src/runtime/form/checkbox-group.js';

const compound = createRawSnippet(() => ({
	render: () => '<span>Compound content</span>'
}));

describe('ZCheckboxGroup server and model contract', () => {
	it('renders option mode as real repeated checkboxes with group semantics', () => {
		const body = render(ZCheckboxGroup, {
			props: {
				'aria-label': 'Permissions',
				defaultValue: ['read'],
				name: 'permission',
				options: [
					{ label: 'Read', value: 'read' },
					{ disabled: true, label: 'Admin', value: 'admin' }
				],
				required: true,
				tone: 'success'
			}
		}).body;

		expect(body).toContain('role="group"');
		expect(body).toContain('aria-label="Permissions"');
		expect(body.match(/type="checkbox"/gu)).toHaveLength(2);
		expect(body.match(/name="permission"/gu)).toHaveLength(2);
		expect(body).toContain('value="read"');
		expect(body).toContain('checked');
		expect(body).toContain('Read');
		expect(body).toContain('Admin');
		expect(body).toContain('data-tone="success"');
	});

	it('renders compound children and select-all without adding a form value owner', () => {
		const body = render(ZCheckboxGroup, {
			props: { 'aria-label': 'Compound', children: compound }
		}).body;
		expect(body).toContain('<span>Compound content</span>');
		expect(body).not.toContain('type="checkbox"');
	});

	it('assigns compound required to the first enabled native checkbox during SSR', () => {
		const body = render(CheckboxGroupSsrFixture).body;
		expect(body.match(/type="checkbox"/gu)).toHaveLength(3);
		expect(body).toMatch(/data-testid="compound-first"[^>]*required/u);
		expect(body).not.toMatch(/data-testid="compound-disabled"[^>]*required/u);
		expect(body).not.toMatch(/data-testid="compound-second"[^>]*required/u);
	});

	it('normalizes typed values, collection order and constrained select-all', () => {
		expect(normalizeCheckboxGroupValue([2, 1, 2])).toEqual([2, 1]);
		expect(orderCheckboxGroupValue([3, 1, 9], [1, 2, 3], true)).toEqual([1, 3, 9]);
		expect(orderCheckboxGroupValue([3, 1, 9], [1, 2, 3], false)).toEqual([1, 3]);
		expect(checkboxGroupSelectionState(['read'], ['read', 'write'])).toEqual({
			all: false,
			empty: false,
			mixed: true
		});
		expect(toggleAllCheckboxGroupValues(['read'], ['read', 'write', 'share'], 0, 2)).toEqual([
			'read',
			'write'
		]);
		expect(toggleAllCheckboxGroupValues(['read', 'write'], ['read', 'write'], 1, 2)).toEqual([
			'read'
		]);
	});
});
