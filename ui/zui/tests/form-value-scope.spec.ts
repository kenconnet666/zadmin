import { render } from 'svelte/server';
import { expect, it } from 'vitest';
import FormValueScopeFixture from './FormValueScopeFixture.svelte';

it('shadows the inherited model field from nonparticipating date views and suffix controls', () => {
	const body = render(FormValueScopeFixture).body;
	// A leaked scope would interpret these controlled dates as the ancestor string model field.
	expect(body).toContain('name="text"');
	expect(body).toContain('value="keep"');
	expect(body).not.toContain('name="ignored-date"');
	expect(body).not.toContain('name="ignored-time"');
	expect(body).not.toContain('name="ignored-calendar"');
	expect(body).not.toContain('name="ignored-date-time"');
	expect(body).toContain('data-testid="date-time-none-suffix"');
	expect(body).toContain('value="suffix-local"');
	expect(body.match(/name="text"/gu)).toHaveLength(1);
});
