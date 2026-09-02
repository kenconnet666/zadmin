import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import MenuFamilyProductionFixture from './MenuFamilyProductionFixture.svelte';

describe('Menu family production SSR contract', () => {
	it('renders every menu member with its semantic role and ARIA relationship', () => {
		const body = render(MenuFamilyProductionFixture).body;

		// ZMenu / ZMenuGroup / ZMenuLabel / ZMenuItem
		expect(body).toMatch(/<div[^>]*aria-label="Production menu"[^>]*role="menu"/u);
		expect(body).toMatch(/<div[^>]*role="group"/u);
		expect(body).toMatch(/<div[^>]*id="[^"]+-label"[^>]*>[\s\S]*Primary[\s\S]*<\/div>/u);
		expect(body).toMatch(/data-testid="menu-first"[^>]*role="menuitem"/u);

		// Checkbox and radio members retain selection semantics in the server HTML.
		expect(body).toMatch(
			/data-testid="menu-check"[^>]*role="menuitemcheckbox"[^>]*aria-checked="mixed"/u
		);
		expect(body).toMatch(/<div[^>]*aria-label="Typed radio"[^>]*role="group"/u);
		expect(body).toMatch(/data-testid="menu-radio-number"[^>]*role="menuitemradio"/u);
		expect(body).toMatch(/data-testid="menu-radio-string"[^>]*role="menuitemradio"/u);

		// Separator is a real semantic descendant, not a documentation placeholder.
		expect(body).toMatch(/<div[^>]*role="separator"[^>]*>/u);
		// Dropdown submenu is portal/presence-owned and intentionally closed during SSR; its real
		// trigger/content semantics are covered by the focused browser contract below.
		expect(body).not.toMatch(/data-testid="dropdown-sub-trigger"/u);
		expect(body).not.toMatch(/data-testid="dropdown-sub-content"/u);
	});

	it('renders open Dropdown and Context layers with real trigger/content ARIA contracts', () => {
		const body = render(MenuFamilyProductionFixture).body;

		expect(body).toMatch(
			/data-testid="dropdown-trigger"[^>]*aria-controls="[^"]+"[^>]*aria-expanded="false"[^>]*aria-haspopup="menu"/u
		);
		expect(body).toMatch(
			/data-testid="context-trigger"[^>]*aria-controls="[^"]+"[^>]*aria-haspopup="menu"[^>]*data-state="closed"/u
		);
		// Context/Dropdown contents are portal + presence owned and therefore absent in SSR.
		expect(body).not.toMatch(/data-testid="context-content"/u);
	});
});
