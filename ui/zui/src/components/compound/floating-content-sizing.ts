import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

/** Shared viewport and intrinsic-width contract for picker-like floating content. */
export const floatingContentSizingRecipe = defineRecipe({
	base: (s) => {
		s.maxHeight.raw('var(--zui-floating-available-height, none)');
		s.overflowY.auto;
	},
	variants: {
		intrinsicWidth: {
			false: () => undefined,
			true: (s) => {
				s.inlineSize.raw('max-content');
				s.minInlineSize.raw(
					'min(var(--zui-floating-reference-width, 0px), var(--zui-floating-available-width, 100vw))'
				);
				s.maxInlineSize.raw('var(--zui-floating-available-width, 100vw)');
			}
		}
	},
	defaultVariants: { intrinsicWidth: false }
});

registerRecipeHmr(import.meta, floatingContentSizingRecipe);
