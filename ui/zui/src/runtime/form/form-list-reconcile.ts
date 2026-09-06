import {
	fieldPathKey,
	fieldPathStartsWith,
	fieldPathToString,
	normalizeFieldPath,
	type FieldPath,
	type FieldPathInput
} from './field-path.js';
import type { FormErrors } from './validation.js';

export interface FormListRowAddress {
	readonly id: string;
	readonly path: FieldPath;
}
export interface FormListReconcile {
	readonly listPath: FieldPath;
	readonly next: readonly FormListRowAddress[];
	readonly previous: readonly FormListRowAddress[];
	readonly removedIds: ReadonlySet<string>;
}

function freezeAddress(address: FormListRowAddress): FormListRowAddress {
	return Object.freeze({ id: address.id, path: normalizeFieldPath(address.path) });
}
function assertAddresses(listPath: FieldPath, addresses: readonly FormListRowAddress[]): void {
	const ids = new Set<string>();
	const paths = new Set<string>();
	for (const address of addresses) {
		if (ids.has(address.id)) throw new TypeError('ZFormList row ids must be unique.');
		if (!fieldPathStartsWith(address.path, listPath) || address.path.length !== listPath.length + 1)
			throw new TypeError('ZFormList row paths must be direct numeric children of the list path.');
		if (typeof address.path.at(-1) !== 'number')
			throw new TypeError('ZFormList row paths must end in a numeric segment.');
		const key = fieldPathKey(address.path);
		if (paths.has(key)) throw new TypeError('ZFormList row paths must be unique.');
		ids.add(address.id);
		paths.add(key);
	}
}

export function createFormListReconcile(
	listPathInput: FieldPathInput,
	previousInput: readonly FormListRowAddress[],
	nextInput: readonly FormListRowAddress[]
): FormListReconcile {
	const listPath = normalizeFieldPath(listPathInput);
	const previous = Object.freeze(previousInput.map(freezeAddress));
	const next = Object.freeze(nextInput.map(freezeAddress));
	assertAddresses(listPath, previous);
	assertAddresses(listPath, next);
	const nextIds = new Set(next.map((row) => row.id));
	return Object.freeze({
		listPath,
		next,
		previous,
		removedIds: new Set(previous.filter((row) => !nextIds.has(row.id)).map((row) => row.id))
	});
}

export function remapFormListPath(
	pathInput: FieldPathInput,
	change: FormListReconcile
): FieldPath | undefined {
	const path = normalizeFieldPath(pathInput);
	const previous = change.previous.find((row) => fieldPathStartsWith(path, row.path));
	if (!previous) return path;
	const next = change.next.find((row) => row.id === previous.id);
	if (!next) return undefined;
	return Object.freeze([...next.path, ...path.slice(previous.path.length)]);
}

function errorStartsWith(key: string, prefix: string): boolean {
	return key === prefix || key.startsWith(`${prefix}.`) || key.startsWith(`${prefix}[`);
}

export function remapFormListErrors(errors: FormErrors, change: FormListReconcile): FormErrors {
	const next = Object.create(null) as Record<string, string[]>;
	for (const [key, messages] of Object.entries(errors)) {
		const previous = change.previous.find((row) =>
			errorStartsWith(key, fieldPathToString(row.path))
		);
		if (previous) {
			const row = change.next.find((candidate) => candidate.id === previous.id);
			if (!row) continue;
			const oldPrefix = fieldPathToString(previous.path);
			const remapped = fieldPathToString(row.path) + key.slice(oldPrefix.length);
			next[remapped] = [...new Set([...(next[remapped] ?? []), ...messages])];
			continue;
		}
		next[key] = [...new Set([...(next[key] ?? []), ...messages])];
	}
	return Object.freeze(
		Object.fromEntries(
			Object.entries(next).map(([key, messages]) => [key, Object.freeze(messages)])
		)
	);
}
