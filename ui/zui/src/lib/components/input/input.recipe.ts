import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

export const inputRecipe = defineRecipe({
	base: (s) => {
		s.appearance.none;
		s.width._full;
		s.borderWidth._hairline;
		s.borderStyle.solid;
		s.borderRadius._medium;
		s.backgroundColor._canvas;
		s.color._text;
		s.transitionDuration._fast;
		s.transitionProperty.raw('border-color, box-shadow');
		s.transitionTimingFunction.ease;
		s._selector('&::placeholder', (placeholder) => placeholder.color._textMuted);
		s._focusVisible((focus) => {
			// This composed focus ring intentionally follows the current text color.
			focus.outline.raw('2px solid currentColor');
			focus.outlineOffset.px(2);
		});
	},
	variants: {
		invalid: {
			false: (s) => s.borderColor._border,
			true: (s) => s.borderColor._danger
		},
		size: {
			large: (s) => {
				s.minHeight._large;
				s.paddingInline._xlarge;
				s.fontSize._large;
			},
			medium: (s) => {
				s.minHeight._medium;
				s.paddingInline._large;
				s.fontSize._medium;
			},
			small: (s) => {
				s.minHeight._small;
				s.paddingInline._medium;
				s.fontSize._small;
			}
		}
	},
	defaultVariants: { invalid: false, size: 'medium' }
});

registerRecipeHmr(import.meta, inputRecipe);
