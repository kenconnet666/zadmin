import type { ComponentProps } from 'svelte';
import ZScrollArea, {
	type ZScrollAreaController
} from '../src/components/layout/ZScrollArea.svelte';

const props = {
	axis: 'both',
	height: { base: 160, medium: '20rem' },
	scrollbarGutter: 'stable both-edges'
} satisfies ComponentProps<typeof ZScrollArea>;
void props;
// @ts-expect-error Axis has only the supported native scroll directions.
const invalidAxis = { axis: 'diagonal' } satisfies ComponentProps<typeof ZScrollArea>;
// @ts-expect-error CSS scrollbar width does not promise arbitrary pixel geometry.
const invalidScrollbar = { scrollbarWidth: 12 } satisfies ComponentProps<typeof ZScrollArea>;
void [invalidAxis, invalidScrollbar];
declare const controller: ZScrollAreaController;
controller.scrollTo({ top: 100, behavior: 'smooth' });
// @ts-expect-error Controller offsets retain native numeric CSSOM units.
controller.scrollBy({ left: '1rem' });
