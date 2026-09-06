import type { StandardSchemaV1 } from '@standard-schema/spec';

import type {
	FormState,
	FormSubmitDetail,
	ZFormController,
	ZFormProps
} from '../src/components/input/ZForm.svelte';
import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

interface Values {
	readonly name: string;
	readonly other: string;
}

const schema: StandardSchemaV1<Values, Values> = {
	'~standard': {
		version: 1,
		vendor: 'form-core-types',
		validate: (input: unknown) => ({ value: input as Values })
	}
};
const model = createFormModel<Values>({ defaultValues: { name: 'Ada', other: 'one' } });
const props = {
	model,
	onStateChange(state: FormState) {
		void state.submitting;
	},
	onSubmitError(error: unknown) {
		void error;
	},
	onValidSubmit(detail: FormSubmitDetail<Values>): Promise<void> {
		void detail.formData;
		return Promise.resolve();
	},
	schema
} satisfies ZFormProps<typeof schema, Values>;
declare const controller: ZFormController<Values, Values>;
const state: FormState = controller.getState();
const unsubscribe = controller.subscribeState((next) => void next.dirty);
controller.initialize({ name: 'Next', other: 'two' }, { keepDirtyValues: true });
controller.resetField('name');
controller.clearErrors(['name']);
controller.setFieldFeedback('name', { errors: ['Manual'], warnings: ['Warning'] });

// @ts-expect-error initialize values retain the form model shape.
controller.initialize({ name: 1, other: 'two' });
const invalidSubmit = {
	model,
	// @ts-expect-error onValidSubmit receives schema output.
	onValidSubmit: (detail: FormSubmitDetail<number>) => detail.data,
	schema
} satisfies ZFormProps<typeof schema, Values>;

void [props, state, unsubscribe, invalidSubmit];
