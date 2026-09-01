import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';

/** Shared viewport sizing for every Popover-backed Menu surface. */
export const menuPopupContentRecipe = defineRecipe({
	base: (s) => {
		s.maxHeight.raw('var(--zui-floating-available-height)');
		s.maxWidth.raw('var(--zui-floating-available-width)');
		s.overflowY.auto;
	},
	variants: {},
	defaultVariants: {}
});

registerRecipeHmr(import.meta, menuPopupContentRecipe);
