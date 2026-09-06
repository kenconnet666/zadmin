import { getContext, setContext } from 'svelte';
import { createContextKey } from '../foundation/context-key.js';
import type { FormListArray, ZFormContext } from './form-context.svelte.js';

export type FormListParentArray = Pick<
	FormListArray<unknown>,
	'path' | 'active' | 'rows' | 'getRowBaselinePath'
>;
export interface FormListContext {
	readonly form: ZFormContext;
	readonly array: FormListParentArray;
	readonly parent?: FormListContext;
}
const LIST_CONTEXT = createContextKey({ hot: import.meta.hot }, 'zui-form-list-context');
export function useFormListParent(): FormListContext | undefined {
	return getContext(LIST_CONTEXT);
}
export function provideFormList(context: FormListContext): void {
	setContext(LIST_CONTEXT, context);
}
