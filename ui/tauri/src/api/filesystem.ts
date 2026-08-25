import {
	exists,
	mkdir,
	readDir,
	readTextFile,
	remove,
	stat,
	watch,
	writeTextFile,
	type DebouncedWatchOptions,
	type DirEntry,
	type ExistsOptions,
	type FileInfo,
	type MkdirOptions,
	type ReadDirOptions,
	type ReadFileOptions,
	type RemoveOptions,
	type StatOptions,
	type WatchEvent,
	type WriteFileOptions
} from '@tauri-apps/plugin-fs';

import { createDesktopResourceHandle, type DesktopResourceHandle } from '../runtime/context.js';
import type { DesktopAvailability } from '../runtime/environment.js';
import { captureDesktop, unsupportedDesktop, type DesktopResult } from '../runtime/error.js';

export { BaseDirectory } from '@tauri-apps/api/path';
export type {
	DebouncedWatchOptions,
	DirEntry,
	ExistsOptions,
	FileInfo,
	MkdirOptions,
	ReadDirOptions,
	ReadFileOptions,
	RemoveOptions,
	StatOptions,
	WatchEvent,
	WriteFileOptions
} from '@tauri-apps/plugin-fs';

export interface DesktopFilesystemApi {
	readonly availability: DesktopAvailability;
	exists(path: string | URL, options?: ExistsOptions): Promise<DesktopResult<boolean>>;
	mkdir(path: string | URL, options?: MkdirOptions): Promise<DesktopResult<void>>;
	readDir(path: string | URL, options?: ReadDirOptions): Promise<DesktopResult<DirEntry[]>>;
	readText(path: string | URL, options?: ReadFileOptions): Promise<DesktopResult<string>>;
	remove(path: string | URL, options?: RemoveOptions): Promise<DesktopResult<void>>;
	stat(path: string | URL, options?: StatOptions): Promise<DesktopResult<FileInfo>>;
	watch(
		paths: string | string[] | URL | URL[],
		listener: (event: WatchEvent) => void,
		options?: DebouncedWatchOptions
	): Promise<DesktopResult<DesktopResourceHandle>>;
	writeText(
		path: string | URL,
		contents: string,
		options?: WriteFileOptions
	): Promise<DesktopResult<void>>;
}

export function createFilesystemApi(availability: DesktopAvailability): DesktopFilesystemApi {
	return {
		availability,
		exists: (path, options) => captureDesktop('filesystem.exists', () => exists(path, options)),
		mkdir: (path, options) => captureDesktop('filesystem.mkdir', () => mkdir(path, options)),
		readDir: (path, options) => captureDesktop('filesystem.readDir', () => readDir(path, options)),
		readText: (path, options) =>
			captureDesktop('filesystem.readText', () => readTextFile(path, options)),
		remove: (path, options) => captureDesktop('filesystem.remove', () => remove(path, options)),
		stat: (path, options) => captureDesktop('filesystem.stat', () => stat(path, options)),
		watch: (paths, listener, options) =>
			captureDesktop('filesystem.watch', async () => {
				const unwatch = await watch(paths, listener, options);
				return createDesktopResourceHandle(unwatch);
			}),
		writeText: (path, contents, options) =>
			captureDesktop('filesystem.writeText', () => writeTextFile(path, contents, options))
	};
}

export function createUnsupportedFilesystemApi(
	availability: DesktopAvailability
): DesktopFilesystemApi {
	const unsupported = <T>(operation: string) =>
		unsupportedDesktop<T>(operation, availability.reason);
	return {
		availability,
		exists: () => unsupported('filesystem.exists'),
		mkdir: () => unsupported('filesystem.mkdir'),
		readDir: () => unsupported('filesystem.readDir'),
		readText: () => unsupported('filesystem.readText'),
		remove: () => unsupported('filesystem.remove'),
		stat: () => unsupported('filesystem.stat'),
		watch: () => unsupported('filesystem.watch'),
		writeText: () => unsupported('filesystem.writeText')
	};
}
