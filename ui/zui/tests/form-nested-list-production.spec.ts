import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import FormNestedListFixture from './FormNestedListFixture.svelte';

describe('nested ZFormList server contract', () => {
	it('renders both list levels and their indexed field paths without browser globals', () => {
		const body = render(FormNestedListFixture).body;

		expect(body.match(/data-main-group-id=/gu)).toHaveLength(2);
		expect(body.match(/data-main-member-id=/gu)).toHaveLength(4);
		expect(body).toContain('name="groups[0].members[0].name"');
		expect(body).toContain('name="groups[0].members[1].name"');
		expect(body).toContain('name="groups[1].members[0].name"');
		expect(body).toContain('name="groups[1].members[1].name"');
	});
});
