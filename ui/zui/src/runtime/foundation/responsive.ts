import type { IcssStyle } from '../../icss/types.js';
import { assertContainerName } from '../../icss/container-name.js';
import type { ZuiTheme } from '../../theme/types.js';

/** Semantic cascade order, independent of the caller's object insertion order. */
export const responsiveBreakpoints = Object.freeze(['small', 'medium', 'large'] as const);
export type ZuiBreakpoint = (typeof responsiveBreakpoints)[number];
export type ResponsiveValue<TValue> =
	| TValue
	| {
			readonly base?: TValue;
			readonly small?: TValue;
			readonly medium?: TValue;
			readonly large?: TValue;
	  };
export type ResponsiveQuery = 'viewport' | { readonly container: string };
type ResponsiveScalar = string | number | boolean;

/** Emits CSS only: no browser globals, observers or hydration-dependent values. */
export function applyResponsiveStyles<TValue extends ResponsiveScalar>(
	s: IcssStyle<ZuiTheme>,
	value: ResponsiveValue<TValue> | undefined,
	apply: (s: IcssStyle<ZuiTheme>, value: TValue) => void,
	query: ResponsiveQuery = 'viewport'
): void {
	if (query !== 'viewport') {
		if (
			typeof query !== 'object' ||
			query === null ||
			Object.keys(query).some((key) => key !== 'container')
		)
			throw new TypeError('Responsive query must be viewport or a named container.');
		assertContainerName(query.container);
	}
	if (value === undefined) return;
	if (typeof value !== 'object' || value === null) {
		if (value === null || !['string', 'number', 'boolean'].includes(typeof value))
			throw new TypeError('Responsive value must be a scalar or a breakpoint object.');
		apply(s, value as TValue);
		return;
	}
	if (
		Array.isArray(value) ||
		(Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
	)
		throw new TypeError('Responsive value must be a scalar or a breakpoint object.');
	for (const key of Reflect.ownKeys(value)) {
		if (key !== 'base' && !responsiveBreakpoints.includes(key as ZuiBreakpoint))
			throw new TypeError(`Unknown responsive breakpoint "${String(key)}".`);
	}
	if (value.base !== undefined) apply(s, value.base);
	for (const breakpoint of responsiveBreakpoints) {
		const selected = value[breakpoint];
		if (selected === undefined) continue;
		if (query === 'viewport') s._media({ min: breakpoint }, (s) => apply(s, selected));
		else s._container({ min: breakpoint, name: query.container }, (s) => apply(s, selected));
	}
}

/** Resolves a named cascade step, not the browser viewport. Used to coordinate grid tracks. */
export function resolveResponsiveValue<TValue extends ResponsiveScalar>(
	value: ResponsiveValue<TValue> | undefined,
	breakpoint: 'base' | ZuiBreakpoint,
	fallback: TValue
): TValue {
	if (value === undefined) return fallback;
	if (typeof value !== 'object' || value === null) return value as TValue;
	let selected = value.base ?? fallback;
	if (breakpoint === 'base') return selected;
	for (const key of responsiveBreakpoints) {
		selected = value[key] ?? selected;
		if (key === breakpoint) break;
	}
	return selected;
}
