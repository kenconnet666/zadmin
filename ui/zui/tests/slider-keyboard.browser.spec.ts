import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import SliderKeyboardFixture from './SliderKeyboardFixture.svelte';

describe('ZSlider logical keyboard direction', () => {
	it('maps arrows to logical direction and calls each owner once', async () => {
		render(SliderKeyboardFixture);
		const slider = document.querySelector<HTMLInputElement>('[data-testid="slider-keyboard"]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="slider-keyboard-output"]'
		)!;
		slider.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => output.textContent).toBe('ltr:55:1:1');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => output.textContent).toBe('ltr:50:2:2');
		document.querySelector<HTMLButtonElement>('[data-testid="slider-toggle-direction"]')!.click();
		await expect.poll(() => output.textContent).toBe('rtl:50:2:2');
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => output.textContent).toBe('rtl:45:3:3');
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => output.textContent).toBe('rtl:50:4:4');
	});
});
