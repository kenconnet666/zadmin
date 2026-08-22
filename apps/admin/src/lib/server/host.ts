import {
	defineApp,
	InstalledPluginArtifactProvider,
	PluginManager,
	PluginInstaller,
	PluginRuntime,
	WorkspacePluginArtifactProvider,
	type PluginArtifact,
	type PluginDisposer
} from '@zadmin/core';
import { authModule } from '@zadmin/auth';
import { ossModule } from '@zadmin/oss';
import { postgresModule } from '@zadmin/postgres';
import { redisModule } from '@zadmin/redis';
import { SVELTEKIT, sveltekitModule } from '@zadmin/sveltekit';
import { fileURLToPath } from 'node:url';
import { AdminPluginBridge } from './plugins.ts';
import { resolvePluginDataRoot } from './data.ts';

export interface AdminHostOptions {
	readonly enableInstalledPlugins?: boolean;
	readonly pluginDataRoot?: string;
}

export type AdminHost = Awaited<ReturnType<typeof createAdminHost>>;

export async function createAdminHost(options: AdminHostOptions = {}) {
	const runtime = new PluginRuntime({
		modules: [sveltekitModule, postgresModule, redisModule, ossModule, authModule]
	});
	await runtime.reconcile(defineApp({ id: 'admin', plugins: [] }));
	const web = runtime.resolve(SVELTEKIT);
	const plugins = new PluginManager(runtime, 'admin', {
		hostVersions: {
			'@zadmin/core': '0.0.0',
			'@zadmin/sveltekit': '0.0.0'
		}
	});
	const bridge = new AdminPluginBridge(plugins);
	const pluginDataRoot = options.pluginDataRoot ?? resolvePluginDataRoot();
	const installer = new PluginInstaller({ root: pluginDataRoot });
	const installedProvider = new InstalledPluginArtifactProvider({ root: pluginDataRoot });
	let installedArtifacts: readonly PluginArtifact[] =
		options.enableInstalledPlugins === false ? [] : await installedProvider.scan();
	let workspaceArtifacts: readonly PluginArtifact[] = [];
	let stopWorkspaceProvider: PluginDisposer | undefined;
	let stopInstalledProvider: PluginDisposer | undefined;
	const reconcileArtifacts = () => {
		const artifacts = new Map(installedArtifacts.map((artifact) => [artifact.id, artifact]));
		for (const artifact of workspaceArtifacts) artifacts.set(artifact.id, artifact);
		return plugins.reconcile(
			[...artifacts.values()].sort((left, right) => left.id.localeCompare(right.id))
		);
	};
	const refreshInstalledPlugins = async () => {
		installedArtifacts = [...(await installedProvider.scan())];
		await reconcileArtifacts();
	};
	let mutationOperation: Promise<unknown> = Promise.resolve();
	const mutatePlugins = <Result>(mutation: () => Promise<Result>): Promise<Result> => {
		const next = mutationOperation.then(async () => {
			const previous = await installer.read();
			try {
				const result = await mutation();
				await refreshInstalledPlugins();
				return result;
			} catch (error) {
				await installer.restore(previous);
				try {
					await refreshInstalledPlugins();
				} catch (rollbackError) {
					throw new AggregateError(
						[error, rollbackError],
						'Plugin mutation and runtime rollback both failed.',
						{ cause: rollbackError }
					);
				}
				throw error;
			}
		});
		mutationOperation = next.catch(() => undefined);
		return next;
	};
	await reconcileArtifacts();
	if (options.enableInstalledPlugins !== false) {
		stopInstalledProvider = installedProvider.watch(
			(artifacts) => {
				installedArtifacts = [...artifacts];
				return reconcileArtifacts();
			},
			(error) => console.error('Installed plugin reload failed.', error)
		);
	}
	if (import.meta.env.MODE === 'development') {
		const provider = new WorkspacePluginArtifactProvider({
			roots: [fileURLToPath(new URL('../../../../../plugins/', import.meta.url))]
		});
		workspaceArtifacts = [...(await provider.scan())];
		await reconcileArtifacts();
		stopWorkspaceProvider = provider.watch(
			(artifacts) => {
				workspaceArtifacts = [...artifacts];
				return reconcileArtifacts();
			},
			(error) => console.error('Workspace plugin reload failed.', error)
		);
	}

	let disposed = false;
	return Object.freeze({
		web,
		runtime,
		plugins,
		bridge,
		installer,
		mutatePlugins,
		pluginDataRoot,
		refreshInstalledPlugins,
		async dispose() {
			if (disposed) return;
			disposed = true;
			const errors: unknown[] = [];
			const clean = async (cleanup: () => void | Promise<void>) => {
				try {
					await cleanup();
				} catch (error) {
					errors.push(error);
				}
			};
			await clean(() => mutationOperation.then(() => undefined));
			await clean(() => stopWorkspaceProvider?.());
			await clean(() => stopInstalledProvider?.());
			await clean(() => bridge.dispose());
			await clean(() => plugins.dispose());
			await clean(() => runtime.dispose());
			if (errors.length) throw new AggregateError(errors, 'Admin host cleanup failed.');
		}
	});
}

const ADMIN_HOST_STORE = Symbol.for('@zadmin/admin/host');

interface RetainedAdminHost {
	current?: AdminHost;
	operation: Promise<unknown>;
}

function retainedAdminHost(): RetainedAdminHost {
	const scope = globalThis as typeof globalThis & {
		[ADMIN_HOST_STORE]?: RetainedAdminHost;
	};
	return (scope[ADMIN_HOST_STORE] ??= { operation: Promise.resolve() });
}

async function replaceAdminHost(): Promise<AdminHost> {
	const retained = retainedAdminHost();
	let created: AdminHost | undefined;
	const next = retained.operation.then(async () => {
		await retained.current?.dispose();
		created = await createAdminHost({
			enableInstalledPlugins: import.meta.env.MODE !== 'test'
		});
		retained.current = created;
	});
	retained.operation = next;
	await next;
	return created!;
}

async function disposeRetainedAdminHost(host: AdminHost): Promise<void> {
	const retained = retainedAdminHost();
	const next = retained.operation.then(async () => {
		await host.dispose();
		if (retained.current === host) retained.current = undefined;
	});
	retained.operation = next;
	await next;
}

export const adminHost = await replaceAdminHost();

if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		void disposeRetainedAdminHost(adminHost).catch((error) =>
			console.error('Admin host HMR cleanup failed.', error)
		);
	});
} else {
	process.once('sveltekit:shutdown', () => {
		void disposeRetainedAdminHost(adminHost).catch((error) =>
			console.error('Admin host shutdown failed.', error)
		);
	});
}
