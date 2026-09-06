import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { tick } from 'svelte';
import { mount, unmount } from './browser-lifecycle.js';
import CopyButtonFixture from './CopyButtonFixture.svelte';
afterEach(() => vi.restoreAllMocks());
function host(): HTMLDivElement {
	const target = document.createElement('div');
	document.body.append(target);
	return target;
}
describe('CopyButton real control integration', () => {
	it('writes the exact value on user activation and preserves label geometry across success', async () => {
		// @zui-visual ZCopyButton stable feedback width and state icon
		const write = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
		const target = host();
		const app = mount(CopyButtonFixture, { target });
		await tick();
		const button = target.querySelector<HTMLButtonElement>('[data-testid=copy-fixture]')!;
		const initial = button.getBoundingClientRect().width;
		await userEvent.click(button);
		await expect.poll(() => button.dataset.copyState).toBe('copied');
		expect(write).toHaveBeenCalledWith('Clipboard fixture\nsecond line');
		expect(button.querySelector('[data-copy-icon=check]')).not.toBeNull();
		expect(button.getBoundingClientRect().width).toBeCloseTo(initial, 1);
		expect(target.querySelector('[data-testid=copy-events]')!.textContent).toBe('1:0');
		app.changeValue('next');
		await tick();
		expect(button.dataset.copyState).toBe('idle');
		await unmount(app);
		target.remove();
	});
	it('honors canceled clicks and displays real failure without reporting success', async () => {
		const write = vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
		const target = host();
		const app = mount(CopyButtonFixture, { target });
		await tick();
		const button = target.querySelector<HTMLButtonElement>('[data-testid=copy-fixture]')!;
		app.cancelCopy(true);
		await tick();
		await userEvent.click(button);
		expect(write).not.toHaveBeenCalled();
		app.cancelCopy(false);
		await tick();
		await userEvent.click(button);
		await expect.poll(() => button.dataset.copyState).toBe('failed');
		expect(target.querySelector('[data-testid=copy-events]')!.textContent).toBe('0:1');
		expect(button.querySelector('[data-copy-icon=check]')).toBeNull();
		await unmount(app);
		target.remove();
	});
});
