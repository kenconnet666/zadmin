import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CascaderProductionFixture from './CascaderProductionFixture.svelte';
import { activateFormReset, resetForm } from './form-reset.js';

describe('ZCascader production collection contract', () => {
	// @zui-visual ZCascader bounded multi-column popup geometry
	it('keeps typed paths, Field ownership, auxiliary search and reset synchronized', async () => {
		render(CascaderProductionFixture, { mode: 'main' });
		const form = document.querySelector<HTMLFormElement>(
			'[data-testid="cascader-production-form"]'
		)!;
		const root = document.querySelector<HTMLElement>('[data-testid="cascader-production"]')!;
		const trigger = root.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]')!;
		const label = document.querySelector<HTMLLabelElement>('label[for]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="cascader-production-output"]'
		)!;

		expect(trigger.id).toBe(label.htmlFor);
		expect(new FormData(form).get('path')).toBe('root/1');
		trigger.click();
		await tick();
		const search = document.querySelector<HTMLInputElement>('input[aria-label="Filter paths"]')!;
		const content = search.closest<HTMLElement>('[data-state="open"]')!;
		expect(getComputedStyle(content).overflowY).toBe('auto');
		expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
		expect(content.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
		expect(search.name).toBe('');
		expect(search.form).toBeNull();
		search.value = 'String';
		search.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		const result = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('String one')
		)!;
		result.click();
		await tick();
		expect(output.textContent).toBe('root/1:string:1');
		expect(new FormData(form).get('path')).toBe('root/1');

		document.querySelector<HTMLButtonElement>('[data-testid="cascader-owner-clear"]')?.click();
		await tick();
		expect(output.textContent).toBe(':empty:1');
		expect(new FormData(form).get('path')).toBeNull();
		await resetForm(form);
		expect(output.textContent).toBe('root/1:number:1');
		expect(new FormData(form).get('path')).toBe('root/1');
	});

	it('does not commit a selectionDisabled leaf', async () => {
		render(CascaderProductionFixture, { mode: 'main' });
		const root = document.querySelector<HTMLElement>('[data-testid="cascader-production"]')!;
		const trigger = root.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]')!;
		trigger.click();
		await tick();
		const locked = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Selection locked')
		)!;
		expect(locked).toHaveAttribute('data-selection-disabled', 'true');
		expect(locked).not.toHaveAttribute('aria-disabled');
		locked.click();
		await tick();
		locked.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
		await tick();
		const listbox = locked.closest<HTMLElement>('[role="listbox"]')!;
		expect(listbox).toHaveAttribute('aria-activedescendant', locked.id);
		listbox.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="cascader-production-output"]')?.textContent).toBe(
			'root/1:number:0'
		);
	});

	it('deduplicates lazy loads, exposes retry and aborts when the branch disappears', async () => {
		render(CascaderProductionFixture, { mode: 'lazy' });
		const branch = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Remote')
		)!;
		branch.click();
		branch.click();
		await tick();
		expect(document.querySelector('[data-testid="cascader-lazy-output"]')?.textContent).toBe(
			'1:0:0:true'
		);
		document.querySelector<HTMLButtonElement>('[data-testid="cascader-lazy-fail"]')?.click();
		await Promise.resolve();
		await tick();
		expect(document.querySelector('[data-testid="cascader-lazy-output"]')?.textContent).toBe(
			'1:0:1:false'
		);
		branch.click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="cascader-lazy-remove"]')?.click();
		await Promise.resolve();
		await tick();
		expect(document.querySelector('[data-testid="cascader-lazy-output"]')?.textContent).toBe(
			'2:1:1:false'
		);
	});

	it('aborts pending lazy work and clears status on form reset', async () => {
		render(CascaderProductionFixture, { mode: 'lazy' });
		const form = document.querySelector<HTMLFormElement>('[data-testid="cascader-lazy-form"]')!;
		const branch = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Remote')
		)!;
		branch.click();
		await tick();
		await activateFormReset(form);
		expect(document.querySelector('[data-testid="cascader-lazy-output"]')?.textContent).toBe(
			'1:1:0:false'
		);
	});

	it('invalidates pending lazy work when the source node identity changes under the same key', async () => {
		render(CascaderProductionFixture, { mode: 'lazy' });
		const branch = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((option) =>
			option.textContent?.includes('Remote')
		)!;
		branch.click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="cascader-lazy-replace"]')?.click();
		await Promise.resolve();
		await tick();
		expect(document.querySelector('[data-testid="cascader-lazy-output"]')?.textContent).toBe(
			'1:1:0:false'
		);
		const replacement = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(option) => option.textContent?.includes('Remote replacement')
		)!;
		expect(replacement).not.toHaveAttribute('data-load-state');
	});

	it('uses logical expand and collapse keys in RTL', async () => {
		render(CascaderProductionFixture, { direction: 'rtl', mode: 'main' });
		const trigger = document.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]')!;
		trigger.click();
		await tick();
		const columns = document.querySelectorAll<HTMLElement>('[role="listbox"]');
		const rootColumn = columns[0]!;
		const childColumn = columns[1]!;
		rootColumn.focus();
		rootColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await tick();
		expect(document.activeElement).toBe(childColumn);
		childColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		expect(document.activeElement).toBe(rootColumn);
	});

	it('keeps virtual columns bounded and mounts a distant active option before selection', async () => {
		render(CascaderProductionFixture, { mode: 'virtual' });
		const rootColumn = document.querySelector<HTMLElement>('[role="listbox"]')!;
		rootColumn.focus();
		rootColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		await Promise.resolve();
		const columns = document.querySelectorAll<HTMLElement>('[role="listbox"]');
		expect(columns).toHaveLength(2);
		const childColumn = columns[1]!;
		expect(childColumn.querySelectorAll('[role="option"]').length).toBeLessThan(30);
		childColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		await Promise.resolve();
		const activeId = childColumn.getAttribute('aria-activedescendant');
		expect(activeId).toBeTruthy();
		expect(childColumn.ownerDocument.getElementById(activeId ?? '')?.textContent).toContain(
			'Service 0999'
		);
		childColumn.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(document.querySelector('[data-testid="cascader-virtual-output"]')?.textContent).toBe(
			'services/service-999'
		);
	});
});
