import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZSwitch from '../src/components/input/ZSwitch.svelte';

describe('ZSwitch SSR contract', () => {
	it('renders a native checked switch with stable form and state semantics', () => {
		const result = render(ZSwitch, {
			props: {
				defaultChecked: true,
				name: 'alerts',
				required: true,
				value: 42n
			}
		}).body;

		expect(result).toContain('data-slot="root"');
		expect(result).toContain('type="checkbox"');
		expect(result).toContain('role="switch"');
		expect(result).toContain('aria-checked="true"');
		expect(result).toContain('data-state="checked"');
		expect(result).toContain('name="alerts"');
		expect(result).toContain('required');
		expect(result).toContain('value="42"');
	});

	it('renders busy and readonly states without native disabling', () => {
		const result = render(ZSwitch, {
			props: { defaultChecked: true, loading: true, readonly: true }
		}).body;

		expect(result).toContain('aria-busy="true"');
		expect(result).toContain('aria-disabled="true"');
		expect(result).toContain('aria-readonly="true"');
		expect(result).toContain('data-loading="true"');
		expect(result).toContain('data-readonly="true"');
		expect(result).not.toContain(' disabled');
	});
});
