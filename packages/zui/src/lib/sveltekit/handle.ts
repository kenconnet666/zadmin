import type { Handle, RequestEvent } from '@sveltejs/kit';

import { createRequestIcssRuntime, runWithRequestIcssRuntime } from './registry.js';
import {
	addStyleHashHeaders,
	addStyleHashMeta,
	createStyleHash,
	injectCriticalCss
} from './server.js';
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
		let styleHash: string | undefined;

		return runWithRequestIcssRuntime(request, async () => {
			let response = await resolve(event, {
				transformPageChunk({ done, html }) {
					bufferedHtml += html;
					if (!done) return '';
					const output = injectCriticalCss(bufferedHtml, request.registry.styleTag({ nonce }));
					if (options.cspHash !== true || request.registry.size === 0) return output;
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
export type { IcssHandleOptions, IcssNonce } from './types.js';
