import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
import type { ZIconName } from '../../components/gene/ZIcon.svelte';
import { assertSelectionKey, type SelectionKey } from './selection.js';

export type NavigationMenuMode = 'inline' | 'vertical' | 'horizontal';
export interface NavigationMenuPanelContext<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly currentKey: TKey | null;
	close(): void;
}
interface NavigationMenuItemBase<TKey extends SelectionKey = SelectionKey> {
	readonly kind?: 'item';
	readonly key: TKey;
	readonly label: string;
	readonly description?: string;
	readonly icon?: ZIconName;
	readonly href?: string;
	readonly target?: HTMLAnchorAttributes['target'];
	readonly rel?: string;
	readonly external?: boolean;
	readonly disabled?: boolean;
}
export type NavigationMenuItem<TKey extends SelectionKey = SelectionKey> =
	NavigationMenuItemBase<TKey> &
		(
			| { readonly children: readonly NavigationMenuEntry<TKey>[]; readonly panel?: never }
			| {
					readonly panel: Snippet<[context: NavigationMenuPanelContext<TKey>]>;
					readonly children?: never;
			  }
			| { readonly children?: never; readonly panel?: never }
		);
export interface NavigationMenuGroup<TKey extends SelectionKey = SelectionKey> {
	readonly kind: 'group';
	readonly key: TKey;
	readonly label: string;
	readonly disabled?: boolean;
	readonly children: readonly NavigationMenuEntry<TKey>[];
}
export interface NavigationMenuSeparator<TKey extends SelectionKey = SelectionKey> {
	readonly kind: 'separator';
	readonly key: TKey;
}
export type NavigationMenuEntry<TKey extends SelectionKey = SelectionKey> =
	NavigationMenuItem<TKey> | NavigationMenuGroup<TKey> | NavigationMenuSeparator<TKey>;

export interface NavigationMenuNavigateRequest<TKey extends SelectionKey = SelectionKey> {
	readonly key: TKey;
	readonly href: string;
	readonly item: NavigationMenuItem<TKey>;
	readonly originalEvent: MouseEvent;
	readonly defaultPrevented: boolean;
	preventDefault(): void;
	/** Closes disclosure panels after a caller-owned SPA navigation succeeds. */
	close(): void;
}

export interface NavigationMenuRecord<TKey extends SelectionKey = SelectionKey> {
	readonly entry: NavigationMenuEntry<TKey>;
	readonly key: TKey;
	readonly disabled: boolean;
	readonly branch: boolean;
	readonly parentKey: TKey | undefined;
	readonly parentBranch: TKey | undefined;
	readonly branches: readonly TKey[];
	readonly depth: number;
	readonly rootKey: TKey;
}

/** Normalizes only logical data; focus, mounted nodes, popup state and routes have other owners. */
export function indexNavigationMenu<TKey extends SelectionKey>(
	entries: readonly NavigationMenuEntry<TKey>[]
): {
	readonly records: readonly NavigationMenuRecord<TKey>[];
	readonly byKey: ReadonlyMap<TKey, NavigationMenuRecord<TKey>>;
} {
	const records: NavigationMenuRecord<TKey>[] = [];
	const byKey = new Map<TKey, NavigationMenuRecord<TKey>>();
	const ancestors = new Set<object>();
	function visit(
		items: readonly NavigationMenuEntry<TKey>[],
		parentKey: TKey | undefined,
		branches: readonly TKey[],
		disabled: boolean,
		depth: number,
		rootKey?: TKey
	): void {
		if (!Array.isArray(items)) throw new TypeError('NavigationMenu children must be arrays.');
		for (const entry of items) {
			if (!entry || typeof entry !== 'object')
				throw new TypeError('NavigationMenu entries must be objects.');
			if (ancestors.has(entry))
				throw new TypeError('NavigationMenu cannot contain cyclic children.');
			assertSelectionKey(entry.key, 'NavigationMenu');
			if (byKey.has(entry.key))
				throw new TypeError('NavigationMenu requires globally unique typed keys.');
			if (entry.kind !== undefined && !['item', 'group', 'separator'].includes(entry.kind))
				throw new TypeError('Invalid NavigationMenu entry kind.');
			if (entry.kind !== 'separator' && (typeof entry.label !== 'string' || !entry.label.trim()))
				throw new TypeError('NavigationMenu items and groups require nonempty labels.');
			const item = entry.kind === undefined || entry.kind === 'item' ? entry : undefined;
			if (item?.href !== undefined && (typeof item.href !== 'string' || !item.href.trim()))
				throw new TypeError('NavigationMenu href must be a nonempty string.');
			if (item?.children !== undefined && item.panel !== undefined)
				throw new TypeError('NavigationMenu uses either children or panel for one branch.');
			if (item?.panel !== undefined && typeof item.panel !== 'function')
				throw new TypeError('NavigationMenu panel must be a Svelte snippet.');
			const branch =
				item !== undefined && (item.children !== undefined || item.panel !== undefined);
			const entryDisabled = disabled || (entry.kind !== 'separator' && Boolean(entry.disabled));
			const record = Object.freeze({
				entry,
				key: entry.key,
				disabled: entryDisabled,
				branch,
				parentKey,
				parentBranch: branches.at(-1),
				branches,
				depth,
				rootKey: rootKey ?? entry.key
			});
			records.push(record);
			byKey.set(entry.key, record);
			if (entry.kind === 'group' || item?.children !== undefined) {
				ancestors.add(entry);
				visit(
					(entry as NavigationMenuGroup<TKey> | NavigationMenuItem<TKey>).children!,
					entry.key,
					branch ? Object.freeze([...branches, entry.key]) : branches,
					entryDisabled,
					depth + 1,
					rootKey ?? entry.key
				);
				ancestors.delete(entry);
			}
		}
	}
	visit(entries, undefined, Object.freeze([]), false, 0);
	return Object.freeze({ records: Object.freeze(records), byKey });
}

export function navigationMenuItem<TKey extends SelectionKey>(
	record: NavigationMenuRecord<TKey> | undefined
): NavigationMenuItem<TKey> | undefined {
	return record && (record.entry.kind === undefined || record.entry.kind === 'item')
		? record.entry
		: undefined;
}
