import type { ComponentProps } from 'svelte';
import ZGrid from '../src/components/layout/ZGrid.svelte';
import ZGridItem from '../src/components/layout/ZGridItem.svelte';
import ZStack from '../src/components/layout/ZStack.svelte';
import { createStyleProgram } from '../src/icss/builder.js';
import { defaultTheme } from '../src/theme/default.js';

const grid = {
	columns: { base: 1, medium: 12 },
	query: { container: 'cards' }
} satisfies ComponentProps<typeof ZGrid>;
const item = {
	span: { base: 'full', medium: 6 },
	start: { base: 'auto', medium: 2 }
} satisfies ComponentProps<typeof ZGridItem>;
const stack = {
	direction: { base: 'column', medium: 'row' },
	wrap: { base: true, large: 'reverse' }
} satisfies ComponentProps<typeof ZStack>;
void [grid, item, stack];
// @ts-expect-error Responsive keys use the shared theme breakpoint vocabulary.
const invalidGrid = { columns: { tiny: 2 } } satisfies ComponentProps<typeof ZGrid>;
// @ts-expect-error Layout spacing cannot use a component-specific theme token.
const invalidGap = { gap: 'switchInset' } satisfies ComponentProps<typeof ZStack>;
void [invalidGrid, invalidGap];
createStyleProgram(defaultTheme, (s) => {
	s._container({ name: 'cards', min: 'small' }, (s) => s.display.grid);
	// @ts-expect-error Container query still needs a typed breakpoint bound.
	s._container({ name: 'cards' }, () => undefined);
	// @ts-expect-error Unknown theme breakpoint is rejected by the ICSS type surface.
	s._container({ min: 'tiny' }, () => undefined);
});
