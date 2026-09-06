import type { IcssFactory } from '../../icss/types.js';
import type { ZSemanticTone } from '../../theme/semantics.js';
import type { ZuiTheme } from '../../theme/types.js';

export type TypographyLineHeight = keyof ZuiTheme['lineHeight'];
export type TypographySize = keyof ZuiTheme['fontSize'];
export type TypographyTone = ZSemanticTone | 'muted' | 'primary';
export type TypographyWeight = keyof ZuiTheme['fontWeight'];

export const typographySizes = {
	xsmall: (s) => s.fontSize._xsmall,
	small: (s) => s.fontSize._small,
	medium: (s) => s.fontSize._medium,
	large: (s) => s.fontSize._large,
	xlarge: (s) => s.fontSize._xlarge,
	xxlarge: (s) => s.fontSize._xxlarge,
	xxxlarge: (s) => s.fontSize._xxxlarge,
	xxxxlarge: (s) => s.fontSize._xxxxlarge
} satisfies Readonly<Record<TypographySize, IcssFactory<ZuiTheme>>>;

export const typographyTones = {
	neutral: (s) => s.color._text,
	info: (s) => s.color._info,
	success: (s) => s.color._success,
	warning: (s) => s.color._warning,
	danger: (s) => s.color._danger,
	muted: (s) => s.color._textMuted,
	primary: (s) => s.color._primary
} satisfies Readonly<Record<TypographyTone, IcssFactory<ZuiTheme>>>;

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
