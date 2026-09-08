import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import InternationalDateTimeOwnerFixture from './InternationalDateTimeOwnerFixture.svelte';

function section(id: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
}

function action(owner: HTMLElement, label: string): HTMLButtonElement {
	return [...owner.querySelectorAll<HTMLButtonElement>('button')].find(
		(button) => button.textContent?.trim() === label
	)!;
}

function input(owner: HTMLElement, label: string, value: string): void {
	const element = owner.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!;
	element.value = value;
	element.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('international DateTime owner calendars', () => {
	it('remembers a Hebrew owner across clear for Field input and Panel Now callbacks', async () => {
		await render(InternationalDateTimeOwnerFixture);
		const owner = section('owner-local');
		owner.querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(document.querySelector('[data-testid="owner-local-output"]')?.textContent).toBe(
			'null:none'
		);
		input(owner, 'Month', '09');
		input(owner, 'Day', '07');
		input(owner, 'Year', '2026');
		input(owner, 'Hour', '10');
		input(owner, 'Minute', '30');
		await tick();
		expect(document.querySelector('[data-testid="owner-local-output"]')?.textContent).toBe(
			'hebrew:none'
		);
		owner.querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		action(owner, 'Now').click();
		await tick();
		expect(document.querySelector('[data-testid="owner-local-output"]')?.textContent).toBe(
			'hebrew:hebrew'
		);
	});

	it('syncs a same-instant calendar change and preserves it through clear and zoned Now', async () => {
		await render(InternationalDateTimeOwnerFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="switch-zoned-calendar"]')!.click();
		await tick();
		const owner = section('owner-zoned');
		expect(document.querySelector('[data-testid="owner-zoned-output"]')?.textContent).toBe(
			'hebrew:America/New_York'
		);
		owner.querySelector<HTMLButtonElement>('[data-slot="clear"]')!.click();
		await tick();
		expect(document.querySelector('[data-testid="owner-zoned-output"]')?.textContent).toBe('null');
		action(owner, 'Now').click();
		await tick();
		expect(document.querySelector('[data-testid="owner-zoned-output"]')?.textContent).toBe(
			'hebrew:America/New_York'
		);
	});

	it('restores each mixed-calendar range endpoint before preset validation and commit', async () => {
		await render(InternationalDateTimeOwnerFixture);
		action(section('owner-range'), 'Owner range').click();
		await tick();
		expect(document.querySelector('[data-testid="owner-range-output"]')?.textContent).toBe(
			'hebrew:persian:hebrew:persian'
		);
	});
});
