import { mount as svelteMount, unmount as svelteUnmount } from 'svelte';

const mounted = new Set<object>();

/**
 * Direct Svelte mounts are invisible to vitest-browser-svelte's cleanup registry.
 * Route every imperative browser-test mount through this adapter so afterEach can
 * release component effects, portals, observers, timers and global listeners even
 * when an assertion aborts before the test's explicit unmount.
 */
export const mount: typeof svelteMount = ((
	component: Parameters<typeof svelteMount>[0],
	options: Parameters<typeof svelteMount>[1]
) => {
	const instance = svelteMount(component, options);
	mounted.add(instance);
	return instance;
}) as typeof svelteMount;

export const unmount: typeof svelteUnmount = (async (
	instance: Parameters<typeof svelteUnmount>[0],
	options?: Parameters<typeof svelteUnmount>[1]
) => {
	await svelteUnmount(instance, options);
	mounted.delete(instance);
}) as typeof svelteUnmount;

export async function cleanupDirectMounts(): Promise<void> {
	const errors: unknown[] = [];
	for (const instance of [...mounted].reverse()) {
		try {
			await svelteUnmount(instance);
		} catch (error) {
			errors.push(error);
		} finally {
			mounted.delete(instance);
		}
	}
	if (errors.length > 0) {
		throw new AggregateError(errors, 'Failed to clean up direct Svelte browser-test mounts.');
	}
}
