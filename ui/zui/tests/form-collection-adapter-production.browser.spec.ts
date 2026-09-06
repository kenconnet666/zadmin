import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import FormCollectionAdapterFixture from './FormCollectionAdapterFixture.svelte';
import { resetForm } from './form-reset.js';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

describe('TagsInput, Select and MultiSelect Form model adapters', () => {
	it('registers one owner per field and preserves typed values, labels and repeated FormData', async () => {
		const target = host();
		const component = mount(FormCollectionAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="collection-form"]')!;
		const tags = target.querySelector<HTMLElement>('[data-testid="collection-tags"]')!;
		const tagInput = tags.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		const selectTrigger = target.querySelector<HTMLButtonElement>(
			'[data-testid="collection-select-trigger"]'
		)!;
		const multiTrigger = target.querySelector<HTMLButtonElement>(
			'[data-testid="collection-multi-trigger"]'
		)!;
		const values = target.querySelector<HTMLOutputElement>('[data-testid="collection-values"]')!;
		const counts = target.querySelector<HTMLOutputElement>('[data-testid="collection-counts"]')!;

		expect(await component.validateOwners()).toBe(true);
		expect(values.textContent).toBe('alpha|b|read');
		expect(counts.textContent).toBe('0:0');
		expect(selectTrigger.textContent).toContain('Beta');
		expect(multiTrigger.textContent).toContain('Read');
		expect(getComputedStyle(selectTrigger).direction).toBe('rtl');
		expect(new FormData(form).getAll('tags')).toEqual(['alpha']);
		expect(new FormData(form).get('target')).toBe('b');
		expect(new FormData(form).getAll('scopes')).toEqual(['read']);

		await userEvent.fill(tagInput, 'beta');
		await userEvent.keyboard('{Enter}');
		await userEvent.click(selectTrigger);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="collection-select-a"]')!
		);
		await userEvent.click(multiTrigger);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="collection-multi-write"]')!
		);
		await expect.poll(() => values.textContent).toBe('alpha,beta|a|read,write');
		expect(counts.textContent).toBe('3:3');
		expect(selectTrigger.textContent).toContain('Alpha');
		expect(multiTrigger.textContent).toContain('Read');
		expect(multiTrigger.textContent).toContain('Write');
		expect(new FormData(form).getAll('tags')).toEqual(['alpha', 'beta']);
		expect(new FormData(form).get('target')).toBe('a');
		expect(new FormData(form).getAll('scopes')).toEqual(['read', 'write']);
		await unmount(component);
		target.remove();
	});

	it('maps external and controller updates without user callbacks and honors readonly/disabled', async () => {
		const target = host();
		const component = mount(FormCollectionAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="collection-form"]')!;
		const tags = target.querySelector<HTMLElement>('[data-testid="collection-tags"]')!;
		const tagInput = tags.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		const selectTrigger = target.querySelector<HTMLButtonElement>(
			'[data-testid="collection-select-trigger"]'
		)!;
		const multiTrigger = target.querySelector<HTMLButtonElement>(
			'[data-testid="collection-multi-trigger"]'
		)!;
		component.mutateExternal();
		await expect.poll(() => selectTrigger.textContent).toContain('Alpha');
		expect(tags.textContent).toContain('external');
		expect(multiTrigger.textContent).toContain('Write');
		expect(target.querySelector('[data-testid="collection-counts"]')?.textContent).toBe('0:0');

		component.setReadonly(true);
		await tick();
		expect(tagInput.readOnly).toBe(true);
		expect(selectTrigger.getAttribute('aria-disabled')).toBe('true');
		expect(multiTrigger.getAttribute('aria-disabled')).toBe('true');
		expect(new FormData(form).getAll('tags')).toEqual(['external']);
		expect(new FormData(form).get('target')).toBe('a');
		expect(new FormData(form).getAll('scopes')).toEqual(['write']);

		component.setReadonly(false);
		component.setDisabled(true);
		await tick();
		expect(tagInput.matches(':disabled')).toBe(true);
		expect(selectTrigger.matches(':disabled')).toBe(true);
		expect(multiTrigger.matches(':disabled')).toBe(true);
		expect(new FormData(form).get('tags')).toBeNull();
		expect(new FormData(form).get('target')).toBeNull();
		expect(new FormData(form).get('scopes')).toBeNull();

		component.setDisabled(false);
		component.clearThroughController();
		await tick();
		expect(tags.querySelectorAll('[data-slot="tag"]')).toHaveLength(0);
		expect(selectTrigger.dataset.placeholder).toBe('true');
		expect(multiTrigger.dataset.placeholder).toBe('true');
		expect(target.querySelector('[data-testid="collection-counts"]')?.textContent).toBe('3:0');
		await unmount(component);
		target.remove();
	});

	it('repeats baseline reset and rolls back a rejecting owner without stale tags or hidden values', async () => {
		const target = host();
		const component = mount(FormCollectionAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="collection-form"]')!;
		const rejectedForm = target.querySelector<HTMLFormElement>(
			'[data-testid="collection-rejected-form"]'
		)!;
		const rejectedTags = target.querySelector<HTMLElement>('[data-testid="rejected-tags"]')!;
		const rejectedTagInput = rejectedTags.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		const rejectedSelect = target.querySelector<HTMLButtonElement>(
			'[data-testid="rejected-select-trigger"]'
		)!;
		const rejectedMulti = target.querySelector<HTMLButtonElement>(
			'[data-testid="rejected-multi-trigger"]'
		)!;

		component.mutateExternal();
		await resetForm(form);
		await expect
			.poll(() => target.querySelector('[data-testid="collection-values"]')?.textContent)
			.toBe('alpha|b|read');
		await resetForm(form);
		expect(target.querySelector('[data-testid="collection-values"]')?.textContent).toBe(
			'alpha|b|read'
		);

		await userEvent.fill(rejectedTagInput, 'beta');
		await userEvent.keyboard('{Enter}');
		expect(rejectedTags.textContent).toContain('alpha');
		expect(rejectedTags.textContent).not.toContain('beta');
		await userEvent.click(rejectedSelect);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="rejected-select-a"]')!
		);
		expect(rejectedSelect.textContent).toContain('Rejected Beta');
		await userEvent.click(rejectedMulti);
		await userEvent.click(
			document.querySelector<HTMLElement>('[data-testid="rejected-multi-write"]')!
		);
		expect(rejectedMulti.textContent).toContain('Rejected Read');
		expect(rejectedMulti.textContent).not.toContain('Rejected Write');
		expect(new FormData(rejectedForm).getAll('tags')).toEqual(['alpha']);
		expect(new FormData(rejectedForm).get('target')).toBe('b');
		expect(new FormData(rejectedForm).getAll('scopes')).toEqual(['read']);

		for (const input of rejectedForm.querySelectorAll<HTMLInputElement>('[data-zui-form-value]'))
			input.value = 'drift';
		await resetForm(rejectedForm);
		expect(new FormData(rejectedForm).getAll('tags')).toEqual(['alpha']);
		expect(new FormData(rejectedForm).get('target')).toBe('b');
		expect(new FormData(rejectedForm).getAll('scopes')).toEqual(['read']);
		await resetForm(rejectedForm);
		expect(rejectedSelect.textContent).toContain('Rejected Beta');
		expect(rejectedMulti.textContent).toContain('Rejected Read');
		await unmount(component);
		target.remove();
	});
});
