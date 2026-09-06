import type { ComponentProps, Snippet } from 'svelte';

import ZToolbar, { type ZToolbarProps } from '../src/components/compound/toolbar/ZToolbar.svelte';
import ZToolbarItem, {
	type ZToolbarItemProps
} from '../src/components/compound/toolbar/ZToolbarItem.svelte';
import type { ToolbarItemAttributes } from '../src/components/compound/toolbar/context.svelte.js';

const children = (() => undefined) as Snippet;
const itemChildren = ((_attributes: ToolbarItemAttributes) => undefined) as Snippet<
	[ToolbarItemAttributes]
>;

const toolbar = {
	'aria-label': 'Editor toolbar',
	children,
	gap: 'small',
	loop: false,
	orientation: 'vertical',
	size: 'large'
} satisfies ComponentProps<typeof ZToolbar> satisfies ZToolbarProps;
void toolbar;

const item = {
	children: itemChildren,
	keyPolicy: 'control',
	value: 1
} satisfies ComponentProps<typeof ZToolbarItem> satisfies ZToolbarItemProps;
void item;

const invalidOrientation = {
	// @ts-expect-error Toolbar has one concrete horizontal or vertical navigation axis.
	orientation: 'both'
} satisfies ZToolbarProps;
void invalidOrientation;

const invalidOwnedRootAttributes = {
	// @ts-expect-error Toolbar owns its composite role.
	role: 'menu'
} satisfies ZToolbarProps;
void invalidOwnedRootAttributes;

const invalidItemKey = {
	children: itemChildren,
	// @ts-expect-error ToolbarItem identity is a string or finite numeric SelectionKey.
	value: Symbol('invalid')
} satisfies ZToolbarItemProps;
void invalidItemKey;

const invalidKeyPolicy = {
	children: itemChildren,
	// @ts-expect-error ToolbarItem key ownership is explicit.
	keyPolicy: 'automatic',
	value: 'save'
} satisfies ZToolbarItemProps;
void invalidKeyPolicy;
