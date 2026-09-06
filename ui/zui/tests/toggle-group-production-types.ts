import type { ComponentProps } from 'svelte';

import {
	default as ZToggleGroup,
	type ZToggleGroupItem,
	type ZToggleGroupProps
} from '../src/components/input/ZToggleGroup.svelte';

type KnownKey = 1 | '1' | 'two';

const knownItems = [
	{ value: 1, label: 'Number one' },
	{ value: '1', label: 'String one' },
	{ value: 'two', label: 'Two', disabled: true }
] as const satisfies readonly ZToggleGroupItem<KnownKey>[];
const readonlyValue: readonly KnownKey[] = [1, '1'];

const valid = {
	allowEmpty: false,
	defaultValue: readonlyValue,
	disabled: false,
	items: knownItems,
	loop: false,
	onValueChange: (value: readonly KnownKey[]) => void value,
	orientation: 'vertical',
	readonly: true,
	roving: false,
	selectionMode: 'multiple',
	shape: 'square',
	size: 'xlarge',
	tone: 'warning',
	value: readonlyValue,
	variant: 'ghost'
} satisfies ComponentProps<typeof ZToggleGroup<KnownKey>> satisfies ZToggleGroupProps<KnownKey>;
void valid;

const invalidMode = {
	items: knownItems,
	// @ts-expect-error selectionMode is a closed SelectionModel mode.
	selectionMode: 'none'
} satisfies ZToggleGroupProps<KnownKey>;
void invalidMode;

const invalidValue = {
	items: knownItems,
	// @ts-expect-error owner values must stay inside the known item domain.
	value: [2] as const
} satisfies ZToggleGroupProps<KnownKey>;
void invalidValue;

const invalidDefaultValue = {
	// @ts-expect-error default values must stay inside the known item domain.
	defaultValue: ['missing'] as const,
	items: knownItems
} satisfies ZToggleGroupProps<KnownKey>;
void invalidDefaultValue;

const invalidItems = [
	// @ts-expect-error boolean keys are outside SelectionKey and the known item domain.
	{ value: true, label: 'Invalid' }
] as const satisfies readonly ZToggleGroupItem<KnownKey>[];
void invalidItems;

const invalidLabel = [
	// @ts-expect-error item labels are always strings.
	{ value: 1, label: 1 }
] as const satisfies readonly ZToggleGroupItem<KnownKey>[];
void invalidLabel;
