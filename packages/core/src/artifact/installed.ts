import { randomUUID } from 'node:crypto';
import { watch, type FSWatcher } from 'node:fs';
import { access, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import * as tar from 'tar';
import type { PluginDisposer } from '../container/context.ts';
import { loadPluginArtifact } from './workspace.ts';
import type { PluginArtifact, PluginArtifactListener, PluginArtifactProvider } from './types.ts';

const INSTALLED_PROTOCOL = 1;
const STATE_FILE = 'installed.json';

export interface InstalledPlugin {
	readonly id: string;
	readonly version: string;
	readonly enabled: boolean;
}

export interface InstalledPluginState {
	readonly protocol: typeof INSTALLED_PROTOCOL;
	readonly plugins: Readonly<Record<string, InstalledPlugin>>;
}

export interface PluginInstallerOptions {
	readonly root: string;
	readonly maxFiles?: number;
	readonly maxBytes?: number;
}

export class PluginInstaller {
	readonly #root: string;
	readonly #maxFiles: number;
	readonly #maxBytes: number;
	#operation: Promise<unknown> = Promise.resolve();

	constructor(options: PluginInstallerOptions) {
		this.#root = resolve(options.root);
		this.#maxFiles = options.maxFiles ?? 2_000;
		this.#maxBytes = options.maxBytes ?? 100 * 1024 * 1024;
	}

	read(): Promise<InstalledPluginState> {
		return readState(this.#root);
	}

	restore(state: InstalledPluginState): Promise<void> {
		return this.#enqueue(() => writeState(this.#root, state.plugins));
	}

	install(archive: string): Promise<InstalledPlugin> {
		return this.#enqueue(() => this.#install(resolve(archive)));
	}

	enable(id: string): Promise<InstalledPlugin> {
		return this.#update(id, (plugin) => ({ ...plugin, enabled: true }));
	}

	disable(id: string): Promise<InstalledPlugin> {
		return this.#update(id, (plugin) => ({ ...plugin, enabled: false }));
	}

	activate(id: string, version: string): Promise<InstalledPlugin> {
		return this.#update(id, (plugin) => ({ ...plugin, version, enabled: true }), version);
	}

	uninstall(id: string): Promise<void> {
		return this.#enqueue(async () => {
			const state = await readState(this.#root);
			if (!state.plugins[id]) return;
			const plugins = { ...state.plugins };
			delete plugins[id];
			await writeState(this.#root, plugins);
		});
	}

	async #install(archive: string): Promise<InstalledPlugin> {
		await access(archive);
		await mkdir(join(this.#root, 'staging'), { recursive: true });
		const staging = await mkdtemp(join(this.#root, 'staging', 'install-'));
		try {
			await validateArchive(archive, this.#maxFiles, this.#maxBytes);
			await tar.x({
				file: archive,
				cwd: staging,
				strict: true,
				preservePaths: false,
				filter: (path) => safeArchivePath(path)
			});
			const artifact = await loadPluginArtifact(staging);
			const destination = this.#versionRoot(artifact.id, artifact.version);
			await mkdir(dirname(destination), { recursive: true });
			try {
				await access(destination);
				const existing = await loadPluginArtifact(destination);
				if (existing.revision !== artifact.revision) {
					throw new Error(
						`${artifact.id}@${artifact.version} is already installed with different content.`
					);
				}
			} catch (error) {
				if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
				await rename(staging, destination);
			}
			const state = await readState(this.#root);
			const installed = Object.freeze({
				id: artifact.id,
				version: artifact.version,
				enabled: true
			});
			await writeState(this.#root, { ...state.plugins, [artifact.id]: installed });
			return installed;
		} finally {
			await rm(staging, { recursive: true, force: true });
		}
	}

	#update(
		id: string,
		update: (plugin: InstalledPlugin) => InstalledPlugin,
		version?: string
	): Promise<InstalledPlugin> {
		return this.#enqueue(async () => {
			const state = await readState(this.#root);
			const current = state.plugins[id];
			if (!current) throw new Error(`Plugin "${id}" is not installed.`);
			if (version) await access(this.#versionRoot(id, version));
			const next = Object.freeze(update(current));
			await writeState(this.#root, { ...state.plugins, [id]: next });
			return next;
		});
	}

	#versionRoot(id: string, version: string): string {
		return join(this.#root, 'packages', encodeURIComponent(id), version);
	}

	#enqueue<T>(operation: () => Promise<T>): Promise<T> {
		const next = this.#operation.then(operation, operation);
		this.#operation = next.catch(() => undefined);
		return next;
	}
}

export class InstalledPluginArtifactProvider implements PluginArtifactProvider {
	readonly #root: string;
	readonly #pollMs: number;

	constructor(options: { readonly root: string; readonly pollMs?: number }) {
		this.#root = resolve(options.root);
		this.#pollMs = options.pollMs ?? 1_000;
	}

	async scan(): Promise<readonly PluginArtifact[]> {
		const state = await readState(this.#root);
		const artifacts: PluginArtifact[] = [];
		for (const plugin of Object.values(state.plugins)) {
			if (!plugin.enabled) continue;
			artifacts.push(
				await loadPluginArtifact(
					join(this.#root, 'packages', encodeURIComponent(plugin.id), plugin.version)
				)
			);
		}
		return Object.freeze(artifacts.sort((left, right) => left.id.localeCompare(right.id)));
	}

	watch(
		listener: PluginArtifactListener,
		onError: (error: unknown) => void = () => undefined
	): PluginDisposer {
		let watcher: FSWatcher | undefined;
		let active = true;
		let last = '';
		let running = false;
		let pending = false;

		const refresh = async () => {
			if (!active) return;
			if (running) {
				pending = true;
				return;
			}
			running = true;
			try {
				const artifacts = await this.scan();
				const key = artifacts
					.map(
						({ id, serverRevision, clientRevision }) =>
							`${id}:${serverRevision}:${clientRevision ?? ''}`
					)
					.join('|');
				if (key !== last) {
					await listener(artifacts);
					last = key;
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

		void mkdir(this.#root, { recursive: true }).then(() => {
			if (!active) return;
			watcher = watch(this.#root, { recursive: true }, () => void refresh());
			void refresh();
		});
		const polling = setInterval(() => void refresh(), this.#pollMs);
		polling.unref();

		return () => {
			active = false;
			watcher?.close();
			clearInterval(polling);
		};
	}
}

export async function packPluginArtifact(source: string, destination: string): Promise<void> {
	const root = resolve(source);
	await loadPluginArtifact(root);
	const entries = (await readdir(root)).sort();
	await mkdir(dirname(resolve(destination)), { recursive: true });
	await tar.c(
		{
			file: resolve(destination),
			cwd: root,
			gzip: true,
			portable: true,
			noMtime: true,
			strict: true
		},
		entries
	);
}

async function validateArchive(file: string, maxFiles: number, maxBytes: number): Promise<void> {
	let files = 0;
	let bytes = 0;
	let validationError: Error | undefined;
	await tar.t({
		file,
		strict: true,
		onentry(entry) {
			if (validationError) return;
			if (!safeArchiveEntry(entry.path, entry.type)) {
				validationError = new Error(`Unsafe plugin archive entry: ${entry.path} (${entry.type}).`);
				return;
			}
			if (entry.type === 'File') {
				files += 1;
				bytes += entry.size;
				if (files > maxFiles)
					validationError = new Error(`Plugin archive exceeds ${maxFiles} files.`);
				if (bytes > maxBytes)
					validationError = new Error(`Plugin archive exceeds ${maxBytes} bytes.`);
			}
		}
	});
	if (validationError) throw validationError;
}

function safeArchiveEntry(path: string, type: string): boolean {
	return (type === 'File' || type === 'Directory') && safeArchivePath(path);
}

function safeArchivePath(path: string): boolean {
	const normalized = path.replaceAll('\\', '/');
	return (
		!isAbsolute(normalized) &&
		!/^[A-Za-z]:/.test(normalized) &&
		!normalized.split('/').includes('..') &&
		basename(normalized) !== ''
	);
}

async function readState(root: string): Promise<InstalledPluginState> {
	try {
		const value = JSON.parse(await readFile(join(root, STATE_FILE), 'utf8')) as {
			protocol?: unknown;
			plugins?: unknown;
		};
		if (
			value.protocol !== INSTALLED_PROTOCOL ||
			typeof value.plugins !== 'object' ||
			!value.plugins
		) {
			throw new Error(`Invalid plugin installation state in ${join(root, STATE_FILE)}.`);
		}
		const plugins: Record<string, InstalledPlugin> = {};
		for (const [id, item] of Object.entries(value.plugins)) {
			if (typeof item !== 'object' || !item) throw new Error(`Invalid installed plugin ${id}.`);
			const plugin = item as Record<string, unknown>;
			if (
				plugin.id !== id ||
				typeof plugin.version !== 'string' ||
				typeof plugin.enabled !== 'boolean'
			) {
				throw new Error(`Invalid installed plugin ${id}.`);
			}
			plugins[id] = Object.freeze({ id, version: plugin.version, enabled: plugin.enabled });
		}
		return Object.freeze({ protocol: INSTALLED_PROTOCOL, plugins: Object.freeze(plugins) });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		return Object.freeze({ protocol: INSTALLED_PROTOCOL, plugins: Object.freeze({}) });
	}
}

async function writeState(
	root: string,
	plugins: Readonly<Record<string, InstalledPlugin>>
): Promise<void> {
	await mkdir(root, { recursive: true });
	const target = join(root, STATE_FILE);
	const temporary = join(root, `.${STATE_FILE}.${randomUUID()}.tmp`);
	await writeFile(
		temporary,
		`${JSON.stringify({ protocol: INSTALLED_PROTOCOL, plugins }, null, 2)}\n`,
		{ flag: 'wx' }
	);
	await rename(temporary, target);
}
