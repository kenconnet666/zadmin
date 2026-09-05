import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { ZCode } from '../src/entrypoints/code.js';

import CodeProductionFixture from './CodeProductionFixture.svelte';

function installClipboard(writeText: (text: string) => Promise<void>): () => void {
	const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: { writeText }
	});
	return () => {
		if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
		else Reflect.deleteProperty(navigator, 'clipboard');
	};
}

describe('ZCode production copy contract', () => {
	it('preserves inline source text and line height when syntax highlighting resolves', async () => {
		const source = "import { ZButton } from '@zadmin/zui';";
		render(ZCode, { code: source, inline: true, wrap: true, lang: 'typescript' });
		const code = document.querySelector<HTMLElement>('code[data-highlight-status]')!;
		await expect.poll(() => code.dataset.highlightStatus).toBe('highlighted');
		expect(code.textContent).toBe(source);
		const style = getComputedStyle(code);
		expect(code.getBoundingClientRect().height).toBe(
			Number.parseFloat(style.lineHeight) +
				Number.parseFloat(style.paddingTop) +
				Number.parseFloat(style.paddingBottom)
		);
	});

	it('preserves source newlines and reserves space for the copy action', async () => {
		const source = 'const first = 1;\n\nconst second = 2;';
		render(ZCode, { code: source, copyable: true, lang: 'typescript' });
		const pre = document.querySelector<HTMLElement>('pre[data-highlight-status]')!;
		await expect.poll(() => pre.dataset.highlightStatus).toBe('highlighted');
		expect(pre.textContent).toBe(source);
		expect(getComputedStyle(pre).paddingInlineEnd).toBe('56px');
		const style = getComputedStyle(pre);
		expect(pre.getBoundingClientRect().height).toBe(
			Number.parseFloat(style.lineHeight) * 3 +
				Number.parseFloat(style.paddingTop) +
				Number.parseFloat(style.paddingBottom) +
				Number.parseFloat(style.borderTopWidth) +
				Number.parseFloat(style.borderBottomWidth)
		);
	});
	it('copies exact source, retains focus and announces a localized success', async () => {
		const writeText = vi.fn(async () => undefined);
		const restore = installClipboard(writeText);
		try {
			render(CodeProductionFixture);
			const button = document.querySelector<HTMLButtonElement>('[data-slot="copy-action"]')!;
			button.focus();
			button.click();
			await tick();
			await expect.poll(() => writeText.mock.calls.length).toBe(1);
			expect(writeText).toHaveBeenCalledWith('pnpm deploy');
			expect(document.activeElement).toBe(button);
			expect(button.getAttribute('aria-label')).toBe('Artifact copied');
			expect(document.querySelector('[data-slot="copy-status"]')?.textContent?.trim()).toBe(
				'Artifact copied'
			);
			expect(document.querySelector('[data-testid="code-production-output"]')?.textContent).toBe(
				'copied:1'
			);
		} finally {
			restore();
		}
	});

	it('converts Clipboard rejection into a safe failed state', async () => {
		const restore = installClipboard(async () => {
			throw new Error('private permission detail');
		});
		try {
			render(CodeProductionFixture);
			const button = document.querySelector<HTMLButtonElement>('[data-slot="copy-action"]')!;
			button.click();
			await expect
				.poll(() => document.querySelector('[data-testid="code-production-output"]')?.textContent)
				.toBe('failed:1');
			expect(button.getAttribute('aria-label')).toBe('Artifact copy failed');
			expect(document.body.textContent).not.toContain('private permission detail');
		} finally {
			restore();
		}
	});
});
