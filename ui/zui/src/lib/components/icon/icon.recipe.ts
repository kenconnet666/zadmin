import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

export const iconRecipe = defineRecipe({
	base: (s) => {
		s.display.inlineBlock;
		s.flexShrink(0);
		s.verticalAlign.middle;
	},
	variants: {
		size: {
			full: (s) => {
				s.width._full;
				s.height._full;
			},
			large: (s) => {
				s.width._large;
				s.height._large;
			},
			medium: (s) => {
				s.width._medium;
				s.height._medium;
			},
			small: (s) => {
				s.width._small;
				s.height._small;
			}
		}
	},
	defaultVariants: { size: 'small' }
});

registerRecipeHmr(import.meta, iconRecipe);
