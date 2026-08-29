import { describe, expect, it } from 'vitest';

import { componentDocs, componentDocsById } from './catalog.js';

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
			'ZCheckbox',
			'ZCombobox',
			'ZInput',
			'ZMultiSelect',
			'ZField',
			'ZRadioGroup',
			'ZSelect',
			'ZSwitch',
			'ZSlider',
			'ZAccordion',
			'ZContextMenu',
			'ZDropdownMenu',
			'ZMenu',
			'ZPagination',
			'ZTabs',
			'ZAlertDialog',
			'ZDialog',
			'ZDrawer',
			'ZPopconfirm',
			'ZPopover',
			'ZTooltip'
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

	it('gives every page runnable demos, real source and API metadata', () => {
		for (const doc of componentDocs) {
			expect(doc.demos.length).toBeGreaterThan(0);
			expect(doc.api.length).toBeGreaterThan(0);
			expect(doc.accessibility.length).toBeGreaterThan(0);
			expect(doc.source).toMatch(/^ui\/zui\/src\/components\//u);
			expect(doc.since).toMatch(/^\d+\.\d+\.\d+$/u);
			expect(Array.isArray(doc.dependencies)).toBe(true);
			expect(doc.api[0]?.rows).toBe(doc.props);
			expect(new Set(doc.api.map(({ id }) => id)).size).toBe(doc.api.length);
			expect(['experimental', 'stable']).toContain(doc.status);
			for (const demo of doc.demos) {
				expect(demo.source).toContain('<script');
				expect(typeof demo.component).toBe('function');
			}
		}
	});
});
