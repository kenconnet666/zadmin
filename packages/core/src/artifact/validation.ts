import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { isPluginDefinition, validatePluginDefinition } from '../plugin/validation.ts';
import type { PluginManifest } from './manifest.ts';
import { loadPluginArtifact } from './workspace.ts';
import type { PluginArtifact } from './types.ts';

const nativeImport = Function('url', 'return import(url)') as (
	url: string
) => Promise<Record<string, unknown>>;

interface PluginPackageJson {
	readonly name?: unknown;
	readonly version?: unknown;
	readonly peerDependencies?: unknown;
}

export async function validatePluginPackage(
	artifactRoot: string,
	packageJsonPath = resolve(dirname(artifactRoot), 'package.json'),
	importModule: (url: string) => Promise<Record<string, unknown>> = nativeImport
): Promise<PluginArtifact> {
	const artifact = await loadPluginArtifact(resolve(artifactRoot));
	const packageJson = JSON.parse(
		await readFile(resolve(packageJsonPath), 'utf8')
	) as PluginPackageJson;
	if (packageJson.name !== artifact.id || packageJson.version !== artifact.version) {
		throw new Error(
			`${packageJsonPath}: name/version must match ${artifact.id}@${artifact.version}.`
		);
	}
	validatePeerDependencies(artifact.manifest, packageJson.peerDependencies);
	const url = new URL(artifact.serverEntry);
	url.searchParams.set('validation', artifact.revision);
	const module = await importModule(url.href);
	if (!isPluginDefinition(module.default)) {
		throw new Error(`${artifact.id}: server entry must default-export a PluginDefinition.`);
	}
	validatePluginDefinition(artifact.manifest, module.default);
	return artifact;
}

export function validatePeerDependencies(manifest: PluginManifest, value: unknown): void {
	const peers = stringRecord(value ?? {}, 'package.json.peerDependencies');
	const declared = {
		...manifest.requiresHost,
		...manifest.requires,
		...manifest.optional
	};
	for (const [id, range] of Object.entries(declared)) {
		const peer = peers[id];
		if (!peer)
			throw new Error(`${manifest.id}: runtime dependency "${id}" is not a peerDependency.`);
		if (!peerRangeMatches(peer, range)) {
			throw new Error(
				`${manifest.id}: peerDependency "${id}" range ${peer} does not match manifest range ${range}.`
			);
		}
	}
	for (const id of Object.keys(peers)) {
		if (id.startsWith('@zadmin/') && !(id in declared)) {
			throw new Error(`${manifest.id}: unused ZAdmin peerDependency "${id}".`);
		}
	}
}

function peerRangeMatches(peer: string, declared: string): boolean {
	if (!peer.startsWith('workspace:')) return peer === declared;
	const workspace = peer.slice('workspace:'.length);
	if (workspace === '*') return true;
	if (workspace === '^') return declared.startsWith('^');
	if (workspace === '~') return declared.startsWith('~');
	return workspace === declared;
}

function stringRecord(value: unknown, path: string): Record<string, string> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error(`${path} must be an object.`);
	}
	const result: Record<string, string> = {};
	for (const [id, range] of Object.entries(value)) {
		if (typeof range !== 'string' || !range.trim()) {
			throw new Error(`${path}.${id} must be a non-empty string.`);
		}
		result[id] = range;
	}
	return result;
}
