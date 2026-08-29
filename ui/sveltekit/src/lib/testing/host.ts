import { createSvelteKitHost, type SvelteKitHost } from '../index.js';

export function createTestSvelteKitHost(): SvelteKitHost {
	return createSvelteKitHost();
}
