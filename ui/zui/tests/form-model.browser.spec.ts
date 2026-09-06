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

	it('publishes accepted plain-owner writes without making initialize effects self-dependent', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(FormModelReactiveFixture, { target });
		try {
			await tick();
			const plainOutput = target.querySelector<HTMLOutputElement>(
				'[data-testid="model-plain-owner"]'
			)!;
			const initializeOutput = target.querySelector<HTMLOutputElement>(
				'[data-testid="model-initialize-effect"]'
			)!;
			expect(plainOutput.textContent).toBe('0');
			expect(initializeOutput.textContent).toBe('1|1');

			await userEvent.click(
				target.querySelector<HTMLButtonElement>('[data-testid="model-set-plain-owner"]')!
			);
			await expect.poll(() => plainOutput.textContent).toBe('1');

			await userEvent.click(
				target.querySelector<HTMLButtonElement>('[data-testid="model-change-initialize-source"]')!
			);
			await expect.poll(() => initializeOutput.textContent).toBe('2|2');
			await tick();
			expect(initializeOutput.textContent).toBe('2|2');
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
