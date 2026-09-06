import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZToolbar from '../src/components/compound/toolbar/ZToolbar.svelte';
import ZToolbarItem from '../src/components/compound/toolbar/ZToolbarItem.svelte';
import ToolbarFixture from './ToolbarFixture.svelte';

describe('ZToolbar server contract', () => {
	it('renders named native toolbars with one enabled child Tab stop and no wrapper items', () => {
		const body = render(ToolbarFixture).body;
		expect(body.match(/role="toolbar"/gu)).toHaveLength(9);
		expect(body.match(/tabindex="0"/gu)).toHaveLength(9);
		const toolbarRoots = [...body.matchAll(/<div[^>]*role="toolbar"[^>]*>/gu)].map(
			([root]) => root
		);
		expect(toolbarRoots).toHaveLength(9);
		for (const root of toolbarRoots) {
			const name = root.match(/aria-(?:label|labelledby)="([^"]+)"/u)?.[1];
			expect(name?.trim().length).toBeGreaterThan(0);
			expect(root).toContain('data-slot="root"');
		}
		expect(body).toContain('aria-label="Editor toolbar"');
		expect(body).toContain('aria-orientation="horizontal"');
		expect(body).toContain('aria-orientation="vertical"');
		expect(body).toMatch(/aria-label="Provider toolbar"[^>]*data-size="large"/gu);
		const disabledButton = body.match(/<button[^>]*data-testid="toolbar-disabled"[^>]*>/u)?.[0];
		const disabledLink = body.match(/<a[^>]*data-testid="toolbar-disabled-link"[^>]*>/u)?.[0];
		expect(disabledButton).toContain('disabled');
		expect(disabledLink).toContain('aria-disabled="true"');
		expect(body).not.toContain('href="#toolbar-disabled-link"');
		expect(body).not.toContain('data-slot="toolbar-item"');
	});

	it('rejects invalid orientation and an Item without its owner while server output is read', () => {
		expect(() => render(ZToolbar).body).toThrow('requires aria-label or aria-labelledby');
		expect(
			() =>
				render(ZToolbar, {
					props: { 'aria-label': 'Invalid toolbar', orientation: 'both' as never }
				}).body
		).toThrow('orientation must be horizontal or vertical');
		expect(
			() =>
				render(ZToolbarItem, {
					props: {
						children: (() => undefined) as never,
						value: 'orphan'
					}
				}).body
		).toThrow('must be rendered inside ZToolbar');
	});
});
