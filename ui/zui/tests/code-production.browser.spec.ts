import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CodeProductionFixture from './CodeProductionFixture.svelte';

function installClipboard(writeText: (text: string) => Promise<void>): () => void {
	const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
	Object.defineProperty(navigator, 'clipboard', {
		configurable: true,
		value: { writeText }
	});
	return () => {
		if (descriptor) Object.defineProperty(navigator, 'clipboard', descriptor);
		else delete (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
	};
}

describe('ZCode production copy contract', () => {
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
