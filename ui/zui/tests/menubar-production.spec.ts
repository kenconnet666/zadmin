import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import MenubarFixture from './MenubarFixture.svelte';

describe('ZMenubar server contract', () => {
	it('renders named menubars with one root menuitem Tab stop and no menu wrapper DOM', () => {
		const body = render(MenubarFixture).body;
		const root = body.match(/<div[^>]*data-testid="menubar-root"[^>]*>/u)?.[0];
		expect(root).toContain('role="menubar"');
		expect(root).toContain('aria-label="Application commands"');
		expect(root).toContain('aria-orientation="horizontal"');
		expect(root).toContain('data-size="medium"');
		expect(body.match(/data-testid="menubar-(?:file|edit|view)-trigger"/gu)).toHaveLength(3);
		expect(body.match(/role="menuitem"/gu)).toHaveLength(10);
		const rootTriggers = body.match(
			/<button[^>]*data-testid="menubar-(?:file|edit|view)-trigger"[^>]*>/gu
		);
		expect(rootTriggers?.filter((trigger) => trigger.includes('tabindex="0"'))).toHaveLength(1);
		expect(body).not.toContain('data-slot="menubar-menu"');
	});

	it('SSR opens exactly one typed root menu and reuses checkbox, radio and submenu semantics', () => {
		const file = render(MenubarFixture, { props: { defaultValue: 'file' } }).body;
		expect(file).toContain('data-testid="menubar-file-content"');
		expect(file).toContain('role="menu"');
		expect(file).toContain('role="menuitemcheckbox"');
		expect(file).not.toContain('data-testid="menubar-edit-content"');

		const view = render(MenubarFixture, { props: { defaultValue: 'view' } }).body;
		expect(view).toContain('data-testid="menubar-view-content"');
		expect(view).toContain('aria-haspopup="menu"');
		expect(view).not.toContain('data-testid="menubar-file-content"');
	});
});
