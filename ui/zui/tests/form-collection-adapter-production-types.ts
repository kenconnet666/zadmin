import type { ZFormProps } from '../src/components/input/ZForm.svelte';
import type { ZTagsInputProps } from '../src/components/input/ZTagsInput.svelte';
import type { ZSelectProps } from '../src/components/compound/select/ZSelect.svelte';
import type { ZMultiSelectProps } from '../src/components/compound/multi-select/ZMultiSelect.svelte';
import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

interface Values {
	readonly scopes?: readonly (number | string)[];
	readonly tags?: readonly string[];
	readonly target?: number | string;
}

const model = createFormModel<Values>({
	defaultValues: { scopes: ['read'], tags: ['alpha'], target: 1 }
});
const form = { model } satisfies ZFormProps<undefined, Values>;
const tags = { value: ['alpha'] } satisfies ZTagsInputProps;
const select = { value: 1 } satisfies ZSelectProps;
const multi = { value: [1, 'read'] } satisfies ZMultiSelectProps;

// @ts-expect-error TagsInput accepts string arrays only.
const invalidTags = { value: [1] } satisfies ZTagsInputProps;
// @ts-expect-error Select accepts SelectionKey values only.
const invalidSelect = { value: { id: 1 } } satisfies ZSelectProps;
// @ts-expect-error MultiSelect accepts SelectionKey arrays only.
const invalidMulti = { value: [{ id: 1 }] } satisfies ZMultiSelectProps;

void [form, tags, select, multi, invalidTags, invalidSelect, invalidMulti];
