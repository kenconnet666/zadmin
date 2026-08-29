import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import miniappRenderer, { createMiniappFragment } from '../src/renderer/index.ts';
import type { WeChatSnapshot } from '../src/targets/wechat/elements.ts';
import ReactiveFixture from './ReactiveFixture.svelte';

function elementId(node: WeChatSnapshot, name: string): string | undefined {
	if (node.kind === 'text') return undefined;
	if (node.kind === 'element' && node.name === name) return node.id;
	for (const child of node.children) {
		const found = elementId(child, name);
		if (found !== undefined) return found;
	}
	return undefined;
}

describe('compiled Svelte renderer integration', () => {
	it('updates runes, events, if blocks, keyed each blocks, and unmounts cleanly', async () => {
		const target = createMiniappFragment();
		const component = mount(ReactiveFixture, { renderer: miniappRenderer, target });
		expect(target.textContent).toContain('count:0');
		expect(target.textContent).toContain('item:1item:2');

		const button = elementId(target.snapshot(), 'button');
		if (button === undefined) throw new Error('Fixture button was not mounted.');
		target.dispatch(button, 'tap', { detail: {}, type: 'tap' });
		await tick();
		expect(target.textContent).toContain('count:1');
		expect(target.textContent).toContain('active');

		await unmount(component);
		expect(target.childNodes).toHaveLength(0);
	});
});
