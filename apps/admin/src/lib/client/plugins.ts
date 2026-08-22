import { activateAuth } from '@zadmin/auth/client';
import { ClientPluginRuntime, type ClientPluginArtifact } from '@zadmin/sveltekit/client';

export const clientPlugins = new ClientPluginRuntime();
const disposeAuth = activateAuth({ pages: clientPlugins.pages.forOwner('@zadmin/auth') });
let eventSource: EventSource | undefined;
let started = false;

export async function startClientPlugins(): Promise<void> {
	if (started) return;
	started = true;
	await refresh();
	eventSource = new EventSource('/__zadmin/plugins/events');
	eventSource.onmessage = () => void refresh();
}

export async function stopClientPlugins(): Promise<void> {
	if (!started) return;
	started = false;
	eventSource?.close();
	eventSource = undefined;
	await clientPlugins.dispose();
}

async function refresh(): Promise<void> {
	const response = await fetch('/__zadmin/plugins/client');
	if (!response.ok) throw new Error(`Plugin client manifest failed with ${response.status}.`);
	await clientPlugins.reconcile((await response.json()) as ClientPluginArtifact[]);
}

if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		void stopClientPlugins();
		void disposeAuth();
	});
}
