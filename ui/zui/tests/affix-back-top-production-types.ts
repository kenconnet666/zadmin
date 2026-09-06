import type { ComponentProps, Snippet } from 'svelte';

import ZAffix, { type ZAffixProps } from '../src/components/layout/ZAffix.svelte';
import ZBackTop, { type ZBackTopProps } from '../src/components/navigation/ZBackTop.svelte';

const children = (() => undefined) as unknown as Snippet;
const affix = {
	boundary: null,
	children,
	offsetBottom: 16,
	onAffixChange: (affixed: boolean) => void affixed,
	portalTarget: null,
	scrollContainer: null
} satisfies ComponentProps<typeof ZAffix> satisfies ZAffixProps;
const backTop = {
	behavior: 'instant',
	children,
	insetBlockEnd: 'large',
	insetInline: 24,
	label: 'Return to top',
	placement: 'start',
	scrollContainer: null,
	shape: 'square',
	size: 'xlarge',
	tone: 'info',
	variant: 'outline',
	visibilityHeight: 200
} satisfies ComponentProps<typeof ZBackTop> satisfies ZBackTopProps;

// @ts-expect-error Affix offsets are physical pixel numbers.
const invalidOffset = { offsetTop: 'small' } satisfies ZAffixProps;
// @ts-expect-error BackTop placement is a logical closed axis.
const invalidPlacement = { placement: 'left' } satisfies ZBackTopProps;
// @ts-expect-error BackTop inset uses Theme spacing names or numbers.
const invalidInset = { insetInline: 'wide' } satisfies ZBackTopProps;
// @ts-expect-error BackTop size reuses the closed five-size Button contract.
const invalidSize = { size: 'giant' } satisfies ZBackTopProps;

void [affix, backTop, invalidOffset, invalidPlacement, invalidInset, invalidSize];
