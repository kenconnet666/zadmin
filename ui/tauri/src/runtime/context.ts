export const DESKTOP_PLATFORM_CONTEXT = Symbol.for('@zadmin/tauri/platform');

export interface DesktopResourceHandle {
	readonly disposed: boolean;
	dispose(): Promise<void>;
}

export function createDesktopResourceHandle(
	disposer: () => Promise<void> | void
): DesktopResourceHandle {
	let disposed = false;
	return {
		get disposed() {
			return disposed;
		},
		async dispose() {
			if (disposed) return;
			disposed = true;
			await disposer();
		}
	};
}

export class DesktopResourceScope implements AsyncDisposable {
	readonly #handles = new Set<DesktopResourceHandle>();
	#disposed = false;

	get disposed(): boolean {
		return this.#disposed;
	}

	add(handle: DesktopResourceHandle): DesktopResourceHandle {
		if (this.#disposed) {
			void handle.dispose();
			return handle;
		}
		this.#handles.add(handle);
		return handle;
	}

	async dispose(): Promise<void> {
		if (this.#disposed) return;
		this.#disposed = true;
		const handles = [...this.#handles].reverse();
		this.#handles.clear();
		const results = await Promise.allSettled(handles.map((handle) => handle.dispose()));
		const errors = results
			.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
			.map((result) => result.reason);
		if (errors.length > 0) throw new AggregateError(errors, 'Desktop resource cleanup failed.');
	}

	async [Symbol.asyncDispose](): Promise<void> {
		await this.dispose();
	}
}
