import type { RequestEvent } from '@sveltejs/kit';

export type ZuiNonce =
	string | ((event: RequestEvent) => string | undefined | Promise<string | undefined>);

export type ZuiCspOptions =
	| { readonly hash: true; readonly nonce?: never }
	| { readonly hash?: never; readonly nonce: ZuiNonce };

export interface ZuiHandleOptions {
	readonly csp?: ZuiCspOptions;
}
