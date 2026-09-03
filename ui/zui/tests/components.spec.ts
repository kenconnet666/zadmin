import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import {
	createIcssRuntime,
	createServerStyleRegistry,
	defaultTheme,
	extendTheme,
	ZAspectRatio,
	ZAccordion,
	ZBox,
	ZButton,
	ZContainer,
	ZCheckbox,
	ZCombobox,
	ZDialog,
	ZField,
	ZIcon,
	ZInput,
	ZKbd,
	ZLink,
	ZMenu,
	ZMultiSelect,
	ZPagination,
	ZPopover,
	ZSeparator,
	ZSlider,
	ZStack,
	ZSelect,
	ZSwitch,
	ZText,
	ZTabs,
	ZTooltip,
	ZToggleButton,
	ZVisuallyHidden
} from '../src/entrypoints/index.js';
import { ZCode } from '../src/entrypoints/code.js';
import Camera from '@lucide/svelte/icons/camera';
import { normalizeAspectRatio } from '../src/components/layout/ZAspectRatio.svelte';
import { getIconComponent, iconManifest } from '../src/components/gene/ZIcon.svelte';
import { __icssCarrier } from '../src/runtime/foundation/compiler-bridge.js';
import FormValueBridge, {
	type FormValueBridgeProps
} from '../src/runtime/form/FormValueBridge.svelte';
import ContextProbe from './ContextProbe.svelte';
import ContextMenuFixture from './ContextMenuFixture.svelte';
import ComboboxFixture from './ComboboxFixture.svelte';
import CommandFixture from './CommandFixture.svelte';
import CoverageFixture from './CoverageFixture.svelte';
import AllDocsExamplesSsrFixture from './AllDocsExamplesSsrFixture.svelte';
import CommandPaletteFixture from './CommandPaletteFixture.svelte';
import CascaderFixture from './CascaderFixture.svelte';
import CarouselFixture from './CarouselFixture.svelte';
import ColorPickerFixture from './ColorPickerFixture.svelte';
import AccordionFixture from './AccordionFixture.svelte';
import AccordionInvalidNestedFixture from './AccordionInvalidNestedFixture.svelte';
import AccordionTabsProductionFixture from './AccordionTabsProductionFixture.svelte';
import AlertDialogFixture from './AlertDialogFixture.svelte';
import FieldFixture from './FieldFixture.svelte';
import FileUploadFixture from './FileUploadFixture.svelte';
import FormFixture from './FormFixture.svelte';
import FormEdgeFixture from './FormEdgeFixture.svelte';
import InputGroupFixture from './InputGroupFixture.svelte';
import MenuFixture from './MenuFixture.svelte';
import MentionFixture from './MentionFixture.svelte';
import MultiSelectFixture from './MultiSelectFixture.svelte';
import NativeIdentityFixture from './NativeIdentityFixture.svelte';
import NumberFieldFixture from './NumberFieldFixture.svelte';
import PinInputFixture from './PinInputFixture.svelte';
import DialogFixture from './DialogFixture.svelte';
import DateFixture from './DateFixture.svelte';
import DateProductionFixture from './DateProductionFixture.svelte';
import DataFixture from './DataFixture.svelte';
import DisplayFixture from './DisplayFixture.svelte';
import FeedbackFixture from './FeedbackFixture.svelte';
import DrawerFixture from './DrawerFixture.svelte';
import DropdownMenuFixture from './DropdownMenuFixture.svelte';
import PopoverFixture from './PopoverFixture.svelte';
import PopconfirmFixture from './PopconfirmFixture.svelte';
import ProviderRuntimeFixture from './ProviderRuntimeFixture.svelte';
import ComponentDefaultsFixture from './ComponentDefaultsFixture.svelte';
import RadioGroupFixture from './RadioGroupFixture.svelte';
import SelectFixture from './SelectFixture.svelte';
import SegmentedFixture from './SegmentedFixture.svelte';
import TabsFixture from './TabsFixture.svelte';
import TreeFixture from './TreeFixture.svelte';
import VirtualTreeFixture from './VirtualTreeFixture.svelte';
import TreeSelectFixture from './TreeSelectFixture.svelte';
import TransferFixture from './TransferFixture.svelte';
import TooltipFixture from './TooltipFixture.svelte';
import TourFixture from './TourFixture.svelte';
import TagsInputFixture from './TagsInputFixture.svelte';
import TextareaFixture from './TextareaFixture.svelte';

describe('ZUI foundational components', () => {
	it('server-renders deterministic explicit entries with one inert reset signal', () => {
		const props = {
			entries: [
				['tag', ['alpha', 'alpha', 2, false]],
				['range.start', '2026-09-01'],
				['range.end', undefined]
			],
			onReset: () => undefined
		} as const satisfies FormValueBridgeProps;
		const first = render(FormValueBridge, { props }).body;
		const second = render(FormValueBridge, { props }).body;

		expect(first).toBe(second);
		expect(first.match(/data-zui-form-value=""/gu)).toHaveLength(4);
		expect(first.match(/name="tag" value="alpha"/gu)).toHaveLength(2);
		expect(first).toContain('name="tag" value="2"');
		expect(first).toContain('name="range.start" value="2026-09-01"');
		expect(first).not.toContain('name="range.end"');
		expect(first.match(/data-zui-form-reset-signal=""/gu)).toHaveLength(1);
	});

	it('server-renders compound roots with and without optional children', () => {
		expect(
			render(ZAccordion, { props: { defaultValue: 'one', type: 'single' as const } }).body
		).toContain('<div');
		expect(typeof render(ZDialog, { props: { defaultOpen: true } }).body).toBe('string');
		expect(typeof render(ZPopover, { props: { defaultOpen: true, modal: true } }).body).toBe(
			'string'
		);
		expect(typeof render(ZTooltip, { props: { defaultOpen: true } }).body).toBe('string');
		expect(render(ZTabs, { props: { defaultValue: 'one', disabled: true } }).body).toContain(
			'<div'
		);
		expect(
			render(ZSelect, { props: { defaultValue: 'one', disabled: true, name: 'choice' } }).body
		).toContain('type="hidden"');
		expect(
			render(ZCombobox, {
				props: { defaultInputValue: 'One', defaultValue: 'one', disabled: true, name: 'choice' }
			}).body
		).toContain('type="hidden"');
		expect(
			render(ZMultiSelect, { props: { defaultValue: ['one', 'two'], name: 'choice' } }).body
		).toContain('value="one"');
		expect(render(ZMenu, { props: { 'aria-label': 'Empty menu' } }).body).toContain('role="menu"');
	});

	it('server-renders the documentation example matrix without browser globals', () => {
		const result = render(AllDocsExamplesSsrFixture);
		expect(result.body.match(/data-docs-example/gu)?.length).toBeGreaterThanOrEqual(156);
	});

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

	it('renders the explicit square button shape contract', () => {
		const result = render(ZButton, {
			props: { 'aria-label': 'Search', shape: 'square', size: 'small' }
		});

		expect(result.body).toContain('data-shape="square"');
		expect(result.body).toContain('aria-label="Search"');
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
		expect(result).toMatch(/<button(?=[^>]*data-testid="tab-b")(?=[^>]*tabindex="0")[^>]*>/u);
		expect(result).toMatch(/<button(?=[^>]*data-testid="tab-a")(?=[^>]*tabindex="-1")[^>]*>/u);
	});

	it('renders typed Accordion/Tabs identities and default keep-mounted panels during SSR', () => {
		const result = render(AccordionTabsProductionFixture).body;
		expect(result).toContain('data-testid="production-accordion"');
		expect(result).toContain('role="heading"');
		expect(result).toContain('data-testid="production-tabs"');
		expect(result.match(/role="tabpanel"/gu)?.length).toBeGreaterThanOrEqual(7);
		expect(result).toContain('data-panel-mount="keep-mounted"');
		expect(result).not.toContain('data-testid="lazy-panel-b"');
		expect(result).not.toContain('data-testid="active-panel-b"');
	});

	it('renders localized pagination with aria-current and boundary controls during SSR', () => {
		const result = render(ZPagination, { props: { defaultPage: 3, totalPages: 10 } }).body;
		const compatibilityDefault = render(ZPagination).body;

		expect(result).toContain('<nav');
		expect(result).toContain('aria-label="Pagination"');
		expect(result).toContain('aria-current="page"');
		expect(result).toContain('aria-label="Previous page"');
		expect(result).toContain('aria-label="Next page"');
		expect(compatibilityDefault).toContain('data-total-pages="1"');
		expect(compatibilityDefault).toMatch(
			/<button(?=[^>]*aria-label="Next page")(?=[^>]*disabled)[^>]*>/u
		);
	});

	it('server-renders item-count, page-size and compact pagination contracts', () => {
		const itemCount = render(ZPagination, {
			props: {
				defaultPage: 3,
				defaultPageSize: 20,
				pageSizeOptions: [10, 20, 50],
				totalItems: 41
			}
		}).body;
		const compact = render(ZPagination, {
			props: { defaultPage: 2, mode: 'compact', totalPages: 4 }
		}).body;

		expect(itemCount).toContain('data-page-size="20"');
		expect(itemCount).toContain('data-total-pages="3"');
		expect(itemCount).toContain('41 items');
		expect(itemCount).toContain('<select');
		expect(compact).toContain('data-mode="compact"');
		expect(compact).toContain('Page 2 of 4');
		expect(compact).not.toContain('data-page-number=');
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
		expect(result).toMatch(/<button(?=[^>]*data-testid="accordion-a")(?=[^>]*tabindex="0")[^>]*>/u);
	});

	it('rejects an Accordion Trigger that inherits an Item from a different nested owner', () => {
		expect(() => render(AccordionInvalidNestedFixture).body).toThrow(/nearest ZAccordion/u);
	});

	it('renders Popover SSR closed by default and inline when initially open', () => {
		expect(render(PopoverFixture).body).not.toContain('role="dialog"');
		const open = render(PopoverFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('aria-expanded="true"');
		expect(open).toContain('role="dialog"');
	});

	it('renders Popconfirm SSR with stable label and description relationships', () => {
		expect(render(PopconfirmFixture).body).not.toContain('role="dialog"');
		const open = render(PopconfirmFixture, { props: { defaultOpen: true } }).body;
		const labelledBy = open.match(/aria-labelledby="([^"]+)"/u)?.[1];
		const describedBy = open.match(/aria-describedby="([^"]+)"/u)?.[1];
		expect(labelledBy).toBeDefined();
		expect(describedBy).toBeDefined();
		expect(open).toContain(`id="${labelledBy}"`);
		expect(open).toContain(`id="${describedBy}"`);
		expect(open).toContain('Delete this release?');
	});

	it('renders Tooltip SSR only when initially open with description linkage', () => {
		expect(render(TooltipFixture).body).not.toContain('role="tooltip"');
		const open = render(TooltipFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('aria-describedby=');
		expect(open).toContain('role="tooltip"');
	});

	it('keeps Tour client-owned layers out of SSR while preserving target content', () => {
		const result = render(TourFixture).body;
		expect(result).toContain('Start tour');
		expect(result).toContain('Summary target');
		expect(result).not.toContain('role="dialog"');
		expect(result).not.toContain('data-slot="mask"');
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
		expect(rendered[2]).toContain('data-reduced-motion="true"');
		expect(open).not.toContain('data-reduced-motion="true"');
		expect(
			render(DrawerFixture, {
				props: { defaultOpen: true, placement: 'end', size: 360 }
			}).body
		).toContain('width:360px');
		expect(new Set(rendered)).toHaveLength(variants.length);
	});

	it('renders Menu SSR with native ARIA roles and disabled state', () => {
		const result = render(MenuFixture).body;
		expect(result).toContain('role="menu"');
		expect(result.match(/role="menuitem"/gu)).toHaveLength(4);
		expect(result).toContain('aria-disabled="true"');
		expect(result).toContain('role="group"');
		expect(result).toContain('role="separator"');
	});

	it('renders DropdownMenu closed by default and with menu semantics when open', () => {
		expect(render(DropdownMenuFixture).body).not.toContain('role="menu"');
		const open = render(DropdownMenuFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('aria-haspopup="menu"');
		expect(open).toContain('role="presentation"');
		expect(open).toContain('role="menu"');
		expect(open).toContain('role="menuitem"');
	});

	it('renders ContextMenu target and initial menu semantics during SSR', () => {
		const closed = render(ContextMenuFixture).body;
		expect(closed).toContain('aria-haspopup="menu"');
		expect(closed).not.toContain('role="menu"');
		const open = render(ContextMenuFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="menu"');
		expect(open).toContain('Fixture context menu');
	});

	it('renders Select form value and listbox semantics during SSR', () => {
		const closed = render(SelectFixture).body;
		expect(closed).toContain('aria-haspopup="listbox"');
		expect(closed).toContain('type="hidden"');
		expect(closed).toContain('name="choice"');
		expect(closed).not.toContain('role="listbox"');
		const open = render(SelectFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="listbox"');
		expect(open.match(/role="option"/gu)).toHaveLength(4);
		expect(open).toContain('aria-selected="true"');
	});

	it('renders Combobox input and filtered-listbox contracts during SSR', () => {
		const closed = render(ComboboxFixture).body;
		expect(closed).toContain('role="combobox"');
		expect(closed).toContain('aria-autocomplete="list"');
		expect(closed).not.toContain('role="listbox"');
		const open = render(ComboboxFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="listbox"');
		expect(open.match(/role="option"/gu)).toHaveLength(4);
		expect(open).toContain('name="choice"');
	});

	it('renders MultiSelect tags, multiple form values and listbox semantics during SSR', () => {
		const closed = render(MultiSelectFixture).body;
		expect(closed).toContain('aria-haspopup="listbox"');
		expect(closed).not.toContain('aria-required="true"');
		expect(closed).toContain('data-required="true"');
		expect(closed.match(/name="choice"/gu)).toHaveLength(2);
		const open = render(MultiSelectFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('aria-multiselectable="true"');
		expect(open.match(/aria-selected="true"/gu)).toHaveLength(2);
	});

	it('rejects mixed MultiSelect value aliases instead of creating dual ownership', () => {
		expect(() => render(ZMultiSelect, { props: { value: ['one'], values: ['two'] } }).body).toThrow(
			/value and deprecated values are mutually exclusive/u
		);
		expect(
			() =>
				render(ZMultiSelect, {
					props: { defaultValue: ['one'], defaultValues: ['two'] }
				}).body
		).toThrow(/defaultValue and deprecated defaultValues are mutually exclusive/u);
		expect(
			() =>
				render(ZMultiSelect, {
					props: { onValueChange: () => undefined, onValuesChange: () => undefined }
				}).body
		).toThrow(/onValueChange and deprecated onValuesChange are mutually exclusive/u);
	});

	it('renders Segmented radiogroup, checked state and form value during SSR', () => {
		const result = render(SegmentedFixture).body;
		expect(result).toContain('role="radiogroup"');
		expect(result.match(/role="radio"/gu)).toHaveLength(4);
		expect(result).toMatch(/role="radio"[^>]*aria-checked="true"[^>]*>Beta/u);
		expect(result).toContain('name="period"');
	});

	it('renders TagsInput group, removable tags and repeated form values during SSR', () => {
		const result = render(TagsInputFixture).body;
		expect(result).toContain('role="group"');
		expect(result).toContain('aria-label="Remove alpha"');
		expect(result).toContain('aria-label="Fixture tags"');
		expect(result).toContain('placeholder="Add tag"');
		expect(result).toContain('name="tag"');
	});

	it('renders single and multiple Tree hierarchy metadata and form values during SSR', () => {
		const result = render(TreeFixture).body;
		expect(result.match(/role="tree"/gu)).toHaveLength(2);
		expect(result.match(/role="treeitem"/gu)).toHaveLength(8);
		expect(result).toContain('aria-level="2"');
		expect(result).toContain('aria-expanded="true"');
		expect(result).toContain('aria-selected="true"');
		expect(result).toContain('aria-multiselectable="true"');
		expect(result).toContain('name="node"');
		expect(result).toContain('name="nodes"');
	});

	it('renders only the initial virtual Tree window with global set metadata during SSR', () => {
		const result = render(VirtualTreeFixture).body;
		expect(result).toContain('data-virtualized="true"');
		expect(result).toContain('data-range-start="0"');
		expect(result).toContain('data-range-end="9"');
		expect(result).toContain('aria-setsize="5000"');
		expect(result).not.toContain('Node 5000');
	});

	it('renders TreeSelect closed trigger and open popup tree during SSR', () => {
		const closed = render(TreeSelectFixture).body;
		expect(closed).toContain('aria-haspopup="tree"');
		expect(closed).not.toContain('role="tree"');
		const open = render(TreeSelectFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="tree"');
		expect(open).toContain('name="node"');
	});

	it('renders Cascader path trigger and layered listboxes during SSR', () => {
		const closed = render(CascaderFixture).body;
		expect(closed).toContain('Root / Alpha / Leaf');
		expect(closed).not.toContain('role="listbox"');
		const open = render(CascaderFixture, { props: { defaultOpen: true } }).body;
		expect(open.match(/role="listbox"/gu)).toHaveLength(3);
		expect(open).toContain('name="path"');
	});

	it('renders Transfer dual listboxes and repeated form values during SSR', () => {
		const result = render(TransferFixture).body;
		expect(result.match(/role="listbox"/gu)).toHaveLength(2);
		expect(result).toContain('aria-multiselectable="true"');
		expect(result).toContain('Available');
		expect(result).toContain('Selected');
		expect(result).toContain('name="channel"');
		expect(result).toContain('value="staging"');
	});

	it('renders Mention native textarea and closed active-descendant popup during SSR', () => {
		const result = render(MentionFixture).body;
		expect(result).toContain('<textarea');
		expect(result).toContain('aria-autocomplete="list"');
		expect(result).toContain('data-state="closed"');
		expect(result).not.toContain('aria-expanded');
		expect(result).toContain('name="message"');
		expect(result).not.toContain('role="listbox"');
	});

	it('renders Command grouped active-descendant results during SSR', () => {
		const result = render(CommandFixture).body;
		expect(result).toContain('role="combobox"');
		expect(result).toContain('role="listbox"');
		expect(result.match(/role="group"/gu)).toHaveLength(2);
		expect(result.match(/role="option"/gu)).toHaveLength(5);
		const optionIds = [...result.matchAll(/id="([^"]+)"[^>]*role="option"/gu)].map(([, id]) => id);
		expect(optionIds).toHaveLength(5);
		expect(new Set(optionIds).size).toBe(5);
		// SSR never emits a dangling reference before the option registry mounts in the browser.
		expect(result).not.toContain('aria-activedescendant');
	});

	it('renders CommandPalette trigger closed and modal dialog when initially open', () => {
		const closed = render(CommandPaletteFixture).body;
		expect(closed).toContain('Open palette');
		expect(closed).not.toContain('role="dialog"');
		const open = render(CommandPaletteFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('role="dialog"');
		expect(open).toContain('Quick actions');
		expect(open).toContain('Search palette');
	});

	it('renders Textarea native form, Field and autosize contracts during SSR', () => {
		const result = render(TextareaFixture).body;
		expect(result).toContain('<textarea');
		expect(result).toContain('name="description"');
		expect(result).toContain('data-autosize="true"');
		expect(result).toContain('aria-describedby');
		expect(result).toContain('required');
		expect(result).toContain('Seed');
	});

	it('renders InputGroup snippets and inherited input state during SSR', () => {
		const result = render(InputGroupFixture).body;
		expect(result).toContain('role="group"');
		expect(result).toContain('data-slot="prefix"');
		expect(result).toContain('data-slot="suffix"');
		expect(result).toContain('name="host"');
		expect(result).toContain('data-invalid="true"');
		expect(result).toContain('disabled');
	});

	it('renders NumberField spinbutton, boundaries and hidden form value during SSR', () => {
		const result = render(NumberFieldFixture).body;
		expect(result).toContain('role="spinbutton"');
		expect(result).toContain('aria-valuemin="0"');
		expect(result).toContain('aria-valuemax="3"');
		expect(result).toContain('aria-valuenow="1.5"');
		expect(result).toContain('name="amount"');
		expect(result).toContain('value="1.5"');
	});

	it('renders PinInput roving cells and one hidden form value during SSR', () => {
		const result = render(PinInputFixture).body;
		expect(result.match(/data-slot="input"/gu)).toHaveLength(4);
		expect(result).toContain('aria-label="PIN 1 of 4"');
		expect(result).toContain('tabindex="0"');
		expect(result).toContain('name="pin"');
		expect(result).toContain('value="12"');
	});

	it('renders ColorPicker trigger and open color fields during SSR', () => {
		const closed = render(ColorPickerFixture).body;
		expect(closed).toContain('Color #33669980');
		expect(closed).toContain('name="color"');
		expect(closed).not.toContain('type="color"');
		const open = render(ColorPickerFixture, { props: { defaultOpen: true } }).body;
		expect(open).toContain('type="color"');
		expect(open).toContain('type="range"');
		expect(open).toContain('Hex color');
	});

	it('renders FileUpload native input, accept rules and empty queue during SSR', () => {
		const result = render(FileUploadFixture).body;
		expect(result).toContain('type="file"');
		expect(result).toContain('data-zui-file-form-value');
		expect(result).toContain('accept="application/json,.yaml"');
		expect(result).toContain('multiple');
		expect(result).toContain('Drop files here or choose files');
		expect(result).not.toContain('data-slot="item"');
	});

	it('renders Form and FormField native semantics and names during SSR', () => {
		const result = render(FormFixture).body;
		expect(result).toContain('<form');
		expect(result).toContain('novalidate');
		expect(result).toContain('name="account"');
		expect(result).toContain('name="email"');
		expect(result).toContain('Account');
		expect(result).toContain('Email');
	});

	it('renders native-validation and caller-prevented Form edge contracts during SSR', () => {
		const result = render(FormEdgeFixture).body;
		expect(result).not.toContain('novalidate');
		expect(result).toContain('data-testid="throwing-form"');
		expect(result).toContain('data-testid="prevented-form"');
	});

	it('renders date fields, Calendar grid and closed pickers during SSR', () => {
		const result = render(DateFixture).body;
		expect(result).toContain('role="grid"');
		expect(result.match(/role="gridcell"/gu)).toHaveLength(42);
		expect(result).toContain('name="calendar"');
		expect(result).toContain('name="date"');
		expect(result).toContain('name="time"');
		expect(result).toContain('name="picked"');
		expect(result).toContain('name="range.start"');
		expect(result).not.toContain('Picker calendar');
	});

	it('renders explicit-empty and partial-range date production contracts during SSR', () => {
		const result = render(DateProductionFixture).body;
		expect(result).toContain('data-testid="production-calendar"');
		expect(result).toContain('name="window.start"');
		expect(result).not.toContain('name="window.end"');
		expect(result).toContain('aria-readonly="true"');
		expect(result).toContain('data-state="closed"');
	});

	it('renders data-display components with native document semantics during SSR', () => {
		const result = render(DisplayFixture).body;

		expect(result).toContain('role="img"');
		expect(result).toContain('aria-label="Alice"');
		expect(result).toContain('<img');
		expect(result).toContain('alt="Broken image"');
		expect(result).toContain('data-testid="badge"');
		expect(result).toContain('aria-label="Remove production"');
		expect(result).toContain('<article');
		expect(result).toContain('<header');
		expect(result).toContain('<footer');
		expect(result).toContain('<ol');
		expect(result.match(/<li/gu)).toHaveLength(5);
		expect(result).toContain('<dl');
		expect(result.match(/<dt/gu)).toHaveLength(3);
		expect(result.match(/<dd/gu)).toHaveLength(4);
		expect(result).toContain('<progress');
		expect(result).toContain('aria-label="Analysis progress"');
		expect(result).toContain('<meter');
		expect(result).toContain('data-state="suboptimal"');
		expect(result).toContain('aria-hidden="true"');
		expect(result).toContain('No releases');
		expect(result).toContain('<time');
		expect(result).toMatch(/<data\b[^>]*value="128430"/u);
	});

	it('renders optional snippets, static/urgent feedback and non-looping reduced Carousel branches', () => {
		const result = render(CoverageFixture).body;
		expect(result).toContain('<ul');
		expect(result).toContain('Custom One');
		expect(result).toContain('<h4');
		expect(result).toContain('Recover');
		expect(result).toContain('data-reduced-motion="true"');
		expect(result).toContain('Automatic rotation disabled by motion preference');
		expect(result).toContain('<em>Queued</em>');
		expect(result).toContain('role="alert"');
		expect(result).toContain('Danger details');
		expect(result).toContain('<h3');
		expect(result).toContain('role="alert"');
		expect(result).toContain('20 units');
	});

	it('renders native Table and only the initial VirtualList window during SSR', () => {
		const result = render(DataFixture).body;

		expect(result).toContain('<table');
		expect(result).toContain('<caption');
		expect(result).toContain('<thead');
		expect(result).toContain('<tbody');
		expect(result).toContain('scope="col"');
		expect(result).toContain('role="list"');
		expect(result).toContain('aria-setsize="1000"');
		expect(result).toContain('data-range-start="0"');
		expect(result).toContain('data-range-end="7"');
		expect(result).not.toContain('999: Row 999');
		expect(result).toContain('Large deployment table');
		expect(result).toContain('aria-rowcount="1001"');
		expect(result).toContain('data-virtualized="true"');
	});

	it('renders Carousel region, one visible slide and explicit controls during SSR', () => {
		const result = render(CarouselFixture).body;
		expect(result).toContain('aria-roledescription="carousel"');
		expect(result.match(/aria-roledescription="slide"/gu)).toHaveLength(3);
		expect(result.match(/ hidden/gu)).toHaveLength(2);
		expect(result).toContain('aria-label="Previous slide"');
		expect(result).toContain('aria-label="Next slide"');
		expect(result).toContain('aria-current="true"');
	});

	it('renders feedback live regions, progress states, Result and queued Toasts during SSR', () => {
		const result = render(FeedbackFixture).body;

		expect(result).toContain('role="status"');
		expect(result).toContain('aria-live="polite"');
		expect(result).toContain('aria-label="Synchronizing"');
		expect(result).toContain('aria-label="Release progress"');
		expect(result).toContain('aria-valuenow="65"');
		expect(result).toContain('data-indeterminate="true"');
		expect(result).toContain('aria-labelledby="');
		expect(result).toContain('Release complete');
		expect(result).toContain('aria-label="Release notifications"');
		expect(result).toContain('Release ready');
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
			'data-testid="outer-context">zh-CN:rtl:dark:high:compact:reduced:test:关闭:Asia/Shanghai:日历:24:default-portal'
		);
		expect(result.body).toContain(
			'data-testid="inner-context">zh-CN:rtl:dark:high:compact:reduced:test:关闭:Asia/Shanghai:日历:24:default-portal'
		);
		expect(registry.cssText()).toContain('#2563eb');
		expect(registry.cssText()).toContain('#6d28d9');
	});

	it('resolves component defaults with nested and explicit boundaries during SSR', () => {
		const body = render(ComponentDefaultsFixture).body;
		expect(body).toMatch(/data-testid="default-button"[^>]+data-size="small"/u);
		expect(body).toMatch(/data-testid="explicit-button"[^>]+data-size="small"/u);
		expect(body).toMatch(/data-testid="axis-null-button"[^>]+data-size="medium"/u);
		expect(body).toMatch(/data-testid="component-null-button"[^>]+data-size="medium"/u);
		expect(body).toMatch(/data-testid="default-table"[^>]+data-virtualized="true"/u);
	});

	it('provides SSR-stable defaults outside an explicit provider', () => {
		expect(render(ContextProbe, { props: { id: 'default-context' } }).body).toContain(
			'data-testid="default-context">en-US:ltr:light:normal:comfortable:auto:zui:none:UTC:Calendar:12:default-portal'
		);
	});

	it('generates deterministic unique native control ids across independent SSR renders', () => {
		const firstBody = render(NativeIdentityFixture).body;
		const secondBody = render(NativeIdentityFixture).body;
		const extractIds = (body: string) =>
			[...body.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1]!);
		const first = extractIds(firstBody);
		const second = extractIds(secondBody);

		expect(first).toEqual(second);
		expect(new Set(first).size).toBe(first.length);
		expect(first).toContain('consumer-input');
		expect(firstBody).not.toContain('data-zui-form-reset-signal');
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
		const decorativeSeparator = render(ZSeparator, { props: { decorative: true } }).body;
		expect(decorativeSeparator).toContain('role="presentation"');
		expect(decorativeSeparator).toContain('aria-hidden="true"');
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
