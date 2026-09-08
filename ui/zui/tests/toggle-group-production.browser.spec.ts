import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import ToggleGroupFixture from './ToggleGroupFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function group(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function buttons(root: HTMLElement): HTMLButtonElement[] {
	return [...root.querySelectorAll<HTMLButtonElement>(':scope > button')];
}

function output(testId: string): string | null | undefined {
	return document.querySelector<HTMLOutputElement>(`[data-testid="${testId}"]`)?.textContent;
}

describe('ZToggleGroup production browser contract', () => {
	it('restores owned focus through disabled and removal changes without rewriting owner value or callbacks', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(ToggleGroupFixture, { target });
		try {
			const root = target.querySelector<HTMLElement>('[data-testid="toggle-group"]')!;
			expect(root.getAttribute('role')).toBe('group');
			component.focus('b');
			expect(document.activeElement?.querySelector('[data-testid="toggle-b"]')).not.toBeNull();
			const identity = root.querySelector('[data-testid="toggle-a"]');
			component.disableB();
			await expect
				.poll(() => document.activeElement?.querySelector('[data-testid="toggle-c"]'))
				.not.toBeNull();
			expect(target.querySelector('[data-testid="toggle-value"]')?.textContent).toBe('number:1:0');
			expect(root.querySelector('[data-testid="toggle-a"]')).toBe(identity);
			component.removeC();
			await expect
				.poll(() => document.activeElement?.querySelector('[data-testid="toggle-a"]'))
				.not.toBeNull();
			expect(target.querySelector('[data-testid="toggle-value"]')?.textContent).toBe('number:1:0');
			component.focusExternal();
			component.disableB();
			await tick();
			expect(document.activeElement?.getAttribute('data-testid')).toBe('toggle-external');
			const allTabStops = target.querySelectorAll<HTMLButtonElement>(
				'[data-testid="toggle-group-roving-off"] button'
			);
			expect([...allTabStops].filter((button) => button.tabIndex === 0)).toHaveLength(2);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('clears a single selection by default and honors allowEmpty=false', async () => {
		await render(ToggleGroupFixture);
		await tick();
		const empty = buttons(group('toggle-single-empty'));
		const required = buttons(group('toggle-single-required'));
		expect(empty[0]?.getAttribute('aria-pressed')).toBe('true');
		expect(required[0]?.getAttribute('aria-pressed')).toBe('true');

		await userEvent.click(empty[0]!);
		await expect.poll(() => output('toggle-single-empty-output')).toBe(':1');
		expect(empty[0]?.getAttribute('aria-pressed')).toBe('false');

		await userEvent.click(required[0]!);
		await tick();
		expect(output('toggle-single-required-output')).toBe('alpha:0');
		expect(required[0]?.getAttribute('aria-pressed')).toBe('true');
		await userEvent.click(required[1]!);
		await expect.poll(() => output('toggle-single-required-output')).toBe('beta:1');
		expect(required[0]?.getAttribute('aria-pressed')).toBe('false');
		expect(required[1]?.getAttribute('aria-pressed')).toBe('true');
	});

	it('preserves number and string identities while serializing repeated native FormData and resetting defaults', async () => {
		await render(ToggleGroupFixture);
		await tick();
		const form = document.querySelector<HTMLFormElement>('[data-testid="toggle-typed-form"]')!;
		const typedButtons = buttons(group('toggle-typed'));
		expect(output('toggle-typed-output')).toBe('number:1:0');
		expect(new FormData(form).getAll('typed-choice')).toEqual(['1']);

		await userEvent.click(typedButtons[1]!);
		await expect.poll(() => output('toggle-typed-output')).toBe('number:1,string:1:1');
		expect(typedButtons[0]?.getAttribute('aria-pressed')).toBe('true');
		expect(typedButtons[1]?.getAttribute('aria-pressed')).toBe('true');
		expect(new FormData(form).getAll('typed-choice')).toEqual(['1', '1']);

		await userEvent.click(typedButtons[0]!);
		await expect.poll(() => output('toggle-typed-output')).toBe('string:1:2');
		expect(new FormData(form).getAll('typed-choice')).toEqual(['1']);

		await userEvent.click(
			document.querySelector<HTMLButtonElement>('[data-testid="toggle-typed-reset"]')!
		);
		await expect.poll(() => output('toggle-typed-output')).toBe('number:1,string:1:2');
		expect(new FormData(form).getAll('typed-choice')).toEqual(['1', '1']);
	});

	it('moves focus without selection on arrows and activates the focused native button with Space', async () => {
		await render(ToggleGroupFixture);
		await tick();
		const root = group('toggle-keyboard');
		const keyboardButtons = buttons(root);
		keyboardButtons[0]!.focus();
		expect(document.activeElement).toBe(keyboardButtons[0]);

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => document.activeElement).toBe(keyboardButtons[1]);
		expect(output('toggle-keyboard-output')).toBe('key-a:0');
		expect(keyboardButtons[0]?.getAttribute('aria-pressed')).toBe('true');
		expect(keyboardButtons[1]?.getAttribute('aria-pressed')).toBe('false');

		await userEvent.keyboard(' ');
		await expect.poll(() => output('toggle-keyboard-output')).toBe('key-b:1');
		expect(document.activeElement).toBe(keyboardButtons[1]);
		expect(keyboardButtons[0]?.getAttribute('aria-pressed')).toBe('false');
		expect(keyboardButtons[1]?.getAttribute('aria-pressed')).toBe('true');
	});

	it('honors caller keydown cancellation before roving navigation and native Space activation', async () => {
		await render(ToggleGroupFixture);
		await tick();
		const cancelledButtons = buttons(group('toggle-keydown-cancelled'));
		cancelledButtons[0]!.focus();

		await userEvent.keyboard('{ArrowRight}');
		await tick();
		expect(document.activeElement).toBe(cancelledButtons[0]);
		expect(output('toggle-keydown-cancelled-output')).toBe('key-a:0:1');

		await userEvent.keyboard(' ');
		await tick();
		expect(document.activeElement).toBe(cancelledButtons[0]);
		expect(cancelledButtons[0]?.getAttribute('aria-pressed')).toBe('true');
		expect(output('toggle-keydown-cancelled-output')).toBe('key-a:0:2');
	});

	it('keeps readonly and disabled groups inert without notifying owners', async () => {
		await render(ToggleGroupFixture);
		await tick();
		const readonlyRoot = group('toggle-readonly');
		const readonlyButtons = buttons(readonlyRoot);
		const disabledRoot = group('toggle-disabled');
		const disabledButtons = buttons(disabledRoot);

		expect(readonlyRoot.dataset.readonly).toBe('true');
		expect(readonlyButtons.every((button) => !button.disabled)).toBe(true);
		await userEvent.click(readonlyButtons[1]!);
		await tick();
		expect(output('toggle-readonly-output')).toBe('alpha:0');
		expect(readonlyButtons[0]?.getAttribute('aria-pressed')).toBe('true');
		expect(readonlyButtons[1]?.getAttribute('aria-pressed')).toBe('false');

		expect(disabledRoot.getAttribute('aria-disabled')).toBe('true');
		expect(disabledButtons.every((button) => button.disabled)).toBe(true);
		expect(output('toggle-disabled-output')).toBe('alpha:0');
		expect(disabledButtons[0]?.getAttribute('aria-pressed')).toBe('true');
		expect(disabledButtons[1]?.getAttribute('aria-pressed')).toBe('false');
		expect(
			new FormData(
				document.querySelector<HTMLFormElement>('[data-testid="toggle-disabled-form"]')!
			).get('disabled-choice')
		).toBeNull();
	});

	it('projects all five sizes to real button geometry and native pressed-button ARIA', async () => {
		// @zui-visual ZToggleGroup five-size button geometry and ARIA
		await render(ToggleGroupFixture);
		await tick();
		for (const [size, height] of [
			['xsmall', 24],
			['small', 28],
			['medium', 32],
			['large', 40],
			['xlarge', 48]
		] as const) {
			const root = group(`toggle-size-${size}`);
			const sizedButtons = buttons(root);
			expect(root.getAttribute('role')).toBe('group');
			expect(root.getAttribute('aria-label')).toBe(`Toggle ${size}`);
			expect(root.dataset.size).toBe(size);
			expect(root.dataset.selectionMode).toBe('single');
			expect(root.dataset.orientation).toBe('horizontal');
			expect(sizedButtons).toHaveLength(2);
			for (const button of sizedButtons) {
				expect(button.tagName).toBe('BUTTON');
				expect(button.type).toBe('button');
				expect(button.dataset.size).toBe(size);
				expect(button.getAttribute('aria-pressed')).toBe('false');
				expect(button.getBoundingClientRect().height).toBe(height);
			}
		}
	});
});
