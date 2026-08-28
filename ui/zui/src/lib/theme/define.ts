import { DEFAULT_THEME_SCHEMA } from './schema.js';
import type { DeepPartial, DeepReadonly, Theme, ThemeTokenValue, ZuiTheme } from './types.js';

function copyTokenGroup(
	groupName: string,
	group: unknown,
	expected: Readonly<Record<string, ThemeTokenValue>>
): Readonly<Record<string, ThemeTokenValue>> {
	if (typeof group !== 'object' || group === null || Array.isArray(group)) {
		throw new TypeError(`Theme group "${groupName}" must be an object.`);
	}

	const copy = Object.create(null) as Record<string, ThemeTokenValue>;
	for (const token of Object.keys(expected)) {
		if (!Object.hasOwn(group, token)) {
			throw new TypeError(`Theme token "${groupName}.${token}" is required.`);
		}
	}
	for (const [token, value] of Object.entries(group)) {
		if (!Object.hasOwn(expected, token)) {
			throw new TypeError(`Unknown theme token "${groupName}.${token}".`);
		}
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

export function defineTheme<const TTheme extends ZuiTheme>(
	theme: TTheme
): Theme<DeepReadonly<TTheme>> {
	if (typeof theme !== 'object' || theme === null || Array.isArray(theme)) {
		throw new TypeError('Theme must be an object.');
	}
	for (const groupName of Object.keys(DEFAULT_THEME_SCHEMA)) {
		if (!Object.hasOwn(theme, groupName)) {
			throw new TypeError(`Theme group "${groupName}" is required.`);
		}
	}
	const copy = Object.create(null) as Record<string, Readonly<Record<string, ThemeTokenValue>>>;
	for (const [groupName, group] of Object.entries(theme)) {
		const expected = (DEFAULT_THEME_SCHEMA as Readonly<Record<string, unknown>>)[groupName];
		if (typeof expected !== 'object' || expected === null) {
			throw new TypeError(`Unknown theme group "${groupName}".`);
		}
		copy[groupName] = copyTokenGroup(
			groupName,
			group,
			expected as Readonly<Record<string, ThemeTokenValue>>
		);
	}
	return Object.freeze(copy) as Theme<DeepReadonly<TTheme>>;
}

export function extendTheme(base: ZuiTheme, patch: DeepPartial<ZuiTheme>): ZuiTheme {
	if (typeof patch !== 'object' || patch === null || Array.isArray(patch)) {
		throw new TypeError('Theme patch must be an object.');
	}

	const merged = Object.fromEntries(
		Object.entries(base).map(([groupName, group]) => [groupName, { ...group }])
	) as Record<string, Record<string, ThemeTokenValue>>;
	for (const [groupName, groupPatch] of Object.entries(patch)) {
		const group = merged[groupName];
		if (group === undefined) throw new TypeError(`Unknown theme group "${groupName}".`);
		if (typeof groupPatch !== 'object' || groupPatch === null || Array.isArray(groupPatch)) {
			throw new TypeError(`Theme patch group "${groupName}" must be an object.`);
		}
		for (const [token, value] of Object.entries(groupPatch)) {
			if (!Object.hasOwn(group, token)) {
				throw new TypeError(`Unknown theme token "${groupName}.${token}".`);
			}
			group[token] = value as ThemeTokenValue;
		}
	}

	return defineTheme(merged as unknown as ZuiTheme);
}
