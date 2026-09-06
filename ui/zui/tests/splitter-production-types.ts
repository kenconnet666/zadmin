import type { ComponentProps } from 'svelte';

import {
	default as ZSplitter,
	type ZSplitterPanel,
	type ZSplitterProps,
	type ZSplitterResizeDetail
} from '../src/components/layout/ZSplitter.svelte';

type Key = 'editor' | 'sidebar';

const panels = [
	{ key: 'sidebar', label: 'Files', min: '8rem', max: '50%', collapsible: true },
	{ key: 'editor', label: 'Editor', min: 20 }
] as const satisfies readonly ZSplitterPanel<Key>[];

const props = {
	defaultSizes: ['15rem', 70],
	panel: (() => undefined) as never,
	panels,
	sizes: ['240px', 65],
	onResize(detail: ZSplitterResizeDetail) {
		const first: number = detail.percentages[0];
		void first;
		// @ts-expect-error Callback snapshots are immutable.
		detail.sizes[0] = 10;
	}
} satisfies ComponentProps<typeof ZSplitter<Key>> satisfies ZSplitterProps<Key>;
void props;

const invalidUnit = {
	panel: (() => undefined) as never,
	panels,
	// @ts-expect-error Splitter lengths intentionally support only number, %, px and rem.
	sizes: ['15em', 70]
} satisfies ZSplitterProps<Key>;
void invalidUnit;

const invalidKey = {
	panel: (() => undefined) as never,
	// @ts-expect-error Stable panel identity is a SelectionKey, never a Symbol.
	panels: [
		{ key: Symbol('sidebar'), label: 'Files' },
		{ key: 'editor', label: 'Editor' }
	]
} satisfies ZSplitterProps<Key>;
void invalidKey;
