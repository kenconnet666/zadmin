import { satisfies } from 'semver';
import type { PluginArtifact } from '../artifact/types.ts';
import type { Disposer } from '../container/context.ts';
import { defineApp, type AppDefinition, type LoadedPlugin } from './definition.ts';
import { PluginRuntime } from './runtime.ts';
import { isPluginDefinition, validatePluginDefinition } from './validation.ts';

const nativeImport = Function('url', 'return import(url)') as (
	url: string
) => Promise<Record<string, unknown>>;

export interface PluginManagerOptions {
	readonly importModule?: (url: string) => Promise<Record<string, unknown>>;
	readonly hostVersions?: Readonly<Record<string, string>>;
}

export interface PluginManagerEvent {
	readonly type: 'degraded' | 'failed' | 'reconciled';
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

	get activeArtifacts(): readonly PluginArtifact[] {
		const active = new Set(
			this.#runtime.snapshot.plugins.filter(({ state }) => state === 'active').map(({ id }) => id)
		);
		return Object.freeze(this.#artifacts.filter(({ id }) => active.has(id)));
	}

	onEvent(listener: (event: PluginManagerEvent) => void): Disposer {
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
		if (sameServerArtifacts(artifacts, this.#artifacts)) {
			this.#artifacts = artifacts;
			this.#emit({ type: 'reconciled', artifacts });
			return;
		}
		const previousApp = this.#currentApp;
		const previousArtifacts = this.#artifacts;
		try {
			this.#validateArtifactSet(artifacts);
			const plugins = await Promise.all(
				artifacts.map((artifact) => loadPlugin(artifact, this.#importModule))
			);
			const candidate = defineApp({ id: this.#appId, plugins });
			await this.#runtime.reconcile(candidate);
			this.#currentApp = candidate;
			this.#artifacts = artifacts;
			this.#emit({
				type: this.#runtime.snapshot.state === 'degraded' ? 'degraded' : 'reconciled',
				artifacts
			});
		} catch (error) {
			let failure = error;
			try {
				await this.#runtime.reconcile(previousApp);
			} catch (rollbackError) {
				failure = new AggregateError(
					[error, rollbackError],
					'Plugin reconciliation and rollback both failed.'
				);
			}
			this.#currentApp = previousApp;
			this.#artifacts = previousArtifacts;
			this.#emit({ type: 'failed', artifacts, error: failure });
			throw failure;
		}
	}

	#validateArtifactSet(artifacts: readonly PluginArtifact[]): void {
		const versions = new Map(
			this.#runtime.snapshot.modules
				.filter(({ kind }) => kind === 'host')
				.map(({ id, version }) => [id, version])
		);
		for (const artifact of artifacts) {
			if (versions.has(artifact.id)) {
				throw new Error(`${artifact.id}: module id conflicts with an active Host or Plugin.`);
			}
			versions.set(artifact.id, artifact.version);
		}
		for (const artifact of artifacts) {
			for (const [id, range] of Object.entries(artifact.manifest.requiresHost)) {
				assertVersion(artifact.id, id, this.#hostVersions[id], range, false);
			}
			for (const [id, range] of Object.entries(artifact.manifest.requires)) {
				assertVersion(artifact.id, id, versions.get(id), range, true);
			}
			for (const [id, range] of Object.entries(artifact.manifest.optional)) {
				assertVersion(artifact.id, id, versions.get(id), range, true);
			}
		}
	}

	#emit(event: PluginManagerEvent): void {
		const frozen = Object.freeze(event);
		for (const listener of this.#listeners) {
			try {
				listener(frozen);
			} catch {
				// Observers cannot roll back an artifact transaction that already committed.
			}
		}
	}
}

async function loadPlugin(
	artifact: PluginArtifact,
	importModule: (url: string) => Promise<Record<string, unknown>>
): Promise<LoadedPlugin> {
	const url = new URL(artifact.serverEntry);
	if (url.protocol === 'data:') url.hash = `revision=${artifact.serverRevision}`;
	else url.searchParams.set('revision', artifact.serverRevision);
	const module = await importModule(url.href);
	const definition = module.default;
	if (!isPluginDefinition(definition)) {
		throw new Error(`${artifact.id}: server entry must default-export a PluginDefinition.`);
	}
	validatePluginDefinition(artifact.manifest, definition);
	return Object.freeze({
		plugin: definition,
		config: definition.defaultConfig,
		version: artifact.version,
		artifactRevision: artifact.serverRevision
	});
}

function assertVersion(
	pluginId: string,
	dependencyId: string,
	version: string | undefined,
	range: string,
	allowMissing: boolean
): void {
	if (!version) {
		if (!allowMissing) {
			throw new Error(`${pluginId}: required host "${dependencyId}" is unavailable.`);
		}
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
			return (
				candidate?.id === artifact.id &&
				candidate.serverRevision === artifact.serverRevision &&
				candidate.clientRevision === artifact.clientRevision
			);
		})
	);
}

function sameServerArtifacts(
	left: readonly PluginArtifact[],
	right: readonly PluginArtifact[]
): boolean {
	return (
		left.length === right.length &&
		left.every((artifact, index) => {
			const candidate = right[index];
			return candidate?.id === artifact.id && candidate.serverRevision === artifact.serverRevision;
		})
	);
}
