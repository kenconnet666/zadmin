import type { ComponentProps } from 'svelte';

import {
	default as ZAppShell,
	type ZAppShellProps
} from '../src/components/layout/ZAppShell.svelte';

const responsive = {
	asideCollapsed: { base: true, large: false },
	headerHeight: { base: 48, medium: '4rem' },
	mainAs: 'div',
	navbarCollapsed: { base: true, medium: false },
	navbarWidth: { base: 0, medium: '14rem' },
	scroll: 'main'
} satisfies ComponentProps<typeof ZAppShell> satisfies ZAppShellProps;
void responsive;

// @ts-expect-error Nested landmark handling is explicit and only main or div is accepted.
const invalidMainAs = { mainAs: 'section' } satisfies ComponentProps<typeof ZAppShell>;
void invalidMainAs;

// @ts-expect-error Collapse is a responsive boolean boundary.
const invalidCollapsed = { navbarCollapsed: 'mobile' } satisfies ComponentProps<typeof ZAppShell>;
void invalidCollapsed;
