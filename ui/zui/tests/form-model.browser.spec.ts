import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import FormModelReactiveFixture from './FormModelReactiveFixture.svelte';

describe('FormModel controlled Svelte state', () => {
	it('tracks deep proxy mutations and preserves equal frozen snapshot identity', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormModelReactiveFixture, { target });
		try {
			await tick();
			const output = target.querySelector<HTMLOutputElement>(
				'[data-testid="model-reactive-output"]'
			)!;
			expect(output.textContent).toBe('Ada|1|true');
			await userEvent.click(
				target.querySelector<HTMLButtonElement>('[data-testid="model-mutate-name"]')!
			);
			await expect.poll(() => output.textContent).toBe('Bob|1|true');
			await userEvent.click(
				target.querySelector<HTMLButtonElement>('[data-testid="model-append-row"]')!
			);
			await expect.poll(() => output.textContent).toBe('Bob|2|true');
			const identity = target.querySelector<HTMLOutputElement>(
				'[data-testid="model-array-identity"]'
			)!;
			const before = identity.textContent;
			await userEvent.click(
				target.querySelector<HTMLButtonElement>('[data-testid="model-move-equal-rows"]')!
			);
			await expect.poll(() => identity.textContent).not.toBe(before);
			expect(identity.textContent?.split(',').reverse().join(',')).toBe(before);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
