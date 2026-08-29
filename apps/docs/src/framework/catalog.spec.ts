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
			'ZInput',
			'ZField'
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
			'input'
		]);
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
