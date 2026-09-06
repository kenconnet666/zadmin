import { tick } from 'svelte';
import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import FormNativeValuesFixture from './FormNativeValuesFixture.svelte';
import { settleFormReset } from './form-reset.js';

it('reads immutable native values with exact paths and repeated fields, while return-to-baseline clears dirty', async () => {
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(FormNativeValuesFixture, { target });
	try {
		await tick();
		await tick();
		const input = target.querySelector<HTMLInputElement>('[data-testid=native-values-name]')!;
		const snapshot = component.readValues() as {
			user: { name: string };
			permissions: readonly string[];
		};
		expect(snapshot).toEqual({ user: { name: 'Ada' }, permissions: ['read', 'write'] });
		expect(Object.isFrozen(snapshot)).toBe(true);
		expect(Object.isFrozen(snapshot.user)).toBe(true);
		expect(Object.isFrozen(snapshot.permissions)).toBe(true);
		expect(component.readName()).toBe('Ada');
		await userEvent.fill(input, 'Grace');
		await expect
			.poll(() => target.querySelector('[data-testid=native-values-state]')?.textContent)
			.toContain('true:');
		expect(component.readName()).toBe('Grace');
		expect(snapshot.user.name).toBe('Ada');
		await userEvent.fill(input, 'Ada');
		await expect
			.poll(() => target.querySelector('[data-testid=native-values-state]')?.textContent)
			.toContain('false:');
		const controller = component.getController();
		component.showExtraPermission(true);
		await expect.poll(() => controller.getFieldState('permissions').dirty).toBe(true);
		expect(controller.getFieldValue('permissions')).toEqual(['read', 'write', 'audit']);
		component.showExtraPermission(false);
		await expect.poll(() => controller.getFieldState('permissions').dirty).toBe(false);
		expect(controller.getFieldValue('permissions')).toEqual(['read', 'write']);
		controller.setFieldFeedback(['user', 'name'], {
			errors: ['Server feedback'],
			warnings: ['Review']
		});
		expect(controller.getFieldState(['user', 'name']).errors).toEqual(['Server feedback']);
		controller.setFieldState(['user', 'name'], { errors: [] });
		expect(controller.getFieldState(['user', 'name']).errors).toEqual([]);
	} finally {
		await unmount(component);
		target.remove();
	}
});

it('keeps a canceled reset intact, then resets values and comparison baseline together', async () => {
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(FormNativeValuesFixture, { target });
	try {
		await tick();
		await tick();
		const input = target.querySelector<HTMLInputElement>('[data-testid=native-values-name]')!;
		const form = target.querySelector<HTMLFormElement>('form')!;
		await userEvent.fill(input, 'Grace');
		await userEvent.click(
			target.querySelector<HTMLButtonElement>('[data-testid=native-values-cancel]')!
		);
		form.reset();
		await settleFormReset(form);
		expect(component.readName()).toBe('Grace');
		expect(component.getController().getFieldState(['user', 'name']).dirty).toBe(true);
		await userEvent.click(
			target.querySelector<HTMLButtonElement>('[data-testid=native-values-cancel]')!
		);
		form.reset();
		await settleFormReset(form);
		expect(component.readName()).toBe('Ada');
		expect(component.getController().getFieldState(['user', 'name']).dirty).toBe(false);
		await userEvent.fill(input, 'Grace');
		await userEvent.fill(input, 'Ada');
		await expect
			.poll(() => component.getController().getFieldState(['user', 'name']).dirty)
			.toBe(false);
	} finally {
		await unmount(component);
		target.remove();
	}
});
