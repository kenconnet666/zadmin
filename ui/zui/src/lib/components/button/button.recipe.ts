import { defineRecipe } from '../../recipes/define.js';
import { registerRecipeHmr } from '../../recipes/define.js';

export const buttonRecipe = defineRecipe({
	base: (s) => {
		s.display.inlineFlex;
		s.alignItems.center;
		s.justifyContent.center;
		s.gap._medium;
		s.borderWidth._hairline;
		s.borderStyle.solid;
		s.borderRadius._medium;
		s.fontWeight._semibold;
		s.lineHeight(1);
		s.cursor.pointer;
		s.transitionDuration._fast;
		// A property list is structural CSS, not a theme value or single keyword.
		s.transitionProperty.raw('background-color, border-color, color, opacity');
		s.transitionTimingFunction.ease;
		s.userSelect.none;
		s._focusVisible((focus) => {
			// The composed outline value has no safe single-keyword accessor.
			focus.outline.raw('2px solid currentColor');
			focus.outlineOffset.px(2);
		});
	},
	variants: {
		disabled: {
			false: () => undefined,
			true: (s) => {
				s.cursor.notAllowed;
				s.opacity._disabled;
			}
		},
		size: {
			large: (s) => {
				s.minHeight._large;
				s.paddingBlock.px(0);
				s.paddingInline._xlarge;
				s.fontSize._large;
			},
			medium: (s) => {
				s.minHeight._medium;
				s.paddingBlock.px(0);
				s.paddingInline._large;
				s.fontSize._medium;
			},
			small: (s) => {
				s.minHeight._small;
				s.paddingBlock.px(0);
				s.paddingInline._medium;
				s.fontSize._small;
			}
		},
		variant: {
			danger: (s) => {
				s.backgroundColor._danger;
				s.borderColor._danger;
				s.color._canvas;
				s._hover((hover) => hover.backgroundColor._danger);
			},
			ghost: (s) => {
				s.backgroundColor.transparent;
				s.borderColor.transparent;
				s.color._primary;
				s._hover((hover) => hover.backgroundColor._surface);
			},
			primary: (s) => {
				s.backgroundColor._primary;
				s.borderColor._primary;
				s.color._canvas;
				s._hover((hover) => hover.backgroundColor._primaryHover);
			},
			secondary: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.color._text;
				s._hover((hover) => hover.backgroundColor._canvas);
			}
		}
	},
	compoundVariants: [
		{
			style: (s) => s.backgroundColor._surface,
			when: { disabled: true, variant: 'ghost' }
		}
	],
	defaultVariants: {
		disabled: false,
		size: 'medium',
		variant: 'primary'
	}
});

registerRecipeHmr(import.meta, buttonRecipe);
