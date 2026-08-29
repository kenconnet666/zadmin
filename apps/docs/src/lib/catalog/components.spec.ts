import { describe, expect, it } from 'vitest';

import { componentDocs, componentDocsById } from './index.js';

describe('ZUI component documentation catalog', () => {
	it('covers the eight foundational components exactly once', () => {
		expect(componentDocs.map(({ name }) => name)).toEqual([
			'ZProvider',
			'ZBox',
			'ZStack',
			'ZText',
			'ZIcon',
			'ZButton',
			'ZInput',
			'ZField'
		]);
		expect(componentDocsById.size).toBe(componentDocs.length);
	});

	it('gives every page runnable demos, real source and API metadata', () => {
		for (const doc of componentDocs) {
			expect(doc.demos.length).toBeGreaterThan(0);
			expect(doc.api.length).toBeGreaterThan(0);
			expect(doc.accessibility.length).toBeGreaterThan(0);
			expect(doc.source).toMatch(/^ui\/zui\/src\/lib\/components\//u);
			for (const demo of doc.demos) {
				expect(demo.source).toContain('<script');
				expect(typeof demo.component).toBe('function');
			}
		}
	});
});
