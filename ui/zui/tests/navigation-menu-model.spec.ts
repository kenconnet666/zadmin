import type { Snippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import {
	indexNavigationMenu,
	navigationMenuItem,
	type NavigationMenuEntry,
	type NavigationMenuPanelContext
} from '../src/runtime/collection/navigation-menu.js';

describe('NavigationMenu logical model', () => {
	it('indexes typed keys globally while preserving static groups, branch ancestry and disabled inheritance', () => {
		type Key = 1 | '1' | 'branch' | 'child' | 'group' | 'group-child' | 'separator';
		const entries = [
			{ key: 1, label: 'Number one', href: '/number' },
			{ key: '1', label: 'String one', href: '/string' },
			{
				key: 'branch',
				label: 'Branch',
				children: [{ key: 'child', label: 'Child', href: '/child' }]
			},
			{
				kind: 'group',
				key: 'group',
				label: 'Static group',
				disabled: true,
				children: [{ key: 'group-child', label: 'Group child', href: '/group-child' }]
			},
			{ kind: 'separator', key: 'separator' }
		] as const satisfies readonly NavigationMenuEntry<Key>[];
		const tree = indexNavigationMenu<Key>(entries);

		expect(tree.records.map((record) => record.key)).toEqual([
			1,
			'1',
			'branch',
			'child',
			'group',
			'group-child',
			'separator'
		]);
		expect(navigationMenuItem(tree.byKey.get(1))?.label).toBe('Number one');
		expect(navigationMenuItem(tree.byKey.get('1'))?.label).toBe('String one');
		expect(tree.byKey.get(1)).not.toBe(tree.byKey.get('1'));
		expect(tree.byKey.get('branch')).toMatchObject({ branch: true, branches: [], depth: 0 });
		expect(tree.byKey.get('child')).toMatchObject({
			branch: false,
			branches: ['branch'],
			depth: 1,
			parentBranch: 'branch',
			parentKey: 'branch',
			rootKey: 'branch'
		});
		expect(tree.byKey.get('group')).toMatchObject({ branch: false, branches: [], depth: 0 });
		expect(tree.byKey.get('group-child')).toMatchObject({
			branches: [],
			disabled: true,
			parentBranch: undefined,
			parentKey: 'group',
			rootKey: 'group'
		});
		expect(navigationMenuItem(tree.byKey.get('group'))).toBeUndefined();
		expect(navigationMenuItem(tree.byKey.get('branch'))?.label).toBe('Branch');
	});

	it('rejects duplicate keys across the whole tree while keeping number and string identities distinct', () => {
		expect(() =>
			indexNavigationMenu<1 | 'branch'>([
				{ key: 1, label: 'Number one' },
				{
					key: 'branch',
					label: 'Branch',
					children: [{ key: 1, label: 'Duplicate number one' }]
				}
			])
		).toThrow('globally unique typed keys');
		expect(() =>
			indexNavigationMenu<1 | '1'>([
				{ key: 1, label: 'Number one' },
				{ key: '1', label: 'String one' }
			])
		).not.toThrow();
	});

	it('rejects recursive object cycles independently of duplicate-key validation', () => {
		const entries: NavigationMenuEntry<string>[] = [];
		const cyclic: NavigationMenuEntry<string> = {
			key: 'cycle',
			label: 'Cycle',
			children: entries
		};
		entries.push(cyclic);
		expect(() => indexNavigationMenu(entries)).toThrow('cannot contain cyclic children');
	});

	it('requires nonempty item and group labels while allowing an unlabeled separator', () => {
		expect(() => indexNavigationMenu([{ key: 'blank', label: '   ' }])).toThrow(
			'require nonempty labels'
		);
		expect(() =>
			indexNavigationMenu([{ kind: 'group', key: 'group', label: '', children: [] }])
		).toThrow('require nonempty labels');
		expect(() => indexNavigationMenu([{ kind: 'separator', key: 'separator' }])).not.toThrow();
	});

	it('rejects invalid kinds, hrefs, panels and branch definitions', () => {
		expect(() =>
			indexNavigationMenu([
				{
					kind: 'submenu',
					key: 'invalid',
					label: 'Invalid'
				} as unknown as NavigationMenuEntry<string>
			])
		).toThrow('Invalid NavigationMenu entry kind');
		expect(() =>
			indexNavigationMenu([{ key: 'blank-href', label: 'Blank href', href: ' ' }])
		).toThrow('href must be a nonempty string');
		expect(() =>
			indexNavigationMenu([
				{
					key: 'invalid-panel',
					label: 'Invalid panel',
					panel: 42 as unknown as Snippet<[NavigationMenuPanelContext<string>]>
				}
			])
		).toThrow('panel must be a Svelte snippet');
		const panel = (() => undefined) as unknown as Snippet<[NavigationMenuPanelContext<string>]>;
		expect(() =>
			indexNavigationMenu([
				{
					key: 'ambiguous',
					label: 'Ambiguous branch',
					children: [],
					panel
				} as unknown as NavigationMenuEntry<string>
			])
		).toThrow('either children or panel');
	});
});
