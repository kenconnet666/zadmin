import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import Fixture from './FormDraftFeedbackFixture.svelte';

async function setup() {
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(Fixture, { target });
	await tick();
	const minute = target.querySelector<HTMLInputElement>('input[id$="-minute"]')!;
	async function edit(value: string) {
		minute.value = value;
		minute.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
	}
	return {
		target,
		component,
		minute,
		edit,
		async cleanup() {
			await unmount(component);
			target.remove();
		}
	};
}

describe('intrinsic form drafts', () => {
	it('drops only the local draft when a model field is preserved across unmount', async () => {
		const fixture = await setup();
		try {
			await fixture.edit('');
			expect((await fixture.component.validate()).valid).toBe(false);
			fixture.component.removeField();
			await expect.poll(() => fixture.component.getState().dirty).toBe(false);
			await expect.poll(() => fixture.component.getState().valid).toBe(true);
			expect(fixture.component.canonical()).toBe('09:30:00');
		} finally {
			await fixture.cleanup();
		}
	});
	it('keeps the canonical value while blocking stale-value validation and submission', async () => {
		const fixture = await setup();
		try {
			await fixture.edit('');
			await expect.poll(() => fixture.component.getState().dirty).toBe(true);
			expect(fixture.component.canonical()).toBe('09:30:00');
			expect(fixture.component.getState().valid).toBe(false);
			expect(fixture.component.getState().errors).toEqual({});
			const invalid = await fixture.component.validate();
			expect(invalid.valid).toBe(false);
			expect(invalid.data).toBeUndefined();
			expect(fixture.component.fieldState().errors.length).toBeGreaterThan(0);
			fixture.component.clearErrors();
			expect(fixture.component.fieldState().errors.length).toBeGreaterThan(0);
			fixture.target.querySelector('form')!.requestSubmit();
			await tick();
			expect(fixture.target.querySelector('[data-submissions]')!.textContent).toBe('0');
			fixture.component.resetField();
			await expect.poll(() => fixture.minute.value).toBe('30');
			expect(fixture.component.getState().dirty).toBe(false);
			expect((await fixture.component.validate()).valid).toBe(true);
		} finally {
			await fixture.cleanup();
		}
	});
	it('ignores disabled drafts, restores them when enabled, and drops feedback on control unmount', async () => {
		const fixture = await setup();
		try {
			await fixture.edit('');
			expect((await fixture.component.validate()).valid).toBe(false);
			const fieldset = fixture.target.querySelector('fieldset')!;
			fieldset.disabled = true;
			expect((await fixture.component.validate()).valid).toBe(true);
			fieldset.disabled = false;
			expect((await fixture.component.validate()).valid).toBe(false);
			fixture.component.removeControl();
			await expect.poll(() => fixture.component.getState().valid).toBe(true);
			expect(fixture.component.getState().dirty).toBe(false);
		} finally {
			await fixture.cleanup();
		}
	});
	it('invalidates an asynchronous validation when only the raw input draft changes', async () => {
		const fixture = await setup();
		try {
			fixture.component.deferNext();
			const validation = fixture.component.validate();
			await expect.poll(() => fixture.component.getState().validating).toBe(true);
			await fixture.edit('');
			fixture.component.finishValidation();
			const result = await validation;
			expect(result.outdated).toBe(true);
			expect(result.valid).toBe(false);
			expect(result.data).toBeUndefined();
		} finally {
			await fixture.cleanup();
		}
	});
});
