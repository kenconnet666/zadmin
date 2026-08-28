import { describe, expect, it } from 'vitest';
import { hashString } from '@zadmin/zui/core';

import { StyleRegistry } from '../src/lib/icss/registry.js';
import { createIcssRuntime } from '../src/lib/icss/runtime.js';
import { hyphenateProperty } from '../src/lib/icss/serialize.js';
import { MemoryStyleSheet } from '../src/lib/icss/sheet.js';
import {
	addStyleHashHeaders,
	addStyleHashMeta,
	createStyleHash,
	injectCriticalCss
} from '../src/lib/sveltekit/server.js';
import { defaultTheme } from '../src/lib/index.js';

describe('ICSS runtime edge behavior', () => {
	it('hashes deterministically and hyphenates standard and custom properties', () => {
		expect(hashString('same')).toBe(hashString('same'));
		expect(hashString('same')).not.toBe(hashString('different'));
		expect(hyphenateProperty('WebkitLineClamp')).toBe('-webkit-line-clamp');
		expect(hyphenateProperty('msOverflowStyle')).toBe('-ms-overflow-style');
		expect(hyphenateProperty('--already-custom')).toBe('--already-custom');
	});

	it('clears registries and validates structural limits', () => {
		expect(() => new StyleRegistry({ maxVariantsPerOwner: 0 })).toThrow(/positive integer/);
		expect(() => new StyleRegistry({ maxVariantsPerOwner: 1.5 })).toThrow(/positive integer/);

		const sheet = new MemoryStyleSheet();
		const registry = new StyleRegistry({ sheet });
		createIcssRuntime({ registry }).icss(defaultTheme, (style) => style.display.flex);
		expect(sheet.entries).toHaveLength(1);
		registry.clear();
		expect(registry.size).toBe(0);
		expect(sheet.entries).toHaveLength(0);
	});

	it('releases owner prefixes and tolerates unknown owner removals', () => {
		const registry = new StyleRegistry();
		const runtime = createIcssRuntime({ registry });
		runtime.ownedIcss('module:a', defaultTheme, (style) => style.color._primary);
		runtime.ownedIcss('module:b', defaultTheme, (style) => style.color._danger);
		registry.releaseOwner('missing');
		registry.releaseOwnerPrefix('module:');
		expect(registry.size).toBe(0);
	});

	it('escapes nonce attributes and raw style closing tags', () => {
		const registry = new StyleRegistry();
		createIcssRuntime({ registry }).icss(defaultTheme, (style) =>
			style.content('</style><script>')
		);
		const tag = registry.styleTag({ nonce: 'a"<&' });

		expect(tag).toContain('nonce="a&quot;&lt;&amp;"');
		expect(tag).toContain('<\\/style>');
	});

	it('injects critical CSS with and without a head', () => {
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

	it('patches prerendered CSP meta tags without touching unrelated metadata', () => {
		const hash = createStyleHash('.x{color:red}');
		const html = `<head><meta name="description" content="test"><meta http-equiv="content-security-policy" content="default-src 'self'; style-src 'self'"></head>`;
		const result = addStyleHashMeta(html, hash);

		expect(result).toContain(`style-src-elem 'self' ${hash}`);
		expect(result).toContain('<meta name="description" content="test">');
		expect(addStyleHashMeta('<head></head>', hash)).toBe('<head></head>');
	});
});
