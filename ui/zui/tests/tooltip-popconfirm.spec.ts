import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import TooltipPopconfirmProductionFixture from './TooltipPopconfirmProductionFixture.svelte';

describe('Tooltip and Popconfirm server contract', () => {
	it('renders stable closed triggers without Portal content or browser globals', () => {
		const first = render(TooltipPopconfirmProductionFixture).body;
		const second = render(TooltipPopconfirmProductionFixture).body;
		expect(first).toBe(second);
		expect(first).toContain('data-testid="confirm-trigger"');
		expect(first).toContain('data-testid="tooltip-first"');
		expect(first).toContain('data-slot="disabled-trigger"');
		expect(first).not.toContain('data-testid="confirm-content"');
		expect(first).not.toContain('role="tooltip"');
	});
});
