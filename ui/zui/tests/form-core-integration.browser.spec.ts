import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';

import { mount, unmount } from './browser-lifecycle.js';
import FormCoreIntegrationFixture from './FormCoreIntegrationFixture.svelte';
import { resetForm } from './form-reset.js';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

async function inputValue(input: HTMLInputElement, value: string): Promise<void> {
	input.value = value;
	input.dispatchEvent(new InputEvent('input', { bubbles: true }));
	await tick();
}

describe('ZForm core model integration', () => {
	it('keeps schema, server and manual error layers independent and batches final observer state', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const errors = target.querySelector<HTMLOutputElement>('[data-testid="form-core-errors"]')!;
		const observers = target.querySelector<HTMLOutputElement>(
			'[data-testid="form-core-observers"]'
		)!;
		await tick();

		component.setServerErrors();
		await tick();
		component.clearObservations();
		component.setManualFeedback();
		await tick();
		expect(errors.textContent).toBe(
			'{"name":["Server error","Manual error"],"other":["Other server"]}'
		);
		expect(observers.textContent).toBe(
			'1:1:1:1|false:false:false:Server error+Manual error:Manual warning:|false:false:false:Server error+Manual error:Manual warning:'
		);

		await component.addSchemaError();
		expect(errors.textContent).toBe(
			'{"name":["Schema error","Server error","Manual error"],"other":["Other server"]}'
		);
		component.clearNameErrors();
		await tick();
		expect(errors.textContent).toBe('{"other":["Other server"]}');
		await unmount(component);
		target.remove();
	});

	it('reports baseline dirty correctly across initialize, replacement and resetField', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const input = target.querySelector<HTMLInputElement>('[data-testid="form-core-name"]')!;
		const state = target.querySelector<HTMLOutputElement>('[data-testid="form-core-state"]')!;
		const field = target.querySelector<HTMLOutputElement>('[data-testid="form-core-field"]')!;
		await inputValue(input, 'Dirty');
		await expect.poll(() => state.textContent).toContain('true:');
		expect(field.textContent?.startsWith('true:')).toBe(true);

		component.initializeKeepDirty();
		await expect.poll(() => input.value).toBe('Dirty');
		expect(state.textContent?.startsWith('true:')).toBe(true);
		component.initializeReplace();
		await expect.poll(() => input.value).toBe('Baseline');
		expect(state.textContent?.startsWith('false:')).toBe(true);

		component.changeNameThroughController();
		await expect.poll(() => input.value).toBe('Changed');
		expect(field.textContent?.startsWith('true:')).toBe(true);
		component.resetName();
		await expect.poll(() => input.value).toBe('Baseline');
		expect(state.textContent?.startsWith('false:')).toBe(true);
		expect(field.textContent?.startsWith('false:')).toBe(true);
		await unmount(component);
		target.remove();
	});

	it('clears accepted resetField interaction and feedback state but preserves it when the owner rejects', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const input = target.querySelector<HTMLInputElement>('[data-testid="form-core-name"]')!;
		const field = target.querySelector<HTMLOutputElement>('[data-testid="form-core-field"]')!;
		const rejected = target.querySelector<HTMLInputElement>(
			'[data-testid="form-core-rejected-name"]'
		)!;
		const rejectedField = target.querySelector<HTMLOutputElement>(
			'[data-testid="form-core-rejected-field"]'
		)!;

		await inputValue(input, 'Dirty');
		input.focus();
		input.blur();
		component.setServerErrors();
		component.setManualFeedback();
		await tick();
		expect(field.textContent).toContain(
			'true:true:false:Server error+Manual error:Manual warning:'
		);
		component.resetName();
		await expect.poll(() => input.value).toBe('Ada');
		expect(field.textContent).toBe('false:false:false:::');

		rejected.focus();
		rejected.blur();
		component.setRejectedFeedback();
		await tick();
		expect(rejectedField.textContent).toBe('true:true:false:Rejected error:Rejected warning:');
		component.resetRejectedName();
		await tick();
		expect(rejected.value).toBe('Owner value');
		expect(rejectedField.textContent).toBe('true:true:false:Rejected error:Rejected warning:');
		await unmount(component);
		target.remove();
	});

	it('keeps Form disabled and readonly dominant over explicit false Field props', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const form = target.querySelector<HTMLFormElement>('[data-testid="form-core"]')!;
		const input = target.querySelector<HTMLInputElement>('[data-testid="form-core-name"]')!;
		const other = target.querySelector<HTMLInputElement>('[data-testid="form-core-other"]')!;
		const submit = target.querySelector<HTMLOutputElement>('[data-testid="form-core-submit"]')!;

		component.setFormDisabled(true);
		await tick();
		expect(input.disabled).toBe(true);
		expect(other.disabled).toBe(true);
		form.requestSubmit();
		await tick();
		expect(submit.textContent).toBe('0:0:false');

		component.setFormDisabled(false);
		component.setFormReadonly(true);
		await tick();
		expect(input.disabled).toBe(false);
		expect(other.disabled).toBe(false);
		expect(input.readOnly).toBe(true);
		expect(other.readOnly).toBe(true);
		await unmount(component);
		target.remove();
	});

	it('lets validate await the DOM projection of a batch model update', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		await component.batchAndValidate();
		expect(target.querySelector('[data-testid="form-core-validation"]')?.textContent).toBe(
			'Batch:Fresh:Batch:Fresh'
		);
		await unmount(component);
		target.remove();
	});

	it('awaits one semantic submit, handles reject, and cancels state reception on reset/unmount', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const form = target.querySelector<HTMLFormElement>('[data-testid="form-core"]')!;
		const output = target.querySelector<HTMLOutputElement>('[data-testid="form-core-submit"]')!;

		form.requestSubmit();
		form.requestSubmit();
		await expect.poll(() => output.textContent).toBe('1:0:true');
		component.resolveSubmit();
		await expect.poll(() => output.textContent).toBe('1:0:false');

		form.requestSubmit();
		await expect.poll(() => output.textContent).toBe('2:0:true');
		component.rejectSubmit();
		await expect.poll(() => output.textContent).toBe('2:1:false');

		form.requestSubmit();
		await expect.poll(() => output.textContent).toBe('3:1:true');
		await resetForm(form);
		expect(output.textContent).toBe('3:1:false');
		component.resolveSubmit();
		await tick();
		expect(output.textContent).toBe('3:1:false');

		form.requestSubmit();
		await expect.poll(() => output.textContent).toBe('4:1:true');
		await unmount(component);
		component.resolveSubmit();
		await Promise.resolve();
		target.remove();
	});

	it('cancels a submit synchronously followed by native reset before semantic submission', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const form = target.querySelector<HTMLFormElement>('[data-testid="form-core"]')!;
		const output = target.querySelector<HTMLOutputElement>('[data-testid="form-core-submit"]')!;
		form.requestSubmit();
		form.reset();
		await tick();
		expect(output.textContent).toBe('0:0:false');
		expect(form.dataset.submitted).toBeUndefined();
		await unmount(component);
		target.remove();
	});

	it('continues submit when the synchronously following reset is cancelled', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const form = target.querySelector<HTMLFormElement>('[data-testid="form-core"]')!;
		const output = target.querySelector<HTMLOutputElement>('[data-testid="form-core-submit"]')!;
		component.setPreventReset(true);
		await tick();
		form.requestSubmit();
		form.reset();
		await tick();
		await expect.poll(() => output.textContent).toBe('1:0:true');
		component.resolveSubmit();
		await expect.poll(() => output.textContent).toBe('1:0:false');
		await unmount(component);
		target.remove();
	});

	it('rejects a late schema result from a replaced model owner', async () => {
		const target = host();
		const component = mount(FormCoreIntegrationFixture, { target });
		const input = target.querySelector<HTMLInputElement>('[data-testid="form-core-name"]')!;
		component.deferNextValidation();
		const pending = component.startValidation()!;
		await expect
			.poll(() => target.querySelector('[data-testid="form-core-pending"]')?.textContent)
			.toBe('1');
		component.switchModel();
		await expect.poll(() => input.value).toBe('New owner');
		component.resolveOldValidationWithError();
		const result = await pending;
		expect(result.outdated).toBe(true);
		expect(target.querySelector('[data-testid="form-core-errors"]')?.textContent).toBe('{}');
		await unmount(component);
		target.remove();
	});
});
