import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZHeading from '../src/components/gene/ZHeading.svelte';
import ZKbd from '../src/components/gene/ZKbd.svelte';
import ZLink from '../src/components/gene/ZLink.svelte';
import ZText from '../src/components/gene/ZText.svelte';

describe('gene primitive API forwarding', () => {
	it('keeps ZText semantic element and native label attributes together', () => {
		const body = render(ZText, {
			props: {
				as: 'label',
				for: 'service-name',
				id: 'service-name-label',
				title: 'Service name'
			}
		}).body;

		expect(body).toContain('<label');
		expect(body).toContain('for="service-name"');
		expect(body).toContain('id="service-name-label"');
		expect(body).toContain('title="Service name"');
	});

	it('keeps ZHeading level, visual state markers, and native attributes independent', () => {
		const body = render(ZHeading, {
			props: { 'aria-label': 'Service health', id: 'service-health', level: 4, size: 'small' }
		}).body;

		expect(body).toContain('<h4');
		expect(body).toContain('data-level="4"');
		expect(body).toContain('data-size="small"');
		expect(body).toContain('aria-label="Service health"');
		expect(body).toContain('id="service-health"');
	});

	it('keeps ZKbd a native keyboard-text element while forwarding attributes', () => {
		const body = render(ZKbd, {
			props: { 'aria-label': 'Command', 'data-key': 'command', title: 'Command key' }
		}).body;

		expect(body).toContain('<kbd');
		expect(body).toContain('aria-label="Command"');
		expect(body).toContain('data-key="command"');
		expect(body).toContain('title="Command key"');
		expect(body).not.toContain('role=');
	});

	it('keeps ZLink appearance state separate from native anchor attributes', () => {
		const body = render(ZLink, {
			props: {
				appearance: 'button',
				download: 'service-report.txt',
				href: '/reports/service.txt',
				size: 'large',
				variant: 'secondary'
			}
		}).body;

		expect(body).toContain('<a');
		expect(body).toContain('data-appearance="button"');
		expect(body).toContain('data-size="large"');
		expect(body).toContain('download="service-report.txt"');
		expect(body).toContain('href="/reports/service.txt"');
	});
});
