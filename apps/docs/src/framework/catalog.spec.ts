import { describe, expect, it } from 'vitest';
import { dataTableMetadata } from '@zadmin/zui/metadata';

import { componentDocs, componentDocsById } from './catalog.js';
import { dataTableApiFacts } from './component-api.generated.js';
import { defineComponentDoc } from './component-doc.js';

describe('ZUI component documentation catalog', () => {
	it('covers the approved component catalog exactly once', () => {
		expect(componentDocs.map(({ name }) => name)).toEqual([
			'ZProvider',
			'ZBox',
			'ZStack',
			'ZText',
			'ZIcon',
			'ZCode',
			'ZButton',
			'ZToggleButton',
			'ZLink',
			'ZSeparator',
			'ZVisuallyHidden',
			'ZKbd',
			'ZAspectRatio',
			'ZContainer',
			'ZAvatar',
			'ZBadge',
			'ZCard',
			'ZDescriptionList',
			'ZList',
			'ZTag',
			'ZProgress',
			'ZMeter',
			'ZSkeleton',
			'ZEmpty',
			'ZTimeline',
			'ZStatistic',
			'ZTable',
			'ZVirtualList',
			'ZDataTable',
			'ZCarousel',
			'ZAlert',
			'ZLoadingBar',
			'ZResult',
			'ZSpinner',
			'ZToast',
			'ZCheckbox',
			'ZCalendar',
			'ZCascader',
			'ZColorPicker',
			'ZCombobox',
			'ZDateField',
			'ZDatePicker',
			'ZDateRangePicker',
			'ZInput',
			'ZInputGroup',
			'ZMention',
			'ZMultiSelect',
			'ZNumberField',
			'ZPinInput',
			'ZField',
			'ZFileUpload',
			'ZForm',
			'ZRadioGroup',
			'ZSelect',
			'ZSegmented',
			'ZSwitch',
			'ZTagsInput',
			'ZTextarea',
			'ZTimeField',
			'ZTreeSelect',
			'ZTransfer',
			'ZSlider',
			'ZAccordion',
			'ZCommand',
			'ZCommandPalette',
			'ZContextMenu',
			'ZDropdownMenu',
			'ZMenu',
			'ZPagination',
			'ZTabs',
			'ZTree',
			'ZAlertDialog',
			'ZDialog',
			'ZDrawer',
			'ZPopconfirm',
			'ZPopover',
			'ZTooltip',
			'ZTour'
		]);
		expect(componentDocsById.size).toBe(componentDocs.length);
		expect(componentDocs.map(({ category }) => category)).toEqual([
			'gene',
			'gene',
			'layout',
			'gene',
			'gene',
			'gene',
			'gene',
			'gene',
			'gene',
			'gene',
			'gene',
			'gene',
			'layout',
			'layout',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'data-display',
			'feedback',
			'feedback',
			'feedback',
			'feedback',
			'feedback',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'input',
			'navigation',
			'navigation',
			'navigation',
			'navigation',
			'navigation',
			'navigation',
			'navigation',
			'navigation',
			'navigation',
			'overlay',
			'overlay',
			'overlay',
			'overlay',
			'overlay',
			'overlay',
			'overlay'
		]);
	});

	it('includes every Tabs compound member on the owning page', () => {
		const tabs = componentDocsById.get('tabs');
		expect(tabs?.api.map(({ title }) => title)).toContain('ZTabsTrigger Props');
		expect(tabs?.api.map(({ title }) => title)).toContain('ZTabsPanel Props');
	});

	it('includes compound member metadata on the owning component page', () => {
		const radio = componentDocsById.get('radio-group');
		expect(radio?.api.map(({ title }) => title)).toContain('ZRadioGroupItem Props');
		expect(radio?.api.find(({ id }) => id === 'radio-group-item-props')?.rows).toHaveLength(5);
	});

	it('includes FormField state metadata on the Form page', () => {
		const form = componentDocsById.get('form');
		expect(form?.api.map(({ title }) => title)).toContain('ZFormField Props');
	});

	it('uses generated public Props facts for incrementally migrated component docs', () => {
		const stack = componentDocsById.get('stack');
		const props = stack?.api.find(({ id }) => id === 'props');
		expect(props?.description).toContain('ZStackProps');
		expect(props?.rows.find(({ name }) => name === 'direction')?.type).toBe(
			"'column' | 'column-reverse' | 'row' | 'row-reverse'"
		);
		expect(stack?.props).toBe(props?.rows);
		expect(stack?.profiles).toContain('primitive');
	});

	it('merges DataTable AST facts with Docs teaching without legacy pseudo props', () => {
		const dataTable = componentDocsById.get('data-table');
		const props = dataTable?.api.find(({ id }) => id === 'props');
		const names = props?.rows.map(({ name }) => name);

		expect(props?.description).toContain('ZDataTableProps');
		expect(names).toEqual(expect.arrayContaining(['caption', 'height', 'rowHeight', 'overscan']));
		expect(names).not.toContain('rowHeight / height');
		expect(dataTable?.demos).toHaveLength(6);
		expect(dataTable?.profiles).toEqual(['collection', 'data-view', 'virtualized']);
	});

	it('lets runtime metadata strengthen conditional requirements over optional source aliases', () => {
		const carousel = componentDocsById.get('carousel');
		const props = carousel?.api.find(({ id }) => id === 'props');
		expect(props?.rows.find(({ name }) => name === 'aria-label')?.required).toBe(true);
		expect(props?.rows.find(({ name }) => name === 'ariaLabel')?.required).not.toBe(true);
	});

	it('rejects misspelled teaching and legacy metadata omissions', () => {
		const dataTable = componentDocsById.get('data-table');
		const teachingProps = Object.fromEntries(
			dataTableApiFacts.undocumentedProps.map((name) => [name, { description: name }])
		);
		const definition = {
			accessibility: ['test'],
			demos: dataTable?.demos.slice(0, 2) ?? [],
			profiles: ['data-view'] as const,
			sourceApi: dataTableApiFacts
		};

		expect(() =>
			defineComponentDoc(dataTableMetadata, {
				...definition,
				teaching: { omitMetadataProps: ['missing'], props: teachingProps }
			})
		).toThrow(/cannot omit unknown metadata props/u);
		expect(() =>
			defineComponentDoc(dataTableMetadata, {
				...definition,
				teaching: {
					props: { ...teachingProps, misspelled: { description: 'invalid' } }
				}
			})
		).toThrow(/unknown public props/u);
	});

	it('requires capability evidence for graduated component docs', () => {
		for (const id of ['button', 'data-table', 'input', 'stack']) {
			const doc = componentDocsById.get(id);
			expect(doc?.profiles.length, id).toBeGreaterThan(0);
			for (const demo of doc?.demos ?? []) {
				expect(demo.covers?.length, `${id}/${demo.id}`).toBeGreaterThan(0);
			}
		}
	});

	it('gives every page runnable demos, real source and API metadata', () => {
		for (const doc of componentDocs) {
			expect(doc.demos.length).toBeGreaterThanOrEqual(2);
			expect(doc.api.length).toBeGreaterThan(0);
			expect(doc.accessibility.length).toBeGreaterThan(0);
			expect(doc.source).toMatch(/^ui\/zui\/src\/components\//u);
			expect(doc.since).toMatch(/^(?:\d+\.\d+\.\d+|unreleased)$/u);
			expect(Array.isArray(doc.dependencies)).toBe(true);
			expect(doc.api[0]?.rows).toBe(doc.props);
			expect(new Set(doc.api.map(({ id }) => id)).size).toBe(doc.api.length);
			expect(new Set(doc.demos.map(({ id }) => id)).size).toBe(doc.demos.length);
			expect(['experimental', 'stable']).toContain(doc.status);
			for (const demo of doc.demos) {
				expect(demo.source).toContain('<script');
				expect(typeof demo.component).toBe('function');
			}
		}
	});

	it('rejects incomplete, duplicate or sourceless demo catalogs', () => {
		const metadata = componentDocs[0]!;
		const [first, second] = metadata.demos;
		expect(() =>
			defineComponentDoc(metadata, { accessibility: ['test'], demos: [first!] })
		).toThrow(/at least two distinct demos/u);
		expect(() =>
			defineComponentDoc(metadata, {
				accessibility: ['test'],
				demos: [first!, { ...second!, id: first!.id }]
			})
		).toThrow(/duplicate demo id/u);
		expect(() =>
			defineComponentDoc(metadata, {
				accessibility: ['test'],
				demos: [first!, { ...second!, source: '   ' }]
			})
		).toThrow(/has no source/u);
	});
});
