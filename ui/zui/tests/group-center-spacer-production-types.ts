import type { ComponentProps } from 'svelte';

import { default as ZCenter, type ZCenterProps } from '../src/components/layout/ZCenter.svelte';
import { default as ZGroup, type ZGroupProps } from '../src/components/layout/ZGroup.svelte';
import { default as ZSpacer, type ZSpacerProps } from '../src/components/layout/ZSpacer.svelte';

const group = {
	align: { base: 'stretch', medium: 'center' },
	gap: { base: 'small', medium: 'large' },
	itemSizing: 'grow',
	wrap: { base: false, medium: true }
} satisfies ComponentProps<typeof ZGroup> satisfies ZGroupProps;
const center = { inline: true } satisfies ComponentProps<typeof ZCenter> satisfies ZCenterProps;
const spacer = {
	blockSize: { base: 'none', medium: 16 },
	inlineSize: { base: 'small', medium: '2rem' }
} satisfies ComponentProps<typeof ZSpacer> satisfies ZSpacerProps;
void group;
void center;
void spacer;

// @ts-expect-error Group direct-child sizing is a closed visual axis.
const invalidItemSizing = { itemSizing: 'distributed' } satisfies ComponentProps<typeof ZGroup>;
void invalidItemSizing;

// @ts-expect-error Spacer dimensions are lengths, not booleans.
const invalidSpacer = { inlineSize: true } satisfies ComponentProps<typeof ZSpacer>;
void invalidSpacer;
// @ts-expect-error A spacer is empty space; content belongs in Box, Group or another layout component.
const spacerContent = { children: () => {} } satisfies ComponentProps<typeof ZSpacer>;
void spacerContent;
