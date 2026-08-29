import type { Handle } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';

import { defaultTheme } from '@zadmin/zui/core';
import { icss } from '@zadmin/zui/runtime';
import { zuiHandle } from '../src/lib/zui/handle.js';
import {
	addStyleHashHeaders,
	addStyleHashMeta,
	createStyleHash,
	injectCriticalCss
} from '../src/lib/zui/server.js';

async function renderWithHandle(
	handle: Handle,
	color: string,
	headers?: HeadersInit
): Promise<Response> {
	return handle({
		event: {} as Parameters<Handle>[0]['event'],
		resolve: async (_event, options) => {
			const theme = { ...defaultTheme, color: { ...defaultTheme.color, primary: color } };
			const className = icss(theme, (s) => s.color._primary);
			const html = await options?.transformPageChunk?.({
				done: true,
				html: `<html><head></head><body><div class="${className}"></div></body></html>`
			});
			return new Response(html, { headers });
		}
	} as Parameters<Handle>[0]);
}

describe('ZUI SvelteKit integration', () => {
	it('injects critical CSS into complete or fragment HTML', () => {
		expect(injectCriticalCss('<html><head></head><body></body></html>', '<style>x</style>')).toBe(
			'<html><head><style>x</style></head><body></body></html>'
		);
		expect(injectCriticalCss('<div>body</div>', '<style>x</style>')).toBe(
			'<style>x</style><div>body</div>'
		);
		expect(injectCriticalCss('<div>body</div>', '')).toBe('<div>body</div>');
	});

	it('patches default, element and report-only CSP directives', () => {
		const hash = createStyleHash('.x{color:red}');
		const response = addStyleHashHeaders(
			new Response('ok', {
				headers: {
					'content-security-policy': "default-src 'none'; style-src-elem 'none'",
					'content-security-policy-report-only': "default-src 'self'"
				}
			}),
			hash
		);

		expect(response.headers.get('content-security-policy')).toContain(`style-src-elem ${hash}`);
		expect(response.headers.get('content-security-policy-report-only')).toContain(
			`style-src-elem 'self' ${hash}`
		);
	});

	it('patches prerendered CSP metadata without touching unrelated tags', () => {
		const hash = createStyleHash('.x{color:red}');
		const html = `<head><meta name="description" content="test"><meta http-equiv="content-security-policy" content="default-src 'self'; style-src 'self'"></head>`;
		const result = addStyleHashMeta(html, hash);

		expect(result).toContain(`style-src-elem 'self' ${hash}`);
		expect(result).toContain('<meta name="description" content="test">');
		expect(addStyleHashMeta('<head></head>', hash)).toBe('<head></head>');
	});

	it('injects request-local critical CSS with a nonce', async () => {
		const response = await renderWithHandle(
			zuiHandle({ csp: { nonce: 'request-nonce' } }),
			'#123456'
		);
		const html = await response.text();

		expect(html).toMatch(
			/<head><style data-icss="(c-[a-z0-9]+)" nonce="request-nonce">@layer zui\.components,zui\.utilities;@layer zui\.utilities\{\.\1\{color:#123456;\}\}<\/style><\/head>/u
		);
	});

	it('adds critical CSS hashes to an existing CSP policy', async () => {
		const response = await renderWithHandle(zuiHandle({ csp: { hash: true } }), '#abcdef', {
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
				return renderWithHandle(zuiHandle(), color);
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
		expect(() => zuiHandle({ csp: { hash: true, nonce: 'x' } as never })).toThrow(
			/either CSP hash or nonce/
		);
	});

	it('buffers future streamed chunks and resolves request-local nonces', async () => {
		const handle = zuiHandle({ csp: { nonce: async () => 'async-nonce' } });
		const response = await handle({
			event: {} as Parameters<Handle>[0]['event'],
			resolve: async (_event, options) => {
				icss(defaultTheme, (s) => s.display.grid);
				expect(await options?.transformPageChunk?.({ done: false, html: '<html><head>' })).toBe('');
				const html = await options?.transformPageChunk?.({
					done: true,
					html: '</head><body></body></html>'
				});
				return new Response(html);
			}
		} as Parameters<Handle>[0]);
		const html = await response.text();

		expect(html).toContain('<html><head><style data-icss=');
		expect(html).toContain('nonce="async-nonce"');
	});

	it('leaves CSP headers unchanged when no ICSS rules are rendered', async () => {
		const handle = zuiHandle({ csp: { hash: true } });
		const response = await handle({
			event: {} as Parameters<Handle>[0]['event'],
			resolve: async (_event, options) => {
				const html = await options?.transformPageChunk?.({
					done: true,
					html: '<html><head></head><body></body></html>'
				});
				return new Response(html, {
					headers: { 'content-security-policy': "default-src 'self'" }
				});
			}
		} as Parameters<Handle>[0]);

		expect(response.headers.get('content-security-policy')).toBe("default-src 'self'");
		expect(await response.text()).not.toContain('data-icss');
	});

	it('adds hashes to prerender-style CSP metadata', async () => {
		const handle = zuiHandle({ csp: { hash: true } });
		const response = await handle({
			event: {} as Parameters<Handle>[0]['event'],
			resolve: async (_event, options) => {
				icss(defaultTheme, (s) => s.color._primary);
				const html = await options?.transformPageChunk?.({
					done: true,
					html: `<html><head><meta http-equiv="content-security-policy" content="default-src 'self'; style-src 'self'"></head><body></body></html>`
				});
				return new Response(html);
			}
		} as Parameters<Handle>[0]);

		expect(await response.text()).toMatch(/style-src-elem 'self' 'sha256-[A-Za-z0-9+/=]+'/u);
	});
});
