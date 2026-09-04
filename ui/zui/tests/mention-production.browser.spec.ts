import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import MentionFixture from './MentionFixture.svelte';
import MentionProductionFixture from './MentionProductionFixture.svelte';

function input(textarea: HTMLTextAreaElement, value: string): void {
	textarea.value = value;
	textarea.setSelectionRange(value.length, value.length);
	textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

describe('ZMention production collection contract', () => {
	it('keeps async loading, typed keys and textarea-owned active descendant synchronized', async () => {
		render(MentionProductionFixture, { mode: 'async' });
		const editor = document.querySelector<HTMLTextAreaElement>(
			'textarea[aria-label="Async mention"]'
		)!;
		input(editor, '@ali');
		await tick();
		const listbox = document.querySelector<HTMLElement>('[role="listbox"]')!;
		expect(editor.getAttribute('aria-controls')).toBe(listbox.id);
		expect(listbox.getAttribute('aria-busy')).toBe('true');
		expect(listbox.textContent).toContain('Loading options');

		document.querySelector<HTMLButtonElement>('[data-testid="mention-resolve"]')?.click();
		await tick();
		const options = [...listbox.querySelectorAll<HTMLElement>('[role="option"]')];
		expect(options).toHaveLength(2);
		expect(options[0]?.id).not.toBe(options[1]?.id);
		editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		expect(editor.getAttribute('aria-activedescendant')).toBe(options[1]?.id);
		editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="mention-production-output"]')?.textContent).toBe(
			'@string :1'
		);
	});

	it('mounts a distant virtual option before exposing and committing it', async () => {
		// @zui-visual ZMention virtual list and floating geometry
		render(MentionProductionFixture, { mode: 'virtual' });
		const editor = document.querySelector<HTMLTextAreaElement>(
			'textarea[aria-label="Virtual mention"]'
		)!;
		input(editor, '@');
		await tick();
		const listbox = document.querySelector<HTMLElement>('[role="listbox"]')!;
		expect(listbox.getBoundingClientRect().height).toBe(260);
		expect(getComputedStyle(listbox).overflowY).toBe('auto');
		expect(getComputedStyle(listbox.parentElement!).position).toMatch(/absolute|fixed/);
		expect(listbox.querySelectorAll('[role="option"]').length).toBeLessThan(30);
		editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		await Promise.resolve();
		await tick();
		const activeId = editor.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(editor.ownerDocument.getElementById(activeId ?? '')?.textContent).toContain('user-0999');
		const stationaryRow = listbox.querySelector<HTMLElement>('[role="option"]');
		stationaryRow?.dispatchEvent(
			new PointerEvent('pointermove', { bubbles: true, clientX: 0, clientY: 0 })
		);
		await tick();
		expect(editor.getAttribute('aria-activedescendant')).toBe(activeId);
		editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="mention-production-output"]')?.textContent).toBe(
			'@user-0999 :0'
		);
	});

	it('delegates pointer selection to the listbox while the textarea keeps focus', async () => {
		render(MentionProductionFixture, { mode: 'async' });
		const editor = document.querySelector<HTMLTextAreaElement>(
			'textarea[aria-label="Async mention"]'
		)!;
		input(editor, '@ali');
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="mention-resolve"]')?.click();
		await tick();
		editor.focus();
		const option = document.querySelector<HTMLElement>('[role="option"]')!;
		option.dispatchEvent(
			new PointerEvent('pointermove', { bubbles: true, clientX: 1, movementX: 1 })
		);
		await tick();
		expect(document.querySelector<HTMLElement>('[role="option"]')).toBe(option);
		option.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
		option.click();
		await tick();
		expect(document.activeElement).toBe(editor);
		expect(document.querySelector('[data-testid="mention-production-output"]')?.textContent).toBe(
			'@numeric :1'
		);
	});

	it('lets the async owner discard stale responses before Mention can expose or commit them', async () => {
		render(MentionProductionFixture, { mode: 'generation' });
		const editor = document.querySelector<HTMLTextAreaElement>(
			'textarea[aria-label="Async mention"]'
		)!;
		input(editor, '@a');
		await tick();
		input(editor, '@al');
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="mention-resolve-old"]')?.click();
		await tick();
		expect(document.querySelector('[role="option"]')).toBeNull();
		document.querySelector<HTMLButtonElement>('[data-testid="mention-resolve-latest"]')?.click();
		await tick();
		const latest = document.querySelector<HTMLElement>('[role="option"]')!;
		expect(latest.textContent).toContain('Latest al');
		latest.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
		latest.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
		latest.click();
		await tick();
		expect(document.querySelector('[data-testid="mention-production-output"]')?.textContent).toBe(
			'@latest :2'
		);
	});

	it('defers query parsing during real composition and supports multiple triggers', async () => {
		render(MentionFixture);
		const editor = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Message"]')!;
		editor.focus();
		editor.value = 'Notify @al';
		editor.setSelectionRange(editor.value.length, editor.value.length);
		editor.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		editor.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
		await tick();
		expect(editor.dataset.state).toBe('closed');
		expect(editor.getAttribute('aria-controls')).toBeNull();
		editor.value = 'Notify #al';
		editor.setSelectionRange(editor.value.length, editor.value.length);
		editor.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
		await tick();
		expect(editor.dataset.state).toBe('open');
		expect(editor.getAttribute('aria-controls')).toBeTruthy();
		expect(document.querySelector('[role="listbox"]')?.textContent).toContain('Alice');
	});
});
