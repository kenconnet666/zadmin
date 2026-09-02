import { describe, expect, it } from 'vitest';
import { dataTableMetadata } from '@zadmin/zui/metadata';

import { componentDocs, componentDocsById } from './catalog.js';
import { componentCatalogManifest } from './catalog-manifest.generated.js';
import { dataTableApiFacts, radioGroupItemApiFacts } from './component-api.generated.js';
import * as generatedApiFacts from './component-api.generated.js';
import type { ComponentApiFacts } from './component-api.js';
import { defineComponentDoc } from './component-doc.js';
import { componentRoute } from './router.js';

describe('ZUI component documentation catalog', () => {
	it('keeps all owner pages, generated API facts, demos and routes integrity-aligned', () => {
		const facts = (Object.values(generatedApiFacts) as unknown[]).filter(
			(value): value is ComponentApiFacts =>
				value !== null &&
				typeof value === 'object' &&
				'id' in value &&
				'name' in value &&
				'props' in value &&
				'source' in value
		);
		const factsByName = new Map(facts.map((fact) => [fact.name, fact]));
		const manifestById = new Map(componentCatalogManifest.map((entry) => [entry.id, entry]));
		const ownerNames = new Set(componentDocs.map(({ name }) => name));

		expect(componentDocs).toHaveLength(79);
		expect(componentCatalogManifest).toHaveLength(79);
		expect(facts).toHaveLength(141);
		for (const doc of componentDocs) {
			const manifest = manifestById.get(doc.id);
			const fact = factsByName.get(doc.name);
			expect(manifest, `${doc.name} catalog manifest entry`).toBeDefined();
			expect(manifest?.name).toBe(doc.name);
			expect(manifest?.demoCount).toBe(doc.demos.length);
			expect(fact, `${doc.name} generated API fact`).toBeDefined();
			expect(doc.source).toBe(fact?.source);
			expect(doc.importStatement).toContain(doc.name);
			expect(componentRoute(doc.id)).toBe(`#/components/${doc.id}`);
			expect(new Set(doc.api.map(({ id }) => id)).size).toBe(doc.api.length);
			expect(new Set(doc.demos.map(({ id }) => id)).size).toBe(doc.demos.length);
			const mainProps = doc.api.find(({ id }) => id === 'props');
			expect(mainProps, `${doc.name} main Props section`).toBeDefined();
			for (const generated of fact?.props ?? []) {
				expect(
					doc.api.some((section) => section.rows.some(({ name }) => name === generated.name)),
					`${doc.name}.${generated.name}`
				).toBe(true);
			}
			for (const section of doc.api) {
				expect(new Set(section.rows.map(({ name }) => name)).size).toBe(section.rows.length);
			}
		}

		for (const fact of facts) {
			if (ownerNames.has(fact.name)) continue;
			const owners = componentDocs.filter((doc) =>
				doc.api.some((section) => section.title === `${fact.name} Props`)
			);
			expect(owners, `${fact.name} owning page`).toHaveLength(1);
			for (const generated of fact.props)
				expect(
					owners[0]?.api.some(
						(candidate) =>
							candidate.title.startsWith(`${fact.name} `) &&
							candidate.rows.some(({ name }) => name === generated.name)
					),
					`${fact.name}.${generated.name}`
				).toBe(true);
		}
	});

	it('covers the approved component catalog exactly once', () => {
		expect(componentDocs.map(({ name }) => name)).toEqual([
			'ZProvider',
			'ZBox',
			'ZStack',
			'ZText',
			'ZHeading',
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
		const itemRows = radio?.api.find(({ id }) => id === 'radio-group-item-props')?.rows ?? [];
		const itemRowNames = new Set(itemRows.map(({ name }) => name));
		for (const fact of radioGroupItemApiFacts.props) {
			expect(itemRowNames, fact.name).toContain(fact.name);
		}
	});

	it('includes FormField state metadata on the Form page', () => {
		const form = componentDocsById.get('form');
		expect(form?.api.map(({ title }) => title)).toContain('ZFormField Props');
	});

	it('keeps service and field members on their owning component routes', () => {
		const form = componentDocsById.get('form');
		const toast = componentDocsById.get('toast');

		expect(componentDocsById.has('form-field')).toBe(false);
		expect(componentDocsById.has('toaster')).toBe(false);
		expect(form?.api.map(({ title }) => title)).toContain('ZFormField Props');
		expect(toast?.api.map(({ title }) => title)).toContain('ZToaster Props');
		expect(componentRoute('form')).toBe('#/components/form');
		expect(componentRoute('toast')).toBe('#/components/toast');
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
		expect(names).toEqual(
			expect.arrayContaining(['caption', 'height', 'rowHeight', 'overscan', 'sortingMode'])
		);
		expect(names).not.toEqual(
			expect.arrayContaining(['columnVisibility', 'columnWidths', 'expandedRow'])
		);
		expect(names).not.toContain('rowHeight / height');
		expect(dataTable?.demos).toHaveLength(7);
		expect(dataTable?.profiles).toEqual(['collection', 'data-view', 'virtualized']);
	});

	it('renders every AST-declared public prop even without hand-written teaching copy', () => {
		const dataTable = componentDocsById.get('data-table');
		const renderedNames = new Set(
			dataTable?.api.flatMap(({ rows }) => rows.map(({ name }) => name))
		);
		for (const fact of dataTableApiFacts.props) {
			expect(renderedNames, fact.name).toContain(fact.name);
		}
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
			dataTableApiFacts.metadataGapProps.map((name) => [name, { description: name }])
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
