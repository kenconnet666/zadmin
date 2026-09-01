import type { StandardSchemaV1 } from '@standard-schema/spec';

import { fieldPathToString, normalizeFieldPath, type FieldPath } from './field-path.js';

export type FormErrors = Readonly<Record<string, readonly string[]>>;

function issuePath(issue: StandardSchemaV1.Issue): FieldPath {
	return Object.freeze(
		(issue.path ?? []).map((segment) => {
			const key =
				typeof segment === 'object' && segment !== null && 'key' in segment ? segment.key : segment;
			return typeof key === 'number' || typeof key === 'string' ? key : String(key);
		})
	);
}

export function issuesToFormErrors(issues: readonly StandardSchemaV1.Issue[]): FormErrors {
	const grouped = new Map<string, string[]>();
	for (const issue of issues) {
		const key = fieldPathToString(issuePath(issue));
		const messages = grouped.get(key) ?? [];
		if (!messages.includes(issue.message)) messages.push(issue.message);
		grouped.set(key, messages);
	}
	return Object.freeze(
		Object.fromEntries([...grouped].map(([key, messages]) => [key, Object.freeze(messages)]))
	);
}

function defineValue(
	target: Record<PropertyKey, unknown> | unknown[],
	key: string | number,
	value: unknown
) {
	Object.defineProperty(target, key, {
		configurable: true,
		enumerable: true,
		value,
		writable: true
	});
}

function hasOwn(target: object, key: string | number): boolean {
	return Object.prototype.hasOwnProperty.call(target, key);
}

function assignPath(
	root: Record<PropertyKey, unknown> | unknown[],
	path: FieldPath,
	value: FormDataEntryValue | readonly FormDataEntryValue[]
): void {
	let cursor: Record<PropertyKey, unknown> | unknown[] = root;
	for (let index = 0; index < path.length; index += 1) {
		const segment = path[index];
		if (index === path.length - 1) {
			if (hasOwn(cursor, segment)) {
				const current = cursor[segment] as FormDataEntryValue | readonly FormDataEntryValue[];
				defineValue(
					cursor,
					segment,
					Object.freeze([
						...(Array.isArray(current) ? current : [current]),
						...(Array.isArray(value) ? value : [value])
					])
				);
				return;
			}
			defineValue(cursor, segment, value);
			return;
		}
		const nextIsArray = typeof path[index + 1] === 'number';
		if (!hasOwn(cursor, segment)) defineValue(cursor, segment, nextIsArray ? [] : {});
		const next = cursor[segment];
		if (
			next === null ||
			typeof next !== 'object' ||
			(nextIsArray ? !Array.isArray(next) : Array.isArray(next))
		) {
			throw new TypeError(`Conflicting ZForm FieldPath "${fieldPathToString(path)}".`);
		}
		cursor = next as Record<PropertyKey, unknown> | unknown[];
	}
}

function freezeFormValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		for (let index = 0; index < value.length; index += 1)
			value[index] = freezeFormValue(value[index]);
		return Object.freeze(value);
	}
	const objectTag = value !== null && typeof value === 'object' ? objectToString(value) : undefined;
	if (
		value !== null &&
		typeof value === 'object' &&
		objectTag !== '[object Blob]' &&
		objectTag !== '[object File]'
	) {
		for (const key of Reflect.ownKeys(value)) {
			const record = value as Record<PropertyKey, unknown>;
			record[key] = freezeFormValue(record[key]);
		}
		return Object.freeze(value);
	}
	return value;
}

function objectToString(value: object): string {
	return Object.prototype.toString.call(value);
}

export function formDataToObject(
	formData: FormData,
	fieldPaths: ReadonlyMap<string, FieldPath> = new Map()
): unknown {
	const entries = new Map<string, FormDataEntryValue | FormDataEntryValue[]>();
	for (const [name, value] of formData) {
		const current = entries.get(name);
		if (current === undefined) entries.set(name, value);
		else if (Array.isArray(current)) current.push(value);
		else entries.set(name, [current, value]);
	}
	const firstPath = fieldPaths.get(entries.keys().next().value ?? '');
	const result: Record<PropertyKey, unknown> | unknown[] =
		firstPath && typeof firstPath[0] === 'number' ? [] : {};
	for (const [name, value] of entries) {
		const path = fieldPaths.get(name) ?? normalizeFieldPath(name);
		assignPath(result, path, Array.isArray(value) ? Object.freeze([...value]) : value);
	}
	return freezeFormValue(result);
}

export function errorsToMap(errors: FormErrors): ReadonlyMap<string, readonly string[]> {
	return new Map(Object.entries(errors));
}

export function errorsForPaths(errors: FormErrors, paths: readonly FieldPath[]): FormErrors {
	const keys = new Set(paths.map(fieldPathToString));
	return Object.freeze(Object.fromEntries(Object.entries(errors).filter(([key]) => keys.has(key))));
}

export function mergeErrorsForPaths(
	current: FormErrors,
	incoming: FormErrors,
	paths: readonly FieldPath[]
): FormErrors {
	const next: Record<string, readonly string[]> = { ...current };
	for (const path of paths) {
		const key = fieldPathToString(path);
		delete next[key];
		if (incoming[key]?.length) next[key] = Object.freeze([...incoming[key]]);
	}
	return Object.freeze(next);
}
