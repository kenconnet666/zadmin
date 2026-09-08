import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import ToolbarToggleGroupFixture from './ToolbarToggleGroupFixture.svelte';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function toolbar(): HTMLElement {
	return document.querySelector<HTMLElement>('[aria-label="Formatting toolbar"]')!;
}

function group(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function buttons(root: HTMLElement): HTMLButtonElement[] {
	return [...root.querySelectorAll<HTMLButtonElement>(':scope > button')];
}

function output(testId: string): string | null | undefined {
	return document.querySelector<HTMLOutputElement>(`[data-testid="${testId}"]`)?.textContent;
}

describe('ZToolbar and ZToggleGroup composition contract', () => {
	it('keeps one outer Tab stop, unique identities for repeated typed keys and explicit size priority', async () => {
		await render(ToolbarToggleGroupFixture);
		await tick();
		const root = toolbar();
		const before = document.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-toggle-before"]'
		)!;
		const after = document.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-toggle-after"]'
		)!;
		const editable = group('toolbar-toggle-editable');
		const editableButtons = buttons(editable);
		const readonly = group('toolbar-toggle-readonly');
		const readonlyButtons = buttons(readonly);

		expect(root.getAttribute('role')).toBe('toolbar');
		expect(root.dataset.size).toBe('large');
		expect(root.querySelectorAll('button')).toHaveLength(7);
		expect([...root.querySelectorAll<HTMLElement>('[tabindex="0"]')]).toEqual([before]);
		expect(new Set([...root.querySelectorAll('button')]).size).toBe(7);

		expect(before.dataset.size).toBe('large');
		expect(editable.parentElement).toBe(root);
		expect(readonly.parentElement).toBe(root);
		expect(editable.dataset.size).toBe('large');
		expect(editableButtons.map((button) => button.dataset.size)).toEqual(['large', 'large']);
		expect(editableButtons.map((button) => button.tabIndex)).toEqual([-1, -1]);
		expect(readonly.dataset.size).toBe('small');
		expect(readonlyButtons.map((button) => button.dataset.size)).toEqual(['small', 'small']);
		expect(readonlyButtons.map((button) => button.tabIndex)).toEqual([-1, -1]);
		expect(after.dataset.size).toBe('xsmall');
		expect(editableButtons[0]).not.toBe(readonlyButtons[0]);
		expect(editableButtons[1]).not.toBe(readonlyButtons[1]);
		expect(output('toolbar-toggle-editable-output')).toBe('number:1:0');
		expect(output('toolbar-toggle-readonly-output')).toBe('number:1:0');
	});

	it('moves across both groups without selecting, limits Space writes and honors Toolbar Home and End', async () => {
		await render(ToolbarToggleGroupFixture);
		await tick();
		const root = toolbar();
		const before = document.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-toggle-before"]'
		)!;
		const after = document.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-toggle-after"]'
		)!;
		const editableButtons = buttons(group('toolbar-toggle-editable'));
		const readonlyButtons = buttons(group('toolbar-toggle-readonly'));

		await userEvent.click(before);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(editableButtons[0]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(editableButtons[1]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(readonlyButtons[0]);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(readonlyButtons[1]);
		expect(output('toolbar-toggle-editable-output')).toBe('number:1:0');
		expect(output('toolbar-toggle-readonly-output')).toBe('number:1:0');

		await userEvent.keyboard(' ');
		await tick();
		expect(output('toolbar-toggle-readonly-output')).toBe('number:1:0');
		expect(output('toolbar-toggle-editable-output')).toBe('number:1:0');

		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(before);
		await userEvent.keyboard('{ArrowRight}');
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(editableButtons[1]);
		await userEvent.keyboard(' ');
		await expect.poll(() => output('toolbar-toggle-editable-output')).toBe('number:1,string:1:1');
		expect(output('toolbar-toggle-readonly-output')).toBe('number:1:0');

		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(after);
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(before);
		expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
	});

	it('retains a focused item when layout invalidates without changing its Toolbar owner', async () => {
		await render(ToolbarToggleGroupFixture);
		const item = buttons(group('toolbar-toggle-editable'))[0]!;
		await userEvent.click(item);
		const value = output('toolbar-toggle-editable-output');
		toolbar().style.paddingInlineStart = '3px';
		window.dispatchEvent(new Event('resize'));
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
		expect(document.activeElement).toBe(item);
		expect(output('toolbar-toggle-editable-output')).toBe(value);
		expect(toolbar().querySelectorAll('[tabindex="0"]')).toHaveLength(1);
	});

	it('keeps a portalled ToggleGroup on independent roving focus and restores the Toolbar trigger', async () => {
		await render(ToolbarToggleGroupFixture);
		await tick();
		const root = toolbar();
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-toggle-popover-trigger"]'
		)!;
		const after = document.querySelector<HTMLButtonElement>(
			'[data-testid="toolbar-toggle-after"]'
		)!;

		await userEvent.click(trigger);
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('true');
		const content = document.querySelector<HTMLElement>(
			'[data-testid="toolbar-toggle-popover-content"]'
		)!;
		const portal = group('toolbar-toggle-portal');
		const portalButtons = buttons(portal);
		await expect.poll(() => portalButtons.filter((button) => button.tabIndex === 0).length).toBe(1);

		expect(root.contains(content)).toBe(false);
		expect(content.parentElement).toBe(document.body);
		expect(portal.dataset.size).toBe('large');
		expect(portalButtons.map((button) => button.tabIndex)).toEqual([0, -1]);
		expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
		expect(document.activeElement).toBe(portalButtons[0]);
		expect(output('toolbar-toggle-portal-output')).toBe('number:1:0');

		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(portalButtons[1]);
		expect(portalButtons.map((button) => button.tabIndex)).toEqual([-1, 0]);
		expect(output('toolbar-toggle-portal-output')).toBe('number:1:0');
		await userEvent.keyboard(' ');
		await expect.poll(() => output('toolbar-toggle-portal-output')).toBe('number:1,string:1:1');
		expect(root.querySelectorAll('[tabindex="0"]')).toHaveLength(1);

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => trigger.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(trigger);
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(after);
	});
});
