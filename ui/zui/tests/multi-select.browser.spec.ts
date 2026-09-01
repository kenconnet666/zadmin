import { cleanup, render } from 'vitest-browser-svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import MultiSelectCollectionFixture from './MultiSelectCollectionFixture.svelte';

afterEach(cleanup);

function keydown(
	target: Element | null | undefined,
	key: string,
	init: KeyboardEventInit = {}
): void {
	target?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, ...init }));
}

describe('ZMultiSelect logical collection integration', () => {
	it('keeps typed keys, async orphans, container focus and repeated FormData synchronized', async () => {
		render(MultiSelectCollectionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-collection-trigger"]'
		);
		const form = document.querySelector<HTMLFormElement>('[data-testid="multi-collection-form"]');
		trigger?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="multi-collection-content"]');
		const options = [...(content?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
		expect(document.activeElement).toBe(content);
		expect(options).toHaveLength(4);
		expect(options[0]?.id).not.toBe(options[1]?.id);
		expect(content?.getAttribute('aria-activedescendant')).toBe(options[0]?.id);
		keydown(content, 'ArrowDown');
		expect(content?.getAttribute('aria-activedescendant')).toBe(options[1]?.id);
		keydown(content, 'Enter');
		await tick();
		expect(content?.isConnected).toBe(true);
		expect(options[1]?.getAttribute('aria-selected')).toBe('false');
		expect(new FormData(form!).getAll('choice')).toEqual(['1', 'orphan']);
		expect(document.querySelector('[data-testid="multi-collection-output"]')?.textContent).toBe(
			'number:1|string:orphan:1'
		);

		document.querySelector<HTMLButtonElement>('[data-testid="multi-empty-options"]')?.click();
		await tick();
		expect(trigger?.textContent).toContain('Remote orphan');
		expect(new FormData(form!).getAll('choice')).toEqual(['1', 'orphan']);
	});

	it('removes tags from the single trigger focus owner, clears explicitly and resets silently', async () => {
		render(MultiSelectCollectionFixture);
		const trigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-collection-trigger"]'
		);
		const form = document.querySelector<HTMLFormElement>('[data-testid="multi-collection-form"]');
		trigger?.focus();
		keydown(trigger, 'Backspace');
		await tick();
		expect(new FormData(form!).getAll('choice')).toEqual(['1', '1']);
		keydown(trigger, 'Backspace', { ctrlKey: true });
		await tick();
		expect(new FormData(form!).getAll('choice')).toEqual([]);
		form?.reset();
		await tick();
		expect(new FormData(form!).getAll('choice')).toEqual(['1', '1', 'orphan']);
		expect(
			document.querySelector('[data-testid="multi-collection-output"]')?.textContent
		).toContain(':2');
	});

	it('keeps readonly closed and completes the virtual ensure-key mount handshake', async () => {
		render(MultiSelectCollectionFixture);
		const readonlyTrigger = document.querySelector<HTMLButtonElement>(
			'[data-testid="multi-readonly-trigger"]'
		);
		readonlyTrigger?.click();
		expect(readonlyTrigger?.getAttribute('aria-disabled')).toBe('true');
		expect(document.querySelector('[data-testid="multi-readonly-content"]')).toBeNull();

		document.querySelector<HTMLButtonElement>('[data-testid="multi-virtual-trigger"]')?.click();
		await tick();
		const shell = document.querySelector<HTMLElement>('[data-testid="multi-virtual-content"]');
		const listbox = shell?.querySelector<HTMLElement>('[role="listbox"]');
		expect(document.activeElement).toBe(listbox);
		keydown(listbox, 'End');
		await tick();
		const activeId = listbox?.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(listbox?.querySelector(`#${activeId}`)?.textContent).toContain('Virtual 200');
	});

	it('keeps deprecated plural aliases functional without creating a second callback path', async () => {
		render(MultiSelectCollectionFixture);
		document.querySelector<HTMLButtonElement>('[data-testid="multi-legacy-trigger"]')?.click();
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="multi-legacy-content"]');
		keydown(content, 'Home');
		keydown(content, 'Enter');
		await tick();
		expect(document.querySelector('[data-testid="multi-legacy-output"]')?.textContent).toBe(
			'stable,1:1'
		);
	});
});
