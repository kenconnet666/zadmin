import type { RequestEvent } from '@sveltejs/kit';
import type {
	SsrResolveFixtureOptions,
	SvelteKitHandleFixture,
	SvelteKitResolve
} from './types.js';

export function createSsrResolveFixture(options: SsrResolveFixtureOptions): SvelteKitResolve {
	return async () => new Response(options.html, options);
}

export function createHandleFixture(
	request: Request,
	resolve: SvelteKitResolve,
	locals: RequestEvent['locals'] = {} as RequestEvent['locals']
): SvelteKitHandleFixture {
	return Object.freeze({
		event: {
			locals,
			request,
			url: new URL(request.url)
		} as RequestEvent,
		resolve
	});
}
