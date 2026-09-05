import { tick } from 'svelte';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FieldAuditFixture from './FieldAuditFixture.svelte';

const element = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

it('focuses the compound owner from label text without intercepting nested links', async () => {
	render(FieldAuditFixture);
	const trigger = element('field-audit-trigger');
	element('field-audit-label-text').click();
	await tick();
	expect(document.activeElement).toBe(trigger);
	expect(trigger.getAttribute('aria-expanded')).toBe('false');
	const outside = element('field-audit-external');
	outside.focus();
	let preventedBeforeDocument: boolean | undefined;
	document.addEventListener(
		'click',
		(event) => {
			preventedBeforeDocument = event.defaultPrevented;
			event.preventDefault(); // Observe activation without navigating the test frame.
		},
		{ once: true }
	);
	element('field-audit-help-link').querySelector<HTMLElement>('span')!.click();
	expect(preventedBeforeDocument).toBe(false);
	expect(document.activeElement).toBe(outside);
});

it('reserves a theme-relative feedback line without moving the following action', async () => {
	render(FieldAuditFixture);
	const feedback =
		element('field-audit-reserved').querySelector<HTMLElement>('[data-slot="messages"]')!;
	const action = element('field-audit-toggle-reserved');
	const originalY = action.getBoundingClientRect().y;
	expect(feedback.textContent?.trim()).toBe('');
	expect(feedback.getBoundingClientRect().height).toBe(
		Number.parseFloat(getComputedStyle(feedback).lineHeight)
	);
	action.click();
	await tick();
	expect(action.getBoundingClientRect().y).toBe(originalY);
	action.click();
	await tick();
	expect(action.getBoundingClientRect().y).toBe(originalY);
	expect(feedback.isConnected).toBe(true);
	element('field-audit-long-error').click();
	await tick();
	expect(feedback.getBoundingClientRect().height).toBeGreaterThan(
		Number.parseFloat(getComputedStyle(feedback).lineHeight)
	);
	expect(feedback.scrollWidth).toBeLessThanOrEqual(feedback.clientWidth + 1);
});

it('ignores blank messages and updates described-by targets with compact, wrapping feedback', async () => {
	render(FieldAuditFixture);
	const field = element('field-audit-messages');
	const input = element('field-audit-input');
	expect(field.hasAttribute('data-invalid')).toBe(false);
	expect(field.hasAttribute('data-warning')).toBe(false);
	expect(field.hasAttribute('data-success')).toBe(false);
	expect(field.querySelector('[aria-live]')).toBeNull();
	element('field-audit-errors').click();
	await tick();
	expect(field.getAttribute('data-invalid')).toBe('true');
	expect(input.getAttribute('aria-invalid')).toBe('true');
	const ids = input.getAttribute('aria-describedby')!.split(' ');
	expect(ids).toContain('field-audit-help');
	expect(ids.every((id) => document.getElementById(id))).toBe(true);
	const messages = field.querySelectorAll<HTMLElement>('[aria-live] p');
	expect(messages.length).toBe(2);
	for (const message of messages) {
		expect(getComputedStyle(message).marginBlockStart).toBe('0px');
		expect(getComputedStyle(message).marginBlockEnd).toBe('0px');
		expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth + 1);
	}
	element('field-audit-clear').click();
	await tick();
	expect(input.hasAttribute('aria-invalid')).toBe(false);
	expect(
		input
			.getAttribute('aria-describedby')!
			.split(' ')
			.every((id) => document.getElementById(id))
	).toBe(true);
});
