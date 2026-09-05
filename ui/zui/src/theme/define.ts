import { DEFAULT_THEME_SCHEMA } from './schema.js';
import { durationMilliseconds } from './units.js';
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
		const expectedValue = expected[token];
		if (typeof expectedValue === 'string') {
			if (typeof value !== 'string' || value.trim().length === 0)
				throw new TypeError(`Theme token "${groupName}.${token}" must be a non-empty string.`);
		} else if (typeof expectedValue === 'number') {
			if (typeof value === 'string') {
				if (value.trim().length === 0)
					throw new TypeError(`Theme token "${groupName}.${token}" must not be an empty string.`);
				if (groupName === 'duration') {
					try {
						durationMilliseconds(value);
					} catch (error) {
						throw new TypeError(
							`Theme token "${groupName}.${token}": ${error instanceof Error ? error.message : 'Invalid duration.'}`,
							{ cause: error }
						);
					}
				}
			} else if (typeof value !== 'number') {
				throw new TypeError(`Theme token "${groupName}.${token}" must be a number or CSS string.`);
			} else if (!Number.isFinite(value)) {
				throw new TypeError(`Theme token "${groupName}.${token}" must be finite.`);
			} else {
				assertNumericToken(groupName, token, value);
			}
		} else {
			throw new TypeError(`Theme token "${groupName}.${token}" has an unsupported schema type.`);
		}
		copy[token] = value;
	}
	return Object.freeze(copy);
}

function assertNumericToken(groupName: string, token: string, value: number): void {
	if (groupName === 'opacity' && (value < 0 || value > 1))
		throw new RangeError(`Theme token "${groupName}.${token}" must be between 0 and 1.`);
	if (groupName === 'fontWeight' && (value < 1 || value > 1000))
		throw new RangeError(`Theme token "${groupName}.${token}" must be between 1 and 1000.`);
	if (
		['duration', 'borderWidth', 'radius', 'indicatorSize', 'size'].includes(groupName) &&
		value < 0
	)
		throw new RangeError(`Theme token "${groupName}.${token}" must be non-negative.`);
	if (groupName === 'fontSize' && value <= 0)
		throw new RangeError(`Theme token "${groupName}.${token}" must be positive.`);
	if (groupName === 'lineHeight' && value < 0)
		throw new RangeError(`Theme token "${groupName}.${token}" must be non-negative.`);
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
		if (groupName === 'color') deriveColorTokens(group, groupPatch as Record<string, unknown>);
	}

	return defineTheme(merged as unknown as ZuiTheme);
}

function deriveColorTokens(
	color: Record<string, ThemeTokenValue>,
	patch: Readonly<Record<string, unknown>>
): void {
	const changed = (token: string): boolean => Object.hasOwn(patch, token);
	const sourceChanged = (...tokens: string[]): boolean => tokens.some(changed);
	const explicit = (token: string): boolean => changed(token);
	const mix = (token: string, source: string, percentage: number): void => {
		if (!explicit(token))
			color[token] = `color-mix(in srgb, ${color[source]} ${percentage}%, ${color.canvas})`;
	};

	if (sourceChanged('canvas', 'text')) mix('surfaceHover', 'text', 6);
	if (sourceChanged('canvas', 'primary')) mix('primarySubtle', 'primary', 8);
	if (sourceChanged('canvas', 'primary')) mix('primarySubtleHover', 'primary', 14);
	if (sourceChanged('canvas', 'accent')) mix('accentSubtle', 'accent', 8);
	if (sourceChanged('canvas', 'danger')) mix('dangerSubtle', 'danger', 8);
	if (sourceChanged('canvas', 'success')) mix('successSubtle', 'success', 8);
	if (sourceChanged('canvas', 'warning')) mix('warningSubtle', 'warning', 8);
	if (changed('canvas')) {
		if (!explicit('onPrimary')) color.onPrimary = color.canvas;
		if (!explicit('onDanger')) color.onDanger = color.canvas;
	}
}
