import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TooltipPopconfirmProductionFixture from './TooltipPopconfirmProductionFixture.svelte';

const wait = (duration: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, duration));

describe('production Popconfirm and Tooltip', () => {
	it('owns pending, blocks duplicate confirmation, resolves and restores trigger focus', async () => {
		render(TooltipPopconfirmProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="confirm-trigger"]')!;
		await userEvent.click(trigger);
		const action = document.querySelector<HTMLButtonElement>('[data-testid="confirm-action"]')!;
		await userEvent.click(action);
		expect(action.disabled).toBe(true);
		expect(action.getAttribute('aria-busy')).toBe('true');
		action.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(document.querySelector('[data-testid="confirm-output"]')?.textContent).toContain(':1:');

		document.querySelector<HTMLButtonElement>('[data-testid="confirm-resolve"]')?.click();
		await wait(140);
		await tick();
		expect(document.querySelector('[data-testid="confirm-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('keeps reject open and announces a safe formatted error', async () => {
		render(TooltipPopconfirmProductionFixture, { mode: 'reject' });
		await userEvent.click(document.querySelector('[data-testid="confirm-trigger"]')!);
		await userEvent.click(document.querySelector('[data-testid="confirm-action"]')!);
		await expect
			.poll(() => document.querySelector<HTMLElement>('[data-slot="error"]')?.textContent)
			.toBe('Safe confirmation error');
		const error = document.querySelector<HTMLElement>('[data-slot="error"]')!;
		expect(error.getAttribute('role')).toBe('status');
		expect(error.textContent).toBe('Safe confirmation error');
		expect(document.querySelector('[data-testid="confirm-content"]')).not.toBeNull();
		expect(
			document.querySelector('[data-testid="confirm-action"]')?.getAttribute('aria-describedby')
		).toContain(error.id);
		expect(document.activeElement).toBe(
			document.querySelector<HTMLButtonElement>('[data-testid="confirm-action"]')
		);
		expect(document.querySelector('[data-testid="confirm-output"]')?.textContent).toContain(':1:1');
	});

	it('invalidates a pending generation when Cancel closes the popover', async () => {
		render(TooltipPopconfirmProductionFixture);
		await userEvent.click(document.querySelector('[data-testid="confirm-trigger"]')!);
		await userEvent.click(document.querySelector('[data-testid="confirm-action"]')!);
		await userEvent.click(document.querySelector('[data-testid="confirm-cancel"]')!);
		await wait(140);
		await userEvent.click(document.querySelector('[data-testid="confirm-resolve"]')!);
		await tick();
		await userEvent.click(document.querySelector('[data-testid="confirm-trigger"]')!);
		expect(document.querySelector('[data-testid="confirm-content"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="confirm-output"]')?.textContent).toContain(
			'true:1:0'
		);
	});

	it('invalidates pending work on Escape and dismisses an idle confirm on outside pointer', async () => {
		render(TooltipPopconfirmProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="confirm-trigger"]')!;
		await userEvent.click(trigger);
		await userEvent.click(document.querySelector('[data-testid="confirm-action"]')!);
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await wait(140);
		expect(document.querySelector('[data-testid="confirm-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);

		await userEvent.click(document.querySelector('[data-testid="confirm-resolve"]')!);
		await userEvent.click(document.querySelector('[data-testid="confirm-external-open"]')!);
		expect(document.querySelector('[data-testid="confirm-content"]')).not.toBeNull();
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await wait(140);
		expect(document.querySelector('[data-testid="confirm-content"]')).toBeNull();
		expect(document.activeElement).toBe(trigger);
	});

	it('opens focus immediately and applies group warmup/cooldown with one active tooltip', async () => {
		render(TooltipPopconfirmProductionFixture);
		const first = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-first"]')!;
		const second = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-second"]')!;
		first.focus();
		await tick();
		expect(document.querySelector('[data-testid="tooltip-first-content"]')).not.toBeNull();

		first.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		first.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		await wait(25);
		second.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-testid="tooltip-second-content"]')).not.toBeNull();
		await wait(140);
		expect(document.querySelector('[data-testid="tooltip-first-content"]')).toBeNull();
	});

	it('restores a focus-owned tooltip after a competing pointer tooltip closes', async () => {
		render(TooltipPopconfirmProductionFixture);
		const first = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-first"]')!;
		const second = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-second"]')!;
		first.focus();
		await tick();
		second.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await wait(45);
		await tick();
		expect(
			document.querySelector('[data-testid="tooltip-second-content"]')?.getAttribute('data-state')
		).toBe('open');
		second.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		await wait(25);
		await tick();
		expect(
			document.querySelector('[data-testid="tooltip-first-content"]')?.getAttribute('data-state')
		).toBe('open');
		expect(document.activeElement).toBe(first);
	});

	it('invalidates a pending hover timer when disabled changes', async () => {
		render(TooltipPopconfirmProductionFixture);
		const delayed = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-delayed"]')!;
		delayed.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		document.querySelector<HTMLButtonElement>('[data-testid="tooltip-disable-delayed"]')?.click();
		await wait(55);
		await tick();
		expect(document.querySelector('[data-testid="tooltip-delayed-content"]')).toBeNull();
		expect(document.querySelector('[data-testid="tooltip-output"]')?.textContent.trim()).toBe(
			'false:true:0:0'
		);
	});

	it('uses a non-Tab disabled wrapper and lets pointer remain over non-interactive content', async () => {
		render(TooltipPopconfirmProductionFixture);
		const disabled = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-disabled"]')!;
		const wrapper = disabled.closest<HTMLElement>('[data-slot="disabled-trigger"]')!;
		expect(disabled.disabled).toBe(true);
		expect(wrapper.tabIndex).toBe(-1);
		wrapper.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-testid="tooltip-disabled-content"]')).not.toBeNull();
		expect(document.querySelector('[data-testid="tooltip-output"]')?.textContent.trim()).toBe(
			'false:false:0:1'
		);

		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-hoverable"]')!;
		trigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await tick();
		const content = document.querySelector<HTMLElement>(
			'[data-testid="tooltip-hoverable-content"]'
		)!;
		trigger.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		content.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await wait(50);
		expect(document.querySelector('[data-testid="tooltip-hoverable-content"]')).toBe(content);
	});

	it('keeps focus, timers and Portal in an iframe owner realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument;
		const ownerWindow = frame.contentWindow as (Window & typeof globalThis) | null;
		if (!ownerDocument || !ownerWindow) throw new Error('Expected same-origin iframe document.');
		const fixture = mount(TooltipPopconfirmProductionFixture, { target: ownerDocument.body });
		await tick();
		const trigger = ownerDocument.querySelector<HTMLButtonElement>(
			'[data-testid="tooltip-first"]'
		)!;
		trigger.focus();
		await expect
			.poll(() => ownerDocument.querySelector('[data-testid="tooltip-first-content"]'))
			.not.toBeNull();
		ownerDocument.dispatchEvent(
			new ownerWindow.KeyboardEvent('keydown', { bubbles: true, key: 'Escape' })
		);
		await wait(140);
		expect(ownerDocument.querySelector('[data-testid="tooltip-first-content"]')).toBeNull();
		expect(ownerDocument.activeElement).toBe(trigger);
		await unmount(fixture);
		frame.remove();
	});
});
