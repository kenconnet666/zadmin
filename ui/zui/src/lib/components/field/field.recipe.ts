import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

export const fieldRecipe = defineSlotRecipe({
	slots: ['root', 'label', 'control', 'description', 'error'] as const,
	base: {
		control: () => undefined,
		description: (s) => s.color._textMuted,
		error: (s) => s.color._danger,
		label: (s) => s.fontWeight._medium,
		root: (s) => s.display.grid
	},
	variants: {
		invalid: {
			false: {},
			true: { control: (s) => s.borderColor._danger }
		},
		size: {
			medium: { root: (s) => s.gap._small },
			small: { root: (s) => s.gap._xsmall }
		}
	},
	defaultVariants: { invalid: false, size: 'medium' }
});

registerSlotRecipeHmr(import.meta, fieldRecipe);
