import type { TaroElement } from '@tarojs/runtime';
import taroRenderer, { createTaroFragment } from '@zadmin/svelte-taro/renderer';
import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import ComponentFixture from './ComponentFixture.svelte';

function descendants(node: TaroElement): TaroElement[] {
	return node.childNodes.flatMap((child) => {
		if (!('childNodes' in child)) return [];
		const element = child as TaroElement;
		return [element, ...descendants(element)];
	});
}

describe('ZUI Taro components', () => {
	it('renders native elements, updates state/theme, and preserves open-type flows', async () => {
		const target = createTaroFragment();
		const component = mount(ComponentFixture, { renderer: taroRenderer, target });
		const elements = descendants(target);
		const increment = elements.find((element) => element.id === 'increment');
		const theme = elements.find((element) => element.id === 'theme');
		const privacy = elements.find((element) => element.id === 'privacy');
		const phone = elements.find((element) => element.id === 'phone');
		expect(increment?.nodeName).toBe('button');
		expect(privacy?.getAttribute('open-type')).toBe('agreePrivacyAuthorization');
		expect(phone?.getAttribute('open-type')).toBe('getPhoneNumber');
		expect(target.textContent).toContain('count:0');

		increment?.__handlers.tap[0].call(increment, { type: 'tap' });
		await tick();
		expect(target.textContent).toContain('count:1');
		const before = increment?.getAttribute('style');
		theme?.__handlers.tap[0].call(theme, { type: 'tap' });
		await tick();
		expect(increment?.getAttribute('style')).not.toBe(before);

		await unmount(component);
		expect(target.childNodes).toHaveLength(0);
	});
});
