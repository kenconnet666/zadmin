import type { UnitFamilyName, UnitName } from './units.js';

const DISPLAY = {
	block: 'block',
	contents: 'contents',
	flex: 'flex',
	flowRoot: 'flow-root',
	grid: 'grid',
	hidden: 'none',
	inline: 'inline',
	inlineBlock: 'inline-block',
	inlineFlex: 'inline-flex',
	inlineGrid: 'inline-grid',
	none: 'none'
} as const;

const OVERFLOW = {
	auto: 'auto',
	clip: 'clip',
	hidden: 'hidden',
	scroll: 'scroll',
	visible: 'visible'
} as const;

export interface PropertyDefinition {
	readonly keywords?: Readonly<Record<string, string>>;
	readonly token?: string;
	readonly tokenUnit?: UnitName;
	readonly units?: readonly UnitFamilyName[];
}

export const PROPERTY_DEFINITIONS = {
	alignContent: {
		keywords: {
			center: 'center',
			end: 'end',
			normal: 'normal',
			spaceAround: 'space-around',
			spaceBetween: 'space-between',
			spaceEvenly: 'space-evenly',
			start: 'start',
			stretch: 'stretch'
		}
	},
	alignItems: {
		keywords: {
			baseline: 'baseline',
			center: 'center',
			end: 'end',
			start: 'start',
			stretch: 'stretch'
		}
	},
	alignSelf: {
		keywords: {
			auto: 'auto',
			baseline: 'baseline',
			center: 'center',
			end: 'end',
			start: 'start',
			stretch: 'stretch'
		}
	},
	accentColor: { token: 'color' },
	aspectRatio: { keywords: { auto: 'auto' } },
	animationDuration: { token: 'duration', tokenUnit: 'ms', units: ['time'] },
	appearance: { keywords: { auto: 'auto', none: 'none' } },
	backgroundColor: { keywords: { transparent: 'transparent' }, token: 'color' },
	backdropFilter: {},
	borderCollapse: { keywords: { collapse: 'collapse', separate: 'separate' } },
	borderBottomColor: { token: 'color' },
	borderBottomLeftRadius: { token: 'radius', tokenUnit: 'px', units: ['length', 'percent'] },
	borderBottomRightRadius: { token: 'radius', tokenUnit: 'px', units: ['length', 'percent'] },
	borderBottomStyle: {
		keywords: { dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none', solid: 'solid' }
	},
	borderBottomWidth: { token: 'borderWidth', tokenUnit: 'px', units: ['length'] },
	borderColor: { keywords: { transparent: 'transparent' }, token: 'color' },
	borderStyle: {
		keywords: {
			dashed: 'dashed',
			dotted: 'dotted',
			double: 'double',
			hidden: 'hidden',
			none: 'none',
			solid: 'solid'
		}
	},
	borderLeftColor: { keywords: { transparent: 'transparent' }, token: 'color' },
	borderLeftStyle: {
		keywords: { dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none', solid: 'solid' }
	},
	borderLeftWidth: { token: 'borderWidth', tokenUnit: 'px', units: ['length'] },
	borderRadius: { token: 'radius', tokenUnit: 'px', units: ['length', 'percent'] },
	borderRightColor: { token: 'color' },
	borderRightStyle: {
		keywords: { dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none', solid: 'solid' }
	},
	borderRightWidth: { token: 'borderWidth', tokenUnit: 'px', units: ['length'] },
	borderTopColor: { token: 'color' },
	borderTopLeftRadius: { token: 'radius', tokenUnit: 'px', units: ['length', 'percent'] },
	borderTopRightRadius: { token: 'radius', tokenUnit: 'px', units: ['length', 'percent'] },
	borderTopStyle: {
		keywords: { dashed: 'dashed', dotted: 'dotted', double: 'double', none: 'none', solid: 'solid' }
	},
	borderTopWidth: { token: 'borderWidth', tokenUnit: 'px', units: ['length'] },
	borderWidth: { token: 'borderWidth', tokenUnit: 'px', units: ['length'] },
	blockSize: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	bottom: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	boxShadow: { token: 'shadow' },
	boxSizing: { keywords: { borderBox: 'border-box', contentBox: 'content-box' } },
	clip: {},
	clipPath: {},
	color: { token: 'color' },
	columnGap: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	cursor: {
		keywords: {
			auto: 'auto',
			default: 'default',
			grab: 'grab',
			grabbing: 'grabbing',
			notAllowed: 'not-allowed',
			pointer: 'pointer',
			text: 'text',
			wait: 'wait'
		}
	},
	display: { keywords: DISPLAY },
	fill: { token: 'color' },
	flexDirection: {
		keywords: {
			column: 'column',
			columnReverse: 'column-reverse',
			row: 'row',
			rowReverse: 'row-reverse'
		}
	},
	flexWrap: { keywords: { nowrap: 'nowrap', wrap: 'wrap', wrapReverse: 'wrap-reverse' } },
	fontFamily: { token: 'fontFamily' },
	fontSize: { token: 'fontSize', tokenUnit: 'px', units: ['length', 'percent'] },
	fontWeight: { token: 'fontWeight' },
	gap: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	inlineSize: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	gridColumn: {},
	gridTemplateColumns: {},
	gridTemplateRows: {},
	height: {
		keywords: {
			auto: 'auto',
			fitContent: 'fit-content',
			maxContent: 'max-content',
			minContent: 'min-content'
		},
		token: 'size',
		tokenUnit: 'px',
		units: ['length', 'percent']
	},
	inset: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	insetBlockEnd: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	insetBlockStart: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	insetInlineEnd: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	insetInlineStart: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	justifyContent: {
		keywords: {
			center: 'center',
			end: 'end',
			left: 'left',
			right: 'right',
			spaceAround: 'space-around',
			spaceBetween: 'space-between',
			spaceEvenly: 'space-evenly',
			start: 'start'
		}
	},
	justifySelf: {
		keywords: { auto: 'auto', center: 'center', end: 'end', start: 'start', stretch: 'stretch' }
	},
	left: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	letterSpacing: { units: ['length'] },
	lineHeight: { token: 'lineHeight', units: ['length', 'percent'] },
	margin: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginBlock: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginBlockEnd: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginBlockStart: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginBottom: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginInline: {
		keywords: { auto: 'auto' },
		token: 'space',
		tokenUnit: 'px',
		units: ['length', 'percent']
	},
	marginInlineEnd: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginInlineStart: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginLeft: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginRight: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	marginTop: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	maxHeight: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	maxWidth: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	minHeight: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	minWidth: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	objectFit: {
		keywords: {
			contain: 'contain',
			cover: 'cover',
			fill: 'fill',
			none: 'none',
			scaleDown: 'scale-down'
		}
	},
	opacity: { token: 'opacity' },
	outlineColor: { token: 'color' },
	outlineOffset: { units: ['length'] },
	outlineStyle: {
		keywords: {
			dashed: 'dashed',
			dotted: 'dotted',
			double: 'double',
			none: 'none',
			solid: 'solid'
		}
	},
	outlineWidth: { token: 'borderWidth', tokenUnit: 'px', units: ['length'] },
	overflow: { keywords: OVERFLOW },
	overflowX: { keywords: OVERFLOW },
	overflowY: { keywords: OVERFLOW },
	padding: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingBlock: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingBlockEnd: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingBlockStart: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingBottom: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingInline: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingInlineEnd: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingInlineStart: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingLeft: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingRight: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	paddingTop: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	pointerEvents: { keywords: { all: 'all', auto: 'auto', none: 'none' } },
	position: {
		keywords: {
			absolute: 'absolute',
			fixed: 'fixed',
			relative: 'relative',
			static: 'static',
			sticky: 'sticky'
		}
	},
	placeItems: {
		keywords: { center: 'center', end: 'end', start: 'start', stretch: 'stretch' }
	},
	resize: {
		keywords: { both: 'both', horizontal: 'horizontal', none: 'none', vertical: 'vertical' }
	},
	right: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	scrollMarginTop: { token: 'space', tokenUnit: 'px', units: ['length'] },
	rowGap: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	stroke: { token: 'color' },
	textAlign: {
		keywords: {
			center: 'center',
			end: 'end',
			justify: 'justify',
			left: 'left',
			right: 'right',
			start: 'start'
		}
	},
	textDecoration: {
		keywords: {
			lineThrough: 'line-through',
			none: 'none',
			overline: 'overline',
			underline: 'underline'
		}
	},
	textTransform: {
		keywords: {
			capitalize: 'capitalize',
			lowercase: 'lowercase',
			none: 'none',
			uppercase: 'uppercase'
		}
	},
	tabSize: {},
	textDecorationColor: { token: 'color' },
	textOverflow: { keywords: { clip: 'clip', ellipsis: 'ellipsis' } },
	textShadow: { token: 'shadow' },
	top: { token: 'space', tokenUnit: 'px', units: ['length', 'percent'] },
	transitionDuration: { token: 'duration', tokenUnit: 'ms', units: ['time'] },
	transitionTimingFunction: {
		keywords: {
			ease: 'ease',
			easeIn: 'ease-in',
			easeInOut: 'ease-in-out',
			easeOut: 'ease-out',
			linear: 'linear'
		}
	},
	userSelect: {
		keywords: { all: 'all', auto: 'auto', contain: 'contain', none: 'none', text: 'text' }
	},
	visibility: { keywords: { collapse: 'collapse', hidden: 'hidden', visible: 'visible' } },
	verticalAlign: {
		keywords: {
			baseline: 'baseline',
			bottom: 'bottom',
			middle: 'middle',
			sub: 'sub',
			super: 'super',
			textBottom: 'text-bottom',
			textTop: 'text-top',
			top: 'top'
		}
	},
	whiteSpace: {
		keywords: {
			breakSpaces: 'break-spaces',
			normal: 'normal',
			nowrap: 'nowrap',
			pre: 'pre',
			preLine: 'pre-line',
			preWrap: 'pre-wrap'
		}
	},
	width: { token: 'size', tokenUnit: 'px', units: ['length', 'percent'] },
	zIndex: { token: 'zIndex' }
} as const satisfies Readonly<Record<string, PropertyDefinition>>;

export type DefinedPropertyName = keyof typeof PROPERTY_DEFINITIONS;

export function getPropertyDefinition(property: string): PropertyDefinition | undefined {
	return (PROPERTY_DEFINITIONS as Readonly<Record<string, PropertyDefinition>>)[property];
}
