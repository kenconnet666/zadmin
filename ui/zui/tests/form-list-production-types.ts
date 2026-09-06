import type { Snippet } from 'svelte';
import type { FormListOperations, ZFormListProps } from '../src/components/input/ZFormList.svelte';
import type { FormArrayRow } from '../src/runtime/form/form-array.svelte.js';
interface Row {
	readonly name: string;
}
const children = (() => undefined) as unknown as Snippet<
	[readonly FormArrayRow<Row>[], FormListOperations<Row>]
>;
const valid = {
	children,
	getRowKey: (row: Row) => row.name,
	name: ['users']
} satisfies ZFormListProps<Row>;
// @ts-expect-error Generic row operations preserve Row.
const invalid: FormListOperations<Row>['append'] = (value: { name: number }) => Boolean(value);
void [valid, invalid];
