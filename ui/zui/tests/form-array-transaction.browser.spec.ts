import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import { mount, unmount } from './browser-lifecycle.js';
import FormArrayTransactionFixture from './FormArrayTransactionFixture.svelte';

describe('ZFormList mutation preflight', () => {
	it('rejects a conflicting registry candidate before values, identity, errors or focus change', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormArrayTransactionFixture, { target });
		try {
			await tick();
			component.seedPreflightState();
			const row = target.querySelector<HTMLElement>('[data-preflight-row]')!;
			const input = row.querySelector<HTMLInputElement>('input')!;
			const beforeState = component.preflightState();
			input.focus();

			target.querySelector<HTMLButtonElement>('[data-testid="preflight-insert"]')!.click();
			await tick();

			expect(target.querySelector('[data-testid="preflight-result"]')?.textContent).toMatch(
				/HTML name/u
			);
			expect(component.preflightWriteCount()).toBe(0);
			expect(component.preflightValues().rows).toEqual([{ name: 'accepted' }]);
			expect([...target.querySelectorAll('[data-preflight-row]')]).toEqual([row]);
			expect(component.preflightState()).toEqual(beforeState);
			expect(document.activeElement).toBe(input);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('keeps committed DOM identity and field state when a model observer throws', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormArrayTransactionFixture, { target });
		try {
			await tick();
			component.seedObserverState();
			const rows = [...target.querySelectorAll<HTMLElement>('[data-observer-row]')];
			const firstInput = rows[0]!.querySelector<HTMLInputElement>('input')!;
			firstInput.focus();

			target.querySelector<HTMLButtonElement>('[data-testid="observer-move"]')!.click();
			await tick();

			expect(target.querySelector('[data-testid="observer-result"]')?.textContent).toBe(
				'array observer failed'
			);
			expect(component.observerValues().rows.map((row) => row.name)).toEqual(['second', 'first']);
			expect([...target.querySelectorAll('[data-observer-row]')]).toEqual([rows[1], rows[0]]);
			expect(component.observerState(1)?.warnings).toEqual(['First row']);
			expect(document.activeElement).toBe(firstInput);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
