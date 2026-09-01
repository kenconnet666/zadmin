import type { ComponentProps } from 'svelte';

import { default as ZLink, type ZLinkProps } from '../src/components/gene/ZLink.svelte';

const valid = {
	external: true,
	href: 'https://example.com',
	target: '_blank'
} satisfies ComponentProps<typeof ZLink> satisfies ZLinkProps;
void valid;

// @ts-expect-error href is the required semantic boundary of ZLink.
const missingHref = { external: true } satisfies ComponentProps<typeof ZLink>;
void missingHref;
