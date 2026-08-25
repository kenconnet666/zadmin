import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import { Box, Button, Stack, Text } from '../src/lib/index.js';

describe('ZUI foundational components', () => {
	it('renders compiler variables on the real Box root without wrappers', () => {
		const result = render(Box, {
			props: {
				__icssVariables: { '--panel-width-test-0': 320 },
				class: 'external'
			}
		});

		expect(result.body).toContain('<div class="external" style="--panel-width-test-0:320">');
		expect(result.body).not.toContain('svelte-css-wrapper');
	});

	it('renders typed layout and text roots', () => {
		expect(render(Stack, { props: { direction: 'row', gap: 'large' } }).body).toContain('<div');
		expect(render(Text, { props: { as: 'strong', color: 'primary' } }).body).toContain('<strong');
	});

	it('renders an accessible native button with loading state', () => {
		const result = render(Button, { props: { loading: true, variant: 'primary' } });

		expect(result.body).toContain('<button');
		expect(result.body).toContain('type="button"');
		expect(result.body).toContain('disabled');
		expect(result.body).toContain('aria-busy="true"');
		expect(result.body).not.toContain('svelte-css-wrapper');
	});
});
