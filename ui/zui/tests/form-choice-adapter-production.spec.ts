import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FormChoiceAdapterFixture from './FormChoiceAdapterFixture.svelte';

describe('Switch and RadioGroup Form model server contract', () => {
	it('renders true native owners with model defaults and external form association', () => {
		const body = render(FormChoiceAdapterFixture).body;
		expect(body.match(/role="switch"/gu)).toHaveLength(3);
		expect(body.match(/role="radiogroup"/gu)).toHaveLength(2);
		expect(body).toContain('name="enabled"');
		expect(body).toContain('name="choice"');
		expect(body).toContain('value="1"');
		expect(body).toContain('value="2"');
		expect(body).toContain('form="choice-external-form"');
		expect(body).toContain('checked');
	});
});
