import type { Handle } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';

import { defaultTheme, icss } from '../src/lib/index.js';
import { icssHandle } from '../src/lib/sveltekit/handle.js';

async function renderWithHandle(
	handle: Handle,
	color: string,
	headers?: HeadersInit
): Promise<Response> {
	return handle({
		event: {} as Parameters<Handle>[0]['event'],
		resolve: async (_event, options) => {
			const theme = { ...defaultTheme, color: { ...defaultTheme.color, primary: color } };
			const className = icss(theme, (style) => style.color._primary);
			const html = await options?.transformPageChunk?.({
				done: true,
				html: `<html><head></head><body><div class="${className}"></div></body></html>`
			});
			return new Response(html, { headers });
		}
	} as Parameters<Handle>[0]);
}

describe('ICSS SvelteKit integration', () => {
	it('injects request-local critical CSS with a nonce', async () => {
		const response = await renderWithHandle(icssHandle({ nonce: 'request-nonce' }), '#123456');
		const html = await response.text();

		expect(html).toMatch(
			/<head><style data-icss="c-[a-z0-9]+" nonce="request-nonce">\.c-[a-z0-9]+\{color:#123456;\}<\/style><\/head>/u
		);
	});

	it('adds critical CSS hashes to an existing CSP policy', async () => {
		const response = await renderWithHandle(icssHandle({ cspHash: true }), '#abcdef', {
			'content-security-policy': "default-src 'self'; style-src 'self'"
		});

		expect(response.headers.get('content-security-policy')).toMatch(
			/default-src 'self'; style-src 'self'; style-src-elem 'self' 'sha256-[A-Za-z0-9+/=]+'/u
		);
	});

	it('isolates concurrent request registries', async () => {
		const responses = await Promise.all(
			Array.from({ length: 50 }, (_, index) => {
				const color = `#${index.toString(16).padStart(6, '0')}`;
				return renderWithHandle(icssHandle(), color);
			})
		);
		const html = await Promise.all(responses.map((response) => response.text()));

		for (let index = 0; index < html.length; index += 1) {
			const expected = `#${index.toString(16).padStart(6, '0')}`;
			expect(html[index]).toContain(`color:${expected}`);
			expect(html[index].match(/color:/gu) ?? []).toHaveLength(1);
		}
	});

	it('rejects conflicting CSP modes', () => {
		expect(() => icssHandle({ cspHash: true, nonce: 'x' })).toThrow(/either cspHash or nonce/);
	});
});
