import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZPinInput from '../src/components/input/ZPinInput.svelte';
import InputGroupMultipleFixture from './InputGroupMultipleFixture.svelte';
import InputGroupNestedFixture from './InputGroupNestedFixture.svelte';
import PinInputGroupProductionFixture from './PinInputGroupProductionFixture.svelte';

describe('PinInput and InputGroup production SSR contracts', () => {
	it('renders canonical PIN slots, one bridge value and native grouped controls without browser globals', () => {
		const body = render(PinInputGroupProductionFixture).body;
		expect(body).toContain('data-testid="pin-production"');
		expect(body).toContain('data-zui-form-value-bridge');
		expect(body).toContain('data-zui-form-value');
		expect(body).toContain('name="otp"');
		expect(body).toContain('value="123456"');
		expect(body).toContain('autocomplete="one-time-code"');
		expect(body).toContain('data-zui-input-group-control');
		expect(body).toContain('name="endpoint"');
		expect(body).toContain('data-slot="suffix-action"');
	});

	it('normalizes Unicode graphemes and rejects invalid length before emitting slots', () => {
		const unicode = render(ZPinInput, {
			props: {
				inputLabel: (index, length) => `${index + 1}/${length}`,
				length: 2,
				mode: 'text',
				value: '👨‍👩‍👧‍👦你A'
			}
		}).body;
		expect(unicode.match(/data-slot="input"/gu)).toHaveLength(2);
		expect(unicode).toContain('value="👨‍👩‍👧‍👦"');
		expect(unicode).toContain('value="你"');
		expect(unicode).not.toContain('value="A"');
		expect(() => render(ZPinInput, { props: { inputLabel: () => 'Invalid', length: 0 } })).toThrow(
			/length must be an integer from 1 through 32/u
		);
	});

	it('rejects multiple value owners and nested groups during SSR too', () => {
		expect(() => render(InputGroupMultipleFixture)).toThrow(
			/exactly one registered business value control/u
		);
		expect(() => render(InputGroupNestedFixture)).toThrow(/cannot be nested/u);
	});
});
