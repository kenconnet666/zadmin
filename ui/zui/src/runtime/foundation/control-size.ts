import type { ZuiDensity } from './context.js';
import type { IcssFactory } from '../../icss/types.js';
import type { ZuiTheme } from '../../theme/types.js';
import { cssLength } from '../../theme/units.js';

export const controlSizes = Object.freeze([
	'xsmall',
	'small',
	'medium',
	'large',
	'xlarge'
] as const);
export type ZControlSize = (typeof controlSizes)[number];

/** Shared geometry for a control row; semantics, borders and layout remain with its component. */
export const controlSizeStyles = {
	xsmall: (s) => {
		s.minHeight._xsmall;
		s.paddingInline._medium;
		s.fontSize._xsmall;
	},
	small: (s) => {
		s.minHeight._small;
		s.paddingInline._medium;
		s.fontSize._small;
	},
	medium: (s) => {
		s.minHeight._medium;
		s.paddingInline._large;
		s.fontSize._medium;
	},
	large: (s) => {
		s.minHeight._large;
		s.paddingInline._large;
		s.fontSize._large;
	},
	xlarge: (s) => {
		s.minHeight._xlarge;
		s.paddingInline._xlarge;
		s.fontSize._large;
	}
} as const satisfies Readonly<Record<ZControlSize, IcssFactory<ZuiTheme>>>;

/** CSS-safe metrics for composed layouts; never parse a rem/calc token as if it were pixels. */
export function controlSizeMetrics(theme: ZuiTheme, size: ZControlSize) {
	const height = cssLength(theme.size[size]);
	const border = cssLength(theme.borderWidth.hairline);
	return {
		height,
		contentHeight: `calc(${height} - ${border} - ${border})`,
		fontSize: cssLength(theme.fontSize[size === 'xlarge' ? 'large' : size]),
		paddingInline: cssLength(
			theme.space[
				size === 'xlarge' ? 'xlarge' : size === 'medium' || size === 'large' ? 'large' : 'medium'
			]
		),
		indicatorSize: cssLength(theme.indicatorSize[size])
	};
}

const CONTROL_SIZE_BY_DENSITY = {
	compact: 'small',
	comfortable: 'medium',
	spacious: 'large'
} as const satisfies Readonly<Record<ZuiDensity, ZControlSize>>;

/** Resolve a control's explicit size before falling back to its Provider density. */
export function resolveControlSize(
	size: ZControlSize | undefined,
	density: ZuiDensity
): ZControlSize {
	return size ?? CONTROL_SIZE_BY_DENSITY[density];
}
