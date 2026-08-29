import type { Snippet } from 'svelte';

import type { DesktopError } from '../../platform/types.js';

export interface WindowFrameProps {
	readonly children?: Snippet;
	readonly class?: string;
	readonly onerror?: (error: DesktopError) => void;
	readonly title?: string;
	readonly titlebar?: Snippet;
}
