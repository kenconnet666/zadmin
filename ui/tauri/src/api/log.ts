import {
	attachLogger,
	debug,
	error,
	info,
	trace,
	warn,
	type LogLevel,
	type LogOptions
} from '@tauri-apps/plugin-log';

import { createDesktopResourceHandle, type DesktopResourceHandle } from '../runtime/context.js';
import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export type { LogLevel, LogOptions } from '@tauri-apps/plugin-log';

export interface DesktopLogRecord {
	readonly level: LogLevel;
	readonly message: string;
}

export interface DesktopLogApi {
	readonly availability: DesktopAvailability;
	attach(
		listener: (record: DesktopLogRecord) => void
	): Promise<DesktopResult<DesktopResourceHandle>>;
	debug(message: string, options?: LogOptions): Promise<DesktopResult<void>>;
	error(message: string, options?: LogOptions): Promise<DesktopResult<void>>;
	info(message: string, options?: LogOptions): Promise<DesktopResult<void>>;
	trace(message: string, options?: LogOptions): Promise<DesktopResult<void>>;
	warn(message: string, options?: LogOptions): Promise<DesktopResult<void>>;
}

export function createLogApi(availability: DesktopAvailability): DesktopLogApi {
	return {
		availability,
		attach: (listener) =>
			captureDesktop('log.attach', async () => {
				const unlisten = await attachLogger((record) => listener(record));
				return createDesktopResourceHandle(unlisten);
			}),
		debug: (message, options) => captureDesktop('log.debug', () => debug(message, options)),
		error: (message, options) => captureDesktop('log.error', () => error(message, options)),
		info: (message, options) => captureDesktop('log.info', () => info(message, options)),
		trace: (message, options) => captureDesktop('log.trace', () => trace(message, options)),
		warn: (message, options) => captureDesktop('log.warn', () => warn(message, options))
	};
}

export function createUnsupportedLogApi(availability: DesktopAvailability): DesktopLogApi {
	const unsupported = <T>(operation: string) =>
		unsupportedDesktop<T>(operation, availability.reason);
	return {
		availability,
		attach: () => unsupported('log.attach'),
		debug: () => unsupported('log.debug'),
		error: () => unsupported('log.error'),
		info: () => unsupported('log.info'),
		trace: () => unsupported('log.trace'),
		warn: () => unsupported('log.warn')
	};
}
