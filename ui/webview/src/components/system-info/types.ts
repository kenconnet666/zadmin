import type {
	AppSnapshot,
	DesktopError,
	OsSnapshot,
	WindowSnapshot
} from '../../platform/types.js';

export interface DesktopSystemInfo {
	readonly app: AppSnapshot;
	readonly os: OsSnapshot;
	readonly window: WindowSnapshot;
}

export interface SystemInfoProps {
	readonly onerror?: (error: DesktopError) => void;
	readonly onload?: (info: DesktopSystemInfo) => void;
	readonly title?: string;
}
