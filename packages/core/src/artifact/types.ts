import type { MaybePromise, PluginDisposer } from '../container/context.ts';
import type { PluginManifest } from './manifest.ts';

export interface PluginArtifact {
	readonly id: string;
	readonly version: string;
	/** Full artifact content identity used for immutable installation checks. */
	readonly revision: string;
	readonly serverRevision: string;
	readonly clientRevision?: string;
	readonly root: string;
	readonly manifest: PluginManifest;
	readonly serverEntry: URL;
	readonly clientEntry?: URL;
}

export type PluginArtifactListener = (artifacts: readonly PluginArtifact[]) => MaybePromise<void>;

export interface PluginArtifactProvider {
	scan(): Promise<readonly PluginArtifact[]>;
	watch(listener: PluginArtifactListener, onError?: (error: unknown) => void): PluginDisposer;
}
