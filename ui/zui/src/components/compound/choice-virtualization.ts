import type { ZVirtualListController } from '../data-display/ZVirtualList.svelte';
import type {
	ActiveDescendantAlign,
	VirtualMountBridge
} from '../../runtime/collection/active-descendant.svelte.js';
import type { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
import type { SelectionKey } from '../../runtime/collection/selection.js';

export type ChoiceVirtualController<TKey extends SelectionKey = SelectionKey> =
	ZVirtualListController<TKey>;

export interface ChoiceVirtualMountBridge<
	TKey extends SelectionKey
> extends VirtualMountBridge<TKey> {
	connect(controller: ChoiceVirtualController<TKey> | null, activeKey?: TKey): void;
}

/** Small adapter that keeps virtual window ownership outside active/selection state. */
export function createChoiceVirtualMountBridge<TKey extends SelectionKey>(
	mounted: MountedElements<TKey>
): ChoiceVirtualMountBridge<TKey> {
	let controller: ChoiceVirtualController<TKey> | null = null;
	return {
		connect(next, activeKey) {
			controller = next;
			if (next && activeKey !== undefined) next.ensureKey(activeKey, 'nearest');
		},
		ensureKey(key, align: ActiveDescendantAlign = 'nearest') {
			controller?.ensureKey(key, align);
		},
		isRendered(key) {
			return controller?.isRendered(key) ?? mounted.has(key);
		},
		scrollToKey(key, align: ActiveDescendantAlign = 'nearest') {
			controller?.scrollToKey(key, align);
		}
	};
}

export interface ChoiceContentContract {
	readonly dataMode: boolean;
	readonly grouped: boolean;
	readonly hasChildren: boolean;
	readonly virtual: boolean;
}

/** Enforces the deliberately narrow first production boundary for virtual choices. */
export function assertChoiceContentContract(
	component: 'ZCombobox' | 'ZMultiSelect' | 'ZSelect',
	contract: ChoiceContentContract
): void {
	if (contract.dataMode && contract.hasChildren) {
		throw new Error(
			`${component}Content children and ${component} options are mutually exclusive. Use the option snippet to customize data options.`
		);
	}
	if (contract.virtual && !contract.dataMode) {
		throw new Error(`${component}Content virtual requires authoritative ${component} options.`);
	}
	if (contract.virtual && contract.grouped) {
		throw new Error(
			`${component}Content virtual does not support grouped options. Remove groups or disable virtual mode.`
		);
	}
}
