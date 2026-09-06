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

const priority = { columns: 2, minItemWidth: 160 } satisfies ComponentProps<
	typeof ZSimpleGrid
> satisfies ZSimpleGridProps;
void priority;

// @ts-expect-error Column count remains numeric even when supplied responsively.
const invalidColumns = { columns: { base: 'two' } } satisfies ComponentProps<typeof ZSimpleGrid>;
void invalidColumns;
