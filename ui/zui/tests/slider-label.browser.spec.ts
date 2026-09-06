import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import ZSlider from '../src/components/input/ZSlider.svelte';

describe('slider native label ownership', () => {
	it.each(['always', 'focus'] as const)(
		'keeps the input as the label control with %s value text',
		async (valueLabel) => {
			const label = document.createElement('label');
			label.append('Threshold');
			document.body.append(label);
			const component = mount(ZSlider, {
				target: label,
				props: {
					valueLabel,
					defaultValue: 35,
					step: 5,
					formatValue: (value) => `${value}%`,
					marks: [{ value: 50, label: 'Middle' }]
				}
			});
			try {
				await tick();
				const input = label.querySelector<HTMLInputElement>('input')!;
				expect(label.control).toBe(input);
				input.focus();
				await userEvent.keyboard('{ArrowRight}');
				await expect.poll(() => input.value).toBe('40');
				expect(label.control).toBe(input);
				expect(input.labels?.item(0)).toBe(label);
				expect(input.getAttribute('aria-valuetext')).toBe('40%');
				expect(label.querySelectorAll('[data-slot="value-label"]')).toHaveLength(1);
			} finally {
				await unmount(component);
				label.remove();
			}
		}
	);
});
