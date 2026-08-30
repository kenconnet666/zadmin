import { flushSync } from 'svelte';

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
	control: { readonly form: HTMLFormElement | null; readonly ownerDocument: Document },
	reset: () => void
): () => void {
	return listenToResetEvent(control.ownerDocument, (event) => event.target === control.form, reset);
}

export function listenToFormReset(form: HTMLFormElement | null, reset: () => void): () => void {
	if (!form) return () => undefined;
	return listenToResetEvent(form, (event) => event.target === form, reset);
}

function listenToResetEvent(
	target: Document | HTMLFormElement,
	accepts: (event: Event) => boolean,
	reset: () => void
): () => void {
	let active = true;
	const handleReset = (event: Event) => {
		if (!accepts(event)) return;
		queueMicrotask(() => {
			if (active && !event.defaultPrevented) flushSync(reset);
		});
	};
	target.addEventListener('reset', handleReset, true);
	return () => {
		active = false;
		target.removeEventListener('reset', handleReset, true);
	};
}
