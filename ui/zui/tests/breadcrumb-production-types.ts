import type { ComponentProps } from 'svelte';

import {
	default as ZBreadcrumb,
	type BreadcrumbItem,
	type ZBreadcrumbProps
} from '../src/components/navigation/ZBreadcrumb.svelte';

const validItems = [
	{ href: '/workspace', key: 1, label: 'Workspace' },
	{ current: true, key: 'details', label: 'Details' }
] satisfies readonly BreadcrumbItem[];

const valid = { items: validItems } satisfies ComponentProps<
	typeof ZBreadcrumb
> satisfies ZBreadcrumbProps;
void valid;

// @ts-expect-error A breadcrumb item needs a stable typed key.
const missingKey = [{ current: true, label: 'Details' }] satisfies readonly BreadcrumbItem[];
void missingKey;

const invalidLabel = [
	// @ts-expect-error A breadcrumb label is always text; use item snippet for rich content.
	{ current: true, key: 'details', label: 42 }
] satisfies readonly BreadcrumbItem[];
void invalidLabel;
