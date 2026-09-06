import type { ComponentProps, Snippet } from 'svelte';

import ZMenubar, { type ZMenubarProps } from '../src/components/compound/menubar/ZMenubar.svelte';
import type { ZMenubarMenuProps } from '../src/components/compound/menubar/ZMenubarMenu.svelte';
import type { ZMenubarTriggerProps } from '../src/components/compound/menubar/ZMenubarTrigger.svelte';
import type { ZMenubarContentProps } from '../src/components/compound/menubar/ZMenubarContent.svelte';

const children = (() => undefined) as unknown as Snippet;
const root = {
	'aria-label': 'Application commands',
	children,
	defaultValue: 'file',
	disabled: false,
	gap: 'small',
	loop: false,
	onValueChange: (value: string | number | null) => void value,
	size: 'xlarge',
	value: 1
} satisfies ComponentProps<typeof ZMenubar> satisfies ZMenubarProps;
const menu = { children, disabled: false, value: 1 } satisfies ZMenubarMenuProps;
const trigger = { children, variant: 'ghost' } satisfies ZMenubarTriggerProps;
const content = { children, loop: false, size: 'small' } satisfies ZMenubarContentProps;

// @ts-expect-error Menubar open identity excludes booleans.
const invalidValue = { 'aria-label': 'Invalid', value: true } satisfies ZMenubarProps;
// @ts-expect-error A Menu requires a stable selection key.
const missingMenuValue = { children } satisfies ZMenubarMenuProps;
// @ts-expect-error Root size is the closed five-control-size contract.
const invalidSize = { 'aria-label': 'Invalid', size: 'giant' } satisfies ZMenubarProps;
// @ts-expect-error MenubarTrigger owns its menuitem role.
const invalidRole = { children, role: 'button' } satisfies ZMenubarTriggerProps;

void [root, menu, trigger, content, invalidValue, missingMenuValue, invalidSize, invalidRole];
