import type { Snippet } from 'svelte';
import type { ZButtonProps } from '@zadmin/zui';

import type { DesktopError } from '../../platform/types.js';

export type DesktopFilePickerMode = 'directory' | 'file' | 'save';
export type DesktopFileSelection = string | readonly string[] | null;
export type FilePickerButtonProps = Omit<
	ZButtonProps,
	'children' | 'onclick' | 'onerror' | 'onselect'
> & {
	readonly children?: Snippet;
	readonly label?: string;
	readonly mode?: DesktopFilePickerMode;
	readonly multiple?: boolean;
	readonly onerror?: (error: DesktopError) => void;
	readonly onselect?: (selection: DesktopFileSelection) => void;
};
