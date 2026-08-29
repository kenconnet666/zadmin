import type { Snippet } from 'svelte';
import type { ZButtonProps } from '@zadmin/zui';

import type {
	DesktopError,
	NotificationOptions,
	NotificationPermissionValue
} from '../../platform/types.js';

export type NotificationButtonProps = Omit<ZButtonProps, 'children' | 'onclick' | 'onerror'> & {
	readonly children?: Snippet;
	readonly label?: string;
	readonly notification: NotificationOptions;
	readonly onerror?: (error: DesktopError) => void;
	readonly onpermission?: (permission: NotificationPermissionValue) => void;
	readonly onsuccess?: () => void;
};
