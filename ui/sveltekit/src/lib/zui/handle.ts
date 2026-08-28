import type { Handle, RequestEvent } from '@sveltejs/kit';

import { createRequestIcssRuntime, runWithRequestIcssRuntime } from './registry.js';
import {
	addStyleHashHeaders,
	addStyleHashMeta,
	createStyleHash,
	injectCriticalCss
} from './server.js';
import type { ZuiHandleOptions, ZuiNonce } from './types.js';

async function resolveNonce(
	nonce: ZuiNonce | undefined,
	event: RequestEvent
): Promise<string | undefined> {
	return typeof nonce === 'function' ? nonce(event) : nonce;
}

export function zuiHandle(options: ZuiHandleOptions = {}): Handle {
	const csp = options.csp;
	if (csp !== undefined && 'hash' in csp && 'nonce' in csp) {
		throw new TypeError('ZUI SvelteKit integration accepts either CSP hash or nonce, not both.');
	}

	return async ({ event, resolve }) => {
		const request = createRequestIcssRuntime();
		const nonce = await resolveNonce(
			csp !== undefined && 'nonce' in csp ? csp.nonce : undefined,
			event
		);
		let bufferedHtml = '';
		let styleHash: string | undefined;

		return runWithRequestIcssRuntime(request, async () => {
			let response = await resolve(event, {
				transformPageChunk({ done, html }) {
					bufferedHtml += html;
					if (!done) return '';
					const output = injectCriticalCss(bufferedHtml, request.registry.styleTag({ nonce }));
					if (csp?.hash !== true || request.registry.size === 0) return output;
					styleHash = createStyleHash(request.registry.htmlStyleText());
					return addStyleHashMeta(output, styleHash);
				}
			});

			if (styleHash !== undefined) {
				response = addStyleHashHeaders(response, styleHash);
			}
			return response;
		});
	};
}

export { createRequestIcssRuntime, runWithRequestIcssRuntime } from './registry.js';
export type { ZuiCspOptions, ZuiHandleOptions, ZuiNonce } from './types.js';
