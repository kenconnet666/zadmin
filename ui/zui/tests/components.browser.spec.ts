import { mount, tick, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import DynamicBox from './DynamicBox.svelte';
import ComponentGallery from './ComponentGallery.svelte';
import FieldFixture from './FieldFixture.svelte';
import ProviderRuntimeFixture from './ProviderRuntimeFixture.svelte';
import { createBrowserIcssRuntime } from '../src/lib/icss/runtime.js';
import { defaultTheme } from '../src/lib/theme/default.js';
import { extendTheme } from '../src/lib/theme/define.js';
import { ZCode } from '../src/lib/code.js';

function insertedRuleCount(): number {
	return [...document.querySelectorAll<HTMLStyleElement>('style[data-icss]')].reduce(
		(total, style) => total + (style.sheet?.cssRules.length ?? 0),
		0
	);
}

describe('compiled ICSS browser updates', () => {
	it('enhances ZCode with Shiki tokens without replacing its text semantics', async () => {
		render(ZCode, {
			code: 'const answer: number = 42;',
			highlightedLines: [1],
			lang: 'typescript',
			lineNumbers: true
		});
		const root = document.querySelector<HTMLElement>('[data-highlight-status]');
		expect(root?.textContent).toContain('const answer: number = 42;');
		await expect.poll(() => root?.dataset.highlightStatus, { timeout: 10_000 }).toBe('highlighted');
		expect(root?.querySelectorAll('[data-highlighted="true"]')).toHaveLength(1);
		expect(root?.querySelector('[aria-hidden="true"]')?.textContent).toBe('1');
	});

	it('keeps ZCode resilient for plain, oversized and invalid language inputs', async () => {
		render(ZCode, { ariaLabel: 'plain-code', code: 'plain', inline: true, wrap: true });
		const plain = document.querySelector<HTMLElement>('[aria-label="plain-code"]');
		expect(plain?.tagName).toBe('CODE');
		expect(plain?.dataset.highlightStatus).toBe('plain');
		expect(plain?.textContent).toBe('plain');

		render(ZCode, {
			ariaLabel: 'large-code',
			code: 'x'.repeat(100_001),
			lang: 'css'
		});
		const large = document.querySelector<HTMLElement>('[aria-label="large-code"]');
		expect(large?.dataset.highlightStatus).toBe('too-large');

		render(ZCode, {
			ariaLabel: 'invalid-code',
			code: 'value',
			lang: 'missing' as never
		});
		const invalid = document.querySelector<HTMLElement>('[aria-label="invalid-code"]');
		await expect.poll(() => invalid?.dataset.highlightStatus).toBe('failed');
		expect(invalid?.textContent).toBe('value');

		for (const [language, source] of [
			['css', '.ready { display: block; }'],
			['json', '{"ready":true}']
		] as const) {
			render(ZCode, { ariaLabel: `${language}-code`, code: source, lang: language });
			const highlighted = document.querySelector<HTMLElement>(`[aria-label="${language}-code"]`);
			await expect.poll(() => highlighted?.dataset.highlightStatus).toBe('highlighted');
		}
	});
	it('updates only the inline variable while class and rules stay stable', async () => {
		render(DynamicBox);
		const target = document.querySelector<HTMLElement>('[data-testid="target"]');
		const increment = document.querySelector<HTMLButtonElement>('[data-testid="increment"]');
		expect(target).not.toBeNull();
		expect(increment).not.toBeNull();
		if (target === null || increment === null) return;

		const variable = [...target.style].find((name) => name.startsWith('--width-'));
		expect(variable).toBeDefined();
		if (variable === undefined) return;
		const initialClass = target.className;
		const initialRules = insertedRuleCount();
		const initialStyleTags = document.querySelectorAll('style[data-icss]').length;
		expect(target.style.getPropertyValue(variable)).toBe('10');

		for (let count = 0; count < 10_000; count += 1) {
			increment.click();
			if (count % 100 === 99) await tick();
		}

		expect(target.style.getPropertyValue(variable)).toBe('10010');
		expect(target.className).toBe(initialClass);
		expect(insertedRuleCount()).toBe(initialRules);
		expect(document.querySelectorAll('style[data-icss]')).toHaveLength(initialStyleTags);
		expect(document.querySelector('svelte-css-wrapper')).toBeNull();
	});

	it('mounts and unmounts the Symbol carrier 100 times without growing CSS resources', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const warmup = mount(DynamicBox, { target });
		await unmount(warmup);
		const baselineRules = insertedRuleCount();
		const baselineTags = document.querySelectorAll('style[data-icss]').length;

		for (let count = 0; count < 100; count += 1) {
			const component = mount(DynamicBox, { target });
			await unmount(component);
		}

		expect(insertedRuleCount()).toBe(baselineRules);
		expect(document.querySelectorAll('style[data-icss]')).toHaveLength(baselineTags);
		expect(target.childNodes).toHaveLength(0);
		target.remove();
	});

	it('updates and removes component-boundary variables without wrappers', async () => {
		render(ComponentGallery);
		const manual = document.querySelector<HTMLElement>('[data-testid="manual"]');
		const change = document.querySelector<HTMLButtonElement>('[data-testid="change"]');
		const style = document.querySelector<HTMLButtonElement>('[data-testid="style"]');
		const remove = document.querySelector<HTMLButtonElement>('[data-testid="remove"]');
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('1');

		change?.click();
		await tick();
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('2');
		style?.click();
		await tick();
		expect(manual?.style.color).toBe('blue');
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('2');
		remove?.click();
		await tick();
		expect(manual?.style.getPropertyValue('--manual-value')).toBe('');
		expect(document.querySelector('svelte-css-wrapper')).toBeNull();
	});

	it('applies provider themes and native button semantics', () => {
		render(ComponentGallery);
		const button = document.querySelector<HTMLButtonElement>('[data-testid="button"]');
		const text = document.querySelector<HTMLElement>('[data-testid="text"]');
		const stack = document.querySelector<HTMLElement>('[data-testid="stack"]');
		const numericStack = document.querySelector<HTMLElement>('[data-testid="numeric-stack"]');
		const icon = document.querySelector<SVGSVGElement>('[data-testid="icon"]');

		expect(button?.type).toBe('button');
		expect(getComputedStyle(button as Element).backgroundColor).toBe('rgb(220, 38, 38)');
		expect(getComputedStyle(text as Element).color).toBe('rgb(124, 58, 237)');
		expect(getComputedStyle(text as Element).fontSize).toBe('16px');
		expect(getComputedStyle(stack as Element).gap).toBe('8px');
		expect(getComputedStyle(numericStack as Element).gap).toBe('6px');
		expect(icon?.getAttribute('role')).toBe('img');
		expect(getComputedStyle(icon as Element).width).toBe('20px');
	});

	it('keeps an explicit ShadowRoot runtime isolated and supports nested themes', async () => {
		const host = document.createElement('div');
		const shadow = host.attachShadow({ mode: 'open' });
		document.body.append(host);
		const runtime = createBrowserIcssRuntime({ root: shadow });
		const nestedTheme = extendTheme(defaultTheme, {
			color: { primary: '#6d28d9', primaryHover: '#5b21b6' }
		});
		const component = mount(ProviderRuntimeFixture, {
			props: { nestedTheme, runtime, theme: defaultTheme },
			target: shadow
		});
		await tick();

		expect(shadow.querySelectorAll('style[data-icss]')).toHaveLength(1);
		expect(shadow.querySelectorAll('button')).toHaveLength(2);
		expect(shadow.querySelector('[data-testid="outer-context"]')?.textContent).toBe('zh-CN:rtl');
		expect(shadow.querySelector('[data-testid="inner-context"]')?.textContent).toBe('zh-CN:rtl');
		expect(runtime.registry.cssText()).toContain('#2563eb');
		expect(runtime.registry.cssText()).toContain('#6d28d9');

		await unmount(component);
		runtime.registry.clear();
		host.remove();
	});

	it('links field semantics and calls onValueChange once per user input', async () => {
		render(FieldFixture);
		const input = document.querySelector<HTMLInputElement>('[data-testid="field-input"]');
		const output = document.querySelector<HTMLOutputElement>('[data-testid="field-output"]');
		const label = document.querySelector<HTMLLabelElement>('label');
		const optional = document.querySelector<HTMLInputElement>('[data-testid="optional-input"]');
		const inherited = document.querySelector<HTMLInputElement>('[data-testid="inherited-input"]');
		const field = label?.parentElement;
		const messages = field?.querySelectorAll('[aria-live] p');
		expect(input).not.toBeNull();
		if (input === null) return;
		let resetEvents = 0;
		input.form?.addEventListener('reset', () => (resetEvents += 1));

		expect(label?.htmlFor).toBe(input.id);
		expect(input.required).toBe(true);
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')?.split(' ')).toHaveLength(4);
		expect(optional?.required).toBe(false);
		expect(optional?.hasAttribute('aria-describedby')).toBe(false);
		expect(optional?.hasAttribute('aria-invalid')).toBe(false);
		expect(inherited?.disabled).toBe(true);
		expect(inherited?.readOnly).toBe(true);
		expect(inherited?.name).toBe('inherited');
		expect(field?.className).not.toBe('');
		expect(label?.className).not.toBe('');
		expect(input.className).not.toBe('');
		expect(messages).toHaveLength(2);
		expect([...(messages ?? [])].every((message) => message.className.length > 0)).toBe(true);

		input.value = 'alice';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		expect(output?.textContent).toBe('alice:1');

		input.form?.reset();
		expect(resetEvents).toBe(1);
		await new Promise((resolve) => setTimeout(resolve, 0));
		await tick();
		await tick();
		expect(input.value).toBe('seed');
		expect(output?.textContent).toBe('alice:1');
	});
});
