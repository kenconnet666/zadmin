import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { PluginManager, PluginManagerEvent, PluginDisposer } from '@zadmin/core';

export class AdminPluginBridge {
	readonly #manager: PluginManager;
	readonly #subscribers = new Set<(type: PluginManagerEvent['type']) => void>();
	readonly #unsubscribe: PluginDisposer;

	constructor(manager: PluginManager) {
		this.#manager = manager;
		this.#unsubscribe = manager.onEvent((event) => {
			for (const subscriber of this.#subscribers) subscriber(event.type);
		});
	}

	get clientArtifacts() {
		return this.#manager.artifacts
			.filter((artifact) => artifact.clientEntry)
			.map((artifact) => ({
				id: artifact.id,
				revision: artifact.revision,
				url: `/__zadmin/plugins/client.js?id=${encodeURIComponent(artifact.id)}`
			}));
	}

	async serveClient(url: URL): Promise<Response> {
		const id = url.searchParams.get('id');
		const artifact = id
			? this.#manager.artifacts.find((candidate) => candidate.id === id)
			: undefined;
		if (!artifact?.clientEntry)
			return new Response('Plugin client artifact not found.', { status: 404 });
		const revision = url.searchParams.get('revision');
		if (revision !== artifact.revision) {
			return new Response('Plugin client revision is no longer active.', { status: 409 });
		}
		return new Response(await readFile(fileURLToPath(artifact.clientEntry)), {
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'text/javascript; charset=utf-8'
			}
		});
	}

	events(): Response {
		const encoder = new TextEncoder();
		let unsubscribe: (() => void) | undefined;
		const stream = new ReadableStream<Uint8Array>({
			start: (controller) => {
				const send = (event: { type: 'connected' | PluginManagerEvent['type'] }) => {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
				};
				send({ type: 'connected' });
				const subscriber = (type: PluginManagerEvent['type']) => send({ type });
				this.#subscribers.add(subscriber);
				unsubscribe = () => {
					this.#subscribers.delete(subscriber);
				};
			},
			cancel: () => unsubscribe?.()
		});
		return new Response(stream, {
			headers: {
				'cache-control': 'no-cache',
				'content-type': 'text/event-stream; charset=utf-8',
				connection: 'keep-alive'
			}
		});
	}

	dispose(): void {
		this.#unsubscribe();
		this.#subscribers.clear();
	}
}
