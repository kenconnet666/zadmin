import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import miniappRenderer, { createMiniappFragment } from '../src/renderer/index.ts';
import type { WeChatSnapshot } from '../src/targets/wechat/elements.ts';
import MiniappFixture from './MiniappFixture.svelte';

function snapshotId(node: WeChatSnapshot, id: string): string | undefined {
	if (node.kind === 'text') return undefined;
	if (node.kind === 'element' && node.attributes.id === id) return node.id;
	for (const child of node.children) {
		const found = snapshotId(child, id);
		if (found !== undefined) return found;
	}
	return undefined;
}

describe('Miniapp foundational components', () => {
	it('renders all eight component families and updates state without wrappers', async () => {
		const target = createMiniappFragment();
		const component = mount(MiniappFixture, { renderer: miniappRenderer, target });
		const snapshot = target.snapshot();
		expect(snapshot.kind).toBe('fragment');
		if (snapshot.kind === 'text') throw new Error('Expected a fragment snapshot.');
		expect(snapshot.children).not.toHaveLength(0);
		expect(target.textContent).toContain('count:0');

		const increment = snapshotId(target.snapshot(), 'increment');
		if (increment === undefined) throw new Error('Missing increment button.');
		target.dispatch(increment, 'tap', { detail: {}, type: 'tap' });
		await tick();
		expect(target.textContent).toContain('count:1');

		await unmount(component);
		expect(target.childNodes).toHaveLength(0);
	});
});
