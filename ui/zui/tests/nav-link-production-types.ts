import { createRawSnippet, type ComponentProps } from 'svelte';

import ZNavLink, {
	type NavLinkIndicator,
	type NavLinkVariant,
	type ZNavLinkProps
} from '../src/components/navigation/ZNavLink.svelte';

const link = {
	active: true,
	compact: false,
	contentId: 'products-panel',
	description: 'Browse products',
	disclosureId: 'products-disclosure',
	disclosureLabel: 'Toggle products',
	expanded: false,
	href: '/products',
	label: 'Products',
	labelContent: createRawSnippet(() => ({ render: () => '<span>Products</span>' })),
	onExpandedChange: (expanded: boolean) => void expanded,
	target: '_blank',
	tone: 'info',
	variant: 'outline'
} satisfies ComponentProps<typeof ZNavLink> satisfies ZNavLinkProps;
const button = {
	disclosureId: 'settings-disclosure',
	expanded: true,
	label: 'Settings',
	onExpandedChange: (expanded: boolean) => void expanded
} satisfies ZNavLinkProps;
const passive = { label: 'Administration' } satisfies ZNavLinkProps;
const variant: NavLinkVariant = 'solid';
const indicator: NavLinkIndicator = 'end';

// @ts-expect-error A full nav row always requires its accessible visible label.
const missingLabel = { href: '/products' } satisfies ZNavLinkProps;
// @ts-expect-error Variant follows the existing subtle, solid and outline vocabulary.
const invalidVariant = { label: 'Products', variant: 'outlined' } satisfies ZNavLinkProps;
// @ts-expect-error The active indicator has only logical start, end or none positions.
const invalidIndicator = { indicator: 'left', label: 'Products' } satisfies ZNavLinkProps;
// @ts-expect-error Navigation rows share the closed five-control-size contract.
const invalidSize = { label: 'Products', size: 'giant' } satisfies ZNavLinkProps;
// @ts-expect-error Nested content belongs to NavigationMenu rather than NavLink.
const nested = { children: () => undefined, label: 'Products' } satisfies ZNavLinkProps;

void [
	link,
	button,
	passive,
	variant,
	indicator,
	missingLabel,
	invalidVariant,
	invalidIndicator,
	invalidSize,
	nested
];
