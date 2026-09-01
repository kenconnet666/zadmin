import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import FeedbackStatusSsrFixture from './FeedbackStatusSsrFixture.svelte';

describe('Alert, Spinner and LoadingBar production SSR contracts', () => {
	it('renders stable feedback semantics without browser globals', () => {
		const result = render(FeedbackStatusSsrFixture).body;
		expect(result).toMatch(/data-testid="ssr-alert-off"(?![^>]*role=)/u);
		expect(result).toMatch(/data-testid="ssr-alert-polite"[^>]*role="status"/u);
		expect(result).toMatch(/data-testid="ssr-alert-assertive"[^>]*role="alert"/u);
		expect(result).toContain('data-slot="icon"');
		expect(result).toMatch(/data-testid="ssr-spinner"[^>]*role="status"/u);
		expect(result).toMatch(/data-testid="ssr-spinner-hidden"[^>]*aria-hidden="true"/u);
		expect(result).toMatch(/data-testid="ssr-loading-value"[^>]*aria-valuenow="40"/u);
		expect(result).toMatch(/data-testid="ssr-loading-indeterminate"(?![^>]*aria-valuenow)/u);
		expect(result).toMatch(/data-testid="ssr-loading-page"[^>]*data-mode="page"/u);
		expect(result).toMatch(/data-testid="ssr-loading-idle"[^>]*hidden/u);
	});
});
