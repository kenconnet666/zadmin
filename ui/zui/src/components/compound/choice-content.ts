import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

export const choiceGroupLabelRecipe = defineRecipe({
	base: (s) => {
		s.color._textMuted;
		s.fontSize._small;
		s.fontWeight._semibold;
		s.paddingBlock._small;
		s.paddingInline._medium;
	},
	variants: {},
	defaultVariants: {}
});

export const choiceStatusRecipe = defineRecipe({
	base: (s) => {
		s.color._textMuted;
		s.padding._large;
		s.textAlign.center;
	},
	variants: {},
	defaultVariants: {}
});

registerRecipeHmr(import.meta, choiceGroupLabelRecipe);
registerRecipeHmr(import.meta, choiceStatusRecipe);
