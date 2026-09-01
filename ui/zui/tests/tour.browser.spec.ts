import { mount, tick, unmount } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import ZTour, { type TourStep } from '../src/components/overlay/ZTour.svelte';

const settle = async (): Promise<void> => {
	await tick();
	await Promise.resolve();
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

describe('ZTour production contract', () => {
	it('scopes selectors and portals to the mounted ShadowRoot', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const target = document.createElement('button');
		target.id = 'shadow-tour-target';
		target.textContent = 'Shadow target';
		shadow.append(target);
		const onOpenChange = vi.fn();
		const component = mount(ZTour, {
			props: {
				defaultOpen: true,
				onOpenChange,
				steps: [
					{
						description: 'ShadowRoot description',
						id: 'shadow',
						target: '#shadow-tour-target',
						title: 'ShadowRoot title'
					}
				]
			},
			target: shadow
		});
		await settle();

		const dialog = shadow.querySelector<HTMLElement>('[role="dialog"]');
		expect(dialog?.dataset.step).toBe('shadow');
		expect(shadow.querySelector('[data-slot="spotlight"]')).not.toBeNull();
		expect(document.body.querySelector('[role="dialog"]')).toBeNull();
		expect(dialog?.getAttribute('dir')).toBe('ltr');

		shadow
			.querySelector<HTMLButtonElement>('[aria-label="Close tour"]')
			?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await tick();
		expect(onOpenChange).toHaveBeenCalledOnce();
		expect(onOpenChange).toHaveBeenCalledWith(false);

		await unmount(component);
		host.remove();
	});

	it('waits for a missing target, reports each loss once and reconnects after DOM mutation', async () => {
		const root = document.createElement('section');
		document.body.append(root);
		const onTargetMissing = vi.fn();
		const component = mount(ZTour, {
			props: {
				defaultOpen: true,
				missingTargetBehavior: 'wait',
				onTargetMissing,
				steps: [
					{
						description: 'Lazy description',
						id: 'lazy',
						target: '.lazy-tour-target',
						title: 'Lazy title'
					}
				],
				targetRoot: root
			},
			target: root
		});
		await settle();
		expect(document.querySelector('[role="dialog"]')?.getAttribute('data-missing-target')).toBe(
			'true'
		);
		expect(onTargetMissing).toHaveBeenCalledOnce();

		const target = document.createElement('button');
		target.className = 'lazy-tour-target';
		target.textContent = 'Lazy target';
		root.prepend(target);
		await settle();
		expect(document.querySelector('[role="dialog"]')?.hasAttribute('data-missing-target')).toBe(
			false
		);
		expect(document.querySelector('[data-slot="spotlight"]')).not.toBeNull();
		expect(onTargetMissing).toHaveBeenCalledOnce();

		target.remove();
		await settle();
		expect(document.querySelector('[role="dialog"]')?.getAttribute('data-missing-target')).toBe(
			'true'
		);
		expect(onTargetMissing).toHaveBeenCalledTimes(2);

		await unmount(component);
		root.remove();
	});

	it('skips missing steps in order and keeps explicit centered steps out of the missing path', async () => {
		const root = document.createElement('section');
		const existing = document.createElement('button');
		existing.className = 'existing-tour-target';
		root.append(existing);
		document.body.append(root);
		const onStepChange = vi.fn();
		const onTargetMissing = vi.fn();
		const steps: readonly TourStep[] = [
			{
				description: 'Missing',
				id: 'missing',
				target: '.missing-tour-target',
				title: 'Missing'
			},
			{
				description: 'Existing',
				id: 'existing',
				target: '.existing-tour-target',
				title: 'Existing'
			},
			{
				description: 'Centered',
				id: 'centered',
				target: null,
				title: 'Centered'
			}
		];
		const component = mount(ZTour, {
			props: {
				defaultOpen: true,
				missingTargetBehavior: 'skip',
				onStepChange,
				onTargetMissing,
				steps,
				targetRoot: root
			},
			target: root
		});
		await settle();
		expect(onTargetMissing).toHaveBeenCalledOnce();
		expect(onStepChange).toHaveBeenCalledWith(1);
		expect(document.querySelector<HTMLElement>('[role="dialog"]')?.dataset.step).toBe('existing');

		document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button').item(2).click();
		await settle();
		expect(document.querySelector<HTMLElement>('[role="dialog"]')?.dataset.step).toBe('centered');
		expect(document.querySelector('[data-slot="spotlight"]')).toBeNull();
		expect(onTargetMissing).toHaveBeenCalledOnce();

		await unmount(component);
		root.remove();
	});
});
