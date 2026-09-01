import type { ZuiTheme } from '../../theme/types.js';

export type TypographyLineHeight = keyof ZuiTheme['lineHeight'];
export type TypographySize = keyof ZuiTheme['fontSize'];
export type TypographyTone = 'danger' | 'default' | 'muted' | 'primary';
export type TypographyWeight = keyof ZuiTheme['fontWeight'];

export interface TypographyOverflowOptions {
	readonly lineClamp?: number;
	readonly tabularNumbers?: boolean;
	readonly truncate?: boolean;
}

export interface TypographyOverflowContract {
	readonly inlineStyle: string;
	readonly lineClamp: number | undefined;
	readonly truncate: boolean;
}

export function resolveTypographyOverflow({
	lineClamp,
	tabularNumbers = false,
	truncate = false
}: TypographyOverflowOptions): TypographyOverflowContract {
	if (lineClamp !== undefined && (!Number.isInteger(lineClamp) || lineClamp < 1)) {
		throw new TypeError('Typography lineClamp must be a positive integer.');
	}
	if (truncate && lineClamp !== undefined) {
		throw new TypeError('Typography truncate and lineClamp are mutually exclusive.');
	}
	const declarations: string[] = [];
	if (lineClamp !== undefined) {
		declarations.push(
			'display:-webkit-box',
			'-webkit-box-orient:vertical',
			`-webkit-line-clamp:${lineClamp}`,
			'overflow:hidden'
		);
	}
	if (tabularNumbers) declarations.push('font-variant-numeric:tabular-nums');
	return Object.freeze({
		inlineStyle: declarations.join(';'),
		lineClamp,
		truncate
	});
}

export function headingElement(level: number): `h${1 | 2 | 3 | 4 | 5 | 6}` {
	if (!Number.isInteger(level) || level < 1 || level > 6) {
		throw new RangeError('ZHeading level must be an integer from 1 through 6.');
	}
	return `h${level as 1 | 2 | 3 | 4 | 5 | 6}`;
}
