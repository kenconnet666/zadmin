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
		pluginDataRoot,
		async refreshInstalledPlugins() {
			installedArtifacts = [...(await installedProvider.scan())];
			await reconcileArtifacts();
		},
		async dispose() {
			if (disposed) return;
			disposed = true;
			await stopWorkspaceProvider?.();
			await stopInstalledProvider?.();
			bridge.dispose();
			await plugins.dispose();
			await runtime.dispose();
		}
	});
}

export const adminHost = await createAdminHost({
	enableInstalledPlugins: import.meta.env.MODE !== 'test'
});

if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		void adminHost.dispose();
	});
} else {
	process.once('sveltekit:shutdown', () => adminHost.dispose());
}
