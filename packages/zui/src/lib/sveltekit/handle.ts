import type { Handle, RequestEvent } from '@sveltejs/kit';

import { createRequestIcssRuntime, runWithRequestIcssRuntime } from './registry.js';
import { addStyleHashHeaders, createStyleHash, injectCriticalCss } from './server.js';
import type { IcssHandleOptions, IcssNonce } from './types.js';

async function resolveNonce(
	nonce: IcssNonce | undefined,
	event: RequestEvent
): Promise<string | undefined> {
	return typeof nonce === 'function' ? nonce(event) : nonce;
}

export function icssHandle(options: IcssHandleOptions = {}): Handle {
	if (options.cspHash === true && options.nonce !== undefined) {
		throw new TypeError('ICSS SvelteKit integration accepts either cspHash or nonce, not both.');
	}

	return async ({ event, resolve }) => {
		const request = createRequestIcssRuntime();
		const nonce = await resolveNonce(options.nonce, event);
		let bufferedHtml = '';

		return runWithRequestIcssRuntime(request, async () => {
			let response = await resolve(event, {
				transformPageChunk({ done, html }) {
					bufferedHtml += html;
					if (!done) return '';
					return injectCriticalCss(bufferedHtml, request.registry.styleTag({ nonce }));
				}
			});

			if (options.cspHash === true && request.registry.size > 0) {
				response = addStyleHashHeaders(response, createStyleHash(request.registry.cssText()));
			}
			return response;
		});
	};
}

export { createRequestIcssRuntime, runWithRequestIcssRuntime } from './registry.js';
export type { IcssHandleOptions, IcssNonce } from './types.js';
