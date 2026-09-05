import type { Snippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZDescriptionList, {
	type DescriptionItem
} from '../src/components/data-display/ZDescriptionList.svelte';
import ZList, { type ListItem } from '../src/components/data-display/ZList.svelte';

const renderSsr = render as unknown as (
	component: unknown,
	options: { props: unknown }
) => { body: string };

describe('display collection server contracts', () => {
	it('renders real list and description-list structures with typed identities', () => {
		const listItems: readonly ListItem[] = [
			{ key: 1, label: 'Number' },
			{ key: '1', label: 'String' }
		];
		const descriptionItems: readonly DescriptionItem[] = [
			{ key: 1, term: 'Number', description: 'One' },
			{ key: '1', term: 'String', description: 'One' }
		];
		const list = renderSsr(ZList, {
			props: { items: listItems }
		}).body;
		const descriptions = renderSsr(ZDescriptionList, {
			props: { items: descriptionItems }
		}).body;
		expect(list).toContain('<ul');
		expect(list.match(/<li/gu)).toHaveLength(2);
		expect(descriptions).toContain('<dl');
		expect(descriptions.match(/<dt/gu)).toHaveLength(2);
		expect(descriptions.match(/<dd/gu)).toHaveLength(2);
	});

	it('does not disguise empty/loading feedback as list or description items', () => {
		const emptyList = renderSsr(ZList, { props: { items: [] } }).body;
		const loadingDescriptions = renderSsr(ZDescriptionList, {
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
		expect(
			() =>
				renderSsr(ZList, {
					props: {
						items: [
							{ key: 'same', label: 'A' },
							{ key: 'same', label: 'B' }
						]
					}
				}).body
		).toThrow(/Duplicate ZList key/u);
		expect(
			() =>
				renderSsr(ZDescriptionList, {
					props: { items: [{ key: Number.NaN, term: 'A', description: 'B' }] }
				}).body
		).toThrow(/finite numbers/u);
		expect(
			() => renderSsr(ZList, { props: { items: [{ label: 'Missing key' }] } as never }).body
		).toThrow(/finite numbers/u);

		const children = (() => undefined) as unknown as Snippet;
		expect(
			() =>
				renderSsr(ZList, {
					props: { children, items: [] } as never
				}).body
		).toThrow(/either items or children/u);
	});
});
