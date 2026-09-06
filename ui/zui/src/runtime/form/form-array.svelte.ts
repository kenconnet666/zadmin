import { normalizeFieldPath, type FieldPath, type FieldPathInput } from './field-path.js';
import { FormModel } from './form-model.svelte.js';

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
export class FormArrayController<T, TValues> {
	readonly #model: FormModel<TValues>;
	readonly #path: FieldPath;
	readonly #options: FormArrayOptions<T>;
	#ids: string[] = [];
	#keys: (string | number)[] = [];
	#sequence = 0;
	#nextRevision = 0;
	#revision = $state(0);
	constructor(model: FormModel<TValues>, path: FieldPathInput, options: FormArrayOptions<T> = {}) {
		this.#model = model;
		this.#path = normalizeFieldPath(path);
		this.#options = options;
		this.#reconcile();
	}
	get rows(): readonly FormArrayRow<T>[] {
		this.#revision;
		const values = this.#values();
		this.#reconcile(values);
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
	append(value: T): void {
		this.insert(this.#values().length, value);
	}
	insert(index: number, value: T): void {
		const values = [...this.#values()];
		if (!Number.isSafeInteger(index) || index < 0 || index > values.length)
			throw new RangeError('ZForm array insert index is out of bounds.');
		this.#reconcile(values);
		values.splice(index, 0, value);
		const ids = [...this.#ids];
		ids.splice(index, 0, this.#id());
		this.#write(values, ids);
	}
	remove(index: number): void {
		const values = [...this.#values()];
		this.#index(index, values.length);
		this.#reconcile(values);
		values.splice(index, 1);
		const ids = [...this.#ids];
		ids.splice(index, 1);
		this.#write(values, ids);
	}
	move(from: number, to: number): void {
		const values = [...this.#values()];
		this.#index(from, values.length);
		this.#index(to, values.length);
		if (from === to) return;
		this.#reconcile(values);
		values.splice(to, 0, values.splice(from, 1)[0]!);
		const ids = [...this.#ids];
		ids.splice(to, 0, ids.splice(from, 1)[0]!);
		this.#write(values, ids);
	}
	replace(index: number, value: T): void {
		const values = [...this.#values()];
		this.#index(index, values.length);
		this.#reconcile(values);
		values[index] = value;
		this.#write(values, [...this.#ids]);
	}
	#values(): readonly T[] {
		const value = this.#model.get(this.#path);
		if (!Array.isArray(value)) throw new TypeError('ZForm array path must resolve to an array.');
		return value as readonly T[];
	}
	#write(values: readonly T[], positionalIds: string[]): void {
		this.#assertKeys(values);
		const keys = this.#options.getRowKey ? values.map(this.#options.getRowKey) : [];
		const ids = this.#options.getRowKey
			? keys.map((key) => {
					const index = this.#keys.indexOf(key);
					return index >= 0 ? this.#ids[index]! : this.#id();
				})
			: positionalIds;
		if (!this.#model.setField(this.#path, Object.freeze(values), 'array')) return;
		this.#keys = keys;
		this.#ids = ids;
		this.#revision = ++this.#nextRevision;
	}
	#id(): string {
		return this.#options.createId?.() ?? 'row-' + ++this.#sequence;
	}
	#index(index: number, length: number): void {
		if (!Number.isSafeInteger(index) || index < 0 || index >= length)
			throw new RangeError('ZForm array index is out of bounds.');
	}
	#assertKeys(values: readonly T[]): void {
		if (!this.#options.getRowKey) return;
		const keys = values.map(this.#options.getRowKey);
		if (new Set(keys).size !== keys.length)
			throw new TypeError('ZForm array row keys must be unique.');
	}
	#reconcile(values = this.#values()): void {
		this.#assertKeys(values);
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
	model: FormModel<TValues>,
	path: FieldPathInput,
	options?: FormArrayOptions<T>
): FormArrayController<T, TValues> {
	return new FormArrayController(model, path, options);
}
