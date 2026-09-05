import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ZCode } from '../src/entrypoints/code.js';

const longToken = '0123456789abcdef'.repeat(16);

it('wraps an unbroken inline token inside a narrow surface without changing its text', () => {
	render(ZCode, { code: longToken, inline: true, wrap: true, style: 'width:180px' });
	const code = document.querySelector<HTMLElement>('code[data-highlight-status]')!;
	expect(code.textContent).toBe(longToken);
	expect(code.scrollWidth).toBeLessThanOrEqual(code.clientWidth + 1);
	expect(code.getBoundingClientRect().height).toBeGreaterThan(
		Number.parseFloat(getComputedStyle(code).lineHeight) * 2
	);
});

it('keeps highlighted long strings wrapped and preserves source newlines', async () => {
	const source = `const value = "${longToken}";\nconst ready = true;`;
	render(ZCode, { code: source, lang: 'typescript', wrap: true, style: 'width:180px' });
	const pre = document.querySelector<HTMLElement>('pre[data-highlight-status]')!;
	await expect.poll(() => pre.dataset.highlightStatus).toBe('highlighted');
	expect(pre.textContent).toBe(source);
	expect(pre.scrollWidth).toBeLessThanOrEqual(pre.clientWidth + 1);
});

it('preserves intentional horizontal scrolling when wrap is disabled', () => {
	render(ZCode, { code: longToken, wrap: false, style: 'width:180px' });
	const pre = document.querySelector<HTMLElement>('pre[data-highlight-status]')!;
	expect(pre.textContent).toBe(longToken);
	expect(getComputedStyle(pre).whiteSpace).toBe('pre');
	expect(getComputedStyle(pre).overflowX).toBe('auto');
	expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
});
