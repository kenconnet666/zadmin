import type { RequestEvent } from '@sveltejs/kit';

export type IcssNonce =
	string | ((event: RequestEvent) => string | undefined | Promise<string | undefined>);

export interface IcssHandleOptions {
	/** Add the critical CSS hash to existing CSP headers instead of using a nonce. */
	readonly cspHash?: boolean;
	/** Explicit nonce or request-local nonce resolver for critical and subsequent client style tags. */
	readonly nonce?: IcssNonce;
}
