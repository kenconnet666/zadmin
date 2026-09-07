<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import type { SortableDisabled } from '@dnd-kit/dom/sortable';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';

	export interface SortableItemState {
		readonly attach: Attachment<HTMLElement>;
		readonly attachHandle: Attachment<HTMLElement>;
		readonly attachSource: Attachment<HTMLElement>;
		readonly attachTarget: Attachment<HTMLElement>;
		readonly isDragging: boolean;
		readonly isDropping: boolean;
		readonly isDragSource: boolean;
		readonly isDropTarget: boolean;
	}

	export interface SortableItemProps<TData extends Record<PropertyKey, unknown>> {
		readonly children: Snippet<[state: SortableItemState]>;
		readonly data: TData;
		readonly disabled?: boolean | SortableDisabled;
		readonly group?: SelectionKey;
		readonly id: SelectionKey;
		readonly index: number;
	}
</script>

<script lang="ts" generics="TData extends Record<PropertyKey, unknown>">
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { safeSortablePlugins } from '../../../runtime/drag-drop/plugins.js';

	let { children, data, disabled = false, group, id, index }: SortableItemProps<TData> = $props();

	const sortable = createSortable<TData>({
		get data() {
			return data;
		},
		get disabled() {
			return disabled;
		},
		get group() {
			return group;
		},
		get id() {
			return id;
		},
		get index() {
			return index;
		},
		plugins: safeSortablePlugins(),
		transition: null
	});

	$effect(() => {
		// @dnd-kit/svelte 0.5.0 merges null into its default transition object. Re-apply the
		// class-only contract after its own reactive input effect until the upstream adapter
		// preserves null.
		void data;
		void disabled;
		void group;
		void id;
		void index;
		sortable.sortable.transition = null;
	});

	const state: SortableItemState = {
		attach: sortable.attach,
		attachHandle: sortable.attachHandle,
		attachSource: sortable.attachSource,
		attachTarget: sortable.attachTarget,
		get isDragging() {
			return sortable.isDragging;
		},
		get isDropping() {
			return sortable.isDropping;
		},
		get isDragSource() {
			return sortable.isDragSource;
		},
		get isDropTarget() {
			return sortable.isDropTarget;
		}
	};
</script>

{@render children(state)}
