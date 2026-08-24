import { describe, expect, it, vi } from 'vitest';

import taroRenderer, { createTaroFragment } from '../src/renderer/index.ts';

describe('Taro renderer operations', () => {
	it('creates, inserts, reorders, updates, and removes Taro nodes', () => {
		const root = createTaroFragment();
		const view = taroRenderer.createElement('view');
		const text = taroRenderer.createTextNode('first');
		const comment = taroRenderer.createComment('anchor');
		taroRenderer.insert(root, view, null);
		taroRenderer.insert(view, comment, null);
		taroRenderer.insert(view, text, comment);

		expect(taroRenderer.nodeType(root)).toBe('fragment');
		expect(taroRenderer.nodeType(view)).toBe('element');
		expect(taroRenderer.getFirstChild(view)).toBe(text);
		expect(taroRenderer.getNextSibling(text)).toBe(comment);
		expect(taroRenderer.getParent(text)).toBe(view);
		taroRenderer.setText(text, 'updated');
		expect(taroRenderer.getNodeValue(text)).toBe('updated');
		taroRenderer.remove(text);
		expect(taroRenderer.getFirstChild(view)).toBe(comment);
	});

	it('manages attributes and maps click events to Mini Program tap events', () => {
		const button = taroRenderer.createElement('button');
		taroRenderer.setAttribute(button, 'data-id', 7);
		expect(taroRenderer.getAttribute(button, 'data-id')).toBe('7');
		expect(taroRenderer.hasAttribute(button, 'data-id')).toBe(true);
		taroRenderer.removeAttribute(button, 'data-id');
		expect(taroRenderer.hasAttribute(button, 'data-id')).toBe(false);

		const handler = vi.fn();
		taroRenderer.addEventListener(button, 'click', handler);
		expect(button.__handlers.tap).toHaveLength(1);
		button.__handlers.tap[0].call(button, { type: 'tap' });
		expect(handler).toHaveBeenCalledOnce();
		taroRenderer.removeEventListener(button, 'click', handler);
		expect(button.__handlers.tap).toHaveLength(0);
	});
});
