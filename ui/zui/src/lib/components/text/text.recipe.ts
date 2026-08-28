import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

export const textRecipe = defineRecipe({
	variants: {
		size: {
			large: (s) => s.fontSize._large,
			medium: (s) => s.fontSize._medium,
			small: (s) => s.fontSize._small,
			xlarge: (s) => s.fontSize._xlarge
		},
		tone: {
			danger: (s) => s.color._danger,
			default: (s) => s.color._text,
			muted: (s) => s.color._textMuted,
			primary: (s) => s.color._primary
		},
		truncate: {
			false: () => undefined,
			true: (s) => {
				s.overflow.hidden;
				s.textOverflow.ellipsis;
				s.whiteSpace.nowrap;
			}
		},
		weight: {
			bold: (s) => s.fontWeight._bold,
			medium: (s) => s.fontWeight._medium,
			normal: (s) => s.fontWeight._normal,
			semibold: (s) => s.fontWeight._semibold
		}
	},
	defaultVariants: {
		size: 'medium',
		tone: 'default',
		truncate: false,
		weight: 'normal'
	}
});

registerRecipeHmr(import.meta, textRecipe);
