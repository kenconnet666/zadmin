import type { DeepReadonly, Theme, ThemeSchema, ThemeTokenValue } from './types.js';

function copyTokenGroup(
	groupName: string,
	group: unknown
): Readonly<Record<string, ThemeTokenValue>> {
	if (typeof group !== 'object' || group === null || Array.isArray(group)) {
		throw new TypeError(`Theme group "${groupName}" must be an object.`);
	}

	const copy = Object.create(null) as Record<string, ThemeTokenValue>;
	for (const [token, value] of Object.entries(group)) {
		if (typeof value !== 'string' && typeof value !== 'number') {
			throw new TypeError(`Theme token "${groupName}.${token}" must be a string or number.`);
		}
		if (typeof value === 'number' && !Number.isFinite(value)) {
			throw new TypeError(`Theme token "${groupName}.${token}" must be finite.`);
		}
		copy[token] = value;
	}
	return Object.freeze(copy);
}

export function defineTheme<const TSchema extends ThemeSchema>(
	schema: TSchema
): Theme<DeepReadonly<TSchema>> {
	const copy = Object.create(null) as Record<string, Readonly<Record<string, ThemeTokenValue>>>;
	for (const [groupName, group] of Object.entries(schema)) {
		copy[groupName] = copyTokenGroup(groupName, group);
	}
	return Object.freeze(copy) as Theme<DeepReadonly<TSchema>>;
}
