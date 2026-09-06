import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { expect, it } from 'vitest';
import ZFieldset from '../src/components/input/ZFieldset.svelte';

it('renders a native named group with independent controls and merged description IDs during SSR', () => {
	const children = createRawSnippet(() => ({
		render: () => '<input name="name" aria-label="Name" />'
	}));
	const html = render(ZFieldset, {
		props: {
			legend: 'Account',
			description: 'Group help',
			'aria-describedby': 'external-help',
			disabled: true,
			children
		}
	}).body;
	expect(html).toMatch(/<fieldset[^>]*disabled/);
	expect(html).toMatch(/<legend[^>]*>Account/);
	expect(html).toContain('external-help');
	expect(html).toContain('Group help');
	expect(html).toContain('aria-label="Name"');
	expect(html).not.toContain('role="group"');
});
