import { createFormArray } from '../src/runtime/form/form-array.svelte.js';
import {
	createFormModel,
	type FormValueSnapshot,
	type FormValuesChange
} from '../src/runtime/form/form-model.svelte.js';

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

interface MutableValues {
	account: { name: string };
	rows: { id: number }[];
}
const mutableModel = createFormModel<MutableValues>({
	defaultValues: { account: { name: 'Ada' }, rows: [{ id: 1 }] },
	write(snapshot) {
		// @ts-expect-error Controlled callbacks receive deeply readonly snapshots.
		snapshot.account.name = 'Grace';
		// @ts-expect-error Controlled callback arrays are readonly.
		snapshot.rows.push({ id: 2 });
	}
});
const snapshot: FormValueSnapshot<MutableValues> = mutableModel.values;
void snapshot;
