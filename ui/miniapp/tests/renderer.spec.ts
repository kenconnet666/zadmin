import { describe, expect, it, vi } from 'vitest';

import miniappRenderer, { createMiniappFragment } from '../src/renderer/index.ts';

describe('Miniapp renderer operations', () => {
	it('creates, inserts, reorders, updates, and removes Miniapp nodes', () => {
		const root = createMiniappFragment();
		const view = miniappRenderer.createElement('view');
		const text = miniappRenderer.createTextNode('first');
		const comment = miniappRenderer.createComment('anchor');
		miniappRenderer.insert(root, view, null);
		miniappRenderer.insert(view, comment, null);
		miniappRenderer.insert(view, text, comment);

		expect(miniappRenderer.nodeType(root)).toBe('fragment');
		expect(miniappRenderer.nodeType(view)).toBe('element');
		expect(miniappRenderer.getFirstChild(view)).toBe(text);
		expect(miniappRenderer.getNextSibling(text)).toBe(comment);
		expect(miniappRenderer.getParent(text)).toBe(view);
		miniappRenderer.setText(text, 'updated');
		expect(miniappRenderer.getNodeValue(text)).toBe('updated');
		miniappRenderer.remove(text);
		expect(miniappRenderer.getFirstChild(view)).toBe(comment);
	});

	it('manages attributes and maps click events to Mini Program tap events', () => {
		const button = miniappRenderer.createElement('button');
		miniappRenderer.setAttribute(button, 'data-id', 7);
		expect(miniappRenderer.getAttribute(button, 'data-id')).toBe('7');
		expect(miniappRenderer.hasAttribute(button, 'data-id')).toBe(true);
		miniappRenderer.removeAttribute(button, 'data-id');
		expect(miniappRenderer.hasAttribute(button, 'data-id')).toBe(false);

		const handler = vi.fn();
		miniappRenderer.addEventListener(button, 'click', handler);
		expect(button.handlers.get('tap')).toHaveLength(1);
		button.dispatch('tap', { detail: {}, type: 'tap' });
		expect(handler).toHaveBeenCalledOnce();
		miniappRenderer.removeEventListener(button, 'click', handler);
		expect(button.handlers.get('tap')).toHaveLength(0);
	});
});
