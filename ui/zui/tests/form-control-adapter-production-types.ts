import type { StandardSchemaV1 } from '@standard-schema/spec';

import type { ZFormController, ZFormProps } from '../src/components/input/ZForm.svelte';
import { createFormModel, type FormValuesChange } from '../src/runtime/form/form-model.svelte.js';

interface Values {
	readonly active?: boolean;
	readonly name?: string;
	readonly permissions?: readonly string[];
	readonly role?: string;
}

const model = createFormModel<Values>({
	defaultValues: { active: true, name: 'Ada', permissions: ['read'], role: 'editor' },
	onValuesChange(detail: FormValuesChange<Values>) {
		void detail.values.permissions;
	}
});
const schema: StandardSchemaV1<Values, Values> = {
	'~standard': {
		version: 1,
		vendor: 'adapter-types',
		validate: (value: unknown) => ({ value: value as Values })
	}
};
const form = {
	model,
	schema
} satisfies ZFormProps<typeof schema, Values>;
declare const controller: ZFormController<Values, Values>;
controller.setFieldValue('name', undefined);
controller.setFieldValue('active', false);
controller.setFieldValue('permissions', ['read', 'write']);

const wrongModel = {
	// @ts-expect-error A model must use the same whole-form value shape as ZForm.
	model: createFormModel({ defaultValues: { count: 1 } }),
	schema
} satisfies ZFormProps<typeof schema, Values>;

void [form, controller, wrongModel];
