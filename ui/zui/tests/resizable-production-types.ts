import type { ComponentProps, Snippet } from 'svelte';

import ZResizable, {
	type ZResizableHandleContext,
	type ZResizableProps,
	type ZResizableResizeDetail,
	type ZResizableValue
} from '../src/components/layout/ZResizable.svelte';

const handle = (() => undefined) as unknown as Snippet<[ZResizableHandleContext]>;

const valid = {
	axis: 'both',
	defaultHeight: '12rem',
	defaultWidth: 50,
	disabled: false,
	handle,
	handleLabel: (value) => `Resize ${value}`,
	handles: ['inline-start', 'block-end', 'block-end-inline-end'],
	height: '240px',
	maxHeight: '30rem',
	maxWidth: '90%',
	minHeight: '8rem',
	minWidth: 20,
	onResize(detail: ZResizableResizeDetail) {
		const pixels: number = detail.widthPixels;
		void pixels;
		// @ts-expect-error lifecycle snapshots are readonly.
		detail.width = '10px';
	},
	onSizeChange(value: ZResizableValue) {
		const width: number | `${number}%` | `${number}px` | `${number}rem` = value.width;
		void width;
		// @ts-expect-error atomic size snapshots are readonly.
		value.height = '10px';
	},
	shiftStep: 32,
	size: 'xlarge',
	step: 8,
	width: '320px'
} satisfies ComponentProps<typeof ZResizable> satisfies ZResizableProps;
void valid;

const invalidAxis = {
	// @ts-expect-error axis is a closed logical-dimension union.
	axis: 'horizontal'
} satisfies ZResizableProps;
void invalidAxis;

const invalidHandle = {
	// @ts-expect-error handles use logical edge and corner names.
	handles: ['right']
} satisfies ZResizableProps;
void invalidHandle;

const invalidWidth = {
	// @ts-expect-error ResizableLength intentionally supports only number, %, px and rem.
	width: '20vw'
} satisfies ZResizableProps;
void invalidWidth;

const invalidSize = {
	// @ts-expect-error size is one of the five control sizes.
	size: 'huge'
} satisfies ZResizableProps;
void invalidSize;
