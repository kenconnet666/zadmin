import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import taroRenderer, { createTaroFragment } from '../src/renderer/index.ts';
import ReactiveFixture from './ReactiveFixture.svelte';

function text(node: { childNodes: unknown[]; nodeName: string; textContent: string }): string {
	if (node.nodeName === '#text') return node.textContent;
	return node.childNodes.map((child) => text(child as typeof node)).join('');
}

describe('compiled Svelte renderer integration', () => {
	it('updates runes, events, if blocks, keyed each blocks, and unmounts cleanly', async () => {
		const target = createTaroFragment();
		const component = mount(ReactiveFixture, { renderer: taroRenderer, target });
		const view = target.firstChild;
		if (view === null || !('childNodes' in view)) throw new Error('Fixture root was not mounted.');
		expect(text(view)).toContain('count:0');
		expect(text(view)).toContain('item:1item:2');

		const button = view.childNodes.find((node) => node.nodeName === 'button');
		if (button === undefined) throw new Error('Fixture button was not mounted.');
		button.__handlers.tap[0].call(button, { type: 'tap' });
		await tick();
		expect(text(view)).toContain('count:1');
		expect(text(view)).toContain('active');

		await unmount(component);
		expect(target.childNodes).toHaveLength(0);
	});
});
