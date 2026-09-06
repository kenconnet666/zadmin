import { createFormArray } from '../src/runtime/form/form-array.svelte.js';
import { createFormModel, type FormValuesChange } from '../src/runtime/form/form-model.svelte.js';

interface Values {
	readonly users: readonly { readonly email: string }[];
}
const model = createFormModel<Values>({
	defaultValues: { users: [{ email: 'a@example.com' }] },
	onValuesChange(detail: FormValuesChange<Values>) {
		// @ts-expect-error Change snapshots are immutable.
		detail.values.users = [];
	}
});
const array = createFormArray<{ readonly email: string }, Values>(model, 'users');
array.append({ email: 'b@example.com' });
// @ts-expect-error Array rows preserve the declared item type.
array.append({ email: 1 });
// @ts-expect-error Reasons are a closed origin contract.
model.setField('users', [], 'external');
void array;
