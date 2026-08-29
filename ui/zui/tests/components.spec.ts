import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import {
	createIcssRuntime,
	createServerStyleRegistry,
	defaultTheme,
	extendTheme,
	ZBox,
	ZButton,
	ZField,
	ZIcon,
	ZInput,
	ZStack,
	ZText
} from '../src/lib/index.js';
import { ZCode } from '../src/lib/code.js';
import { getIconPaths } from '../src/lib/components/gene/ZIcon.svelte';
import { __icssCarrier } from '../src/lib/runtime/internal.js';
import FieldFixture from './FieldFixture.svelte';
import ProviderRuntimeFixture from './ProviderRuntimeFixture.svelte';

describe('ZUI foundational components', () => {
	it('renders Symbol-carried compiler variables on the real ZBox root', () => {
		const result = render(ZBox, {
			props: {
				...__icssCarrier({ '--panel-width-test-0': 320 }),
				class: 'external'
			}
		});

		expect(result.body).toContain('<div class="external" style="--panel-width-test-0:320">');
		expect(result.body).not.toContain('svelte-css-wrapper');
	});

	it('renders typed layout and text roots', () => {
		expect(render(ZStack, { props: { direction: 'row', gap: 'large' } }).body).toContain('<div');
		expect(render(ZText, { props: { as: 'strong', tone: 'primary' } }).body).toContain('<strong');
	});

	it('renders an accessible native button with loading state', () => {
		const result = render(ZButton, {
			props: { loading: true, loadingLabel: 'Saving', variant: 'primary' }
		});

		expect(result.body).toContain('<button');
		expect(result.body).toContain('type="button"');
		expect(result.body).toContain('disabled');
		expect(result.body).toContain('aria-busy="true"');
		expect(result.body).toContain('aria-label="Saving"');
		expect(result.body).not.toContain('svelte-css-wrapper');
	});

	it('renders accessible icons, inputs and field relationships', () => {
		const decorative = render(ZIcon, { props: { name: 'search' } }).body;
		const labelled = render(ZIcon, { props: { label: 'Search', name: 'search' } }).body;
		const ariaLabelled = render(ZIcon, {
			props: { 'aria-label': 'External search', name: 'search' }
		}).body;
		const field = render(FieldFixture).body;

		expect(decorative).toContain('aria-hidden="true"');
		expect(labelled).toContain('role="img"');
		expect(labelled).toContain('aria-label="Search"');
		expect(ariaLabelled).toContain('aria-label="External search"');
		expect(ariaLabelled).toContain('role="img"');
		expect(() => getIconPaths('missing' as never)).toThrow(/Unknown ZIcon/);
		expect(render(ZInput).body).toContain('type="text"');
		expect(render(ZInput, { props: { defaultValue: 'seed' } }).body).toContain('value="seed"');
		expect(field).toMatch(/<label[^>]+for="[^"]+-control"/u);
		expect(field).toMatch(/<input[^>]+id="[^"]+-control"/u);
		expect(field).toContain('aria-invalid="true"');
		expect(field).toContain('aria-live="polite"');
		expect(field).toContain('required');
		expect(render(ZField, { props: { label: 'Optional' } }).body).not.toContain(
			'aria-hidden="true"> *'
		);
	});

	it('inherits an explicit runtime through nested providers during SSR', () => {
		const registry = createServerStyleRegistry();
		const runtime = createIcssRuntime({ registry });
		const nestedTheme = extendTheme(defaultTheme, {
			color: { primary: '#6d28d9', primaryHover: '#5b21b6' }
		});
		const result = render(ProviderRuntimeFixture, {
			props: { nestedTheme, runtime, theme: defaultTheme }
		});

		expect(result.body).toContain('data-testid="outer-provider"');
		expect(result.body).toContain('data-testid="inner-provider"');
		expect(result.body).toContain('data-testid="outer-context">zh-CN:rtl');
		expect(result.body).toContain('data-testid="inner-context">zh-CN:rtl');
		expect(registry.cssText()).toContain('#2563eb');
		expect(registry.cssText()).toContain('#6d28d9');
	});

	it('renders ZCode as stable escaped plain code during SSR', () => {
		const result = render(ZCode, {
			props: { code: '<script>unsafe()</script>', lang: 'svelte', lineNumbers: true }
		});

		expect(result.body).toContain('<pre');
		expect(result.body).toContain('data-highlight-status="plain"');
		expect(result.body).toContain('&lt;script>unsafe()&lt;/script>');
		expect(result.body).not.toContain('<script>');
	});
});
