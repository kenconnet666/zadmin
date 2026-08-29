import type { Snippet } from 'svelte';
import type { ZButtonProps } from '@zadmin/zui';

import type { DesktopError } from '../../platform/types.js';

export type DesktopClipboardMode = 'clear' | 'read' | 'write';
export type ClipboardButtonProps = Omit<ZButtonProps, 'children' | 'onclick' | 'onerror'> & {
	readonly children?: Snippet;
	readonly label?: string;
	readonly mode?: DesktopClipboardMode;
	readonly onerror?: (error: DesktopError) => void;
	readonly onread?: (text: string) => void;
	readonly onsuccess?: () => void;
	readonly text?: string;
};
