export type ScopeCleanup =
	(() => unknown | Promise<unknown>) | { dispose(): unknown | Promise<unknown> };

function cleanupOf(resource: ScopeCleanup): () => unknown | Promise<unknown> {
	return typeof resource === 'function' ? resource : () => resource.dispose();
}

export class ResourceScope {
	readonly #cleanups: Array<() => unknown | Promise<unknown>> = [];
	#closed = false;

	get closed(): boolean {
		return this.#closed;
	}

	add<TResource extends ScopeCleanup>(resource: TResource): TResource {
		if (this.#closed) throw new Error('Cannot add a resource to a disposed scope.');
		this.#cleanups.push(cleanupOf(resource));
		return resource;
	}

	child(): ResourceScope {
		const child = new ResourceScope();
		this.add(() => child.dispose());
		return child;
	}

	async dispose(): Promise<void> {
		if (this.#closed) return;
		this.#closed = true;
		const errors: unknown[] = [];
		for (const cleanup of this.#cleanups.splice(0).reverse()) {
			try {
				await cleanup();
			} catch (error) {
				errors.push(error);
			}
		}
		if (errors.length > 0) throw new AggregateError(errors, 'Resource scope disposal failed.');
	}
}
