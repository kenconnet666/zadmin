import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import AvatarProductionFixture from './AvatarProductionFixture.svelte';

describe('ZAvatar production browser contract', () => {
	it('projects native image props and distinguishes named from decorative fallbacks', () => {
		render(AvatarProductionFixture);
		const named = document.querySelector<HTMLElement>('[data-testid="avatar-named"]')!;
		const decorative = document.querySelector<HTMLElement>('[data-testid="avatar-decorative"]')!;
		const image = document.querySelector<HTMLImageElement>(
			'[data-testid="avatar-responsive"] [data-slot="image"]'
		)!;

		expect(named.querySelector('[data-slot="fallback"]')?.getAttribute('role')).toBe('img');
		expect(named.querySelector('[data-slot="fallback"]')?.getAttribute('aria-label')).toBe(
			'Named fallback'
		);
		expect(decorative.querySelector('[data-slot="fallback"]')?.hasAttribute('role')).toBe(false);
		expect(decorative.querySelector('[data-slot="fallback"]')?.getAttribute('aria-hidden')).toBe(
			'true'
		);
		expect(image.loading).toBe('lazy');
		expect(image.decoding).toBe('async');
		expect(image.crossOrigin).toBe('anonymous');
		expect(image.referrerPolicy).toBe('no-referrer');
		expect(image.draggable).toBe(false);
		expect(image.sizes).toBe('48px');
		expect(image.srcset).toContain('32w');
	});

	it('isolates keyed source attempts and only accepts current image events', async () => {
		render(AvatarProductionFixture);
		const root = document.querySelector<HTMLElement>('[data-testid="avatar-responsive"]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="avatar-production-output"]'
		)!;
		const oldImage = root.querySelector<HTMLImageElement>('[data-slot="image"]')!;
		const errorsBefore = Number(output.textContent?.split(':')[2] ?? 0);

		document.querySelector<HTMLButtonElement>('[data-testid="avatar-use-second"]')?.click();
		await tick();
		const currentImage = root.querySelector<HTMLImageElement>('[data-slot="image"]')!;
		expect(currentImage).not.toBe(oldImage);
		expect(root.dataset.state).toBe('image');

		oldImage.dispatchEvent(new Event('error'));
		await tick();
		expect(Number(output.textContent?.split(':')[2] ?? 0)).toBe(errorsBefore);
		expect(root.dataset.state).toBe('image');

		currentImage.dispatchEvent(new Event('error'));
		await tick();
		expect(Number(output.textContent?.split(':')[2] ?? 0)).toBe(errorsBefore + 1);
		expect(root.dataset.state).toBe('fallback');
		expect(currentImage.hidden).toBe(true);
		expect(root.querySelector<HTMLElement>('[data-slot="fallback"]')?.hidden).toBe(false);

		currentImage.dispatchEvent(new Event('load'));
		await tick();
		expect(root.dataset.state).toBe('image');
		expect(currentImage.hidden).toBe(false);

		document.querySelector<HTMLButtonElement>('[data-testid="avatar-clear"]')?.click();
		await tick();
		expect(root.querySelector('[data-slot="image"]')).toBeNull();
		expect(root.dataset.state).toBe('fallback');
		expect(output.textContent).toContain('none:');
	});
});
