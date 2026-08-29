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
	control: { readonly form: HTMLFormElement | null },
	reset: () => void
): () => void {
	const form = control.form;
	if (!form) return () => undefined;
	const handleReset = () => queueMicrotask(reset);
	form.addEventListener('reset', handleReset);
	return () => form.removeEventListener('reset', handleReset);
}
