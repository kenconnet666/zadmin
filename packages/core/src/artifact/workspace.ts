import { createHash } from 'node:crypto';
import { watch, type FSWatcher } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { PluginDisposer } from '../container/context.ts';
import { parsePluginManifest } from './manifest.ts';
import type { PluginArtifact, PluginArtifactListener, PluginArtifactProvider } from './types.ts';

export interface WorkspacePluginProviderOptions {
	readonly roots: readonly string[];
	readonly debounceMs?: number;
	readonly pollMs?: number;
}

export class WorkspacePluginArtifactProvider implements PluginArtifactProvider {
	readonly #roots: readonly string[];
	readonly #debounceMs: number;
	readonly #pollMs: number;

	constructor(options: WorkspacePluginProviderOptions) {
		this.#roots = Object.freeze([...options.roots].map((root) => resolve(root)));
		this.#debounceMs = options.debounceMs ?? 150;
		this.#pollMs = options.pollMs ?? 2_000;
	}

	async scan(): Promise<readonly PluginArtifact[]> {
		const artifacts: PluginArtifact[] = [];
		for (const root of this.#roots) {
			let entries;
			try {
				entries = await readdir(root, { withFileTypes: true });
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
				throw error;
			}
			for (const entry of entries) {
				if (!entry.isDirectory()) continue;
				const artifactRoot = resolve(root, entry.name, 'dist');
				const manifestPath = resolve(artifactRoot, 'zadmin.plugin.json');
				try {
					artifacts.push(await loadWorkspaceArtifact(artifactRoot, manifestPath));
				} catch (error) {
					if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
					throw error;
				}
			}
		}
		artifacts.sort((left, right) => left.id.localeCompare(right.id));
		return Object.freeze(artifacts);
	}

	watch(
		listener: PluginArtifactListener,
		onError: (error: unknown) => void = () => undefined
	): PluginDisposer {
		const watchers: FSWatcher[] = [];
		let timer: ReturnType<typeof setTimeout> | undefined;
		let active = true;
		let running = false;
		let pending = false;
		let lastRevisionSet = '';

		const refresh = async (): Promise<void> => {
			if (!active) return;
			if (running) {
				pending = true;
				return;
			}
			running = true;
			try {
				const artifacts = await this.scan();
				const revisionSet = artifacts
					.map(
						({ id, serverRevision, clientRevision }) =>
							`${id}:${serverRevision}:${clientRevision ?? ''}`
					)
					.join('|');
				if (revisionSet !== lastRevisionSet) {
					await listener(artifacts);
					lastRevisionSet = revisionSet;
				}
			} catch (error) {
				onError(error);
			} finally {
				running = false;
				if (pending) {
					pending = false;
					void refresh();
				}
			}
		};

		const schedule = (): void => {
			if (!active) return;
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => void refresh(), this.#debounceMs);
		};

		for (const root of this.#roots) {
			try {
				watchers.push(watch(root, { recursive: true }, schedule));
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== 'ENOENT') onError(error);
			}
		}
		const polling = setInterval(schedule, this.#pollMs);
		polling.unref();
		void refresh();

		return () => {
			active = false;
			if (timer) clearTimeout(timer);
			clearInterval(polling);
			for (const watcher of watchers) watcher.close();
		};
	}
}

async function loadWorkspaceArtifact(root: string, manifestPath: string): Promise<PluginArtifact> {
	const artifact = await loadPluginArtifact(root);
	const manifest = artifact.manifest;
	const packagePath = resolve(dirname(root), 'package.json');
	const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
		name?: unknown;
		version?: unknown;
	};
	if (packageJson.name !== manifest.id || packageJson.version !== manifest.version) {
		throw new Error(`${manifestPath}: id/version must match ${packagePath}.`);
	}
	return artifact;
}

export async function loadPluginArtifact(root: string): Promise<PluginArtifact> {
	const manifestPath = resolve(root, 'zadmin.plugin.json');
	const manifest = parsePluginManifest(
		JSON.parse(await readFile(manifestPath, 'utf8')),
		manifestPath
	);
	const serverPath = resolveEntry(root, manifest.entries.server);
	await assertFile(serverPath);
	const clientPath = manifest.entries.client
		? resolveEntry(root, manifest.entries.client)
		: undefined;
	if (clientPath) await assertFile(clientPath);
	const paths = await files(root);
	const revision = await hashFiles(root, paths);
	const serverRevision = await hashFiles(
		root,
		paths.filter((path) => belongsToEntry(root, path, manifest.entries.client))
	);
	const clientRevision = manifest.entries.client
		? await hashFiles(
				root,
				paths.filter((path) => belongsToEntry(root, path, manifest.entries.server))
			)
		: undefined;
	return Object.freeze({
		id: manifest.id,
		version: manifest.version,
		revision,
		serverRevision,
		...(clientRevision ? { clientRevision } : {}),
		root,
		manifest,
		serverEntry: pathToFileURL(serverPath),
		...(clientPath ? { clientEntry: pathToFileURL(clientPath) } : {})
	});
}

function resolveEntry(root: string, entry: string): string {
	const path = resolve(root, entry.slice(2));
	if (path !== root && !path.startsWith(`${root}${sep}`)) {
		throw new Error(`Plugin entry escaped artifact root: ${entry}`);
	}
	return path;
}

async function assertFile(path: string): Promise<void> {
	if (!(await stat(path)).isFile()) throw new Error(`Plugin entry is not a file: ${path}`);
}

async function hashFiles(root: string, paths: readonly string[]): Promise<string> {
	const hash = createHash('sha256');
	for (const path of paths) {
		if (path.endsWith('.map')) continue;
		hash.update(relative(root, path).replaceAll('\\', '/'));
		hash.update(await readFile(path));
	}
	return hash.digest('hex');
}

function belongsToEntry(root: string, path: string, excludedEntry: string | undefined): boolean {
	const name = relative(root, path).replaceAll('\\', '/');
	if (name === 'zadmin.plugin.json') return true;
	if (name.startsWith('types/')) return false;
	if (!excludedEntry) return true;
	const excludedArea = excludedEntry.slice(2).split('/', 1)[0];
	return !excludedArea || !name.startsWith(`${excludedArea}/`);
}

async function files(root: string): Promise<string[]> {
	const result: string[] = [];
	for (const entry of await readdir(root, { withFileTypes: true })) {
		const path = resolve(root, entry.name);
		if (entry.isDirectory()) result.push(...(await files(path)));
		else if (entry.isFile()) result.push(path);
	}
	return result.sort();
}
