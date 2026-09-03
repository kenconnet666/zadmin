import { tick } from 'svelte';

/** Waits for the owner Window's native reset task and Svelte's following flush. */
export async function settleFormReset(form?: HTMLFormElement | null): Promise<void> {
	const ownerWindow = (form ?? document.querySelector('form'))?.ownerDocument.defaultView;
	if (ownerWindow) await new Promise<void>((resolve) => ownerWindow.setTimeout(resolve, 0));
	else await new Promise<void>((resolve) => setTimeout(resolve, 0));
	await tick();
}

/** Calls native form.reset(), then settles its asynchronous lifecycle. */
export async function resetForm(form: HTMLFormElement | null | undefined): Promise<void> {
	form?.reset();
	await settleFormReset(form);
}

/** Activates the form's native reset control when present, preserving user-activation coverage. */
export async function activateFormReset(form: HTMLFormElement | null | undefined): Promise<void> {
	const control = form?.querySelector<HTMLButtonElement | HTMLInputElement>(
		'button[type="reset"], input[type="reset"]'
	);
	if (control) control.click();
	else form?.reset();
	await settleFormReset(form);
}
