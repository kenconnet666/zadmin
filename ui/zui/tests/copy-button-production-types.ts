import { createRawSnippet } from 'svelte';
import type { ZCopyButtonProps } from '../src/components/gene/ZCopyButton.svelte';
import type { ClipboardSnapshot } from '../src/runtime/clipboard.svelte.js';
const props = {
	value: 'copy',
	timeout: 0,
	size: 'xsmall',
	tone: 'success',
	onCopy: (value: string) => void value,
	children: createRawSnippet<[ClipboardSnapshot]>(() => ({
		render: () => '<span>Copy state</span>'
	}))
} satisfies ZCopyButtonProps;
// @ts-expect-error Clipboard values are explicit text, not implicit object serialization.
const invalidValue = { value: { id: 1 } } satisfies ZCopyButtonProps;
// @ts-expect-error Copy actions never submit or reset a form.
const submit = { value: 'copy', type: 'submit' } satisfies ZCopyButtonProps;
// @ts-expect-error Async state is owned by ClipboardController.
const loading = { value: 'copy', loading: true } satisfies ZCopyButtonProps;
void [props, invalidValue, submit, loading];
