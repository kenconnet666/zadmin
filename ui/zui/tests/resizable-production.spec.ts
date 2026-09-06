import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZResizable from '../src/components/layout/ZResizable.svelte';

describe('ZResizable server contract', () => {
	it('renders logical edge and corner handles without inventing owner geometry', () => {
		const body = render(ZResizable, {
			props: {
				axis: 'both',
				height: '120px',
				handleLabel: (handle) => `Resize ${handle}`,
				width: '62.5%'
			}
		}).body;

		expect(body).toContain('data-axis="both"');
		expect(body).toContain('data-measured="false"');
		expect(body).toContain('data-size="medium"');
		expect(body).toContain('--zui-resizable-width:62.5%');
		expect(body).not.toContain('percent');
		expect(body).toContain('--zui-resizable-height:120px');
		expect(body.match(/data-slot="handle"/gu)).toHaveLength(3);
		expect(body.match(/role="separator"/gu)).toHaveLength(2);
		expect(body.match(/<button(?:\s|>)/gu)).toHaveLength(1);
		expect(body.match(/tabindex="-1"/gu)).toHaveLength(3);
		expect(body).toContain('aria-orientation="vertical"');
		expect(body).toContain('aria-orientation="horizontal"');
		expect(body).toContain('aria-label="Resize inline-end"');
		expect(body).toContain('aria-label="Resize block-end-inline-end"');
		expect(body).not.toContain('aria-valuenow=');
		expect(body).not.toContain('aria-valuemin=');
		expect(body).not.toContain('aria-valuemax=');
		expect(body).not.toContain('aria-disabled=');
		expect(body).not.toContain('data-resizing="true"');
	});

	it('validates configuration lazily while reading server body', () => {
		expect(() => render(ZResizable, { props: { axis: 'physical' as never } }).body).toThrow(
			'Invalid ZResizable axis'
		);
		expect(
			() =>
				render(ZResizable, {
					props: { handles: ['inline-end', 'inline-end'] }
				}).body
		).toThrow('handles must be unique');
		expect(
			() =>
				render(ZResizable, {
					props: { axis: 'inline', handles: ['block-end'] }
				}).body
		).toThrow('handle must match axis');
		expect(() => render(ZResizable, { props: { width: '10em' as never } }).body).toThrow(
			'%, px, or rem'
		);
		expect(
			() => render(ZResizable, { props: { minWidth: '300px', maxWidth: '100px' } }).body
		).toThrow('minWidth cannot exceed maxWidth');
		expect(() => render(ZResizable, { props: { step: 0 } }).body).toThrow(
			'step must be positive and finite'
		);
	});
});
