import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import type { PluginManager, PluginManagerEvent, PluginDisposer } from '@zadmin/core';

export class AdminPluginBridge {
	readonly #manager: PluginManager;
	readonly #subscribers = new Set<(type: PluginManagerEvent['type']) => void>();
	readonly #streams = new Set<ReadableStreamDefaultController<Uint8Array>>();
	readonly #unsubscribe: PluginDisposer;

	constructor(manager: PluginManager) {
		this.#manager = manager;
		this.#unsubscribe = manager.onEvent((event) => {
			for (const subscriber of this.#subscribers) subscriber(event.type);
		});
	}

	get clientArtifacts() {
		return this.#manager.activeArtifacts
			.filter((artifact) => artifact.clientEntry)
			.map((artifact) => ({
				id: artifact.id,
				revision: artifact.clientRevision!,
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
		if (revision !== artifact.clientRevision) {
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
				this.#streams.add(controller);
				const send = (event: { type: 'connected' | PluginManagerEvent['type'] }) => {
					controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
				};
				send({ type: 'connected' });
				const subscriber = (type: PluginManagerEvent['type']) => send({ type });
				this.#subscribers.add(subscriber);
				unsubscribe = () => {
					this.#subscribers.delete(subscriber);
					this.#streams.delete(controller);
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
		for (const stream of this.#streams) {
			try {
				stream.close();
			} catch {
				// The browser may already have cancelled the stream.
			}
		}
		this.#streams.clear();
	}
}
