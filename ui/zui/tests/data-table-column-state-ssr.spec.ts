import { render } from 'svelte/server';
import { expect, it } from 'vitest';

import DataTableColumnStateFixture from './DataTableColumnStateFixture.svelte';

it('renders valid prototype-like column IDs without treating inherited properties as state', () => {
	const body = render(DataTableColumnStateFixture).body;
	expect(body).toContain('data-column-id="name"');
	for (const id of ['constructor', 'toString', '__proto__'])
		expect(body).not.toContain(`data-column-id="${id}"`);
});
