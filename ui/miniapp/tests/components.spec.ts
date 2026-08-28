import type { TaroElement } from '@tarojs/runtime';
import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import taroRenderer, { createTaroFragment } from '../src/renderer/index.ts';
import MiniappFixture from './MiniappFixture.svelte';

function descendants(node: TaroElement): TaroElement[] {
	return node.childNodes.flatMap((child) => {
		if (!('childNodes' in child)) return [];
		const element = child as TaroElement;
		return [element, ...descendants(element)];
	});
}

describe('Miniapp foundational components', () => {
	it('renders all eight component families and updates state without wrappers', async () => {
		const target = createTaroFragment();
		const component = mount(MiniappFixture, { renderer: taroRenderer, target });
		const elements = descendants(target);
		const increment = elements.find((element) => element.id === 'increment');
		const theme = elements.find((element) => element.id === 'theme');
		const input = elements.find((element) => element.id === 'input');
		const image = elements.find((element) => element.id === 'image');
		const icon = elements.find((element) => element.id === 'icon');

		expect(increment?.nodeName).toBe('button');
		expect(input?.nodeName).toBe('input');
		expect(image?.nodeName).toBe('image');
		expect(image?.getAttribute('mode')).toBe('aspectFit');
		expect(icon?.getAttribute('aria-label')).toBe('Ready');
		expect(target.textContent).toContain('count:0');

		increment?.__handlers.tap[0].call(increment, { detail: {}, type: 'tap' });
		await tick();
		expect(target.textContent).toContain('count:1');
		const before = increment?.getAttribute('style');
		theme?.__handlers.tap[0].call(theme, { detail: {}, type: 'tap' });
		await tick();
		expect(increment?.getAttribute('style')).not.toBe(before);

		input?.__handlers.input[0].call(input, { detail: { value: 'alice' }, type: 'input' });
		await tick();
		expect(target.textContent).toContain('alice');

		await unmount(component);
		expect(target.childNodes).toHaveLength(0);
	});
});
