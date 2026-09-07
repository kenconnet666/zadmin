import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { focusCollectionForPointer } from '../src/runtime/collection/active-descendant.svelte.js';
import { MountedElements } from '../src/runtime/collection/mounted-elements.svelte.js';
import { containsComposedNode, getActiveElement } from '../src/runtime/layer/dom-realm.js';
import { FocusScope } from '../src/runtime/layer/focus-scope.js';

describe('focus ownership across DOM roots', () => {
	it('keeps a ShadowRoot editor focused when its aria-controls tokens own the collection', () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		const editor = document.createElement('input');
		const collection = document.createElement('div');
		collection.id = 'shadow-results';
		collection.tabIndex = -1;
		editor.setAttribute('aria-controls', `other-results  ${collection.id}`);
		shadow.append(editor, collection);
		document.body.append(host);
		try {
			editor.focus();
			focusCollectionForPointer(collection);
			expect(getActiveElement(collection)).toBe(editor);

			editor.setAttribute('aria-controls', 'other-results');
			focusCollectionForPointer(collection);
			expect(getActiveElement(collection)).toBe(collection);
		} finally {
			host.remove();
		}
	});

	it.each(['open', 'closed'] as const)(
		'tracks real focus and removal in a known %s shadow root',
		async (mode) => {
			const host = document.createElement('div');
			const shadow = host.attachShadow({ mode });
			const first = document.createElement('button');
			const second = document.createElement('button');
			const outside = document.createElement('button');
			first.textContent = 'First';
			second.textContent = 'Second';
			shadow.append(first, second);
			document.body.append(host, outside);
			const mounted = new MountedElements<string>();
			const removeFirst = mounted.mount('first', first, 'first');
			mounted.mount('second', second, 'second');
			try {
				expect(mounted.focus('first')).toBe(true);
				expect(document.activeElement).toBe(host);
				expect(getActiveElement(first)).toBe(first);
				expect(containsComposedNode(host, first)).toBe(true);
				expect(mounted.ownsFocus('first')).toBe(true);
				mounted.scheduleFocus('second');
				await Promise.resolve();
				expect(getActiveElement(second)).toBe(second);
				expect(mounted.ownsFocus('second')).toBe(true);
				mounted.scheduleFocus('first');
				outside.focus();
				await Promise.resolve();
				expect(getActiveElement(second)).toBe(outside);
				expect(mounted.ownsFocus('second')).toBe(false);
				mounted.focus('first');
				first.remove();
				removeFirst();
				expect(mounted.ownsFocus('first')).toBe(true);
				expect(mounted.focus('second')).toBe(true);
			} finally {
				mounted.clear();
				host.remove();
				outside.remove();
			}
		}
	);

	it('keeps a modal scope on its second shadow descendant and restores the original shadow trigger', async () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		const trigger = document.createElement('button');
		const container = document.createElement('div');
		const nestedHost = document.createElement('div');
		const nested = nestedHost.attachShadow({ mode: 'open' });
		const first = document.createElement('button');
		const second = document.createElement('button');
		const outside = document.createElement('button');
		trigger.textContent = 'Open';
		first.textContent = 'First action';
		second.textContent = 'Second action';
		nested.append(first, second);
		container.append(nestedHost);
		shadow.append(trigger, container);
		document.body.append(host, outside);
		trigger.focus();
		const scope = new FocusScope(container, { trap: true });
		try {
			await Promise.resolve();
			expect(getActiveElement(container)).toBe(first);
			await userEvent.keyboard('{Tab}');
			expect(getActiveElement(container)).toBe(second);
			await userEvent.keyboard('{Tab}');
			expect(getActiveElement(container)).toBe(first);
			outside.focus();
			expect(getActiveElement(container)).toBe(first);
			scope.destroy();
			expect(getActiveElement(trigger)).toBe(trigger);
		} finally {
			scope.destroy();
			host.remove();
			outside.remove();
		}
	});

	it('resolves the owner document inside an iframe without crossing its focus boundary', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const button = ownerDocument.createElement('button');
		button.textContent = 'Frame action';
		ownerDocument.body.append(button);
		const mounted = new MountedElements<string>();
		mounted.mount('frame', button, 'frame');
		try {
			expect(mounted.focus('frame')).toBe(true);
			expect(getActiveElement(button)).toBe(button);
			expect(document.activeElement).toBe(frame);
			expect(mounted.ownsFocus('frame')).toBe(true);
		} finally {
			mounted.clear();
			frame.remove();
		}
	});
});
