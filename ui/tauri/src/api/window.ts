import { currentMonitor, getCurrentWindow, type Monitor, type Theme } from '@tauri-apps/api/window';

import { createDesktopResourceHandle, type DesktopResourceHandle } from '../runtime/context.js';
import type { DesktopAvailability } from '../runtime/environment.js';
import {
	captureDesktop,
	desktopError,
	desktopFail,
	unsupportedDesktop,
	type DesktopResult
} from '../runtime/error.js';
import { isConfirmedDesktopAction, type ConfirmedDesktopAction } from '../runtime/scope.js';

export interface DesktopPoint {
	readonly x: number;
	readonly y: number;
}

export interface DesktopSize {
	readonly height: number;
	readonly width: number;
}

export interface DesktopMonitor {
	readonly name: string | null;
	readonly position: DesktopPoint;
	readonly scaleFactor: number;
	readonly size: DesktopSize;
	readonly workArea: {
		readonly position: DesktopPoint;
		readonly size: DesktopSize;
	};
}

export interface DesktopWindowSnapshot {
	readonly focused: boolean;
	readonly maximized: boolean;
	readonly monitor: DesktopMonitor | null;
	readonly scaleFactor: number;
	readonly theme: Theme | null;
}

export interface DesktopWindowApi {
	readonly availability: DesktopAvailability;
	close(action: ConfirmedDesktopAction): Promise<DesktopResult<void>>;
	listen(
		listener: (snapshot: DesktopWindowSnapshot) => void
	): Promise<DesktopResult<DesktopResourceHandle>>;
	maximize(): Promise<DesktopResult<void>>;
	minimize(): Promise<DesktopResult<void>>;
	restore(): Promise<DesktopResult<void>>;
	snapshot(): Promise<DesktopResult<DesktopWindowSnapshot>>;
	startDragging(): Promise<DesktopResult<void>>;
	toggleMaximize(): Promise<DesktopResult<void>>;
}

function mapMonitor(monitor: Monitor | null): DesktopMonitor | null {
	if (!monitor) return null;
	return {
		name: monitor.name,
		position: { x: monitor.position.x, y: monitor.position.y },
		scaleFactor: monitor.scaleFactor,
		size: { height: monitor.size.height, width: monitor.size.width },
		workArea: {
			position: { x: monitor.workArea.position.x, y: monitor.workArea.position.y },
			size: { height: monitor.workArea.size.height, width: monitor.workArea.size.width }
		}
	};
}

async function readWindowSnapshot(): Promise<DesktopWindowSnapshot> {
	const current = getCurrentWindow();
	const [focused, maximized, monitor, scaleFactor, theme] = await Promise.all([
		current.isFocused(),
		current.isMaximized(),
		currentMonitor(),
		current.scaleFactor(),
		current.theme()
	]);
	return { focused, maximized, monitor: mapMonitor(monitor), scaleFactor, theme };
}

export function createWindowApi(availability: DesktopAvailability): DesktopWindowApi {
	const api: DesktopWindowApi = {
		availability,
		async close(action) {
			if (!isConfirmedDesktopAction(action)) {
				return desktopFail(
					desktopError('invalid-input', 'window.close', 'A confirmed user action is required.')
				);
			}
			return captureDesktop('window.close', () => getCurrentWindow().close());
		},
		listen: (listener) =>
			captureDesktop('window.listen', async () => {
				let disposed = false;
				const notify = async () => {
					if (disposed) return;
					const result = await api.snapshot();
					if (result.ok && !disposed) listener(result.value);
				};
				const current = getCurrentWindow();
				const [unfocus, unresize] = await Promise.all([
					current.onFocusChanged(() => void notify()),
					current.onResized(() => void notify())
				]);
				return createDesktopResourceHandle(() => {
					disposed = true;
					unfocus();
					unresize();
				});
			}),
		maximize: () => captureDesktop('window.maximize', () => getCurrentWindow().maximize()),
		minimize: () => captureDesktop('window.minimize', () => getCurrentWindow().minimize()),
		restore: () => captureDesktop('window.restore', () => getCurrentWindow().unmaximize()),
		snapshot: () => captureDesktop('window.snapshot', readWindowSnapshot),
		startDragging: () =>
			captureDesktop('window.startDragging', () => getCurrentWindow().startDragging()),
		toggleMaximize: () =>
			captureDesktop('window.toggleMaximize', () => getCurrentWindow().toggleMaximize())
	};
	return api;
}

export function createUnsupportedWindowApi(availability: DesktopAvailability): DesktopWindowApi {
	const unsupported = <T>(operation: string) =>
		unsupportedDesktop<T>(operation, availability.reason);
	return {
		availability,
		close: () => unsupported('window.close'),
		listen: () => unsupported('window.listen'),
		maximize: () => unsupported('window.maximize'),
		minimize: () => unsupported('window.minimize'),
		restore: () => unsupported('window.restore'),
		snapshot: () => unsupported('window.snapshot'),
		startDragging: () => unsupported('window.startDragging'),
		toggleMaximize: () => unsupported('window.toggleMaximize')
	};
}
