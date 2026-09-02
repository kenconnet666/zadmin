import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import OverlayProductionSsrFixture from './OverlayProductionSsrFixture.svelte';

describe('Overlay production SSR contract', () => {
	it('renders stable modal names, required AlertDialog description and explicit Popover label', () => {
		const result = render(OverlayProductionSsrFixture).body;
		expect(result).toContain('role="dialog"');
		expect(result).toContain('aria-labelledby=');
		expect(result).not.toMatch(/role="dialog"[^>]*aria-describedby/u);
		expect(result).toContain('role="alertdialog"');
		expect(result).toContain('aria-describedby=');
		expect(result).toContain('aria-label="SSR popover"');
	});
});
