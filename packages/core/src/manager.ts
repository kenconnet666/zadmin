import type { PluginArtifact } from './artifact.ts';
import { defineApp } from './definition.ts';
import type { AnyPluginDefinition, AppDefinition, LoadedPlugin, PluginDisposer } from './types.ts';
import { PluginRuntime } from './runtime.ts';
import { satisfies } from 'semver';

const nativeImport = Function('url', 'return import(url)') as (
	url: string
) => Promise<Record<string, unknown>>;

export interface PluginManagerOptions {
	readonly importModule?: (url: string) => Promise<Record<string, unknown>>;
	readonly hostVersions?: Readonly<Record<string, string>>;
}

export interface PluginManagerEvent {
	readonly type: 'reconciled' | 'failed';
	readonly artifacts: readonly PluginArtifact[];
	readonly error?: unknown;
}

export class PluginManager {
	readonly #runtime: PluginRuntime;
	readonly #appId: string;
	readonly #importModule: (url: string) => Promise<Record<string, unknown>>;
	readonly #hostVersions: Readonly<Record<string, string>>;
	readonly #listeners = new Set<(event: PluginManagerEvent) => void>();
	#currentApp: AppDefinition;
	#artifacts: readonly PluginArtifact[] = Object.freeze([]);
	#operation: Promise<void> = Promise.resolve();

	constructor(runtime: PluginRuntime, appId: string, options: PluginManagerOptions = {}) {
		this.#runtime = runtime;
		this.#appId = appId;
		this.#importModule = options.importModule ?? nativeImport;
		this.#hostVersions = Object.freeze({ ...(options.hostVersions ?? {}) });
		this.#currentApp = defineApp({ id: appId, plugins: [] });
	}

	get artifacts(): readonly PluginArtifact[] {
		return this.#artifacts;
	}

	onEvent(listener: (event: PluginManagerEvent) => void): PluginDisposer {
		this.#listeners.add(listener);
		return () => {
			this.#listeners.delete(listener);
		};
	}

	reconcile(artifacts: readonly PluginArtifact[]): Promise<void> {
		const snapshot = Object.freeze([...artifacts]);
		const next = this.#operation.then(() => this.#reconcile(snapshot));
		this.#operation = next.catch(() => undefined);
		return next;
	}

	async dispose(): Promise<void> {
		await this.reconcile([]);
		this.#listeners.clear();
	}

	async #reconcile(artifacts: readonly PluginArtifact[]): Promise<void> {
		if (sameArtifacts(artifacts, this.#artifacts)) return;
		const previousApp = this.#currentApp;
		const previousArtifacts = this.#artifacts;
		try {
			this.#validateArtifactSet(artifacts);
			const plugins = await Promise.all(
				artifacts.map((artifact) => loadPlugin(artifact, this.#importModule))
			);
			const candidate = defineApp({ id: this.#appId, plugins });
			await this.#runtime.reconcile(candidate);
			const failed = this.#runtime.snapshot.plugins.filter(
				(plugin) => plugin.state === 'failed' || plugin.state === 'waiting'
			);
			if (failed.length) {
				throw new AggregateError(
					failed.map((plugin) => plugin.error ?? new Error(`${plugin.id} is ${plugin.state}.`)),
					`Plugin revision activation failed: ${failed.map(({ id }) => id).join(', ')}.`
				);
			}
			this.#currentApp = candidate;
			this.#artifacts = artifacts;
			this.#emit({ type: 'reconciled', artifacts });
		} catch (error) {
			await this.#runtime.reconcile(previousApp);
			this.#currentApp = previousApp;
			this.#artifacts = previousArtifacts;
			this.#emit({ type: 'failed', artifacts, error });
			throw error;
		}
	}

	#validateArtifactSet(artifacts: readonly PluginArtifact[]): void {
		const versions = new Map(
			this.#runtime.snapshot.providers
				.filter(({ owner }) => owner === 'host')
				.map(({ id, version }) => [id, version])
		);
		for (const artifact of artifacts) {
			if (versions.has(artifact.id))
				throw new Error(`${artifact.id}: provider id conflicts with Host.`);
			versions.set(artifact.id, artifact.version);
		}
		if (
			versions.size !==
			artifacts.length +
				this.#runtime.snapshot.providers.filter(({ owner }) => owner === 'host').length
		) {
			throw new Error('Duplicate plugin artifact id.');
		}
		for (const artifact of artifacts) {
			for (const [id, range] of Object.entries(artifact.manifest.requiresHost)) {
				assertVersion(artifact.id, id, this.#hostVersions[id], range, true);
			}
			for (const [id, range] of Object.entries(artifact.manifest.requires)) {
				assertVersion(artifact.id, id, versions.get(id), range, true);
			}
			for (const [id, range] of Object.entries(artifact.manifest.optional)) {
				assertVersion(artifact.id, id, versions.get(id), range, false);
			}
		}
	}

	#emit(event: PluginManagerEvent): void {
		const frozen = Object.freeze(event);
		for (const listener of this.#listeners) listener(frozen);
	}
}

async function loadPlugin(
	artifact: PluginArtifact,
	importModule: (url: string) => Promise<Record<string, unknown>>
): Promise<LoadedPlugin> {
	const url = new URL(artifact.serverEntry);
	if (url.protocol === 'data:') url.hash = `revision=${artifact.revision}`;
	else url.searchParams.set('revision', artifact.revision);
	const module = await importModule(url.href);
	const definition = module.default;
	if (!isPluginDefinition(definition)) {
		throw new Error(`${artifact.id}: server entry must default-export a PluginDefinition.`);
	}
	if (definition.id !== artifact.id) {
		throw new Error(
			`${artifact.id}: server PluginDefinition id "${definition.id}" does not match its manifest.`
		);
	}
	validateInjections(artifact, definition);
	return Object.freeze({
		plugin: definition,
		config: definition.defaultConfig,
		version: artifact.version,
		artifactRevision: artifact.revision
	});
}

function validateInjections(artifact: PluginArtifact, definition: AnyPluginDefinition): void {
	const injections = new Map(
		Object.values(definition.dependencies).map((injection) => [injection.id, injection.optional])
	);
	for (const [id, optional] of injections) {
		const declared = optional ? artifact.manifest.optional[id] : artifact.manifest.requires[id];
		if (!declared) {
			throw new Error(
				`${artifact.id}: ${optional ? 'optional' : 'required'} injection "${id}" is missing from its manifest.`
			);
		}
	}
	for (const id of Object.keys(artifact.manifest.requires)) {
		if (injections.get(id) !== false) {
			throw new Error(`${artifact.id}: manifest requires unused injection "${id}".`);
		}
	}
	for (const id of Object.keys(artifact.manifest.optional)) {
		if (injections.get(id) !== true) {
			throw new Error(`${artifact.id}: manifest declares unused optional injection "${id}".`);
		}
	}
}

function assertVersion(
	pluginId: string,
	dependencyId: string,
	version: string | undefined,
	range: string,
	required: boolean
): void {
	if (!version) {
		if (required)
			throw new Error(`${pluginId}: required capability "${dependencyId}" is unavailable.`);
		return;
	}
	if (!satisfies(version, range, { includePrerelease: true })) {
		throw new Error(
			`${pluginId}: capability "${dependencyId}" version ${version} does not satisfy ${range}.`
		);
	}
}

function sameArtifacts(left: readonly PluginArtifact[], right: readonly PluginArtifact[]): boolean {
	return (
		left.length === right.length &&
		left.every((artifact, index) => {
			const candidate = right[index];
			return candidate?.id === artifact.id && candidate.revision === artifact.revision;
		})
	);
}

function isPluginDefinition(value: unknown): value is AnyPluginDefinition {
	if (typeof value !== 'object' || value === null) return false;
	const definition = value as Record<string, unknown>;
	return (
		typeof definition.id === 'string' &&
		typeof definition.setup === 'function' &&
		typeof definition.dependencies === 'object' &&
		definition.dependencies !== null
	);
}
