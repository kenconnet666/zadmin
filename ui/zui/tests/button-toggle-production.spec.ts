import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZButton from '../src/components/gene/ZButton.svelte';
import ZToggleButton from '../src/components/gene/ZToggleButton.svelte';
import ButtonToggleProductionFixture from './ButtonToggleProductionFixture.svelte';

describe('Button and ToggleButton production server contract', () => {
	it('renders native button type and orthogonal visual state during SSR', () => {
		const result = render(ZButton, {
			props: { shape: 'circle', tone: 'danger', variant: 'secondary' }
		}).body;
		expect(result).toContain('<button');
		expect(result).toContain('type="button"');
		expect(result).toContain('data-variant="secondary"');
		expect(result).toContain('data-tone="danger"');
		expect(result).toContain('data-shape="circle"');
	});

	it('renders one hidden Spinner status beneath the Button-owned busy state', () => {
		const result = render(ZButton, { props: { loading: true, loadingLabel: 'Saving' } }).body;
		expect(result).toContain('aria-busy="true"');
		expect(result).toContain('aria-label="Saving"');
		expect(result).toContain('data-slot="loading"');
		expect(result).toContain('aria-hidden="true"');
		expect(result).toContain('role="status"');
	});

	it('renders ToggleButton pressed state with the shared Button visual contract', () => {
		const result = render(ZToggleButton, {
			props: { defaultPressed: true, tone: 'danger', variant: 'ghost' }
		}).body;
		expect(result).toContain('aria-pressed="true"');
		expect(result).toContain('data-state="on"');
		expect(result).toContain('data-variant="ghost"');
		expect(result).toContain('data-tone="danger"');
	});

	it('keeps the dedicated fixture deterministic', () => {
		const first = render(ButtonToggleProductionFixture).body;
		const second = render(ButtonToggleProductionFixture).body;
		expect(first).toBe(second);
	});
});
