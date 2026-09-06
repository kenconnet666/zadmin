import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZAffix from '../src/components/layout/ZAffix.svelte';
import ZBackTop from '../src/components/navigation/ZBackTop.svelte';

const children = createRawSnippet(() => ({ render: () => '<strong>Sticky tools</strong>' }));

describe('ZAffix and ZBackTop server contract', () => {
	it('renders native sticky content without pretending that client target projection is active', () => {
		const body = render(ZAffix, { props: { children, offsetTop: 12 } }).body;
		expect(body).toContain('data-mode="sticky"');
		expect(body).toContain('data-edge="top"');
		expect(body).toContain('top: 12px');
		expect(body).toContain('<strong>Sticky tools</strong>');
		expect(body).not.toContain('data-affixed="true"');
	});

	it('keeps target projection and BackTop visibility as client geometry facts', () => {
		const projected = render(ZAffix, {
			props: { children, scrollContainer: null }
		}).body;
		const backTop = render(ZBackTop, { props: { label: 'Back to start' } }).body;
		expect(projected).toContain('data-mode="fixed"');
		expect(projected).not.toContain('data-affixed="true"');
		expect(backTop).toContain('data-slot="anchor"');
		expect(backTop).not.toContain('<button');
	});

	it('rejects contradictory or invalid Affix offsets when SSR reads output', () => {
		expect(() => render(ZAffix, { props: { offsetBottom: 4, offsetTop: 4 } }).body).toThrow(
			'mutually exclusive'
		);
		expect(() => render(ZAffix, { props: { offsetTop: -1 } }).body).toThrow(
			'non-negative finite number'
		);
	});
});
