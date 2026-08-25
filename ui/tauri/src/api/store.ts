import { load, type Store } from '@tauri-apps/plugin-store';

import type { DesktopAvailability } from '../runtime/environment.js';
import {
	captureDesktop,
	desktopError,
	desktopFail,
	unsupportedDesktop,
	type DesktopResult
} from '../runtime/error.js';

export type JsonPrimitive = boolean | null | number | string;
export type JsonValue =
	JsonPrimitive | { readonly [key: string]: JsonValue } | readonly JsonValue[];

export interface DesktopStoreApi {
	readonly availability: DesktopAvailability;
	readonly filename: string;
	clear(): Promise<DesktopResult<void>>;
	delete(key: string): Promise<DesktopResult<boolean>>;
	get(key: string): Promise<DesktopResult<JsonValue | null>>;
	has(key: string): Promise<DesktopResult<boolean>>;
	keys(): Promise<DesktopResult<string[]>>;
	save(): Promise<DesktopResult<void>>;
	set(key: string, value: JsonValue): Promise<DesktopResult<void>>;
}

export function isJsonValue(value: unknown): value is JsonValue {
	if (value === null || typeof value === 'boolean' || typeof value === 'string') return true;
	if (typeof value === 'number') return Number.isFinite(value);
	if (Array.isArray(value)) return value.every(isJsonValue);
	if (!value || typeof value !== 'object') return false;
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) return false;
	return Object.values(value).every(isJsonValue);
}

export function createStoreApi(
	availability: DesktopAvailability,
	filename: string
): DesktopStoreApi {
	let storePromise: Promise<Store> | undefined;
	const store = () => (storePromise ??= load(filename, { autoSave: false }));

	return {
		availability,
		filename,
		clear: () => captureDesktop('store.clear', async () => (await store()).clear()),
		delete: (key) => captureDesktop('store.delete', async () => (await store()).delete(key)),
		get: (key) =>
			captureDesktop('store.get', async () => {
				const value = await (await store()).get<unknown>(key);
				if (value === undefined) return null;
				if (!isJsonValue(value)) {
					throw desktopError(
						'transport-error',
						'store.get',
						`Stored value is not valid JSON: ${key}`
					);
				}
				return value;
			}),
		has: (key) => captureDesktop('store.has', async () => (await store()).has(key)),
		keys: () => captureDesktop('store.keys', async () => (await store()).keys()),
		save: () => captureDesktop('store.save', async () => (await store()).save()),
		async set(key, value) {
			if (!isJsonValue(value)) {
				return desktopFail(
					desktopError('invalid-input', 'store.set', 'Store values must be finite JSON values.')
				);
			}
			return captureDesktop('store.set', async () => (await store()).set(key, value));
		}
	};
}

export function createUnsupportedStoreApi(availability: DesktopAvailability): DesktopStoreApi {
	const unsupported = <T>(operation: string) =>
		unsupportedDesktop<T>(operation, availability.reason);
	return {
		availability,
		filename: 'settings.json',
		clear: () => unsupported('store.clear'),
		delete: () => unsupported('store.delete'),
		get: () => unsupported('store.get'),
		has: () => unsupported('store.has'),
		keys: () => unsupported('store.keys'),
		save: () => unsupported('store.save'),
		set: () => unsupported('store.set')
	};
}
