import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZCode from '../src/components/gene/ZCode.svelte';
import CodeProductionFixture from './CodeProductionFixture.svelte';

describe('ZCode production server contract', () => {
	it('renders a real localized copy action without changing the pre ref owner', () => {
		const body = render(CodeProductionFixture).body;

		expect(body).toContain('<pre');
		expect(body).toContain('data-slot="copy-action"');
		expect(body).toContain('aria-label="Copy artifact"');
		expect(body).toContain('data-slot="copy-status"');
		expect(body).toContain('pnpm deploy');
	});

	it('rejects an inline interactive copy control', () => {
		expect(() =>
			render(ZCode, { props: { code: 'inline', copyable: true, inline: true } })
		).toThrow(/inline and copyable are mutually exclusive/u);
	});
});
