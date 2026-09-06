import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ToolbarToggleGroupFixture from './ToolbarToggleGroupFixture.svelte';

describe('ZToolbar and ZToggleGroup server composition contract', () => {
	it('renders one initial Toolbar Tab stop and preserves both native pressed-button groups', () => {
		const body = render(ToolbarToggleGroupFixture).body;
		const toolbarRoot = body.match(/<div[^>]*role="toolbar"[^>]*>/u)?.[0];
		const buttons = body.match(/<button(?:\s|>)[\s\S]*?<\/button>/gu) ?? [];

		expect(toolbarRoot).toContain('aria-label="Formatting toolbar"');
		expect(toolbarRoot).toContain('data-size="large"');
		expect(body.match(/tabindex="0"/gu)).toHaveLength(1);
		expect(buttons).toHaveLength(7);
		expect(buttons.filter((button) => button.includes('aria-pressed='))).toHaveLength(4);
		expect(body.match(/aria-pressed="true"/gu)).toHaveLength(2);
		expect(body.match(/aria-pressed="false"/gu)).toHaveLength(2);
		expect(body.match(/data-zui-form-value-bridge=""/gu)).toHaveLength(2);
		expect(body.match(/<input(?:\s|>)/gu)).toHaveLength(2);
	});
});
