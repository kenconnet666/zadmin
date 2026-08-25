import type { DesktopAppSnapshot } from '../api/app.js';
import type { DesktopOsSnapshot } from '../api/os.js';
import type { DesktopWindowSnapshot } from '../api/window.js';

export type DesktopClipboardMode = 'clear' | 'read' | 'write';
export type DesktopFilePickerMode = 'directory' | 'file' | 'save';
export type DesktopFileSelection = string | string[] | null;

export interface DesktopSystemInfo {
	readonly app: DesktopAppSnapshot;
	readonly os: DesktopOsSnapshot;
	readonly window: DesktopWindowSnapshot;
}
