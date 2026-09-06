import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZNativeSelect from '../src/components/input/ZNativeSelect.svelte';
import ZPasswordInput from '../src/components/input/ZPasswordInput.svelte';
import InputPrimitivesFixture from './InputPrimitivesFixture.svelte';

const items = [
	{ value: 'a', label: 'Alpha' },
	{
		label: 'Grouped',
		options: [
			{ value: 'b', label: 'Beta' },
			{ value: 'c', label: 'Gamma', disabled: true }
		]
	}
] as const;

describe('ZPasswordInput server contract', () => {
	it('renders one native password owner and one labelled visibility button', () => {
		const body = render(ZPasswordInput, {
			props: {
				'aria-label': 'Password',
				autocomplete: 'current-password',
				defaultValue: 'secret',
				name: 'password'
			}
		}).body;
		expect(body.match(/<input(?:\s|>)/gu)).toHaveLength(1);
		expect(body.match(/<button(?:\s|>)/gu)).toHaveLength(1);
		expect(body).toContain('type="password"');
		expect(body).toContain('name="password"');
		expect(body).toContain('autocomplete="current-password"');
		expect(body).toContain('value="secret"');
		expect(body).toContain('aria-label="Show password"');
		expect(body).toContain('data-visible="false"');
		expect(body).toContain('data-size="medium"');
	});

	it('projects an externally visible state without changing the password value contract', () => {
		const body = render(ZPasswordInput, {
			props: { 'aria-label': 'Visible password', defaultValue: 'secret', visible: true }
		}).body;
		expect(body).toContain('type="text"');
		expect(body).toContain('value="secret"');
		expect(body).toContain('aria-label="Hide password"');
		expect(body).toContain('data-visible="true"');
	});

	it('validates visibility and toggle labels while server body is read', () => {
		expect(
			() =>
				render(ZPasswordInput, {
					props: { 'aria-label': 'Invalid visibility', visible: 'yes' as never }
				}).body
		).toThrow('visible must be boolean');
		expect(
			() =>
				render(ZPasswordInput, {
					props: { 'aria-label': 'Invalid label', toggleLabel: () => '' }
				}).body
		).toThrow('toggle label must not be empty');
	});

	it('renders a grouped PasswordInput as one xsmall readonly or disabled business control', () => {
		const body = render(InputPrimitivesFixture).body;
		expect(body).toMatch(
			/data-testid="password-group-readonly"[^>]*data-readonly="true"[^>]*data-size="xsmall"/u
		);
		expect(body).toMatch(
			/data-testid="password-group-readonly-input"[^>]*readonly[^>]*data-readonly="true"[^>]*data-size="xsmall"/u
		);
		expect(body).toMatch(
			/data-testid="password-group-disabled-input"[^>]*disabled[^>]*data-disabled="true"/u
		);
		expect(body.match(/data-testid="password-group-readonly-input"/gu)).toHaveLength(1);
	});
});

describe('ZNativeSelect server contract', () => {
	it('renders native select, option and optgroup semantics with visual and native sizes separated', () => {
		const body = render(ZNativeSelect, {
			props: {
				'aria-label': 'Choice',
				defaultValue: 'b',
				items,
				name: 'choice',
				nativeSize: 3,
				placeholder: 'Choose',
				size: 'large'
			}
		}).body;
		expect(body.match(/<select(?:\s|>)/gu)).toHaveLength(1);
		expect(body.match(/<option(?:\s|>)/gu)).toHaveLength(4);
		expect(body.match(/<optgroup(?:\s|>)/gu)).toHaveLength(1);
		expect(body).toContain('name="choice"');
		expect(body).toContain('size="3"');
		expect(body).toContain('data-size="large"');
		expect(body).toContain('<option value="">Choose</option>');
		expect(body).toContain('label="Grouped"');
		expect(body).toContain('value="c" disabled');
		expect(body).not.toContain('role="listbox"');
	});

	it('renders multiple native selection without converting values away from strings', () => {
		const body = render(ZNativeSelect, {
			props: {
				'aria-label': 'Multiple choice',
				defaultValue: ['a', 'b'],
				items,
				multiple: true,
				name: 'choice'
			}
		}).body;
		expect(body).toContain('multiple');
		expect(body).toContain('data-multiple="true"');
		expect(body.match(/selected/gu)).toHaveLength(2);
	});

	it('validates exclusive sources, native mode values and item identity while body is read', () => {
		expect(
			() =>
				render(ZNativeSelect, {
					props: { 'aria-label': 'No source' } as never
				}).body
		).toThrow('exactly one of items or children');
		expect(
			() =>
				render(ZNativeSelect, {
					props: {
						'aria-label': 'Duplicate values',
						items: [
							{ value: 'same', label: 'One' },
							{ value: 'same', label: 'Two' }
						]
					}
				}).body
		).toThrow('option values must be unique');
		expect(
			() =>
				render(ZNativeSelect, {
					props: {
						'aria-label': 'Empty label',
						items: [{ value: 'empty', label: ' ' }]
					}
				}).body
		).toThrow('option labels must not be empty');
		expect(
			() =>
				render(ZNativeSelect, {
					props: { 'aria-label': 'Invalid single', items, value: ['a'] } as never
				}).body
		).toThrow('must be a string in single mode');
		expect(
			() =>
				render(ZNativeSelect, {
					props: {
						'aria-label': 'Invalid multiple',
						items,
						multiple: true,
						value: 'a'
					} as never
				}).body
		).toThrow('must be a string array in multiple mode');
		expect(
			() =>
				render(ZNativeSelect, {
					props: {
						'aria-label': 'Invalid multiple placeholder',
						items,
						multiple: true,
						placeholder: 'Choose'
					} as never
				}).body
		).toThrow('placeholder is only available in single mode');
		expect(
			() =>
				render(ZNativeSelect, {
					props: { 'aria-label': 'Invalid rows', items, nativeSize: 0 }
				}).body
		).toThrow('nativeSize must be a positive safe integer');
	});
});
