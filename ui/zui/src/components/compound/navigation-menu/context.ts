import type { Snippet } from 'svelte';
import type { SelectionKey } from '../../../runtime/collection/selection.js';
import type {
	NavigationMenuEntry,
	NavigationMenuItem,
	NavigationMenuMode,
	NavigationMenuRecord,
	NavigationMenuPanelContext
} from '../../../runtime/collection/navigation-menu.js';
import type { ZControlSize } from '../../../runtime/foundation/control-size.js';
import type { NavLinkTone, NavLinkVariant } from '../../navigation/ZNavLink.svelte';

export interface NavigationMenuItemContext<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly depth: number;
	readonly current: boolean;
	readonly expanded: boolean;
	readonly currentAncestor: boolean;
	readonly disabled: boolean;
}

export interface NavigationMenuContext<TKey extends SelectionKey> {
	readonly mode: NavigationMenuMode;
	readonly inline: boolean;
	readonly compact: boolean;
	readonly direction: 'ltr' | 'rtl';
	readonly size: ZControlSize;
	readonly tone: NavLinkTone;
	readonly variant: NavLinkVariant;
	readonly currentKey: TKey | null;
	readonly emptyLabel: string;
	readonly item?: Snippet<
		[item: NavigationMenuItem<TKey>, context: NavigationMenuItemContext<TKey>]
	>;
	readonly start?: Snippet<
		[item: NavigationMenuItem<TKey>, context: NavigationMenuItemContext<TKey>]
	>;
	readonly end?: Snippet<
		[item: NavigationMenuItem<TKey>, context: NavigationMenuItemContext<TKey>]
	>;
	record(key: TKey): NavigationMenuRecord<TKey>;
	itemContext(key: TKey): NavigationMenuItemContext<TKey>;
	open(key: TKey): boolean;
	id(key: TKey, part: 'primary' | 'disclosure' | 'content' | 'group'): string;
	setExpanded(key: TKey, open: boolean, edge?: 'first' | 'last', restoreTarget?: HTMLElement): void;
	navigate(key: TKey, event: MouseEvent): void;
	keydown(key: TKey, event: KeyboardEvent): void;
	register(
		key: TKey,
		primary: HTMLElement | null,
		disclosure: HTMLButtonElement | null
	): () => void;
	registerPanel(
		key: TKey,
		node: HTMLElement | null,
		restoreTarget?: (target: HTMLElement | null) => void
	): () => void;
	panelContext(key: TKey): NavigationMenuPanelContext<TKey>;
	initialFocus(key: TKey, node: HTMLElement | null): HTMLElement | null;
	panelKeydown(key: TKey, node: HTMLElement | null, event: KeyboardEvent): void;
	returnFocus(key: TKey, panel: HTMLElement | null): void;
}

export type { NavigationMenuEntry };
