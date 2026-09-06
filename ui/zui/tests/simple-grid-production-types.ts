import type { ComponentProps } from 'svelte';

import {
	default as ZSimpleGrid,
	type ZSimpleGridProps
} from '../src/components/layout/ZSimpleGrid.svelte';

const fixed = { columns: { base: 1, medium: 3 } } satisfies ComponentProps<
	typeof ZSimpleGrid
> satisfies ZSimpleGridProps;
const adaptive = { minItemWidth: { base: 160, medium: '14rem' } } satisfies ComponentProps<
	typeof ZSimpleGrid
> satisfies ZSimpleGridProps;
void fixed;
void adaptive;

// @ts-expect-error Fixed column and auto-fit minimum-width modes are mutually exclusive.
const conflicting = { columns: 2, minItemWidth: 160 } satisfies ComponentProps<typeof ZSimpleGrid>;
void conflicting;

// @ts-expect-error Column count remains numeric even when supplied responsively.
const invalidColumns = { columns: { base: 'two' } } satisfies ComponentProps<typeof ZSimpleGrid>;
void invalidColumns;
