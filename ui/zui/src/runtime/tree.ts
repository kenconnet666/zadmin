import { LogicalCollection, type LogicalCollectionView } from './collection/logical-collection.js';
import type { SelectionKey } from './collection/selection.js';

export interface TreeNode<TKey extends SelectionKey = SelectionKey> {
	readonly disabled?: boolean;
	/** Marks a lazy branch whose children may not be present in `nodes` yet. */
	readonly hasChildren?: boolean;
	readonly key: TKey;
	readonly label: string;
	readonly parentKey?: TKey;
	readonly selectionDisabled?: boolean;
	readonly textValue?: string;
}

export interface TreeEntry<TKey extends SelectionKey = SelectionKey> {
	/** Number of children currently present in the logical source. */
	readonly childCount: number;
	readonly disabled: boolean;
	/** True for loaded or lazy branches. */
	readonly hasChildren: boolean;
	readonly key: TKey;
	readonly label: string;
	readonly level: number;
	readonly node: TreeNode<TKey>;
	readonly parentKey: TKey | undefined;
	/** One-based sibling position retained for the pre-LogicalTree API. */
	readonly position: number;
	readonly posInSet: number;
	readonly selectionDisabled: boolean;
	readonly setSize: number;
	readonly textValue: string;
}

export interface LogicalTreeView<TKey extends SelectionKey = SelectionKey> {
	readonly collection: LogicalCollectionView<TKey, TreeNode<TKey>>;
	readonly entries: readonly TreeEntry<TKey>[];
	readonly keys: readonly TKey[];
	get(key: TKey): TreeEntry<TKey> | undefined;
}

export interface TreeIndex<TKey extends SelectionKey = SelectionKey> {
	readonly children: ReadonlyMap<TKey | undefined, readonly TreeNode<TKey>[]>;
	readonly collection: LogicalCollection<TKey, TreeNode<TKey>>;
	readonly nodes: ReadonlyMap<TKey, TreeNode<TKey>>;
	childrenOf(parentKey?: TKey): readonly TreeNode<TKey>[];
	descendantsOf(key: TKey): readonly TreeNode<TKey>[];
	flatten(expanded: ReadonlySet<TKey>): readonly TreeEntry<TKey>[];
	has(key: TKey): boolean;
	isDescendant(key: TKey, ancestorKey: TKey): boolean;
	parentOf(key: TKey): TreeNode<TKey> | undefined;
	pathTo(key: TKey): readonly TreeNode<TKey>[];
	view(expanded: ReadonlySet<TKey>): LogicalTreeView<TKey>;
}

function assertUniqueKeys<TKey extends SelectionKey>(nodes: readonly TreeNode<TKey>[]): void {
	const keys = new Set<TKey>();
	for (const node of nodes) {
		if (keys.has(node.key)) throw new Error(`Duplicate tree key "${String(node.key)}".`);
		keys.add(node.key);
	}
}

/**
 * Immutable hierarchical adapter over LogicalCollection.
 *
 * It owns source order and parent/child normalization only. Expansion,
 * selection, navigation, DOM mounting, lazy request state and virtualization
 * remain independent owners.
 */
export class LogicalTree<TKey extends SelectionKey = SelectionKey> implements TreeIndex<TKey> {
	readonly children: ReadonlyMap<TKey | undefined, readonly TreeNode<TKey>[]>;
	readonly collection: LogicalCollection<TKey, TreeNode<TKey>>;
	readonly nodes: ReadonlyMap<TKey, TreeNode<TKey>>;

	constructor(source: readonly TreeNode<TKey>[]) {
		assertUniqueKeys(source);
		const normalized = Object.freeze(source.map((node) => Object.freeze({ ...node })));
		this.collection = new LogicalCollection(
			normalized,
			{
				disabled: (node) => node.disabled ?? false,
				key: (node) => node.key,
				selectionDisabled: (node) => node.selectionDisabled ?? false,
				textValue: (node) => node.textValue ?? node.label
			},
			{ name: 'Tree' }
		);
		this.nodes = new Map(normalized.map((node) => [node.key, node]));

		for (const node of normalized) {
			if (node.parentKey !== undefined && !this.nodes.has(node.parentKey)) {
				throw new Error(
					`Missing tree parent "${String(node.parentKey)}" for "${String(node.key)}".`
				);
			}
		}
		this.#assertAcyclic();

		const mutableChildren = new Map<TKey | undefined, TreeNode<TKey>[]>();
		for (const node of normalized) {
			const siblings = mutableChildren.get(node.parentKey) ?? [];
			siblings.push(node);
			mutableChildren.set(node.parentKey, siblings);
		}
		this.children = new Map(
			[...mutableChildren].map(([key, siblings]) => [key, Object.freeze(siblings)])
		);
	}

	childrenOf(parentKey?: TKey): readonly TreeNode<TKey>[] {
		return this.children.get(parentKey) ?? Object.freeze([]);
	}

	descendantsOf(key: TKey): readonly TreeNode<TKey>[] {
		const descendants: TreeNode<TKey>[] = [];
		const pending = [...this.childrenOf(key)].reverse();
		while (pending.length > 0) {
			const child = pending.pop()!;
			descendants.push(child);
			const children = this.childrenOf(child.key);
			for (let index = children.length - 1; index >= 0; index -= 1) {
				pending.push(children[index]!);
			}
		}
		return Object.freeze(descendants);
	}

	flatten(expanded: ReadonlySet<TKey>): readonly TreeEntry<TKey>[] {
		return this.view(expanded).entries;
	}

	has(key: TKey): boolean {
		return this.nodes.has(key);
	}

	isDescendant(key: TKey, ancestorKey: TKey): boolean {
		let parent = this.nodes.get(key)?.parentKey;
		while (parent !== undefined) {
			if (Object.is(parent, ancestorKey)) return true;
			parent = this.nodes.get(parent)?.parentKey;
		}
		return false;
	}

	parentOf(key: TKey): TreeNode<TKey> | undefined {
		const parentKey = this.nodes.get(key)?.parentKey;
		return parentKey === undefined ? undefined : this.nodes.get(parentKey);
	}

	pathTo(key: TKey): readonly TreeNode<TKey>[] {
		const node = this.nodes.get(key);
		if (!node) return Object.freeze([]);
		const path: TreeNode<TKey>[] = [node];
		let parent = this.parentOf(node.key);
		while (parent) {
			path.push(parent);
			parent = this.parentOf(parent.key);
		}
		return Object.freeze(path.reverse());
	}

	view(expanded: ReadonlySet<TKey>): LogicalTreeView<TKey> {
		const entries: TreeEntry<TKey>[] = [];
		const byKey = new Map<TKey, TreeEntry<TKey>>();
		interface PendingNode {
			readonly level: number;
			readonly node: TreeNode<TKey>;
			readonly position: number;
			readonly setSize: number;
		}
		const roots = this.childrenOf(undefined);
		const pending: PendingNode[] = [];
		for (let index = roots.length - 1; index >= 0; index -= 1) {
			pending.push({ level: 1, node: roots[index]!, position: index + 1, setSize: roots.length });
		}
		while (pending.length > 0) {
			const current = pending.pop()!;
			const { level, node, position, setSize } = current;
			const children = this.childrenOf(node.key);
			const childCount = children.length;
			const item = this.collection.get(node.key)!;
			const entry = Object.freeze({
				childCount,
				disabled: item.disabled,
				hasChildren: childCount > 0 || node.hasChildren === true,
				key: node.key,
				label: node.label,
				level,
				node,
				parentKey: node.parentKey,
				position,
				posInSet: position,
				selectionDisabled: item.selectionDisabled,
				setSize,
				textValue: item.textValue
			});
			entries.push(entry);
			byKey.set(node.key, entry);
			if (childCount > 0 && expanded.has(node.key)) {
				for (let index = childCount - 1; index >= 0; index -= 1) {
					pending.push({
						level: level + 1,
						node: children[index]!,
						position: index + 1,
						setSize: childCount
					});
				}
			}
		}
		const frozenEntries = Object.freeze(entries);
		const collection = this.collection.view({ keys: frozenEntries.map(({ key }) => key) });
		return Object.freeze({
			collection,
			entries: frozenEntries,
			get: (key: TKey) => byKey.get(key),
			keys: collection.keys
		});
	}

	#assertAcyclic(): void {
		const done = new Set<TKey>();
		for (const start of this.nodes.keys()) {
			if (done.has(start)) continue;
			const path: TKey[] = [];
			const visiting = new Set<TKey>();
			let key: TKey | undefined = start;
			while (key !== undefined && !done.has(key)) {
				if (visiting.has(key)) throw new Error(`Tree cycle detected at "${String(key)}".`);
				visiting.add(key);
				path.push(key);
				key = this.nodes.get(key)?.parentKey;
			}
			for (const current of path) done.add(current);
		}
	}
}
