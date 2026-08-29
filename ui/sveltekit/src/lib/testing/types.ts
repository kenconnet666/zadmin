import type { Handle, RequestEvent } from '@sveltejs/kit';
import type { RouteMethod } from '../routes.js';

export type SvelteKitResolve = Parameters<Handle>[0]['resolve'];

export interface JsonRouteFixtureOptions {
	readonly body?: unknown;
	readonly method?: RouteMethod;
	readonly path: string;
	readonly status?: number;
}

export interface SsrResolveFixtureOptions extends ResponseInit {
	readonly html: string;
}

export interface SvelteKitHandleFixture {
	readonly event: RequestEvent;
	readonly resolve: SvelteKitResolve;
}
