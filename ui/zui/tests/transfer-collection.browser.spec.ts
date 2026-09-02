import { render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import TransferProductionFixture from './TransferProductionFixture.svelte';

function keydown(
	target: Element | null | undefined,
	key: string,
	init: KeyboardEventInit = {}
): void {
	target?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, ...init }));
}

describe('ZTransfer logical collection integration', () => {
	it('keeps filter drafts auxiliary, select-all view scoped and typed FormData ordered', async () => {
		render(TransferProductionFixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="transfer-production"]');
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="transfer-production-form"]'
		);
		const source = root?.querySelector<HTMLElement>('[role="listbox"][aria-label="Available"]');
		const filter = root?.querySelector<HTMLInputElement>(
			'input[aria-label="Available: Filter items"]'
		);
		expect(new FormData(form!).getAll('channel')).toEqual(['1', 'orphan']);
		expect([...new FormData(form!).keys()]).toEqual(['channel', 'channel']);

		if (filter) {
			filter.value = 'Alpha';
			filter.dispatchEvent(new InputEvent('input', { bubbles: true }));
		}
		await tick();
		expect(source?.querySelectorAll('[role="option"]')).toHaveLength(1);
		source?.focus();
		keydown(source, 'a', { ctrlKey: true });
		await tick();
		root?.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')?.click();
		await tick();
		expect(
			document.querySelector('[data-testid="transfer-production-output"]')?.textContent?.trim()
		).toBe('string:1|string:alpha|string:orphan:1');
		expect(new FormData(form!).getAll('channel')).toEqual(['1', 'alpha', 'orphan']);

		form?.reset();
		await expect
			.poll(
				() =>
					root
						?.querySelector<HTMLElement>('[role="listbox"][aria-label="Available"]')
						?.querySelectorAll('[role="option"]').length
			)
			.toBe(3);
		expect(
			root?.querySelector<HTMLInputElement>('input[aria-label="Available: Filter items"]')?.value
		).toBe('');
		await expect
			.poll(() =>
				document.querySelector('[data-testid="transfer-production-output"]')?.textContent?.trim()
			)
			.toBe('string:1|string:orphan:1');
	});

	it('preserves async orphan values and reports loading without leaking transport ownership', async () => {
		render(TransferProductionFixture);
		await tick();
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="transfer-production-form"]'
		);
		document.querySelector<HTMLButtonElement>('[data-testid="transfer-empty-items"]')?.click();
		await tick();
		expect(document.body.textContent).toContain('2 selected items are not loaded');
		expect(new FormData(form!).getAll('channel')).toEqual(['1', 'orphan']);

		document.querySelector<HTMLButtonElement>('[data-testid="transfer-loading"]')?.click();
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="transfer-production"]');
		expect(root?.getAttribute('aria-busy')).toBe('true');
		expect(root?.textContent).toContain('Loading options');

		document.querySelector<HTMLButtonElement>('[data-testid="transfer-restore-items"]')?.click();
		await tick();
		expect(document.body.textContent).toContain('1 selected item is not loaded');
		expect(new FormData(form!).getAll('channel')).toEqual(['1', 'orphan']);
	});

	it('uses independent virtual pane owners and mounts an End target before selecting and moving it', async () => {
		render(TransferProductionFixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="transfer-virtual"]');
		const source = root?.querySelector<HTMLElement>(
			'[role="listbox"][aria-label="Virtual available"]'
		);
		expect(source?.textContent).not.toContain('Virtual node 999');
		source?.focus();
		keydown(source, 'End');
		await tick();
		expect(document.activeElement).toBe(source);
		const activeId = source?.getAttribute('aria-activedescendant');
		const active = activeId ? source?.querySelector<HTMLElement>(`#${activeId}`) : null;
		expect(active?.textContent).toContain('Virtual node 999');
		keydown(source, ' ');
		await tick();
		root?.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="transfer-virtual-output"]')?.textContent).toBe(
			'0,998,999'
		);
	});

	it('keeps readonly panes navigable while preventing selection and movement', async () => {
		render(TransferProductionFixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="transfer-readonly"]');
		const source = root?.querySelector<HTMLElement>(
			'[role="listbox"][aria-label="Readonly available"]'
		);
		source?.focus();
		keydown(source, 'End');
		await tick();
		keydown(source, ' ');
		await tick();
		expect(document.activeElement).toBe(source);
		expect(root?.getAttribute('aria-readonly')).toBe('true');
		expect(root?.querySelectorAll('[role="option"][aria-selected="true"]')).toHaveLength(0);
		expect(
			root?.querySelector<HTMLButtonElement>('[aria-label="Move selected to target"]')?.disabled
		).toBe(true);
	});
});
