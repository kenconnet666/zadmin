import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';

import type { DesktopError } from '../../platform/types.js';

export type ExternalLinkProps = Omit<
	HTMLAnchorAttributes,
	'children' | 'href' | 'onclick' | 'onerror'
> & {
	readonly children?: Snippet;
	readonly href: string;
	readonly onerror?: (error: DesktopError) => void;
};
