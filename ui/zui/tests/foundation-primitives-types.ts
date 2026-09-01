import type { ComponentProps } from 'svelte';

import ZAspectRatio, { type ZAspectRatioProps } from '../src/components/layout/ZAspectRatio.svelte';
import ZContainer, { type ZContainerProps } from '../src/components/layout/ZContainer.svelte';
import ZKbd, { type ZKbdProps } from '../src/components/gene/ZKbd.svelte';
import ZSeparator, { type ZSeparatorProps } from '../src/components/gene/ZSeparator.svelte';
import ZVisuallyHidden, {
	type ZVisuallyHiddenProps
} from '../src/components/gene/ZVisuallyHidden.svelte';

const separator = {
	decorative: false,
	label: 'Boundary',
	orientation: 'vertical'
} satisfies ComponentProps<typeof ZSeparator> satisfies ZSeparatorProps;
const hidden = { role: 'status' } satisfies ComponentProps<
	typeof ZVisuallyHidden
> satisfies ZVisuallyHiddenProps;
const kbd = { 'aria-label': 'Command' } satisfies ComponentProps<typeof ZKbd> satisfies ZKbdProps;
const ratio = { ratio: '16 / 9' } satisfies ComponentProps<
	typeof ZAspectRatio
> satisfies ZAspectRatioProps;
const container = { gutter: 'none', size: 'full' } satisfies ComponentProps<
	typeof ZContainer
> satisfies ZContainerProps;

// @ts-expect-error focusable mode is intentionally absent
const invalidHidden = { focusable: true } satisfies ZVisuallyHiddenProps;
// @ts-expect-error Container does not duplicate Grid columns
const invalidContainer = { columns: 12 } satisfies ZContainerProps;
// @ts-expect-error AspectRatio values are numeric or width / height strings
const invalidRatio = { ratio: 'wide' } satisfies ZAspectRatioProps;

void separator;
void hidden;
void kbd;
void ratio;
void container;
void invalidHidden;
void invalidContainer;
void invalidRatio;
