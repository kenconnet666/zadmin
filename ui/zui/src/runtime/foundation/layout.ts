import type { IcssStyle } from '../../icss/types.js';
import type { ZuiTheme } from '../../theme/types.js';
import type { ZControlSize } from './control-size.js';
import type { ResponsiveValue } from './responsive.js';

export type ZLayoutSpacing = ZControlSize | 'none' | number;
export type ZLayoutAlignment = 'baseline' | 'center' | 'end' | 'start' | 'stretch';
export type ZLayoutJustification = 'around' | 'between' | 'center' | 'end' | 'evenly' | 'start';

/** Preserve an explicit longhand when a later responsive gap shorthand changes. */
export function cascadeAxisSpacing(
	value: ResponsiveValue<ZLayoutSpacing> | undefined
): ResponsiveValue<ZLayoutSpacing> | undefined {
	if (value === undefined) return undefined;
	if (typeof value !== 'object' || value === null)
		return { base: value, small: value, medium: value, large: value };
	if (
		Array.isArray(value) ||
		(Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
	)
		return value;
	const small = value.small ?? value.base;
	const medium = value.medium ?? small;
	return { ...value, base: value.base, small, medium, large: value.large ?? medium };
}

export function applyLayoutSpacing(
	s: IcssStyle<ZuiTheme>,
	property: 'gap' | 'rowGap' | 'columnGap' | 'paddingInline',
	value: ZLayoutSpacing
): void {
	if (typeof value === 'number') {
		if (!Number.isFinite(value) || value < 0)
			throw new TypeError('Layout spacing must be non-negative and finite.');
		s[property].px(value);
		return;
	}
	if (!['none', 'xsmall', 'small', 'medium', 'large', 'xlarge'].includes(value))
		throw new TypeError(`Unknown layout spacing "${String(value)}".`);
	s[property][`_${value}`];
}

export function applyLayoutAlignment(s: IcssStyle<ZuiTheme>, value: ZLayoutAlignment): void {
	if (!['baseline', 'center', 'end', 'start', 'stretch'].includes(value))
		throw new TypeError(`Unknown layout alignment "${String(value)}".`);
	s.alignItems[value];
}

export function applyLayoutJustification(
	s: IcssStyle<ZuiTheme>,
	value: ZLayoutJustification
): void {
	switch (value) {
		case 'around':
			s.justifyContent.spaceAround;
			break;
		case 'between':
			s.justifyContent.spaceBetween;
			break;
		case 'center':
			s.justifyContent.center;
			break;
		case 'end':
			s.justifyContent.end;
			break;
		case 'evenly':
			s.justifyContent.spaceEvenly;
			break;
		case 'start':
			s.justifyContent.start;
			break;
		default:
			throw new TypeError(`Unknown layout justification "${String(value)}".`);
	}
}
