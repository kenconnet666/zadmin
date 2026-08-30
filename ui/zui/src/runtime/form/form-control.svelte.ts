export type FieldMessage = string;
export type FieldMessages = FieldMessage | readonly FieldMessage[];

export function normalizeFieldMessages(
	messages: FieldMessages | null | undefined
): readonly string[] {
	if (messages === null || messages === undefined) return [];
	return (Array.isArray(messages) ? messages : [messages]).filter(
		(message): message is string => typeof message === 'string' && message.length > 0
	);
}

export function mergeAriaIds(
	...values: readonly (string | null | undefined)[]
): string | undefined {
	const ids: string[] = [];
	for (const value of values) {
		for (const id of value?.trim().split(/\s+/u) ?? []) {
			if (id.length > 0 && !ids.includes(id)) ids.push(id);
		}
	}
	return ids.length === 0 ? undefined : ids.join(' ');
}

export function listenForFormReset(
	control: HTMLElement & { readonly form: HTMLFormElement | null },
	reset: () => void
): () => void {
	const root = control.getRootNode();
	const associatedForm = control.form ?? control.closest('form');
	return listenToResetEvents(
		[control.ownerDocument, root, associatedForm],
		(event) => {
			const form = event.target;
			const FormElement = control.ownerDocument.defaultView?.HTMLFormElement;
			if (!FormElement || !(form instanceof FormElement)) return false;
			const explicitFormId = control.getAttribute('form');
			return (
				control.form === form ||
				form.contains(control) ||
				(explicitFormId !== null && explicitFormId === form.id)
			);
		},
		reset
	);
}

export function formReset(
	control: HTMLElement & { readonly form: HTMLFormElement | null },
	reset: () => void
): { destroy(): void; update(reset: () => void): void } {
	let currentReset = reset;
	const destroy = listenForFormReset(control, () => currentReset());
	return {
		destroy,
		update(nextReset) {
			currentReset = nextReset;
		}
	};
}

export function listenToFormReset(form: HTMLFormElement | null, reset: () => void): () => void {
	if (!form) return () => undefined;
	return listenToResetEvents([form], (event) => event.target === form, reset);
}

function listenToResetEvents(
	targets: readonly (EventTarget | null)[],
	accepts: (event: Event) => boolean,
	reset: () => void
): () => void {
	const activeTargets = [
		...new Set(targets.filter((target): target is EventTarget => target !== null))
	];
	let active = true;
	let pending: ReturnType<typeof setTimeout> | undefined;
	const handleReset = (event: Event) => {
		if (!accepts(event)) return;
		if (pending !== undefined) clearTimeout(pending);
		pending = setTimeout(() => {
			pending = undefined;
			if (active && !event.defaultPrevented) reset();
		}, 0);
	};
	for (const target of activeTargets) target.addEventListener('reset', handleReset, true);
	return () => {
		active = false;
		if (pending !== undefined) clearTimeout(pending);
		for (const target of activeTargets) target.removeEventListener('reset', handleReset, true);
	};
}
