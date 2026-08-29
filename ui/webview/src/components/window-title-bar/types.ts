import type { Snippet } from 'svelte';

import type { DesktopError } from '../../platform/types.js';

export interface WindowTitleBarProps {
	readonly children?: Snippet;
	readonly onerror?: (error: DesktopError) => void;
	readonly title?: string;
}
