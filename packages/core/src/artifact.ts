import type { MaybePromise, PluginDisposer } from './types.ts';
import type { PluginManifest } from './manifest.ts';

export interface PluginArtifact {
	readonly id: string;
	readonly version: string;
	readonly revision: string;
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
