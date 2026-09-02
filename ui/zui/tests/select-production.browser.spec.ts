import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import SelectFixture from './SelectFixture.svelte';

describe('ZSelect production contract', () => {
	it('supports default, controlled updates, Field/Form reset and vetoed selection', async () => {
		render(SelectFixture, { defaultOpen: true, prevent: true });
		const form = document.querySelector<HTMLFormElement>('[data-testid="select-form"]')!;
		const trigger = document.querySelector<HTMLButtonElement>('[data-testid="select-trigger"]')!;
		await tick();
		expect(trigger.getAttribute('aria-label')).toBe('Choice');
		expect(trigger.textContent).toContain('Beta');
		expect(new FormData(form).get('choice')).toBe('b');

		document.querySelector<HTMLElement>('[data-testid="select-d"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="select-output"]')?.textContent).toMatch(/^b:/u);

		document.querySelector<HTMLButtonElement>('[data-testid="select-owner-clear"]')?.click();
		await tick();
		expect(new FormData(form).get('choice')).toBeNull();
		form.reset();
		await expect.poll(() => new FormData(form).get('choice')).toBe('b');
	});
});
