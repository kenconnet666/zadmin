import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import { mount, unmount } from './browser-lifecycle.js';
import FormValueScopeFixture from './FormValueScopeFixture.svelte';

describe('nonparticipating date value scopes', () => {
	it('keeps a DateTimeField suffix control outside the inherited Form model path', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormValueScopeFixture, { target });
		try {
			await tick();
			const form = target.querySelector<HTMLFormElement>('[data-testid="form-value-scope-form"]')!;
			const owner = target.querySelector<HTMLInputElement>(
				'[data-testid="form-value-scope-owner"]'
			)!;
			const suffix = target.querySelector<HTMLInputElement>(
				'[data-testid="date-time-none-suffix"]'
			)!;
			expect(owner.value).toBe('keep');
			expect(suffix.value).toBe('suffix-local');
			expect(new FormData(form).getAll('text')).toEqual(['keep']);
			expect(new FormData(form).has('ignored-date-time')).toBe(false);

			suffix.value = 'suffix-edited';
			suffix.dispatchEvent(new InputEvent('input', { bubbles: true }));
			await tick();
			expect(suffix.value).toBe('suffix-edited');
			expect(owner.value).toBe('keep');
			expect(new FormData(form).getAll('text')).toEqual(['keep']);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
