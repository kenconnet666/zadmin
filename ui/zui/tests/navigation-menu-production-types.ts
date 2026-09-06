import type { ComponentProps, Snippet } from 'svelte';

import ZNavigationMenu, {
	type ZNavigationMenuProps
} from '../src/components/compound/navigation-menu/ZNavigationMenu.svelte';
import type {
	NavigationMenuEntry,
	NavigationMenuPanelContext
} from '../src/runtime/collection/navigation-menu.js';

type KnownKey = 1 | '1' | 'branch' | 'child' | 'group' | 'group-child' | 'panel' | 'separator';

const panel = (() => undefined) as unknown as Snippet<[NavigationMenuPanelContext<KnownKey>]>;
const knownItems = [
	{ key: 1, label: 'Number one', href: '/number' },
	{ key: '1', label: 'String one', href: '/string' },
	{
		key: 'branch',
		label: 'Branch',
		href: '/branch',
		children: [{ key: 'child', label: 'Child', href: '/child' }]
	},
	{
		kind: 'group',
		key: 'group',
		label: 'Group',
		children: [{ key: 'group-child', label: 'Group child', href: '/group-child' }]
	},
	{ key: 'panel', label: 'Panel', panel },
	{ kind: 'separator', key: 'separator' }
] as const satisfies readonly NavigationMenuEntry<KnownKey>[];
const readonlyOpenKeys: readonly KnownKey[] = ['branch', 'panel'];

const valid = {
	collapsed: false,
	currentKey: 'child',
	defaultOpenKeys: readonlyOpenKeys,
	disabled: false,
	expandMode: 'multiple',
	items: knownItems,
	keyboardNavigation: true,
	loop: true,
	mode: 'inline',
	onNavigateRequest: (request) => {
		const key: KnownKey = request.key;
		void key;
		request.preventDefault();
		request.close();
	},
	onOpenKeysChange: (keys: readonly KnownKey[]) => void keys,
	openKeys: readonlyOpenKeys,
	overflow: true,
	overflowLabel: 'More destinations',
	size: 'large',
	tone: 'info',
	variant: 'outline'
} satisfies ComponentProps<
	typeof ZNavigationMenu<KnownKey>
> satisfies ZNavigationMenuProps<KnownKey>;
void valid;

const invalidCurrentKey = {
	// @ts-expect-error currentKey cannot widen the item key domain through NoInfer.
	currentKey: 'missing',
	items: knownItems
} satisfies ZNavigationMenuProps<KnownKey>;
void invalidCurrentKey;

const invalidOpenKeys = {
	items: knownItems,
	// @ts-expect-error openKeys must remain a readonly array of the known key domain.
	openKeys: ['missing'] as const
} satisfies ZNavigationMenuProps<KnownKey>;
void invalidOpenKeys;

const invalidDefaultOpenKeys = {
	// @ts-expect-error defaultOpenKeys must remain inside the known key domain.
	defaultOpenKeys: ['missing'] as const,
	items: knownItems
} satisfies ZNavigationMenuProps<KnownKey>;
void invalidDefaultOpenKeys;

const invalidMode = {
	items: knownItems,
	// @ts-expect-error mode is a closed NavigationMenuMode union.
	mode: 'menubar'
} satisfies ZNavigationMenuProps<KnownKey>;
void invalidMode;

const invalidKind = [
	{
		// @ts-expect-error entry kind is limited to item, group and separator.
		kind: 'submenu',
		key: 'branch',
		label: 'Invalid kind'
	}
] as const satisfies readonly NavigationMenuEntry<KnownKey>[];
void invalidKind;

const invalidKey = [
	{
		// @ts-expect-error boolean keys are outside SelectionKey and the known domain.
		key: true,
		label: 'Invalid key'
	}
] as const satisfies readonly NavigationMenuEntry<KnownKey>[];
void invalidKey;

const groupWithoutChildren = [
	// @ts-expect-error a static group always owns a children array.
	{ kind: 'group', key: 'group', label: 'Missing children' }
] as const satisfies readonly NavigationMenuEntry<KnownKey>[];
void groupWithoutChildren;

const separatorWithLabel = [
	{
		kind: 'separator',
		key: 'separator',
		// @ts-expect-error separators do not accept item or group labels.
		label: 'Unexpected label'
	}
] as const satisfies readonly NavigationMenuEntry<KnownKey>[];
void separatorWithLabel;

const itemWithTwoBranchSources = [
	// @ts-expect-error an item owns either children or panel, never both.
	{
		children: [{ key: 'child', label: 'Child' }],
		key: 'branch',
		label: 'Ambiguous branch',
		panel
	}
] as const satisfies readonly NavigationMenuEntry<KnownKey>[];
void itemWithTwoBranchSources;
