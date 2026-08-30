import { describe, expect, it } from 'vitest';

import { BrowserStyleSheet, type StyleSheetEntry } from '../src/icss/sheet.js';

function entry(className: string, declaration = 'color:red'): StyleSheetEntry {
	const rule = `.${className}{${declaration};}`;
	return { className, cssText: rule, rules: [rule] };
}

describe('BrowserStyleSheet', () => {
	it('hydrates SSR classes and discovers their nonce', () => {
		const root = document.implementation.createHTMLDocument('hydrate');
		const ssr = root.createElement('style');
		ssr.dataset.icss = 'c-server-a  c-server-b';
		ssr.setAttribute('nonce', 'server-nonce');
		root.head.append(ssr);
		const sheet = new BrowserStyleSheet({ root, speedy: false });

		expect([...sheet.hydratedClassNames]).toEqual(['c-server-a', 'c-server-b']);
		sheet.insert(entry('c-client'));
		const client = [...root.querySelectorAll<HTMLStyleElement>('style[data-icss]')].at(-1);
		expect(client?.nonce).toBe('server-nonce');
		expect(client?.textContent).toContain('.c-client{color:red;}');
		sheet.clear();
		expect(root.querySelectorAll('style[data-icss]')).toHaveLength(1);
	});

	it('uses a meta nonce and non-speedy text insertion', () => {
		const root = document.implementation.createHTMLDocument('meta');
		const meta = root.createElement('meta');
		meta.name = 'icss-nonce';
		meta.content = 'meta-nonce';
		root.head.append(meta);
		const sheet = new BrowserStyleSheet({ root, speedy: false });

		sheet.insert(entry('c-one'));
		sheet.insert(entry('c-two', 'display:block'));
		const style = root.querySelector<HTMLStyleElement>('style[data-icss]');
		expect(style?.nonce).toBe('meta-nonce');
		expect(style?.dataset.icss).toBe('c-one c-two');
		expect(style?.textContent).toContain('.c-two{display:block;}');
		sheet.remove('c-one');
		expect(style?.isConnected).toBe(false);
		expect(root.querySelector('style[data-icss]')?.getAttribute('data-icss')).toBe('c-two');
		sheet.remove('missing');
	});

	it('inserts CSSOM rules after an explicit insertion point', () => {
		const root = document.implementation.createHTMLDocument('speedy');
		const marker = root.createComment('icss');
		root.head.append(marker);
		const sheet = new BrowserStyleSheet({ insertionPoint: marker, nonce: 'explicit', root });

		sheet.insert(entry('c-speedy'));
		const style = marker.nextSibling as HTMLStyleElement | null;
		expect(style?.tagName).toBe('STYLE');
		expect(style?.nonce).toBe('explicit');
		expect(style?.sheet?.cssRules).toHaveLength(2);
		expect(style?.sheet?.cssRules[0]?.cssText).toContain('zui.components, zui.utilities');
	});

	it('skips a browser-rejected CSSOM rule without losing later valid entries', () => {
		const root = document.implementation.createHTMLDocument('invalid-rule');
		const sheet = new BrowserStyleSheet({ root });
		sheet.insert({ className: 'c-invalid', cssText: '.c-invalid{}', rules: ['.c-invalid[{'] });
		sheet.insert(entry('c-after'));

		const style = root.querySelector<HTMLStyleElement>('style[data-icss]');
		expect(style?.dataset.icss).toBe('c-invalid c-after');
		expect(
			[...(style?.sheet?.cssRules ?? [])].some((rule) => rule.cssText.includes('.c-after'))
		).toBe(true);
	});

	it('supports isolated ShadowRoot registries', () => {
		const host = document.createElement('div');
		document.body.append(host);
		const root = host.attachShadow({ mode: 'open' });
		const sheet = new BrowserStyleSheet({ root, speedy: false });

		sheet.insert(entry('c-shadow'));
		expect(root.querySelector('style[data-icss]')?.textContent).toContain('.c-shadow');
		host.remove();
	});

	it('adopts remaining hydrated entries when HMR removes an SSR-owned class', () => {
		const root = document.implementation.createHTMLDocument('hmr');
		const ssr = root.createElement('style');
		ssr.dataset.icss = 'c-old c-shared';
		ssr.textContent = '.c-old{color:red}.c-shared{display:block}';
		root.head.append(ssr);
		const sheet = new BrowserStyleSheet({ root, speedy: false });
		sheet.insert(entry('c-old'));
		sheet.insert(entry('c-shared', 'display:block'));

		sheet.remove('c-old');
		expect(ssr.isConnected).toBe(false);
		const adopted = root.querySelector<HTMLStyleElement>('style[data-icss]');
		expect(adopted?.dataset.icss).toBe('c-shared');
		expect(adopted?.textContent).not.toContain('c-old');
	});
});
