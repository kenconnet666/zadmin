import {
	Accessibility,
	Cursor,
	Feedback,
	PreventSelection,
	StyleInjector,
	defaultPreset
} from '@dnd-kit/dom';
import { SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';

export type DragDropPluginList = typeof defaultPreset.plugins;

export interface ClassOnlyDragDropPluginOptions {
	readonly nonce?: string;
}

const CLASS_ONLY_EXCLUDED_PLUGINS = new Set<unknown>([
	Accessibility,
	Cursor,
	Feedback,
	PreventSelection
]);

/** Keeps behavior plugins while removing defaults that inject runtime styles or accessibility DOM. */
export function classOnlyDragDropPlugins(
	defaults: DragDropPluginList,
	options: ClassOnlyDragDropPluginOptions = {}
): DragDropPluginList {
	const plugins = defaults.filter((plugin) => !CLASS_ONLY_EXCLUDED_PLUGINS.has(plugin));
	if (options.nonce !== undefined) {
		if (options.nonce.length === 0) throw new TypeError('DragDrop CSP nonce must not be empty.');
		plugins.push(StyleInjector.configure({ nonce: options.nonce }));
	}
	return plugins;
}

/** Explicit entity plugins prevent DOM optimistic sorting from re-entering through defaults. */
export function safeSortablePlugins(): [typeof SortableKeyboardPlugin] {
	return [SortableKeyboardPlugin];
}
