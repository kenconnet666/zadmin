import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { mount, unmount } from './browser-lifecycle.js';

import TooltipPopconfirmProductionFixture from './TooltipPopconfirmProductionFixture.svelte';

const wait = (duration: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, duration));

describe.sequential('ZPopconfirm and ZTooltip production contracts', () => {
	it('ZPopconfirmTrigger and ZPopconfirmAction own pending, duplicate blocking, resolve and focus restoration', async () => {
		// @zui-visual ZPopconfirm
		// @zui-visual ZPopconfirmTrigger
		// @zui-visual ZPopconfirmContent
		// @zui-visual ZPopconfirmTitle
		// @zui-visual ZPopconfirmDescription
		// @zui-visual ZPopconfirmAction
		// @zui-visual ZPopconfirmCancel
		render(TooltipPopconfirmProductionFixture);
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="confirm-trigger"]')!;
		await userEvent.click(trigger);
		const content = document.querySelector<HTMLElement>('[data-testid="confirm-content"]')!;
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(content.getAttribute('role')).toBe('dialog');
		const titleId = content.getAttribute('aria-labelledby');
		const descriptionId = content.getAttribute('aria-describedby');
		expect(titleId).toBeTruthy();
		expect(descriptionId).toBeTruthy();
		expect(content.ownerDocument.getElementById(titleId ?? '')?.textContent).toBe(
			'Delete deployment?'
		);
		expect(content.textContent).toContain('This action is short and contextual.');
		expect(
			content.getBoundingClientRect().width,
			'popconfirm content has rendered geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(content).position, 'popconfirm content is floating').toMatch(
			/absolute|fixed/
		);
		expect(content.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(content.querySelector('[data-testid="confirm-action"]')).not.toBeNull();
		expect(content.querySelector('[data-testid="confirm-cancel"]')).not.toBeNull();
		const action = document.querySelector<HTMLButtonElement>('[data-testid="confirm-action"]')!;
		const cancel = document.querySelector<HTMLButtonElement>('[data-testid="confirm-cancel"]')!;
		const title = content.ownerDocument.getElementById(titleId)!;
		const description = content.ownerDocument.getElementById(descriptionId)!;
		expect(
			trigger.getBoundingClientRect().height,
			'popconfirm trigger has button geometry'
		).toBeGreaterThan(0);
		expect(
			action.getBoundingClientRect().height,
			'popconfirm action has button geometry'
		).toBeGreaterThan(0);
		expect(
			cancel.getBoundingClientRect().height,
			'popconfirm cancel has button geometry'
		).toBeGreaterThan(0);
		expect(
			title.getBoundingClientRect().height,
			'popconfirm title has typography geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(title).fontSize).toBe('14px');
		expect(getComputedStyle(title).fontWeight).toBe('700');
		expect(
			description.getBoundingClientRect().height,
			'popconfirm description has typography geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(description).marginBlockStart).toBe('8px');
		await userEvent.click(action);
		expect(action.disabled).toBe(true);
		expect(action.getAttribute('aria-busy')).toBe('true');
		action.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		expect(document.querySelector('[data-testid="confirm-output"]')?.textContent).toContain(':1:');

		document.querySelector<HTMLButtonElement>('[data-testid="confirm-resolve"]')?.click();
		await wait(140);
		await tick();
		await expect
			.poll(() => document.querySelector('[data-testid="confirm-content"]'), { timeout: 10_000 })
			.toBeNull();
		await expect.poll(() => document.activeElement, { timeout: 10_000 }).toBe(trigger);
	});

	it('ZPopconfirmContent, ZPopconfirmTitle and ZPopconfirmDescription keep reject open with a safe announcement', async () => {
		render(TooltipPopconfirmProductionFixture, { mode: 'reject' });
		await userEvent.click(document.querySelector('[data-testid="confirm-trigger"]')!);
		await userEvent.click(document.querySelector('[data-testid="confirm-action"]')!);
		await expect
			.poll(() => document.querySelector<HTMLElement>('[data-slot="error"]')?.textContent)
			.toBe('Safe confirmation error');
		const error = document.querySelector<HTMLElement>('[data-slot="error"]')!;
		const content = document.querySelector<HTMLElement>('[data-testid="confirm-content"]')!;
		const titleId = content.getAttribute('aria-labelledby');
		const descriptionId = content.getAttribute('aria-describedby');
		expect(content.ownerDocument.getElementById(titleId ?? '')?.textContent).toBe(
			'Delete deployment?'
		);
		expect(content.textContent).toContain('This action is short and contextual.');
		expect(descriptionId).toBeTruthy();
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

	it('ZPopconfirmCancel invalidates pending work when Cancel closes the Popconfirm', async () => {
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

	it('ZPopconfirm dismisses pending work on Escape and idle content on outside pointer', async () => {
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

	it('ZTooltipGroup applies warmup/cooldown while ZTooltip keeps one active tooltip', async () => {
		// @zui-visual ZTooltip
		// @zui-visual ZTooltipGroup coordinated visibility
		// @zui-visual ZTooltipTrigger
		// @zui-visual ZTooltipContent
		render(TooltipPopconfirmProductionFixture);
		const first = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-first"]')!;
		const second = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-second"]')!;
		first.focus();
		await tick();
		expect(document.querySelector('[data-testid="tooltip-first-content"]')).not.toBeNull();
		const firstContent = document.querySelector<HTMLElement>(
			'[data-testid="tooltip-first-content"]'
		)!;
		expect(
			first.getBoundingClientRect().height,
			'tooltip trigger has button geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(first).display, 'tooltip trigger participates in layout').not.toBe(
			'none'
		);
		expect(
			firstContent.getBoundingClientRect().width,
			'tooltip content has rendered geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(firstContent).position, 'tooltip content is floating').toMatch(
			/absolute|fixed/
		);
		await expect.poll(() => firstContent.style.left, { timeout: 2_000 }).not.toBe('');
		await expect.poll(() => firstContent.style.top, { timeout: 2_000 }).not.toBe('');
		expect(firstContent.getBoundingClientRect().height).toBeGreaterThan(0);
		expect(first.getAttribute('aria-describedby')).toBe(firstContent.id);

		first.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		first.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		await wait(25);
		second.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-testid="tooltip-second-content"]')).not.toBeNull();
		await wait(140);
		expect(document.querySelector('[data-testid="tooltip-first-content"]')).toBeNull();
	});

	it('ZTooltipTrigger restores focus ownership after a competing pointer tooltip closes', async () => {
		render(TooltipPopconfirmProductionFixture);
		const first = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-first"]')!;
		const second = document.querySelector<HTMLButtonElement>('[data-testid="tooltip-second"]')!;
		first.focus();
		await tick();
		await expect
			.poll(
				() =>
					document
						.querySelector('[data-testid="tooltip-first-content"]')
						?.getAttribute('data-state'),
				{ timeout: 2_000 }
			)
			.toBe('open');
		// Use the browser driver so WebKit updates its real hover target before the group suspends focus.
		await userEvent.hover(second);
		await wait(45);
		await tick();
		expect(
			document.querySelector('[data-testid="tooltip-second-content"]')?.getAttribute('data-state')
		).toBe('open');
		await userEvent.unhover(second);
		await wait(25);
		await tick();
		await expect
			.poll(
				() =>
					document
						.querySelector('[data-testid="tooltip-first-content"]')
						?.getAttribute('data-state'),
				{ timeout: 10_000 }
			)
			.toBe('open');
		await expect.poll(() => document.activeElement, { timeout: 10_000 }).toBe(first);
	});

	it('ZTooltipTrigger invalidates its pending hover timer when disabled changes', async () => {
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

	it('ZTooltipContent stays non-interactive while ZTooltipTrigger supports disabled and hoverable paths', async () => {
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
		expect(content.getAttribute('role')).toBe('tooltip');
		expect(trigger.getAttribute('aria-describedby')).toBe(content.id);
		trigger.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		content.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
		await wait(50);
		expect(document.querySelector('[data-testid="tooltip-hoverable-content"]')).toBe(content);
	});

	it('ZTooltip, ZTooltipTrigger and ZTooltipContent keep focus, timers and Portal in an iframe owner realm', async () => {
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
