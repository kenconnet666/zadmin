import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CodeSizeFixture from './CodeSizeFixture.svelte';

function codeStyle(testId: string): CSSStyleDeclaration {
	return getComputedStyle(document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!);
}

it('keeps ZCode inline and block defaults while allowing explicit Theme font-size overrides', () => {
	render(CodeSizeFixture);

	expect(document.querySelector('[data-testid="inline-default"]')?.getAttribute('data-size')).toBe(
		'small'
	);
	expect(codeStyle('inline-default').fontSize).toBe('12px');
	expect(document.querySelector('[data-testid="inline-medium"]')?.getAttribute('data-size')).toBe(
		'medium'
	);
	expect(codeStyle('inline-medium').fontSize).toBe('14px');
	expect(document.querySelector('[data-testid="block-default"]')?.getAttribute('data-size')).toBe(
		'medium'
	);
	expect(codeStyle('block-default').fontSize).toBe('14px');
	expect(document.querySelector('[data-testid="block-small"]')?.getAttribute('data-size')).toBe(
		'small'
	);
	expect(codeStyle('block-small').fontSize).toBe('12px');
});

it('uses a custom Provider font-size token without changing source text, line height or copy structure', () => {
	render(CodeSizeFixture);
	const customBlock = document.querySelector<HTMLElement>('[data-testid="custom-block-default"]')!;
	const customInline = document.querySelector<HTMLElement>('[data-testid="custom-inline-medium"]')!;
	expect(customBlock.dataset.size).toBe('medium');
	expect(codeStyle('custom-block-default').fontSize).toBe('17px');
	expect(codeStyle('custom-inline-medium').fontSize).toBe('17px');
	expect(customBlock.textContent).toBe('custom block medium');
	expect(customInline.textContent).toBe('custom inline medium');

	const copyable = document.querySelector<HTMLElement>('[data-testid="copyable-block"]')!;
	const source = 'const first = 1;\n\nconst second = 2;';
	expect(copyable.textContent).toContain(source);
	expect(copyable.dataset.size).toBe('medium');
	expect(codeStyle('copyable-block').lineHeight).toBe('21px');
	expect(document.querySelector('[data-slot="copy-action"]')).not.toBeNull();
});
