import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TagsInputProductionFixture from './TagsInputProductionFixture.svelte';
import { resetForm } from './form-reset.js';

describe('ZTagsInput production contract', () => {
	it('clears the native draft value when add and clear occur in one Svelte flush', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production-static"]')!;
		const input = root.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		input.value = 'three';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(input.value).toBe('');
		expect(
			document.querySelector('[data-testid="tags-production-static-output"]')?.textContent
		).toBe('one,two,three');
	});

	it('coordinates Field, overflow, keyboard editing, removal, FormData and reset', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production"]')!;
		const form = document.querySelector<HTMLFormElement>('[data-testid="tags-production-form"]')!;
		const input = root.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		const label = document.querySelector<HTMLLabelElement>('label[for]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="tags-production-output"]'
		)!;
		const staticRoot = document.querySelector<HTMLElement>(
			'[data-testid="tags-production-static"]'
		)!;
		const staticInput = staticRoot.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		const staticOutput = document.querySelector<HTMLOutputElement>(
			'[data-testid="tags-production-static-output"]'
		)!;

		expect(input.id).toBe(label.htmlFor);
		expect(root.dataset.invalid).toBe('true');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBeTruthy();
		expect(root.querySelectorAll('[data-slot="tag"]')).toHaveLength(2);
		expect(root.querySelector('[data-slot="overflow"]')?.textContent).toBe('+1');
		expect(new FormData(form).getAll('tag')).toEqual(['alpha', 'beta', 'gamma']);

		input.focus();
		await tick();
		expect(root.querySelectorAll('[data-slot="tag"]')).toHaveLength(3);
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		const lastEdit = root.querySelectorAll<HTMLButtonElement>('[data-slot="edit"]')[2]!;
		expect(document.activeElement).toBe(lastEdit);
		lastEdit.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		await Promise.resolve();
		await tick();
		const editInput = root.querySelector<HTMLInputElement>('[data-slot="edit-input"]')!;
		expect(document.activeElement).toBe(editInput);
		editInput.value = 'Release Candidate';
		editInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
		editInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(output.textContent).toBe('alpha,beta,release-candidate:1:');
		expect(new FormData(form).getAll('tag')).toEqual(['alpha', 'beta', 'release-candidate']);

		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		(document.activeElement as HTMLElement)?.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, key: 'Delete' })
		);
		await tick();
		expect(output.textContent).toBe('alpha,beta:2:');

		staticInput.focus();
		staticInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		const staticRemove = staticRoot.querySelectorAll<HTMLButtonElement>('[data-slot="remove"]')[1]!;
		expect(document.activeElement).toBe(staticRemove);
		staticRemove.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Delete' }));
		await tick();
		expect(staticOutput.textContent).toBe('one');

		input.focus();
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		root.querySelectorAll<HTMLButtonElement>('[data-slot="edit"]')[1]?.click();
		await tick();
		document.querySelector<HTMLButtonElement>('[data-testid="tags-owner-prepend"]')?.click();
		await tick();
		expect(root.querySelector('[data-slot="edit-input"]')).toBeNull();
		expect(output.textContent).toBe('owner,alpha,beta:2:');

		document.querySelector<HTMLButtonElement>('[data-testid="tags-owner-clear"]')?.click();
		await tick();
		expect(output.textContent).toBe(':2:');
		await resetForm(form);
		await Promise.resolve();
		await tick();
		expect(output.textContent).toBe('alpha,beta,gamma:2:');
	});

	it('keeps duplicate-tag navigation and edit focus valid after removing a preceding tag', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production-identity"]')!;
		const tags = root.querySelectorAll<HTMLElement>('[data-slot="tag"]');
		expect(tags).toHaveLength(3);
		const retainedDuplicate = tags[1]!;
		const firstRemove = tags[0]!.querySelector<HTMLButtonElement>('[data-slot="remove"]')!;
		firstRemove.focus();
		firstRemove.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Delete' }));
		await tick();
		expect(root.querySelectorAll('[data-slot="tag"]')).toHaveLength(2);
		expect(root.querySelector('[data-tag-index="0"]')).toBe(retainedDuplicate);
		expect(document.activeElement?.closest('[data-slot="tag"]')?.textContent).toContain('same');
		const edit = root.querySelectorAll<HTMLButtonElement>('[data-slot="edit"]')[0]!;
		edit.click();
		await tick();
		const editInput = root.querySelector<HTMLInputElement>('[data-slot="edit-input"]')!;
		expect(document.activeElement).toBe(editInput);
		editInput.value = 'renamed';
		editInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
		editInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(
			document.querySelector('[data-testid="tags-production-identity-output"]')?.textContent
		).toBe('renamed,third');
	});

	it('preserves duplicate identities when removing the second duplicate', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production-identity"]')!;
		const initial = [...root.querySelectorAll<HTMLElement>('[data-slot="tag"]')];
		const remove = initial[1]!.querySelector<HTMLButtonElement>('[data-slot="remove"]')!;
		remove.focus();
		remove.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Delete' }));
		await tick();
		expect(root.querySelectorAll<HTMLElement>('[data-slot="tag"]')[0]).toBe(initial[0]);
		expect(root.querySelectorAll<HTMLElement>('[data-slot="tag"]')[1]).toBe(initial[2]);
	});

	it('preserves duplicate identities when removing the first duplicate', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production-identity"]')!;
		const initial = [...root.querySelectorAll<HTMLElement>('[data-slot="tag"]')];
		const remove = initial[0]!.querySelector<HTMLButtonElement>('[data-slot="remove"]')!;
		remove.focus();
		remove.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Delete' }));
		await tick();
		expect(root.querySelectorAll<HTMLElement>('[data-slot="tag"]')[0]).toBe(initial[1]);
		expect(root.querySelectorAll<HTMLElement>('[data-slot="tag"]')[1]).toBe(initial[2]);
	});

	it('preserves identities while editing a duplicate and appending or pasting tags', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production-identity"]')!;
		const initial = [...root.querySelectorAll<HTMLElement>('[data-slot="tag"]')];
		initial[0]!.querySelector<HTMLButtonElement>('[data-slot="edit"]')!.click();
		await tick();
		const editInput = root.querySelector<HTMLInputElement>('[data-slot="edit-input"]')!;
		expect(document.activeElement).toBe(editInput);
		editInput.value = 'renamed';
		editInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
		editInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(root.querySelectorAll('[data-slot="tag"]')[1]).toBe(initial[1]);
		expect(root.querySelectorAll('[data-slot="tag"]')[2]).toBe(initial[2]);
		const input = root.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		input.value = 'fourth';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(root.querySelectorAll('[data-slot="tag"]')[1]).toBe(initial[1]);
		expect(root.querySelectorAll('[data-slot="tag"]')[2]).toBe(initial[2]);
		const paste = new DataTransfer();
		paste.setData('text', 'fifth,sixth');
		input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: paste }));
		await tick();
		expect(root.querySelectorAll('[data-slot="tag"]')[1]).toBe(initial[1]);
		expect(root.querySelectorAll('[data-slot="tag"]')[2]).toBe(initial[2]);
	});

	it('reconciles controlled prepend and duplicate replacement in occurrence order', async () => {
		render(TagsInputProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="tags-production-identity"]')!;
		const initial = [...root.querySelectorAll<HTMLElement>('[data-slot="tag"]')];
		document
			.querySelector<HTMLButtonElement>('[data-testid="tags-identity-controlled-prepend"]')!
			.click();
		await tick();
		expect(root.querySelectorAll('[data-slot="tag"]')[1]).toBe(initial[0]);
		expect(root.querySelectorAll('[data-slot="tag"]')[2]).toBe(initial[1]);
		expect(root.querySelectorAll('[data-slot="tag"]')[3]).toBe(initial[2]);
		document
			.querySelector<HTMLButtonElement>('[data-testid="tags-identity-controlled-replace"]')!
			.click();
		await tick();
		const replacementTags = [...root.querySelectorAll<HTMLElement>('[data-slot="tag"]')].slice(
			0,
			2
		);
		expect(replacementTags.map((tag) => initial.indexOf(tag))).toEqual([0, 1]);
	});

	it('does not commit during real composition and honors commitOnBlur and readonly boundaries', async () => {
		render(TagsInputProductionFixture);
		const staticRoot = document.querySelector<HTMLElement>(
			'[data-testid="tags-production-static"]'
		)!;
		const staticInput = staticRoot.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		staticInput.focus();
		staticInput.value = 'composing';
		staticInput.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		staticInput.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
		staticInput.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, isComposing: true, key: 'Enter' })
		);
		await tick();
		expect(
			document.querySelector('[data-testid="tags-production-static-output"]')?.textContent
		).toBe('one,two');
		staticInput.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
		staticInput.dispatchEvent(new InputEvent('input', { bubbles: true }));
		staticInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
		await tick();
		expect(
			document.querySelector('[data-testid="tags-production-static-output"]')?.textContent
		).toBe('one,two,composing');
		const readonlyRoot = document.querySelector<HTMLElement>(
			'[data-testid="tags-production-readonly"]'
		)!;
		const readonlyInput = readonlyRoot.querySelector<HTMLInputElement>('[data-slot="input"]')!;
		expect(readonlyInput.readOnly).toBe(true);
		readonlyInput.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
		expect(readonlyRoot.querySelectorAll('[data-slot="tag"]')).toHaveLength(1);
	});
});
