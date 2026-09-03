import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ToastSsrFixture from './ToastSsrFixture.svelte';
import ToastQueueReplacementFixture from './ToastQueueReplacementFixture.svelte';

describe('Toast production SSR contract', () => {
	it('renders scoped records and centralized live regions without browser globals', () => {
		const result = render(ToastSsrFixture).body;
		expect(result).toContain('aria-label="Server notifications"');
		expect(result).toContain('data-slot="polite-announcer"');
		expect(result).toContain('data-slot="assertive-announcer"');
		expect(result).toContain('Server polite');
		expect(result).toContain('Server assertive');
		expect(result).not.toMatch(/<article[^>]+role=/u);
	});

	it('keeps queue replacement SSR-safe without connecting or disposing queues', () => {
		const result = render(ToastQueueReplacementFixture).body;
		expect(result).toContain('data-testid="toast-replacement-state"');
		expect(result).toContain('initial');
	});
});
