import { describe, expect, it, vi } from 'vitest';
import { PresenceEntryMotion } from '../src/runtime/foundation/presence-entry-motion.svelte.js';

function realm() {
	let nextId = 0;
	const frames = new Map<number, FrameRequestCallback>();
	const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
		const id = ++nextId;
		frames.set(id, callback);
		return id;
	});
	const cancelAnimationFrame = vi.fn((id: number) => frames.delete(id));
	const view = { requestAnimationFrame, cancelAnimationFrame } as unknown as Window;
	return {
		cancelAnimationFrame,
		element: { ownerDocument: { defaultView: view } } as HTMLElement,
		flush() {
			const current = [...frames.values()];
			frames.clear();
			for (const callback of current) callback(0);
		},
		frames,
		requestAnimationFrame
	};
}

describe('PresenceEntryMotion frame ownership', () => {
	it('uses the element realm and preserves the pending closed frame across repeated updates', () => {
		const owner = realm();
		const entry = new PresenceEntryMotion(false);
		entry.update(true, false, null);
		expect(owner.requestAnimationFrame).not.toHaveBeenCalled();
		entry.update(true, false, owner.element);
		entry.update(true, false, owner.element);
		expect(owner.requestAnimationFrame).toHaveBeenCalledOnce();
		owner.flush();
		expect(entry.entered).toBe(false);
		owner.flush();
		expect(entry.entered).toBe(true);
		entry.destroy();
	});

	it('cancels entry on close and ignores a callback already dequeued by the owner window', () => {
		const owner = realm();
		const entry = new PresenceEntryMotion(false);
		entry.update(true, false, owner.element);
		const late = [...owner.frames.values()][0]!;
		entry.update(false, false, owner.element);
		late(0);
		expect(entry.entered).toBe(false);
		expect(owner.frames.size).toBe(0);
		expect(owner.cancelAnimationFrame).toHaveBeenCalledOnce();
		entry.destroy();
	});

	it('reverses retained exits immediately and cancels frames when motion is reduced', () => {
		const owner = realm();
		const entry = new PresenceEntryMotion(false);
		entry.update(true, false, owner.element);
		entry.update(false, false, owner.element);
		entry.update(true, false, owner.element);
		expect(entry.entered).toBe(true);
		expect(owner.frames.size).toBe(0);
		entry.update(false, false, null);
		entry.update(true, false, owner.element);
		entry.update(true, true, owner.element);
		expect(entry.entered).toBe(true);
		expect(owner.frames.size).toBe(0);
		entry.destroy();
	});

	it('preserves initially open SSR state and cancels the old realm when the element changes', () => {
		const initial = new PresenceEntryMotion(true);
		initial.update(true, false, null);
		expect(initial.entered).toBe(true);
		initial.destroy();
		const first = realm();
		const second = realm();
		const entry = new PresenceEntryMotion(false);
		entry.update(true, false, first.element);
		entry.update(true, false, second.element);
		expect(first.frames.size).toBe(0);
		expect(second.frames.size).toBe(1);
		entry.destroy();
		expect(second.frames.size).toBe(0);
	});
});
