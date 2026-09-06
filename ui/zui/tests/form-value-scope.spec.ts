import { render } from 'svelte/server';
import { expect, it } from 'vitest';
import FormValueScopeFixture from './FormValueScopeFixture.svelte';

it('allows explicit nonparticipating date views without claiming the inherited model field', () => {
	const body = render(FormValueScopeFixture).body;
	// A leaked scope would interpret these controlled dates as the ancestor string model field.
	expect(body).toContain('name="text"');
	expect(body).toContain('value="keep"');
	expect(body).not.toContain('name="ignored-date"');
	expect(body).not.toContain('name="ignored-time"');
	expect(body).not.toContain('name="ignored-calendar"');
});
