import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZSplitter from '../src/components/layout/ZSplitter.svelte';

const panels = [
	{ key: 1, label: 'Files', min: '8rem', collapsible: true },
	{ key: '1', label: 'Editor', min: 20 }
] as const;

describe('ZSplitter server contract', () => {
	it('renders deterministic keyed regions without inventing client geometry before measurement', () => {
		const body = render(ZSplitter, {
			props: {
				defaultSizes: ['15rem', 70],
				panel: (() => undefined) as never,
				panels
			}
		}).body;
		expect(body).toContain('role="region"');
		expect(body).toContain('aria-label="Files"');
		expect(body).toContain('role="separator"');
		expect(body).toContain('aria-controls=');
		expect(body).toContain('aria-orientation="vertical"');
		expect(body).toContain('tabindex="-1"');
		expect(body).not.toContain('aria-valuenow=');
		expect(body).not.toContain('aria-valuemin=');
		expect(body).not.toContain('aria-valuemax=');
		expect(body).not.toContain('aria-disabled=');
		expect(body).not.toContain('data-constrained=');
		expect(body).not.toContain('data-collapsed=');
		expect(body).toContain('data-measured="false"');
		expect(body.match(/aria-hidden="true"/gu)).toHaveLength(2);
		expect(body).not.toContain('inert');
		expect(body).toContain('data-key-type="number"');
		expect(body).toContain('data-key-type="string"');
		expect(body).not.toContain('data-resizing="true"');
		const percentages = render(ZSplitter, {
			props: {
				defaultSizes: [30, '70%'],
				panel: (() => undefined) as never,
				panels
			}
		}).body;
		expect(percentages).toContain('data-measured="false"');
		expect(percentages).not.toContain('aria-valuenow=');
	});

	it('validates panel identity, labels, size cardinality and constraints when body is read', () => {
		const base = { panel: (() => undefined) as never, panels };
		expect(() => render(ZSplitter, { props: { ...base, sizes: [100] } }).body).toThrow(
			/match panels length/u
		);
		expect(
			() =>
				render(ZSplitter, {
					props: {
						...base,
						panels: [
							{ key: 1, label: 'A' },
							{ key: 1, label: 'B' }
						]
					}
				}).body
		).toThrow(/unique panel keys/u);
		expect(
			() =>
				render(ZSplitter, {
					props: {
						...base,
						panels: [
							{ key: 1, label: ' ' },
							{ key: 2, label: 'B' }
						]
					}
				}).body
		).toThrow(/label must not be empty/u);
		expect(
			() =>
				render(ZSplitter, {
					props: {
						...base,
						panels: [
							{ key: 1, label: 'A', min: 80, max: 20 },
							{ key: 2, label: 'B' }
						]
					}
				}).body
		).toThrow(/cannot exceed/u);
	});

	it('does not infer cross-unit constraints or collapsed state without a real client axis', () => {
		const body = render(ZSplitter, {
			props: {
				defaultSizes: ['0px', 100],
				panel: (() => undefined) as never,
				panels: [
					{
						key: 'sidebar',
						label: 'Sidebar',
						min: '300px',
						max: '40%',
						collapsible: true,
						collapsedSize: '0px'
					},
					{ key: 'content', label: 'Content' }
				]
			}
		}).body;
		expect(body).toContain('data-measured="false"');
		expect(body).not.toContain('data-constrained=');
		expect(body).not.toContain('data-collapsed=');
		expect(body.match(/aria-hidden="true"/gu)).toHaveLength(2);
		expect(body).not.toContain('inert');
		expect(body).not.toContain('aria-valuenow=');
	});
});
