import type { DesktopError } from '../../platform/types.js';

export interface WindowControlsProps {
	readonly onerror?: (error: DesktopError) => void;
}
