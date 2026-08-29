import { mount, tick, unmount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import miniappRenderer, { createMiniappFragment } from '../src/renderer/index.ts';
import type { WeChatSnapshot } from '../src/targets/wechat/elements.ts';
import ConformanceFixture from './ConformanceFixture.svelte';
import ReactiveFixture from './ReactiveFixture.svelte';

function snapshotId(node: WeChatSnapshot, id: string): string | undefined {
	if (node.kind === 'text') return undefined;
	if (node.kind === 'element' && node.attributes.id === id) return node.id;
	for (const child of node.children) {
		const found = snapshotId(child, id);
		if (found !== undefined) return found;
	}
	return undefined;
}

function tap(root: ReturnType<typeof createMiniappFragment>, id: string): void {
	const runtimeId = snapshotId(root.snapshot(), id);
	if (runtimeId === undefined) throw new Error(`Missing fixture element #${id}.`);
	root.dispatch(runtimeId, 'tap', { detail: {}, type: 'tap' });
}

describe('Svelte custom-renderer conformance', () => {
	it('supports runes, lifecycle, binding, snippets, context, key, await, and boundaries', async () => {
		const target = createMiniappFragment();
		const onCleanup = vi.fn();
		const onEffect = vi.fn();
		const onLifecycle = vi.fn();
		const component = mount(ConformanceFixture, {
			props: { onCleanup, onEffect, onLifecycle },
			renderer: miniappRenderer,
			target
		});
		await tick();
		await Promise.resolve();
		await tick();
		expect(target.textContent).toContain('derived:2');
		expect(target.textContent).toContain('context:2:bound:2');
		expect(target.textContent).toContain('snippet:1');
		expect(target.textContent).toContain('key:1');
		expect(target.textContent).toContain('item:1item:2');
		expect(target.textContent).toContain('await:ready');
		expect(target.textContent).toContain('boundary-safe');
		expect(onLifecycle).toHaveBeenCalledWith('mount');
		expect(onEffect).toHaveBeenCalledWith(1);

		tap(target, 'bound');
		tap(target, 'increment');
		await tick();
		expect(target.textContent).toContain('context:4:bound:3');
		expect(target.textContent).toContain('key:2');
		expect(onCleanup).toHaveBeenCalledWith(1);
		expect(onEffect).toHaveBeenCalledWith(2);

		tap(target, 'failure');
		await tick();
		expect(target.textContent).toContain('boundary:fixture-boundary');

		await unmount(component);
		expect(onLifecycle).toHaveBeenCalledWith('mount-cleanup');
		expect(onLifecycle).toHaveBeenCalledWith('destroy');
		expect(onCleanup).toHaveBeenCalledWith(2);
		expect(target.childNodes).toHaveLength(0);
	});

	it('returns the Miniapp node tree to baseline after 100 mount/unmount cycles', async () => {
		const target = createMiniappFragment();
		for (let index = 0; index < 100; index += 1) {
			const component = mount(ReactiveFixture, { renderer: miniappRenderer, target });
			await unmount(component);
			expect(target.childNodes).toHaveLength(0);
		}
	});
});
