import { assertSelectionKey } from '../collection/selection.js';
import { normalizeFieldPath, type FieldPath, type FieldPathInput } from './field-path.js';
import {
	getFormValue,
	type FormAcceptedWrite,
	type FormValuesChangeReason
} from './form-model.svelte.js';
import { createFormListReconcile, type FormListReconcile } from './form-list-reconcile.js';
import { sameFormValue as equal } from './form-value-equality.js';

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
/** @internal Resolves a nested list through its stable parent row identity. */
export interface FormArrayLocation {
	readonly active?: boolean;
	readonly baselinePath: FieldPathInput | undefined;
	readonly path: FieldPathInput;
}
export interface FormArrayModel<TValues> {
	readonly defaultValues: TValues;
	get(path: FieldPathInput): unknown;
	getResetRevision(): number;
	getResetVersion(path: FieldPathInput): number;
	isDirty(path: FieldPathInput): boolean;
	isDirtyFrom(path: FieldPathInput, baselinePath?: FieldPathInput): boolean;
	resetFieldTo(path: FieldPathInput, baselinePath?: FieldPathInput): boolean;
	setField(
		path: FieldPathInput,
		value: unknown,
		reason: FormValuesChangeReason,
		acceptedWrite?: FormAcceptedWrite
	): boolean;
}
/** @internal A fully validated list transition whose commit cannot be rejected. */
export interface FormArrayPreparedMutation {
	commit(): void;
}
/** @internal Bridges row identity to the owning form registry and error layers. */
export interface FormArrayMutationHost {
	prepareList(change: FormListReconcile): FormArrayPreparedMutation;
}
interface PendingRows<T> {
	readonly ids: readonly string[];
	readonly keys: readonly (string | number)[];
	readonly values: readonly T[];
}

export class FormArrayController<T, TValues> {
	readonly #model: FormArrayModel<TValues>;
	readonly #staticPath: FieldPath;
	readonly #options: FormArrayOptions<T>;
	readonly #location?: FormArrayLocation;
	readonly #mutationHost?: FormArrayMutationHost;
	#lastPath: FieldPath;
	#baselineIds: string[] = [];
	#baselineInput?: readonly T[];
	#baselineKeys: (string | number)[] = [];
	#ids: string[] = [];
	#keys: (string | number)[] = [];
	#pending?: PendingRows<T>;
	#sequence = 0;
	#nextRevision = 0;
	#resetRevision = 0;
	#revision = $state(0);
	constructor(
		model: FormArrayModel<TValues>,
		path: FieldPathInput,
		options: FormArrayOptions<T> = {},
		location?: FormArrayLocation,
		mutationHost?: FormArrayMutationHost
	) {
		this.#model = model;
		this.#staticPath = normalizeFieldPath(path);
		this.#lastPath = this.#staticPath;
		this.#options = options;
		this.#location = location;
		this.#mutationHost = mutationHost;
		if (this.active) {
			this.#lastPath = normalizeFieldPath(location?.path ?? this.#staticPath);
			this.#refreshBaseline();
			this.#ids = [...this.#baselineIds];
			this.#keys = [...this.#baselineKeys];
			this.#reconcile(this.#values());
			this.#resetRevision = this.#model.getResetRevision();
		}
	}
	get active(): boolean {
		return this.#location?.active ?? true;
	}
	get path(): FieldPath {
		if (this.active) this.#lastPath = normalizeFieldPath(this.#location?.path ?? this.#staticPath);
		return this.#lastPath;
	}
	get rows(): readonly FormArrayRow<T>[] {
		this.#revision;
		if (!this.active) return EMPTY_ROWS;
		const path = this.path;
		const values = this.#values();
		this.#refreshBaseline();
		const resetRevision = this.#model.getResetRevision();
		const resetVersion = this.#model.getResetVersion(path);
		if (resetVersion > this.#resetRevision) {
			this.#ids = values.map((_, index) => this.#baselineIds[index] ?? this.#id());
			this.#keys = this.#options.getRowKey ? values.map(this.#options.getRowKey) : [];
		} else if (!(this.#pending && equal(values, this.#pending.values))) this.#reconcile(values);
		this.#resetRevision = resetRevision;
		const ids =
			this.#pending && equal(values, this.#pending.values) ? this.#pending.ids : this.#ids;
		return Object.freeze(
			values.map((value, index) =>
				Object.freeze({
					id: ids[index]!,
					index,
					path: Object.freeze([...path, index]),
					value
				})
			)
		);
	}
	append(value: T): boolean {
		if (!this.active) return false;
		return this.insert(this.rows.length, value);
	}
	insert(index: number, value: T): boolean {
		if (!this.active) return false;
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
		if (!this.active) return false;
		const values = this.rows.map((row) => row.value);
		this.#index(index, values.length);
		this.#reconcile(values);
		values.splice(index, 1);
		const ids = [...this.#ids];
		ids.splice(index, 1);
		return this.#write(values, ids);
	}
	move(from: number, to: number): boolean {
		if (!this.active) return false;
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
		if (!this.active) return false;
		const values = this.rows.map((row) => row.value);
		this.#index(index, values.length);
		if (equal(values[index], value)) return true;
		this.#reconcile(values);
		values[index] = value;
		return this.#write(values, [...this.#ids]);
	}
	isDirty(rowId: string, relativePath?: FieldPathInput): boolean {
		if (!this.active) return false;
		const { baselineIndex, currentIndex } = this.#indices(rowId);
		if (baselineIndex < 0)
			return relativePath === undefined
				? true
				: this.#model.isDirtyFrom(this.#rowPath(currentIndex, relativePath));
		return this.#model.isDirtyFrom(
			this.#rowPath(currentIndex, relativePath),
			this.#baselineRowPath(baselineIndex, relativePath)
		);
	}
	resetField(rowId: string, relativePath?: FieldPathInput): boolean {
		if (!this.active) return false;
		const { baselineIndex, currentIndex } = this.#indices(rowId);
		const currentPath = this.#rowPath(currentIndex, relativePath);
		if (baselineIndex < 0) {
			if (relativePath === undefined)
				throw new TypeError('ZForm cannot reset a new array row; use FormArray.remove.');
			return this.#model.resetFieldTo(currentPath);
		}
		return this.#model.resetFieldTo(
			currentPath,
			this.#baselineRowPath(baselineIndex, relativePath)
		);
	}
	/** @internal Returns the stable baseline row address used by nested FormList locations. */
	getRowBaselinePath(rowId: string): FieldPath | undefined {
		if (!this.active) return undefined;
		const { baselineIndex } = this.#indices(rowId);
		return baselineIndex < 0 ? undefined : this.#baselineRowPath(baselineIndex);
	}
	#values(): readonly T[] {
		const value = this.#model.get(this.path);
		if (!Array.isArray(value)) throw new TypeError('ZForm array path must resolve to an array.');
		return value as readonly T[];
	}
	#baselineValues(): readonly T[] {
		const path = this.#baselinePath();
		if (!path) return EMPTY_ROWS;
		const value = getFormValue(this.#model.defaultValues, path);
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
		const path = this.path;
		const change = createFormListReconcile(
			path,
			previousIds.map((id, index) => ({ id, path: Object.freeze([...path, index]) })),
			ids.map((id, index) => ({ id, path: Object.freeze([...path, index]) }))
		);
		const identityChanged =
			previousIds.length !== ids.length || previousIds.some((id, index) => id !== ids[index]);
		const prepared = identityChanged ? this.#mutationHost?.prepareList(change) : undefined;
		this.#pending = { ids, keys, values };
		let committed = false;
		const acceptedWrite: FormAcceptedWrite = {
			commit: () => {
				if (committed) return;
				this.#keys = [...keys];
				this.#ids = [...ids];
				this.#revision = ++this.#nextRevision;
				committed = true;
				prepared?.commit();
			}
		};
		let accepted = false;
		try {
			accepted = this.#model.setField(path, Object.freeze(values), 'array', acceptedWrite);
			// Structural models written against the earlier narrow contract may ignore the hook.
			if (accepted && !committed) acceptedWrite.commit();
		} finally {
			this.#pending = undefined;
			if (!committed) {
				this.#ids = previousIds;
				this.#keys = previousKeys;
			}
		}
		if (!accepted) return false;
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
			...this.path,
			index,
			...(relativePath === undefined ? [] : normalizeFieldPath(relativePath))
		]);
	}
	#baselinePath(): FieldPath | undefined {
		if (!this.#location) return this.#staticPath;
		return this.#location.baselinePath === undefined
			? undefined
			: normalizeFieldPath(this.#location.baselinePath);
	}
	#baselineRowPath(index: number, relativePath?: FieldPathInput): FieldPath {
		const path = this.#baselinePath();
		if (!path) throw new TypeError('ZForm array row has no baseline path.');
		return Object.freeze([
			...path,
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
		if (this.#baselineInput !== undefined && equal(values, this.#baselineInput)) {
			this.#baselineInput = values;
			return;
		}
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
		if (!this.#model.isDirty(this.path)) {
			this.#ids = [...this.#baselineIds];
			this.#keys = [...this.#baselineKeys];
		}
	}
	#reconcile(values = this.#values()): void {
		this.#refreshBaseline();
		this.#assertKeys(values);
		if (this.#pending && equal(values, this.#pending.values)) {
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
