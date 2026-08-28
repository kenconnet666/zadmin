import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

export const stackRecipe = defineRecipe({
	base: (s) => s.display.flex,
	variants: {
		align: {
			baseline: (s) => s.alignItems.baseline,
			center: (s) => s.alignItems.center,
			end: (s) => s.alignItems.end,
			start: (s) => s.alignItems.start,
			stretch: (s) => s.alignItems.stretch
		},
		direction: {
			column: (s) => s.flexDirection.column,
			'column-reverse': (s) => s.flexDirection.columnReverse,
			row: (s) => s.flexDirection.row,
			'row-reverse': (s) => s.flexDirection.rowReverse
		},
		gap: {
			large: (s) => s.gap._large,
			medium: (s) => s.gap._medium,
			none: (s) => s.gap._none,
			small: (s) => s.gap._small,
			xlarge: (s) => s.gap._xlarge,
			xsmall: (s) => s.gap._xsmall
		},
		justify: {
			around: (s) => s.justifyContent.spaceAround,
			between: (s) => s.justifyContent.spaceBetween,
			center: (s) => s.justifyContent.center,
			end: (s) => s.justifyContent.end,
			evenly: (s) => s.justifyContent.spaceEvenly,
			start: (s) => s.justifyContent.start
		},
		wrap: {
			false: (s) => s.flexWrap.nowrap,
			true: (s) => s.flexWrap.wrap
		}
	},
	defaultVariants: {
		align: 'stretch',
		direction: 'column',
		gap: 'none',
		justify: 'start',
		wrap: false
	}
});

registerRecipeHmr(import.meta, stackRecipe);
