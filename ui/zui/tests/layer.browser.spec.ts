import { describe, expect, it, vi } from 'vitest';

import { DismissableLayer } from '../src/runtime/layer/dismissable-layer.js';
import { FloatingPositioner } from '../src/runtime/layer/floating.js';
import { FocusScope } from '../src/runtime/layer/focus-scope.js';
import { inertOthers } from '../src/runtime/layer/inert-others.js';
import { LayerStack } from '../src/runtime/layer/layer-stack.svelte.js';
import { portal } from '../src/runtime/layer/portal.js';
import { lockScroll } from '../src/runtime/layer/scroll-lock.js';
import { listenForFormReset, listenToFormReset } from '../src/runtime/form/form-control.svelte.js';

const settleReset = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('ZUI layer runtime', () => {
	it('flushes uncancelled form resets after native default behavior and cancels cleanup', async () => {
		const form = document.createElement('form');
		const reset = vi.fn();
		const prevent = (event: Event) => event.preventDefault();
		form.addEventListener('reset', prevent);
		const stop = listenToFormReset(form, reset);
		form.dispatchEvent(new Event('reset', { cancelable: true }));
		await settleReset();
		expect(reset).not.toHaveBeenCalled();

		form.removeEventListener('reset', prevent);
		form.dispatchEvent(new Event('reset', { cancelable: true }));
		await settleReset();
		expect(reset).toHaveBeenCalledOnce();
		stop();
		form.dispatchEvent(new Event('reset', { cancelable: true }));
		await settleReset();
		expect(reset).toHaveBeenCalledOnce();
	});

	it('observes controls whose external form association appears after setup', async () => {
		const input = document.createElement('input');
		input.setAttribute('form', 'late-form');
		Object.defineProperty(input, 'form', { configurable: true, get: () => null });
		document.body.append(input);
		const reset = vi.fn();
		const stop = listenForFormReset(input, reset);
		const unrelated = document.createElement('form');
		document.body.append(unrelated);
		unrelated.reset();
		await settleReset();
		expect(reset).not.toHaveBeenCalled();

		const form = document.createElement('form');
		form.id = 'late-form';
		document.body.append(form);
		form.reset();
		await settleReset();
		expect(reset).toHaveBeenCalledOnce();

		stop();
		input.remove();
		form.remove();
		unrelated.remove();
	});

	it('coalesces repeated reset events and cancels pending work on cleanup', async () => {
		const form = document.createElement('form');
		document.body.append(form);
		const reset = vi.fn();
		const stop = listenToFormReset(form, reset);
		form.dispatchEvent(new Event('reset'));
		form.dispatchEvent(new Event('reset'));
		await settleReset();
		expect(reset).toHaveBeenCalledOnce();

		form.dispatchEvent(new Event('reset'));
		stop();
		await settleReset();
		expect(reset).toHaveBeenCalledOnce();
		form.remove();
	});

	it('falls back to DOM containment when an engine does not expose control.form', async () => {
		const form = document.createElement('form');
		const input = document.createElement('input');
		Object.defineProperty(input, 'form', { configurable: true, get: () => null });
		form.append(input);
		document.body.append(form);
		const reset = vi.fn();
		const stop = listenForFormReset(input, reset);

		form.reset();
		await settleReset();
		expect(reset).toHaveBeenCalledOnce();

		stop();
		form.remove();
	});
	it('moves portal content between inline, Element and ShadowRoot targets reversibly', () => {
		const host = document.createElement('div');
		const target = document.createElement('div');
		const shadowHost = document.createElement('div');
		const shadow = shadowHost.attachShadow({ mode: 'open' });
		const node = document.createElement('section');
		host.append(node);
		document.body.append(host, target, shadowHost);
		const action = portal(node, { target });
		expect(node.parentNode).toBe(target);
		action.update({ target: shadow });
		expect(node.parentNode).toBe(shadow);
		action.update({ target: document });
		expect(node.parentNode).toBe(document.body);
		action.update({ target: null });
		expect(node.parentNode).toBe(host);
		action.destroy();
		expect(node.isConnected).toBe(false);
		expect(host.childNodes).toHaveLength(0);
		host.remove();
		target.remove();
		shadowHost.remove();
	});

	it('keeps null-target portals in place and tolerates detached owners', () => {
		const host = document.createElement('div');
		const inline = document.createElement('section');
		host.append(inline);
		const inlineAction = portal(inline, { target: null });
		expect(inline.parentNode).toBe(host);
		inlineAction.destroy();

		const detached = document.createElement('section');
		const detachedAction = portal(detached, { target: undefined });
		expect(detached.isConnected).toBe(false);
		detachedAction.destroy();
	});

	it('removes portal content whether its owner or the action tears down first', () => {
		const host = document.createElement('div');
		const target = document.createElement('div');
		const node = document.createElement('section');
		host.append(node);
		document.body.append(host, target);
		const action = portal(node, { target });
		expect(node.parentNode).toBe(target);

		node.remove();
		action.destroy();
		expect(node.isConnected).toBe(false);
		expect(host.childNodes).toHaveLength(0);

		host.remove();
		target.remove();
	});

	it('owns nested layer order, modal pointer blocking and branch containment', () => {
		const stack = new LayerStack();
		const root = document.createElement('div');
		const rootChild = document.createElement('span');
		const branch = document.createElement('div');
		const branchChild = document.createElement('span');
		root.append(rootChild);
		branch.append(branchChild);
		const first = stack.register({ element: () => root, id: 'first' });
		const removeBranch = first.registerBranch(branch);
		expect(stack.contains('first', rootChild)).toBe(true);
		expect(stack.contains('first', branchChild)).toBe(true);
		expect(stack.isTopmost('first')).toBe(true);
		const second = stack.register({ element: () => branch, id: 'second', modal: () => true });
		expect(stack.topmostId).toBe('second');
		expect(stack.isPointerBlocked('first')).toBe(true);
		expect(stack.isPointerBlocked('missing')).toBe(true);
		expect(stack.contains('missing', root)).toBe(false);
		expect(() => stack.registerBranch('missing', branch)).toThrow(/Unknown layer/u);
		expect(() => stack.register({ element: () => root, id: 'first' })).toThrow(/Duplicate/u);
		second.destroy();
		expect(stack.isPointerBlocked('first')).toBe(false);
		removeBranch();
		first.destroy();
		first.destroy();
		expect(stack.layers).toEqual([]);
	});

	it('keeps only the top nested FocusScope active and tolerates repeated cleanup', async () => {
		const outside = document.createElement('button');
		const outer = document.createElement('div');
		const outerButton = document.createElement('button');
		const inner = document.createElement('div');
		const innerButton = document.createElement('button');
		inner.append(innerButton);
		outer.append(outerButton, inner);
		document.body.append(outside, outer);
		outside.focus();
		const outerScope = new FocusScope(outer, { trap: true });
		await Promise.resolve();
		const innerScope = new FocusScope(inner, { initialFocus: () => innerButton, trap: true });
		await Promise.resolve();
		expect(document.activeElement).toBe(innerButton);
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		outerButton.focus();
		expect(document.activeElement).toBe(innerButton);
		innerScope.destroy();
		innerScope.destroy();
		expect(document.activeElement).toBe(outerButton);
		outerScope.destroy();
		outerScope.destroy();
		expect(document.activeElement).toBe(outside);
		outside.remove();
		outer.remove();
	});

	it('dismisses only the top layer for outside pointer, focus and Escape', () => {
		const root = document.createElement('div');
		const branch = document.createElement('button');
		const outside = document.createElement('button');
		document.body.append(root, branch, outside);
		const dismiss = vi.fn();
		const stack = new LayerStack();
		const layer = new DismissableLayer(root, { onDismiss: dismiss, stack });
		const removeBranch = layer.registerBranch(branch);
		branch.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(dismiss).not.toHaveBeenCalled();
		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(dismiss).toHaveBeenLastCalledWith('pointer-outside');
		outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		expect(dismiss).toHaveBeenLastCalledWith('focus-outside');
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		expect(dismiss).toHaveBeenLastCalledWith('escape');
		removeBranch();
		layer.destroy();
		root.remove();
		branch.remove();
		outside.remove();
	});

	it('honors prevented layer callbacks and ignores non-Escape keys', () => {
		const root = document.createElement('div');
		const outside = document.createElement('button');
		document.body.append(root, outside);
		const dismiss = vi.fn();
		const pointer = vi.fn((event) => event.preventDefault());
		const focus = vi.fn((event) => event.preventDefault());
		const escape = vi.fn((event) => event.preventDefault());
		const layer = new DismissableLayer(root, {
			onDismiss: dismiss,
			onEscape: escape,
			onFocusOutside: focus,
			onPointerOutside: pointer
		});

		outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		expect(pointer).toHaveBeenCalledOnce();
		expect(focus).toHaveBeenCalledOnce();
		expect(escape).toHaveBeenCalledOnce();
		expect(dismiss).not.toHaveBeenCalled();

		layer.destroy();
		root.remove();
		outside.remove();
	});

	it('traps, wraps and restores focus while nested scopes own the top position', async () => {
		const outside = document.createElement('button');
		const container = document.createElement('div');
		container.tabIndex = -1;
		const first = document.createElement('button');
		const second = document.createElement('button');
		container.append(first, second);
		document.body.append(outside, container);
		outside.focus();
		const scope = new FocusScope(container, { restoreFocus: true, trap: true });
		await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
		expect(document.activeElement).toBe(first);
		second.focus();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
		expect(document.activeElement).toBe(first);
		document.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', shiftKey: true })
		);
		expect(document.activeElement).toBe(second);
		outside.focus();
		expect(document.activeElement).toBe(first);
		scope.destroy();
		expect(document.activeElement).toBe(outside);
		outside.remove();
		container.remove();

		const empty = document.createElement('div');
		empty.tabIndex = -1;
		document.body.append(empty);
		const noRestore = new FocusScope(empty, {
			initialFocus: () => empty,
			restoreFocus: false,
			trap: true
		});
		await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
		expect(document.activeElement).toBe(empty);
		noRestore.destroy();
		empty.remove();
	});

	it('allows focus to leave a non-trapping scope and skips restoration when requested', async () => {
		const outside = document.createElement('button');
		const container = document.createElement('div');
		const inside = document.createElement('button');
		container.append(inside);
		document.body.append(outside, container);
		outside.focus();
		const scope = new FocusScope(container, { restoreFocus: false, trap: false });
		await Promise.resolve();
		expect(document.activeElement).toBe(inside);
		outside.focus();
		const tab = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Tab' });
		document.dispatchEvent(tab);
		expect(document.activeElement).toBe(outside);
		expect(tab.defaultPrevented).toBe(false);
		scope.destroy();
		expect(document.activeElement).toBe(outside);
		outside.remove();
		container.remove();
	});

	it('handles pre-flush cleanup and every non-wrapping Tab direction', async () => {
		const container = document.createElement('div');
		container.tabIndex = -1;
		const first = document.createElement('button');
		const second = document.createElement('button');
		container.append(first, second);
		document.body.append(container);

		const disposed = new FocusScope(container, { trap: true });
		disposed.destroy();
		const outer = new FocusScope(container, { trap: true });
		const inner = new FocusScope(container, { trap: true });
		await Promise.resolve();
		expect(document.activeElement).toBe(first);

		first.focus();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
		expect(document.activeElement).toBe(second);
		document.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', shiftKey: true })
		);
		expect(document.activeElement).toBe(first);
		container.focus();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
		expect(document.activeElement).toBe(first);

		inner.destroy();
		outer.destroy();
		container.remove();
	});

	it('locks scroll and restores inert siblings with nested cleanup', () => {
		const originalOverflow = document.body.style.overflow;
		const releaseFirst = lockScroll(document);
		const releaseSecond = lockScroll(document);
		expect(document.body.style.overflow).toBe('hidden');
		releaseFirst();
		expect(document.body.style.overflow).toBe('hidden');
		releaseSecond();
		expect(document.body.style.overflow).toBe(originalOverflow);

		const scrolling = document.createElement('div');
		scrolling.style.paddingInlineEnd = '4px';
		Object.defineProperty(scrolling, 'offsetWidth', { configurable: true, value: 120 });
		Object.defineProperty(scrolling, 'clientWidth', { configurable: true, value: 100 });
		document.body.append(scrolling);
		const releaseElement = lockScroll(scrolling);
		expect(scrolling.style.paddingInlineEnd).toBe('24px');
		releaseElement();
		releaseElement();
		expect(scrolling.style.paddingInlineEnd).toBe('4px');
		scrolling.remove();

		const root = document.createElement('div');
		const sibling = document.createElement('main');
		sibling.inert = true;
		sibling.setAttribute('aria-hidden', 'legacy');
		const branch = document.createElement('aside');
		document.body.append(root, sibling, branch);
		const restore = inertOthers(root, [branch]);
		expect(sibling.inert).toBe(true);
		expect(sibling.getAttribute('aria-hidden')).toBe('true');
		restore();
		restore();
		expect(sibling.inert).toBe(true);
		expect(sibling.getAttribute('aria-hidden')).toBe('legacy');
		expect(branch.inert).toBe(false);
		root.remove();
		sibling.remove();
		branch.remove();

		const shadowHost = document.createElement('div');
		const shadow = shadowHost.attachShadow({ mode: 'open' });
		const shadowRoot = document.createElement('div');
		const shadowSibling = document.createElement('main');
		shadow.append(shadowRoot, shadowSibling);
		document.body.append(shadowHost);
		const restoreShadow = inertOthers(shadowRoot);
		expect(shadowSibling.inert).toBe(true);
		restoreShadow();
		expect(shadowSibling.inert).toBe(false);
		shadowHost.remove();

		const zeroWidth = document.createElement('div');
		Object.defineProperty(zeroWidth, 'offsetWidth', { configurable: true, value: 100 });
		Object.defineProperty(zeroWidth, 'clientWidth', { configurable: true, value: 100 });
		document.body.append(zeroWidth);
		const releaseZeroWidth = lockScroll(zeroWidth);
		expect(zeroWidth.style.paddingInlineEnd).toBe('');
		releaseZeroWidth();
		zeroWidth.remove();

		const zeroPadding = document.createElement('div');
		Object.defineProperty(zeroPadding, 'offsetWidth', { configurable: true, value: 120 });
		Object.defineProperty(zeroPadding, 'clientWidth', { configurable: true, value: 100 });
		document.body.append(zeroPadding);
		const releaseZeroPadding = lockScroll(zeroPadding);
		expect(zeroPadding.style.paddingInlineEnd).toBe('20px');
		releaseZeroPadding();
		zeroPadding.remove();

		const detached = document.createElement('div');
		const bodySibling = document.createElement('main');
		document.body.append(bodySibling);
		const restoreDetached = inertOthers(detached);
		expect(bodySibling.inert).toBe(true);
		restoreDetached();
		expect(bodySibling.inert).toBe(false);
		bodySibling.remove();
	});

	it('positions floating content and releases autoUpdate resources', async () => {
		const reference = document.createElement('button');
		const floating = document.createElement('div');
		const arrow = document.createElement('span');
		floating.append(arrow);
		document.body.append(reference, floating);
		const positioned = vi.fn();
		const positioner = new FloatingPositioner();
		positioner.start(reference, floating, {
			arrow,
			matchWidth: true,
			onPosition: positioned,
			placement: 'bottom-start'
		});
		await positioner.update();
		expect(floating.style.position).toBe('absolute');
		expect(floating.style.left).toMatch(/px$/u);
		expect(floating.style.getPropertyValue('--zui-floating-available-height')).toMatch(/px$/u);
		expect(positioned).toHaveBeenCalled();
		positioner.stop();
		positioner.stop();
		await positioner.update();
		const stopFixed = positioner.start(reference, floating, { strategy: 'fixed' });
		await positioner.update();
		expect(floating.style.position).toBe('fixed');
		stopFixed();
		stopFixed();
		reference.remove();
		floating.remove();
	});
});
