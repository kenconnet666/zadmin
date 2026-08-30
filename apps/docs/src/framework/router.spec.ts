import { describe, expect, it } from 'vitest';

import { guideDocs, guideDocsById } from '../content/guides.js';
import { componentDocs } from './catalog.js';
import { componentRoute, guideRoute, parseDocsRoute } from './router.js';
import { searchComponentDocs } from './search.js';

describe('Docs routing', () => {
	it('parses, normalizes and formats component routes', () => {
		expect(parseDocsRoute('#/')).toEqual({ kind: 'home' });
		expect(parseDocsRoute('#/components/button/')).toEqual({
			componentId: 'button',
			kind: 'component'
		});
		expect(parseDocsRoute(componentRoute('button', 'api'))).toEqual({
			componentId: 'button',
			kind: 'component',
			section: 'api'
		});
		expect(parseDocsRoute(guideRoute('theme'))).toEqual({ guideId: 'theme', kind: 'guide' });
		expect(parseDocsRoute(guideRoute('getting-started'))).toEqual({
			guideId: 'getting-started',
			kind: 'guide'
		});
		expect(parseDocsRoute('#/missing')).toMatchObject({ kind: 'not-found' });
		expect(parseDocsRoute('#/components/%E0%A4%A')).toMatchObject({ kind: 'not-found' });
	});

	it('keeps production guide ids, sections and copy complete', () => {
		expect(guideDocsById.size).toBe(guideDocs.length);
		expect(new Set(guideDocs.map(({ id }) => id)).size).toBe(guideDocs.length);
		for (const guide of guideDocs) {
			expect(guide.sections.length).toBeGreaterThanOrEqual(3);
			expect(new Set(guide.sections.map(({ id }) => id)).size).toBe(guide.sections.length);
			expect(guide.sections.every(({ paragraphs }) => paragraphs.length > 0)).toBe(true);
		}
	});
});

describe('Docs search', () => {
	it('searches component names, props and descriptions', () => {
		expect(searchComponentDocs(componentDocs, 'bindable').map(({ name }) => name)).toContain(
			'ZInput'
		);
		expect(searchComponentDocs(componentDocs, 'highlightedLines').map(({ name }) => name)).toEqual([
			'ZCode'
		]);
		expect(searchComponentDocs(componentDocs, 'drop zone').map(({ name }) => name)).toContain(
			'ZFileUpload'
		);
		expect(searchComponentDocs(componentDocs, '  ').length).toBe(componentDocs.length);
	});
});
