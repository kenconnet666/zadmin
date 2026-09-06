import type { ComponentProps, Snippet } from 'svelte';

import ZCheckboxGroup, {
	type ZCheckboxGroupOption,
	type ZCheckboxGroupProps
} from '../src/components/compound/checkbox-group/ZCheckboxGroup.svelte';
import ZCheckboxGroupItem, {
	type ZCheckboxGroupItemProps
} from '../src/components/compound/checkbox-group/ZCheckboxGroupItem.svelte';
import ZCheckboxGroupSelectAll, {
	type ZCheckboxGroupSelectAllProps
} from '../src/components/compound/checkbox-group/ZCheckboxGroupSelectAll.svelte';
import type { CheckboxGroupValue } from '../src/runtime/form/checkbox-group.js';

type Permission = 'read' | 'write';
const children = (() => undefined) as unknown as Snippet;
const value: CheckboxGroupValue<Permission> = ['read'];
const options: readonly ZCheckboxGroupOption<Permission>[] = [
	{ label: 'Read', value: 'read' },
	{ disabled: true, label: 'Write', value: 'write' }
];
const group = {
	defaultValue: value,
	maxSelected: 2,
	minSelected: 1,
	name: 'permission',
	onValueChange: (next: readonly Permission[]) => void next,
	options,
	orientation: 'horizontal',
	preserveUnknownValues: true,
	required: true,
	size: 'large',
	tone: 'success',
	value
} satisfies ComponentProps<
	typeof ZCheckboxGroup<Permission>
> satisfies ZCheckboxGroupProps<Permission>;
const compound = {
	children,
	defaultValue: [1] as const,
	value: [1, 2] as const
} satisfies ZCheckboxGroupProps<number>;
const item = {
	children,
	disabled: false,
	size: 'small',
	textValue: 'Read permission',
	tone: 'info',
	value: 'read'
} satisfies ComponentProps<
	typeof ZCheckboxGroupItem<Permission>
> satisfies ZCheckboxGroupItemProps<Permission>;
const selectAll = {
	children,
	disabled: false,
	size: 'small',
	tone: 'neutral'
} satisfies ComponentProps<typeof ZCheckboxGroupSelectAll> satisfies ZCheckboxGroupSelectAllProps;

// @ts-expect-error Data mode requires options when children are absent.
const emptyGroup = {} satisfies ZCheckboxGroupProps;
// @ts-expect-error Data and compound modes are mutually exclusive.
const mixedModes = { children, options } satisfies ZCheckboxGroupProps<Permission>;
const objectValue = {
	// @ts-expect-error CheckboxGroup values use SelectionKey values only.
	options: [{ label: 'Object', value: { id: 1 } }]
} satisfies ZCheckboxGroupProps;
// @ts-expect-error Item value is required.
const missingItemValue = { children } satisfies ZCheckboxGroupItemProps;
const invalidOrientation = {
	options,
	// @ts-expect-error Orientation is a closed axis.
	orientation: 'grid'
} satisfies ZCheckboxGroupProps<Permission>;

void [
	group,
	compound,
	item,
	selectAll,
	emptyGroup,
	mixedModes,
	objectValue,
	missingItemValue,
	invalidOrientation
];
