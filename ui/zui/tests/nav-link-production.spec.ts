import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZNavLink from '../src/components/navigation/ZNavLink.svelte';

describe('ZNavLink server contract', () => {
	it('renders a real current anchor and keeps disclosure outside the anchor', () => {
		const body = render(ZNavLink, {
			props: {
				active: true,
				contentId: 'products-panel',
				description: 'Browse products',
				disclosureId: 'products-disclosure',
				expanded: false,
				external: true,
				href: 'https://example.com/products',
				id: 'products-link',
				label: 'Products',
				labelContent: createRawSnippet(() => ({
					render: () => '<strong>Product catalog</strong>'
				})),
				onExpandedChange: () => undefined,
				rel: 'help',
				target: '_blank'
			}
		}).body;
		expect(body).toContain('<a');
		expect(body).toContain('href="https://example.com/products"');
		expect(body).toContain('id="products-link"');
		expect(body).toContain('aria-current="page"');
		expect(body).toContain('aria-label="Products"');
		expect(body).toContain('<strong>Product catalog</strong>');
		expect(body).toContain('rel="help noopener noreferrer"');
		expect(body).toContain('data-slot="external-icon"');
		expect(body).toContain('aria-controls="products-panel"');
		expect(body).toContain('id="products-disclosure"');
		expect(body).toContain('aria-expanded="false"');
		expect(body).toContain('Browse products');
		expect(body.indexOf('</a>')).toBeLessThan(body.indexOf('<button'));
		expect(body.slice(body.indexOf('<a'), body.indexOf('</a>'))).not.toContain('<button');
	});

	it('uses a native disclosure button without href and passive content without either action', () => {
		const disclosure = render(ZNavLink, {
			props: {
				contentId: 'settings-panel',
				disclosureId: 'settings-disclosure',
				expanded: true,
				id: 'settings-primary-fallback',
				label: 'Settings',
				onExpandedChange: () => undefined
			}
		}).body;
		const passive = render(ZNavLink, { props: { label: 'Administration' } }).body;
		expect(disclosure).toContain('<button');
		expect(disclosure).toContain('type="button"');
		expect(disclosure).toContain('aria-expanded="true"');
		expect(disclosure).toContain('id="settings-disclosure"');
		expect(disclosure).not.toContain('id="settings-primary-fallback"');
		expect(disclosure).not.toContain('<a');
		expect(passive).toContain('<div');
		expect(passive).not.toContain('<button');
		expect(passive).not.toContain('<a');
		expect(passive).not.toContain('role=');
	});

	it('keeps compact rows named and supplies a visible fallback without a start snippet', () => {
		const body = render(ZNavLink, { props: { compact: true, label: 'Analytics' } }).body;
		expect(body).toContain('aria-label="Analytics"');
		expect(body).toContain('data-slot="compact-fallback"');
		expect(body).toContain('>A</span>');
		expect(body).not.toContain('data-slot="description"');
	});

	it('removes disabled anchor navigation while preserving separate current and expanded state', () => {
		const body = render(ZNavLink, {
			props: {
				active: true,
				disabled: true,
				expanded: true,
				href: '/disabled',
				label: 'Disabled',
				onExpandedChange: () => undefined,
				target: '_blank'
			}
		}).body;
		expect(body).toContain('aria-current="page"');
		expect(body).toContain('aria-expanded="true"');
		expect(body).toContain('aria-disabled="true"');
		expect(body).toContain('<button');
		expect(body).toContain('disabled');
		expect(body).not.toContain('href=');
		expect(body).not.toContain('target=');
	});
});
