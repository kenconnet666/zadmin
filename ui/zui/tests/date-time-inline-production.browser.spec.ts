import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Fixture from './DateTimeInlineProductionFixture.svelte';
import { resetForm } from './form-reset.js';

const root = () => document.querySelector<HTMLElement>('[data-testid="inline-picker"]')!;
const form = () => document.querySelector<HTMLFormElement>('[data-testid="inline-form"]')!;
const events = () => document.querySelector('[data-testid="inline-events"]')!.textContent;
const action = (label: string) =>
	[...root().querySelectorAll<HTMLButtonElement>('button')].find(
		(button) => button.textContent?.trim() === label
	)!;
const confirm = () =>
	root().querySelector<HTMLButtonElement>('[data-slot="date-time-footer"] button:last-child')!;

describe('inline date-time composition', () => {
	it('uses a persistent panel with cancel, confirm and callback-free reset', async () => {
		await render(Fixture);
		await tick();
		form().style.width = '320px';
		await tick();
		expect(form().scrollWidth).toBeLessThanOrEqual(form().clientWidth + 1);
		expect(
			root().querySelector<HTMLElement>('[data-slot="inline-panel"]')!.scrollWidth
		).toBeLessThanOrEqual(320);
		expect(root().querySelector('[data-slot="trigger"]')).toBeNull();
		expect(root().querySelector('[role="dialog"]')).toBeNull();
		action('Afternoon').click();
		await tick();
		expect(new FormData(form()).getAll('appointment')).toEqual(['2026-09-07T09:30:00']);
		action('Cancel').click();
		await tick();
		expect(events()).toBe('0|0');
		expect(root().querySelector('[data-slot="inline-panel"]')).not.toBeNull();
		action('Afternoon').click();
		await tick();
		confirm().click();
		await tick();
		expect(new FormData(form()).getAll('appointment')).toEqual(['2026-09-08T14:30:00']);
		expect(events()).toBe('1|1');
		expect(root().dataset.state).toBe('inline');
		await resetForm(form());
		await expect.poll(() => new FormData(form()).get('appointment')).toBe('2026-09-07T09:30:00');
		expect(events()).toBe('1|1');
	});
	it('commits immediate actions while keeping the same inline surface', async () => {
		await render(Fixture, { variant: 'immediate' });
		await tick();
		const panel = root().querySelector('[data-slot="inline-panel"]');
		action('Afternoon').click();
		await tick();
		expect(new FormData(form()).get('appointment')).toBe('2026-09-08T14:30:00');
		expect(events()).toBe('1|1');
		expect(root().querySelector('[data-slot="inline-panel"]')).toBe(panel);
	});
	it('keeps range presets draft-only and preserves both native entries', async () => {
		await render(Fixture, { variant: 'range' });
		await tick();
		action('Tomorrow').click();
		await tick();
		expect(new FormData(form()).get('window.start')).toBe('2026-09-07T09:30:00');
		confirm().click();
		await tick();
		expect(new FormData(form()).getAll('window.start')).toEqual(['2026-09-08T14:30:00']);
		expect(new FormData(form()).getAll('window.end')).toEqual(['2026-09-08T18:30:00']);
		expect(root().dataset.state).toBe('inline');
		expect(events()).toBe('1|1');
	});
	it('rolls a rejected owner back without committing or removing the panel', async () => {
		await render(Fixture, { variant: 'rejected' });
		await tick();
		action('Afternoon').click();
		await tick();
		confirm().click();
		await tick();
		expect(new FormData(form()).get('appointment')).toBe('2026-09-07T09:30:00');
		expect(events()?.split('|')[1]).toBe('0');
		expect(root().dataset.state).toBe('inline');
	});
	it('lets readonly controls keep focus while disabling mutation actions', async () => {
		await render(Fixture, { variant: 'readonly' });
		await tick();
		const day = root().querySelector<HTMLButtonElement>('[data-slot="grid"] button[tabindex="0"]')!;
		expect(day.disabled).toBe(false);
		day.focus();
		expect(document.activeElement).toBe(day);
		day.click();
		await tick();
		expect(action('Afternoon').disabled).toBe(true);
		expect(confirm().disabled).toBe(true);
		expect(events()).toBe('0|0');
		expect(new FormData(form()).get('appointment')).toBe('2026-09-07T09:30:00');
	});
});
