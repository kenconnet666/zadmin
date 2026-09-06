import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import ZCopyButton from '../src/components/gene/ZCopyButton.svelte';
describe('CopyButton server semantics', () => {
	it('renders a true non-submit button with idle feedback and one live status', () => {
		const body = render(ZCopyButton, {
			props: { value: 'original\nsource', label: 'Copy source' }
		}).body;
		expect(body).toContain('type="button"');
		expect(body).toContain('aria-label="Copy source"');
		expect(body).toContain('data-copy-state="idle"');
		expect(body).toContain('data-copy-icon="copy"');
		expect(body.match(/aria-live="polite"/g)).toHaveLength(1);
		expect(body).not.toContain('original\nsource');
	});
	it('keeps an accessible name when only the state icon is visible', () => {
		const body = render(ZCopyButton, {
			props: { value: 'source', label: 'Copy private reference', iconOnly: true }
		}).body;
		expect(body).toContain('aria-label="Copy private reference"');
		expect(body).toContain('data-shape="square"');
		expect(body).not.toContain('data-slot="label"');
	});
});
