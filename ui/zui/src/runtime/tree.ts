import type { SelectionKey } from './collection/selection.js';

export interface TreeNode<TKey extends SelectionKey = SelectionKey> {
	readonly disabled?: boolean;
	readonly key: TKey;
	readonly label: string;
	readonly parentKey?: TKey;
}

export interface TreeEntry<TKey extends SelectionKey = SelectionKey> {
	readonly childCount: number;
	readonly disabled: boolean;
	readonly key: TKey;
	readonly label: string;
	readonly level: number;
	readonly parentKey: TKey | undefined;
	readonly position: number;
	readonly setSize: number;
}

export interface TreeIndex<TKey extends SelectionKey = SelectionKey> {
	readonly children: ReadonlyMap<TKey | undefined, readonly TreeNode<TKey>[]>;
	readonly nodes: ReadonlyMap<TKey, TreeNode<TKey>>;
	flatten(expanded: ReadonlySet<TKey>): readonly TreeEntry<TKey>[];
}

export function createTreeIndex<TKey extends SelectionKey>(
	source: readonly TreeNode<TKey>[]
): TreeIndex<TKey> {
	const nodes = new Map<TKey, TreeNode<TKey>>();
	for (const node of source) {
		if (nodes.has(node.key)) throw new Error(`Duplicate tree key "${String(node.key)}".`);
		nodes.set(node.key, Object.freeze({ ...node }));
	}
	for (const node of nodes.values()) {
		if (node.parentKey !== undefined && !nodes.has(node.parentKey)) {
			throw new Error(`Missing tree parent "${String(node.parentKey)}" for "${String(node.key)}".`);
		}
		const seen = new Set<TKey>([node.key]);
		let parent = node.parentKey;
		while (parent !== undefined) {
			if (seen.has(parent)) throw new Error(`Tree cycle detected at "${String(parent)}".`);
			seen.add(parent);
			parent = nodes.get(parent)?.parentKey;
		}
	}
	const mutableChildren = new Map<TKey | undefined, TreeNode<TKey>[]>();
	for (const node of nodes.values()) {
		const siblings = mutableChildren.get(node.parentKey) ?? [];
		siblings.push(node);
		mutableChildren.set(node.parentKey, siblings);
	}
	const children = new Map<TKey | undefined, readonly TreeNode<TKey>[]>(
		[...mutableChildren].map(([key, value]) => [key, Object.freeze(value)])
	);
	return Object.freeze({
		children,
		flatten(expanded) {
			const entries: TreeEntry<TKey>[] = [];
			const visit = (parentKey: TKey | undefined, level: number) => {
				const siblings = children.get(parentKey) ?? [];
				for (const [index, node] of siblings.entries()) {
					const childCount = children.get(node.key)?.length ?? 0;
					entries.push(
						Object.freeze({
							childCount,
							disabled: node.disabled ?? false,
							key: node.key,
							label: node.label,
							level,
							parentKey: node.parentKey,
							position: index + 1,
							setSize: siblings.length
						})
					);
					if (childCount > 0 && expanded.has(node.key)) visit(node.key, level + 1);
				}
			};
			visit(undefined, 1);
			return Object.freeze(entries);
		},
		nodes
	});
}
