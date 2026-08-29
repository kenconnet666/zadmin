import type { DesktopResourceHandle, DesktopResourceScope } from './types.js';

export function createDesktopResourceHandle(
	dispose: () => Promise<void> | void
): DesktopResourceHandle {
	let disposed = false;
	return {
		get disposed() {
			return disposed;
		},
		async dispose() {
			if (disposed) return;
			disposed = true;
			await dispose();
		}
	};
}

export function createDesktopResourceScope(): DesktopResourceScope {
	const handles = new Set<DesktopResourceHandle>();
	let disposed = false;
	return {
		get disposed() {
			return disposed;
		},
		add(handle) {
			if (disposed) {
				void handle.dispose();
				throw new Error('Desktop resource scope is disposed.');
			}
			handles.add(handle);
			return handle;
		},
		async dispose() {
			if (disposed) return;
			disposed = true;
			const pending = [...handles].reverse().map((handle) => handle.dispose());
			handles.clear();
			const results = await Promise.allSettled(pending);
			const failure = results.find((result) => result.status === 'rejected');
			if (failure?.status === 'rejected') throw failure.reason;
		}
	};
}
