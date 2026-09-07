import { tick } from 'svelte';
import { expect, it } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import Fixture from './DatePickerStateFixture.svelte';

it.each(['date', 'range'] as const)(
	'%s picker preserves requested open while suppressing disabled/readonly layers',
	async (kind) => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(Fixture, { target, props: { kind } });
		try {
			await tick();
			const root = target.querySelector<HTMLElement>('[data-testid="state-picker"]')!;
			expect(root.dataset.state).toBe('closed');
			expect(document.querySelector('[role="dialog"]')).toBeNull();
			expect(component.intent()).toEqual({ open: true, changes: 0 });
			component.enable();
			await expect.poll(() => root.dataset.state).toBe('open');
			const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
			expect(dialog.dir).toBe('ltr');
			expect(getComputedStyle(dialog.querySelector('[role="grid"]')!).direction).toBe('ltr');
			component.makeReadonly();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
			expect(root.dataset.state).toBe('closed');
			expect(component.intent()).toEqual({ open: true, changes: 0 });
		} finally {
			await unmount(component);
			target.remove();
		}
	}
);
