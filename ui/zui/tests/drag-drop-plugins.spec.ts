import {
	Accessibility,
	AutoScroller,
	Cursor,
	Feedback,
	PreventSelection,
	defaultPreset
} from '@dnd-kit/dom';
import { OptimisticSortingPlugin, SortableKeyboardPlugin } from '@dnd-kit/dom/sortable';
import { describe, expect, it } from 'vitest';

import { classOnlyDragDropPlugins, safeSortablePlugins } from '../src/runtime/drag-drop/plugins.js';

describe('class-only drag and drop plugin boundary', () => {
	it('preserves behavior without style, accessibility DOM or optimistic sorting plugins', () => {
		const managerPlugins = classOnlyDragDropPlugins(defaultPreset.plugins);
		expect(managerPlugins).toContain(AutoScroller);
		expect(managerPlugins).not.toContain(Accessibility);
		expect(managerPlugins).not.toContain(Cursor);
		expect(managerPlugins).not.toContain(Feedback);
		expect(managerPlugins).not.toContain(PreventSelection);

		const sortablePlugins = safeSortablePlugins();
		expect(sortablePlugins).toEqual([SortableKeyboardPlugin]);
		expect(sortablePlugins).not.toContain(OptimisticSortingPlugin);
	});

	it('adds only an explicit non-empty StyleInjector configuration', () => {
		const baseline = classOnlyDragDropPlugins(defaultPreset.plugins);
		expect(
			classOnlyDragDropPlugins(defaultPreset.plugins, { nonce: 'request-nonce' })
		).toHaveLength(baseline.length + 1);
		expect(() => classOnlyDragDropPlugins(defaultPreset.plugins, { nonce: '' })).toThrow(
			/non-empty|must not be empty/u
		);
	});
});
