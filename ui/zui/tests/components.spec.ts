import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import {
	createIcssRuntime,
	createServerStyleRegistry,
	defaultTheme,
	extendTheme,
	ZAspectRatio,
	ZBox,
	ZButton,
	ZContainer,
	ZCheckbox,
	ZField,
	ZIcon,
	ZInput,
	ZKbd,
	ZLink,
	ZPagination,
	ZPopover,
	ZSeparator,
	ZSlider,
	ZStack,
	ZSwitch,
	ZText,
	ZToggleButton,
	ZVisuallyHidden
} from '../src/entrypoints/index.js';
import { ZCode } from '../src/entrypoints/code.js';
import Camera from '@lucide/svelte/icons/camera';
import { normalizeAspectRatio } from '../src/components/layout/ZAspectRatio.svelte';
import { getIconComponent, iconManifest } from '../src/components/gene/ZIcon.svelte';
import { __icssCarrier } from '../src/runtime/foundation/compiler-bridge.js';
import ContextProbe from './ContextProbe.svelte';
import AccordionFixture from './AccordionFixture.svelte';
import AlertDialogFixture from './AlertDialogFixture.svelte';
import FieldFixture from './FieldFixture.svelte';
import DialogFixture from './DialogFixture.svelte';
import DrawerFixture from './DrawerFixture.svelte';
import PopoverFixture from './PopoverFixture.svelte';
import ProviderRuntimeFixture from './ProviderRuntimeFixture.svelte';
import RadioGroupFixture from './RadioGroupFixture.svelte';
import TabsFixture from './TabsFixture.svelte';
import TooltipFixture from './TooltipFixture.svelte';

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

	it('renders toggle button state without changing native button semantics', () => {
		const off = render(ZToggleButton).body;
		const on = render(ZToggleButton, { props: { defaultPressed: true } }).body;

		expect(off).toContain('<button');
		expect(off).toContain('aria-pressed="false"');
		expect(off).toContain('data-state="off"');
		expect(on).toContain('aria-pressed="true"');
		expect(on).toContain('data-state="on"');
	});

	it('renders native checkbox and mixed state contracts during SSR', () => {
		const checked = render(ZCheckbox, { props: { defaultChecked: true, name: 'ready' } }).body;
		const mixed = render(ZCheckbox, {
			props: { defaultChecked: 'indeterminate', value: 42n }
		}).body;

		expect(checked).toContain('type="checkbox"');
		expect(checked).toContain('checked');
		expect(checked).toContain('name="ready"');
		expect(mixed).toContain('aria-checked="mixed"');
		expect(mixed).toContain('data-state="indeterminate"');
		expect(mixed).toContain('value="42"');
	});

	it('renders switch accessibility and native form contracts during SSR', () => {
		const result = render(ZSwitch, {
			props: { defaultChecked: true, name: 'alerts', value: 'enabled' }
		}).body;

		expect(result).toContain('type="checkbox"');
		expect(result).toContain('role="switch"');
		expect(result).toContain('aria-checked="true"');
		expect(result).toContain('data-state="checked"');
		expect(result).toContain('value="enabled"');
	});

	it('renders compound radio group with native checked state during SSR', () => {
		const result = render(RadioGroupFixture).body;

		expect(result).toContain('role="radiogroup"');
		expect(result).toContain('aria-orientation="horizontal"');
		expect(result).toContain('type="radio"');
		expect(result).toMatch(/value="b"[^>]*checked/u);
	});

	it('renders Tabs with stable Trigger and Panel ARIA relationships during SSR', () => {
		const result = render(TabsFixture).body;
		const controls = result.match(/aria-controls="([^"]+)"/u)?.[1];
		const labelledBy = result.match(
			new RegExp(`id="${controls}"[^>]*aria-labelledby="([^"]+)"`, 'u')
		)?.[1];

		expect(result).toContain('role="tablist"');
		expect(result).toContain('role="tab"');
		expect(result).toContain('role="tabpanel"');
		expect(controls).toBeDefined();
		expect(labelledBy).toBeDefined();
		expect(result).toContain(`id="${labelledBy}"`);
	});

	it('renders localized pagination with aria-current and boundary controls during SSR', () => {
		const result = render(ZPagination, { props: { defaultPage: 3, totalPages: 10 } }).body;

		expect(result).toContain('<nav');
		expect(result).toContain('aria-label="Pagination"');
		expect(result).toContain('aria-current="page"');
		expect(result).toContain('aria-label="Previous page"');
		expect(result).toContain('aria-label="Next page"');
	});

	it('renders native range Slider with normalized value and form semantics during SSR', () => {
		const result = render(ZSlider, {
			props: { defaultValue: 37, formatValue: (value) => `${value}%`, name: 'threshold', step: 5 }
		}).body;

		expect(result).toContain('type="range"');
		expect(result).toContain('name="threshold"');
		expect(result).toContain('value="35"');
		expect(result).toContain('aria-valuetext="35%"');
	});

	it('renders Accordion Trigger and open Content with stable ARIA relationships during SSR', () => {
		const result = render(AccordionFixture).body;
		const contentId = result.match(/aria-controls="([^"]+)"/u)?.[1];

		expect(result).toContain('aria-expanded="true"');
		expect(contentId).toBeDefined();
		expect(result).toContain(`id="${contentId}"`);
		expect(result).toContain('role="region"');
		expect(result).toContain('Alpha content');
	});

	it('renders Popover SSR closed by default and inline when initially open', () => {
		expect(render(PopoverFixture).body).not.toContain('role="dialog"');
		const open = render(PopoverFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('aria-expanded="true"');
		expect(open).toContain('role="dialog"');
	});

	it('renders Tooltip SSR only when initially open with description linkage', () => {
		expect(render(TooltipFixture).body).not.toContain('role="tooltip"');
		const open = render(TooltipFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('aria-describedby=');
		expect(open).toContain('role="tooltip"');
	});

	it('renders Dialog SSR with stable title and description relationships', () => {
		expect(render(DialogFixture).body).not.toContain('role="dialog"');
		const open = render(DialogFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="dialog"');
		expect(open).toContain('aria-modal="true"');
		expect(open).toMatch(/aria-labelledby="([^"]+)"/u);
		expect(open).toMatch(/aria-describedby="([^"]+)"/u);
		expect(open).toContain('Fixture dialog');
	});

	it('renders AlertDialog SSR with explicit-action semantics', () => {
		expect(render(AlertDialogFixture).body).not.toContain('role="alertdialog"');
		const open = render(AlertDialogFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="alertdialog"');
		expect(open).toContain('aria-modal="true"');
		expect(open).toContain('Delete production?');
		expect(open).toContain('This cannot be undone.');
	});

	it('renders Drawer SSR with dialog relationships when initially open', () => {
		expect(render(DrawerFixture).body).not.toContain('role="dialog"');
		const variants = [
			{ direction: 'ltr', motion: 'auto', placement: 'start', size: 'small' },
			{ direction: 'rtl', motion: 'full', placement: 'start', size: 'medium' },
			{ direction: 'ltr', motion: 'reduced', placement: 'end', size: 'large' },
			{ direction: 'rtl', motion: 'auto', placement: 'end', size: 'full' },
			{ direction: 'ltr', motion: 'auto', placement: 'top', size: 'medium' },
			{ direction: 'ltr', motion: 'auto', placement: 'bottom', size: 'medium' }
		] as const;
		const rendered = variants.map(
			(variant) => render(DrawerFixture, { props: { defaultOpen: true, ...variant } }).body
		);
		const open = rendered[0] ?? '';
		expect(open).toContain('role="dialog"');
		expect(open).toContain('aria-modal="true"');
		expect(open).toContain('Fixture drawer');
		expect(new Set(rendered)).toHaveLength(variants.length);
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
		expect(labelled).toContain('lucide-search');
		expect(getIconComponent('search')).toBe(iconManifest.search);
		expect(() => getIconComponent('missing' as never)).toThrow(/Unknown ZIcon/);
		expect(render(Camera).body).toContain('lucide-camera');
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
		expect(result.body).toContain(
			'data-testid="outer-context">zh-CN:rtl:dark:high:compact:reduced:test:关闭:default-portal'
		);
		expect(result.body).toContain(
			'data-testid="inner-context">zh-CN:rtl:dark:high:compact:reduced:test:关闭:default-portal'
		);
		expect(registry.cssText()).toContain('#2563eb');
		expect(registry.cssText()).toContain('#6d28d9');
	});

	it('provides SSR-stable defaults outside an explicit provider', () => {
		expect(render(ContextProbe, { props: { id: 'default-context' } }).body).toContain(
			'data-testid="default-context">en-US:ltr:light:normal:comfortable:auto:zui:none:default-portal'
		);
	});

	it('renders ZCode as stable escaped plain code during SSR', () => {
		const result = render(ZCode, {
			props: { code: '<script>unsafe()</script>', lang: 'svelte', lineNumbers: true }
		});

		expect(result.body).toContain('<pre');
		expect(result.body).toContain('data-highlight-status="plain"');
		expect(result.body).toContain('&lt;script>unsafe()&lt;/script>');
		expect(result.body).not.toContain('<script>');
		const inline = render(ZCode, { props: { code: 'inline', inline: true, wrap: true } });
		expect(inline.body).toContain('<code');
		expect(inline.body).toContain('>inline');
		const dark = render(ZCode, { props: { code: 'dark', embedded: true, scheme: 'dark' } });
		expect(dark.body).toContain('data-color-scheme="dark"');
	});

	it('renders S1 semantic and layout primitives without wrapper abstractions', () => {
		const link = render(ZLink, {
			props: { href: '/docs', target: '_blank' }
		}).body;
		const disabledLink = render(ZLink, {
			props: { disabled: true, href: '/hidden' }
		}).body;

		expect(link).toContain('<a');
		expect(link).toContain('href="/docs"');
		expect(link).toContain('rel="noopener noreferrer"');
		expect(disabledLink).toContain('aria-disabled="true"');
		expect(disabledLink).not.toContain('href=');
		expect(render(ZSeparator).body).toContain('<hr');
		expect(render(ZSeparator, { props: { orientation: 'vertical' } }).body).toContain(
			'role="separator"'
		);
		expect(render(ZKbd).body).toContain('<kbd');
		expect(render(ZVisuallyHidden).body).toContain('<span');
		expect(render(ZContainer, { props: { size: 'small' } }).body).toContain('<div');
		expect(render(ZAspectRatio, { props: { ratio: '4 / 3' } }).body).toContain(
			'--zui-aspect-ratio:4 / 3'
		);
		expect(normalizeAspectRatio(1.5)).toBe('1.5');
		expect(() => normalizeAspectRatio(0)).toThrow(/must be positive/);
		expect(() => normalizeAspectRatio('4 / 0')).toThrow(/positive width \/ height/);
	});
});
