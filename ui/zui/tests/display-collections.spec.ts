import type { Snippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDescriptionList from '../src/components/data-display/ZDescriptionList.svelte';
import ZList from '../src/components/data-display/ZList.svelte';

describe('display collection server contracts', () => {
	it('renders real list and description-list structures with typed identities', () => {
		const list = render(ZList, {
			props: {
				items: [
					{ key: 1, label: 'Number' },
					{ key: '1', label: 'String' }
				]
			}
		}).body;
		const descriptions = render(ZDescriptionList, {
			props: {
				items: [
					{ key: 1, term: 'Number', description: 'One' },
					{ key: '1', term: 'String', description: 'One' }
				]
			}
		}).body;
		expect(list).toContain('<ul');
		expect(list.match(/<li/gu)).toHaveLength(2);
		expect(descriptions).toContain('<dl');
		expect(descriptions.match(/<dt/gu)).toHaveLength(2);
		expect(descriptions.match(/<dd/gu)).toHaveLength(2);
	});

	it('does not disguise empty/loading feedback as list or description items', () => {
		const emptyList = render(ZList, { props: { items: [] } }).body;
		const loadingDescriptions = render(ZDescriptionList, {
			props: {
				items: [{ key: 'one', term: 'One', description: 'First' }],
				loading: true,
				loadingCount: 2
			}
		}).body;
		expect(emptyList).toContain('<ul');
		expect(emptyList).not.toContain('<li');
		expect(emptyList).toContain('data-state="empty"');
		expect(loadingDescriptions).toContain('<dl');
		expect(loadingDescriptions).not.toContain('<dt');
		expect(loadingDescriptions).not.toContain('<dd');
		expect(loadingDescriptions).toContain('data-state="loading"');
	});

	it('rejects duplicate and invalid typed keys plus ambiguous composition modes', () => {
		expect(() =>
			render(ZList, {
				props: {
					items: [
						{ key: 'same', label: 'A' },
						{ key: 'same', label: 'B' }
					]
				}
			})
		).toThrow(/Duplicate ZList key/u);
		expect(() =>
			render(ZDescriptionList, {
				props: { items: [{ key: Number.NaN, term: 'A', description: 'B' }] }
			})
		).toThrow(/finite numbers/u);
		expect(() =>
			render(ZList, {
				props: { items: [{ id: 'legacy', key: 'current', label: 'Ambiguous' }] } as never
			})
		).toThrow(/both key and deprecated id/u);

		const children = (() => undefined) as Snippet;
		expect(() =>
			render(ZList, {
				props: { children, items: [] } as never
			})
		).toThrow(/either items or children/u);
	});
});
