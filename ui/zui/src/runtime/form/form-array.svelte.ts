import { sameStateValue } from '../foundation/controllable-state.svelte.js';
import { assertSelectionKey } from '../collection/selection.js';
import { normalizeFieldPath, type FieldPath, type FieldPathInput } from './field-path.js';
import { getFormValue, type FormValuesChangeReason } from './form-model.svelte.js';

const EMPTY_ROWS: readonly never[] = Object.freeze([]);

export interface FormArrayRow<T> {
	readonly id: string;
	readonly index: number;
	readonly path: FieldPath;
	readonly value: T;
}
export interface FormArrayOptions<T> {
	readonly createId?: () => string;
	readonly getRowKey?: (value: T) => string | number;
}
export interface FormArrayModel<TValues> {
	readonly defaultValues: TValues;
	get(path: FieldPathInput): unknown;
	getResetVersion(path: FieldPathInput): number;
	isDirty(path: FieldPathInput): boolean;
	isDirtyFrom(path: FieldPathInput, baselinePath?: FieldPathInput): boolean;
	resetFieldTo(path: FieldPathInput, baselinePath?: FieldPathInput): boolean;
	setField(path: FieldPathInput, value: unknown, reason: FormValuesChangeReason): boolean;
}
interface PendingRows<T> {
	readonly ids: readonly string[];
	readonly keys: readonly (string | number)[];
	readonly values: readonly T[];
}

export class FormArrayController<T, TValues> {
	readonly #model: FormArrayModel<TValues>;
	readonly #path: FieldPath;
	readonly #options: FormArrayOptions<T>;
	#baselineIds: string[] = [];
	#baselineInput?: readonly T[];
	#baselineKeys: (string | number)[] = [];
	#ids: string[] = [];
	#keys: (string | number)[] = [];
	#pending?: PendingRows<T>;
	#sequence = 0;
	#nextRevision = 0;
	#resetVersion = 0;
	#revision = $state(0);
	constructor(
		model: FormArrayModel<TValues>,
		path: FieldPathInput,
		options: FormArrayOptions<T> = {}
	) {
		this.#model = model;
		this.#path = normalizeFieldPath(path);
		this.#options = options;
		this.#refreshBaseline();
		this.#ids = [...this.#baselineIds];
		this.#keys = [...this.#baselineKeys];
		this.#reconcile(this.#values());
		this.#resetVersion = this.#model.getResetVersion(this.#path);
	}
	get rows(): readonly FormArrayRow<T>[] {
		this.#revision;
		const values = this.#values();
		this.#refreshBaseline();
		const resetVersion = this.#model.getResetVersion(this.#path);
		if (resetVersion !== this.#resetVersion) {
			this.#resetVersion = resetVersion;
			this.#ids = values.map((_, index) => this.#baselineIds[index] ?? this.#id());
			this.#keys = this.#options.getRowKey ? values.map(this.#options.getRowKey) : [];
		} else if (this.#pending && sameStateValue(values, this.#pending.values)) {
			this.#ids = [...this.#pending.ids];
			this.#keys = [...this.#pending.keys];
		} else this.#reconcile(values);
		return Object.freeze(
			values.map((value, index) =>
				Object.freeze({
					id: this.#ids[index]!,
					index,
					path: Object.freeze([...this.#path, index]),
					value
				})
			)
		);
	}
	append(value: T): boolean {
		return this.insert(this.rows.length, value);
	}
	insert(index: number, value: T): boolean {
		const values = this.rows.map((row) => row.value);
		if (!Number.isSafeInteger(index) || index < 0 || index > values.length)
			throw new RangeError('ZForm array insert index is out of bounds.');
		this.#reconcile(values);
		values.splice(index, 0, value);
		this.#assertKeys(values);
		const ids = [...this.#ids];
		if (!this.#options.getRowKey) ids.splice(index, 0, this.#id());
		return this.#write(values, ids);
	}
	remove(index: number): boolean {
		const values = this.rows.map((row) => row.value);
		this.#index(index, values.length);
		this.#reconcile(values);
		values.splice(index, 1);
		const ids = [...this.#ids];
		ids.splice(index, 1);
		return this.#write(values, ids);
	}
	move(from: number, to: number): boolean {
		const values = this.rows.map((row) => row.value);
		this.#index(from, values.length);
		this.#index(to, values.length);
		if (from === to) return true;
		this.#reconcile(values);
		values.splice(to, 0, values.splice(from, 1)[0]!);
		const ids = [...this.#ids];
		ids.splice(to, 0, ids.splice(from, 1)[0]!);
		return this.#write(values, ids);
	}
	replace(index: number, value: T): boolean {
		const values = this.rows.map((row) => row.value);
		this.#index(index, values.length);
		if (sameStateValue(values[index], value)) return true;
		this.#reconcile(values);
		values[index] = value;
		return this.#write(values, [...this.#ids]);
	}
	isDirty(rowId: string, relativePath?: FieldPathInput): boolean {
		const { baselineIndex, currentIndex } = this.#indices(rowId);
		if (baselineIndex < 0)
			return relativePath === undefined
				? true
				: this.#model.isDirtyFrom(this.#rowPath(currentIndex, relativePath));
		return this.#model.isDirtyFrom(
			this.#rowPath(currentIndex, relativePath),
			this.#rowPath(baselineIndex, relativePath)
		);
	}
	resetField(rowId: string, relativePath?: FieldPathInput): boolean {
		const { baselineIndex, currentIndex } = this.#indices(rowId);
		const currentPath = this.#rowPath(currentIndex, relativePath);
		if (baselineIndex < 0) {
			if (relativePath === undefined)
				throw new TypeError('ZForm cannot reset a new array row; use FormArray.remove.');
			return this.#model.resetFieldTo(currentPath);
		}
		return this.#model.resetFieldTo(currentPath, this.#rowPath(baselineIndex, relativePath));
	}
	#values(): readonly T[] {
		const value = this.#model.get(this.#path);
		if (!Array.isArray(value)) throw new TypeError('ZForm array path must resolve to an array.');
		return value as readonly T[];
	}
	#baselineValues(): readonly T[] {
		const value = getFormValue(this.#model.defaultValues, this.#path);
		if (value === undefined) return EMPTY_ROWS;
		if (!Array.isArray(value))
			throw new TypeError('ZForm array baseline path must resolve to an array.');
		return value as readonly T[];
	}
	#write(values: readonly T[], positionalIds: string[]): boolean {
		this.#assertKeys(values);
		const keys = this.#options.getRowKey ? values.map(this.#options.getRowKey) : [];
		const ids = this.#options.getRowKey
			? keys.map((key) => {
					const index = this.#keys.indexOf(key);
					return index >= 0 ? this.#ids[index]! : this.#id();
				})
			: positionalIds;
		const previousIds = [...this.#ids];
		const previousKeys = [...this.#keys];
		this.#pending = { ids, keys, values };
		let accepted = false;
		try {
			accepted = this.#model.setField(this.#path, Object.freeze(values), 'array');
		} finally {
			this.#pending = undefined;
			if (!accepted) {
				this.#ids = previousIds;
				this.#keys = previousKeys;
			}
		}
		if (!accepted) return false;
		this.#keys = keys;
		this.#ids = ids;
		this.#revision = ++this.#nextRevision;
		return true;
	}
	#id(): string {
		return this.#options.createId?.() ?? 'row-' + ++this.#sequence;
	}
	#index(index: number, length: number): void {
		if (!Number.isSafeInteger(index) || index < 0 || index >= length)
			throw new RangeError('ZForm array index is out of bounds.');
	}
	#indices(rowId: string): { readonly baselineIndex: number; readonly currentIndex: number } {
		this.rows;
		const currentIndex = this.#ids.indexOf(rowId);
		if (currentIndex < 0) throw new RangeError('ZForm array row id is not current.');
		return { baselineIndex: this.#baselineIds.indexOf(rowId), currentIndex };
	}
	#rowPath(index: number, relativePath?: FieldPathInput): FieldPath {
		return Object.freeze([
			...this.#path,
			index,
			...(relativePath === undefined ? [] : normalizeFieldPath(relativePath))
		]);
	}
	#assertKeys(values: readonly T[]): void {
		if (!this.#options.getRowKey) return;
		const keys = values.map(this.#options.getRowKey);
		for (const key of keys) assertSelectionKey(key, 'ZForm array row');
		if (new Set(keys).size !== keys.length)
			throw new TypeError('ZForm array row keys must be unique.');
	}
	#refreshBaseline(): void {
		const values = this.#baselineValues();
		if (Object.is(values, this.#baselineInput)) return;
		this.#assertKeys(values);
		if (this.#options.getRowKey) {
			const ids = new Map<string | number, string>();
			for (let index = 0; index < this.#keys.length; index += 1)
				ids.set(this.#keys[index]!, this.#ids[index]!);
			for (let index = 0; index < this.#baselineKeys.length; index += 1)
				if (!ids.has(this.#baselineKeys[index]!))
					ids.set(this.#baselineKeys[index]!, this.#baselineIds[index]!);
			this.#baselineKeys = values.map(this.#options.getRowKey);
			this.#baselineIds = this.#baselineKeys.map((key) => ids.get(key) ?? this.#id());
		} else {
			this.#baselineKeys = [];
			this.#baselineIds = values.map(() => this.#id());
		}
		this.#baselineInput = values;
		if (!this.#model.isDirty(this.#path)) {
			this.#ids = [...this.#baselineIds];
			this.#keys = [...this.#baselineKeys];
		}
	}
	#reconcile(values = this.#values()): void {
		this.#refreshBaseline();
		this.#assertKeys(values);
		if (this.#pending && sameStateValue(values, this.#pending.values)) {
			this.#ids = [...this.#pending.ids];
			this.#keys = [...this.#pending.keys];
			return;
		}
		if (this.#options.getRowKey) {
			const prior = new Map(this.#keys.map((key, index) => [key, this.#ids[index]!]));
			this.#keys = values.map(this.#options.getRowKey);
			this.#ids = this.#keys.map((key) => prior.get(key) ?? this.#id());
			return;
		}
		this.#ids = values.map((_, index) => this.#ids[index] ?? this.#id());
	}
}
export function createFormArray<T, TValues>(
	model: FormArrayModel<TValues>,
	path: FieldPathInput,
	options?: FormArrayOptions<T>
): FormArrayController<T, TValues> {
	return new FormArrayController(model, path, options);
}
