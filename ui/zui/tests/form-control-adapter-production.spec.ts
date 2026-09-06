import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FormControlAdapterInvalidFixture from './FormControlAdapterInvalidFixture.svelte';

describe('ZForm control adapter server contract', () => {
	it.each([
		['input', /ZInput model value must be a string or undefined/u],
		['textarea', /ZTextarea model value must be a string or undefined/u],
		['checkbox', /ZCheckbox model value must be boolean, indeterminate or undefined/u],
		['select', /ZNativeSelect model value must be a string in single mode/u],
		['group', /ZCheckboxGroup model value must be a SelectionKey array or undefined/u]
	] as const)('rejects an invalid %s model value during SSR', (kind, message) => {
		expect(() => render(FormControlAdapterInvalidFixture, { props: { kind } }).body).toThrow(
			message
		);
	});

	it('rejects a public controlled value combined with Form model ownership', () => {
		expect(
			() => render(FormControlAdapterInvalidFixture, { props: { kind: 'conflict' } }).body
		).toThrow(/ZInput cannot combine a controlled value with ZForm model ownership/u);
	});
});
