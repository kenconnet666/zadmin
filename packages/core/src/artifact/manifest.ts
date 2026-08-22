export const PLUGIN_PROTOCOL_VERSION = 2;

export interface PluginEntries {
	readonly server: string;
	readonly client?: string;
}

export interface PluginManifest {
	readonly protocol: typeof PLUGIN_PROTOCOL_VERSION;
	readonly id: string;
	readonly version: string;
	readonly displayName: string;
	readonly requiredTrust: 'trusted';
	readonly entries: PluginEntries;
	readonly requiresHost: Readonly<Record<string, string>>;
	readonly requires: Readonly<Record<string, string>>;
	readonly optional: Readonly<Record<string, string>>;
}

export class PluginManifestError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'PluginManifestError';
	}
}

export function parsePluginManifest(value: unknown, source = 'plugin manifest'): PluginManifest {
	const manifest = record(value, source);
	if (manifest.protocol !== PLUGIN_PROTOCOL_VERSION) {
		throw new PluginManifestError(
			`${source}: unsupported protocol ${String(manifest.protocol)}; expected ${PLUGIN_PROTOCOL_VERSION}.`
		);
	}
	const requiredTrust = string(manifest.requiredTrust, `${source}.requiredTrust`);
	if (requiredTrust !== 'trusted') {
		throw new PluginManifestError(`${source}: unsupported requiredTrust "${requiredTrust}".`);
	}
	const entries = record(manifest.entries, `${source}.entries`);
	const server = entryPath(entries.server, `${source}.entries.server`);
	const client =
		entries.client === undefined
			? undefined
			: entryPath(entries.client, `${source}.entries.client`);

	return Object.freeze({
		protocol: PLUGIN_PROTOCOL_VERSION,
		id: nonEmptyString(manifest.id, `${source}.id`),
		version: nonEmptyString(manifest.version, `${source}.version`),
		displayName: nonEmptyString(manifest.displayName, `${source}.displayName`),
		requiredTrust,
		entries: Object.freeze({ server, ...(client ? { client } : {}) }),
		requiresHost: stringRecord(manifest.requiresHost, `${source}.requiresHost`),
		requires: stringRecord(manifest.requires, `${source}.requires`),
		optional: stringRecord(manifest.optional ?? {}, `${source}.optional`)
	});
}

function record(value: unknown, path: string): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new PluginManifestError(`${path} must be an object.`);
	}
	return value as Record<string, unknown>;
}

function string(value: unknown, path: string): string {
	if (typeof value !== 'string') throw new PluginManifestError(`${path} must be a string.`);
	return value;
}

function nonEmptyString(value: unknown, path: string): string {
	const result = string(value, path).trim();
	if (!result) throw new PluginManifestError(`${path} must not be empty.`);
	return result;
}

function stringRecord(value: unknown, path: string): Readonly<Record<string, string>> {
	const source = record(value, path);
	const result: Record<string, string> = {};
	for (const [key, item] of Object.entries(source)) {
		if (!key.trim()) throw new PluginManifestError(`${path} contains an empty key.`);
		result[key] = nonEmptyString(item, `${path}.${key}`);
	}
	return Object.freeze(result);
}

function entryPath(value: unknown, path: string): string {
	const result = nonEmptyString(value, path);
	if (!result.startsWith('./') || result.includes('\\')) {
		throw new PluginManifestError(
			`${path} must be a forward-slash relative path starting with "./".`
		);
	}
	if (result.split('/').includes('..')) {
		throw new PluginManifestError(`${path} must not traverse outside the artifact.`);
	}
	return result;
}
