import { expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import { mount, unmount } from './browser-lifecycle.js';
import ZSegmented from '../src/components/input/ZSegmented.svelte';
import { getActiveElement } from '../src/runtime/layer/dom-realm.js';

const options = [
	{ value: 'one', label: 'One' },
	{ value: 'two', label: 'Two' }
] as const;

it('lets the root owner cancel navigation and uses the actual native RTL direction', async () => {
	let cancel = true;
	let listenerTarget: EventTarget | null = null;
	const changed = vi.fn();
	await render(ZSegmented, {
		'aria-label': 'Native direction',
		dir: 'rtl',
		options,
		defaultValue: 'one',
		onValueChange: changed,
		onkeydown: (event) => {
			listenerTarget = event.currentTarget;
			if (cancel) event.preventDefault();
		}
	});
	const root = document.querySelector<HTMLElement>('[aria-label="Native direction"]')!;
	const [first, second] = root.querySelectorAll<HTMLButtonElement>('button');
	first!.focus();
	await userEvent.keyboard('{ArrowLeft}');
	expect(listenerTarget).toBe(root);
	expect(document.activeElement).toBe(first);
	expect(changed).not.toHaveBeenCalled();
	cancel = false;
	await userEvent.keyboard('{ArrowLeft}');
	expect(document.activeElement).toBe(second);
	expect(second!.getAttribute('aria-checked')).toBe('true');
	expect(changed).toHaveBeenCalledExactlyOnceWith('two');
});

it('moves readonly Segmented focus inside a closed shadow root without selecting', async () => {
	const host = document.createElement('div');
	const shadow = host.attachShadow({ mode: 'closed' });
	document.body.append(host);
	const changed = vi.fn();
	const component = mount(ZSegmented, {
		target: shadow,
		props: {
			'aria-label': 'Shadow segmented',
			options,
			readonly: true,
			defaultValue: 'one',
			onValueChange: changed
		}
	});
	try {
		const root = shadow.querySelector<HTMLElement>('[role="radiogroup"]')!;
		const [first, second] = root.querySelectorAll<HTMLButtonElement>('button');
		first!.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(getActiveElement(root)).toBe(second);
		expect(first!.getAttribute('aria-checked')).toBe('true');
		expect(second!.getAttribute('aria-checked')).toBe('false');
		expect(changed).not.toHaveBeenCalled();
	} finally {
		await unmount(component);
		host.remove();
	}
});
