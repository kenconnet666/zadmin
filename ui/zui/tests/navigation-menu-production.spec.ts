import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZNavigationMenu from '../src/components/compound/navigation-menu/ZNavigationMenu.svelte';
import type { NavigationMenuEntry } from '../src/runtime/collection/navigation-menu.js';

type Key = 1 | '1' | 'group' | 'group-child' | 'home' | 'projects' | 'separator';

const items = [
	{ key: 'home', label: 'Home', href: '/home' },
	{
		kind: 'group',
		key: 'group',
		label: 'Workspace',
		children: [{ key: 'group-child', label: 'Help', href: '/help' }]
	},
	{ kind: 'separator', key: 'separator' },
	{
		key: 'projects',
		label: 'Projects',
		href: '/projects',
		children: [
			{ key: 1, label: 'Number project', href: '/projects/number' },
			{ key: '1', label: 'String project', href: '/projects/string' }
		]
	}
] as const satisfies readonly NavigationMenuEntry<Key>[];

describe('ZNavigationMenu server contract', () => {
	it('renders native navigation lists, links and disclosure buttons without menu roles', () => {
		const body = render(ZNavigationMenu<Key>, {
			props: {
				'aria-label': 'Project navigation',
				currentKey: '1',
				defaultOpenKeys: ['projects'],
				items,
				overflow: false
			}
		}).body;

		expect(body.match(/<nav(?:\s|>)/gu)).toHaveLength(1);
		expect(body).toContain('aria-label="Project navigation"');
		expect(body.match(/<ul(?:\s|>)/gu)).toHaveLength(3);
		expect(body.match(/<li(?:\s|>)/gu)).toHaveLength(7);
		expect(body.match(/role="list"/gu)).toHaveLength(3);
		expect(body).toContain('role="group"');
		expect(body.match(/<hr(?:\s|>)/gu)).toHaveLength(1);
		const separator = body.match(/<hr[^>]*>/u)?.[0];
		expect(separator).toContain('role="presentation"');
		expect(separator).toContain('aria-hidden="true"');
		expect(body).not.toContain('role="menu"');
		expect(body).not.toContain('role="menuitem"');
		expect(body.match(/<a(?:\s|>)/gu)).toHaveLength(5);
		expect(body.match(/<button(?:\s|>)/gu)).toHaveLength(1);
		expect(body.match(/aria-current="page"/gu)).toHaveLength(1);
		expect(body).toMatch(/href="\/projects"[\s\S]*?<\/a>[\s\S]*?<button/gu);
		expect(body).toContain('data-key="1" data-key-type="number"');
		expect(body).toContain('data-key="1" data-key-type="string"');
		expect(body).toContain('data-state="open"');
	});

	it('derives current markup only from currentKey and validates while server body is read', () => {
		const body = render(ZNavigationMenu<Key>, {
			props: { 'aria-label': 'No current navigation', items, overflow: false }
		}).body;
		expect(body).not.toContain('aria-current="page"');
		expect(
			() =>
				render(ZNavigationMenu, {
					props: {
						'aria-label': 'Invalid navigation',
						currentKey: true as never,
						items
					}
				}).body
		).toThrow('NavigationMenu currentKey');
	});
});
