import type { Snippet } from 'svelte';

import type { DesktopPlatform } from '../../platform/types.js';

export interface DesktopProviderProps {
	readonly children?: Snippet;
	readonly platform: DesktopPlatform;
}
