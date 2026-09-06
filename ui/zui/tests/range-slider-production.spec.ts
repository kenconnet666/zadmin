import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZRangeSlider from '../src/components/input/ZRangeSlider.svelte';
import ZSlider from '../src/components/input/ZSlider.svelte';
import {
	applySliderRangeChange,
	normalizeSliderRange,
	sliderKeyboardValue,
	sliderValueFromPointer
} from '../src/runtime/slider.js';

describe('Slider family server and math contract', () => {
	it('renders one native owner for Slider and two common-domain owners for RangeSlider', () => {
		const label = createRawSnippet<[number, 0 | 1]>((getValue) => ({
			render: () => `<b>${getValue()}</b>`
		}));
		const single = render(ZSlider, {
			props: { 'aria-label': 'Volume', defaultValue: 35, name: 'volume', orientation: 'vertical' }
		}).body;
		const range = render(ZRangeSlider, {
			props: {
				defaultValue: [15, 65],
				label,
				max: 90,
				min: 10,
				name: 'price',
				step: 5,
				thumbLabels: ['Minimum price', 'Maximum price'],
				valueLabel: 'always'
			}
		}).body;

		expect(single.match(/type="range"/gu)).toHaveLength(1);
		expect(single).toContain('data-orientation="vertical"');
		expect(range.match(/type="range"/gu)).toHaveLength(2);
		expect(range.match(/name="price"/gu)).toHaveLength(2);
		expect(range.match(/min="10"/gu)).toHaveLength(2);
		expect(range.match(/max="90"/gu)).toHaveLength(2);
		expect(range.match(/step="5"/gu)).toHaveLength(2);
		expect(range).toContain('aria-label="Minimum price"');
		expect(range).toContain('aria-label="Maximum price"');
		expect(range).toContain('<b>15</b>');
	});

	it('normalizes ranges and keeps collision math separate from the native domain', () => {
		expect(normalizeSliderRange([84, 16], 0, 100, 5)).toEqual([15, 85]);
		expect(
			applySliderRangeChange([20, 80], 0, 78, {
				collision: 'clamp',
				max: 100,
				min: 0,
				minRange: 10,
				step: 5
			})
		).toEqual({ activeIndex: 0, value: [70, 80] });
		expect(
			applySliderRangeChange([20, 80], 0, 75, {
				collision: 'push',
				max: 100,
				min: 0,
				minRange: 10,
				step: 5
			})
		).toEqual({ activeIndex: 0, value: [75, 85] });
		expect(
			applySliderRangeChange([20, 80], 0, 95, {
				collision: 'swap',
				max: 100,
				min: 0,
				minRange: 10,
				step: 5
			})
		).toEqual({ activeIndex: 1, value: [80, 95] });
	});

	it('maps vertical, RTL, reversed and pointer coordinates over one public domain', () => {
		expect(sliderKeyboardValue(50, 'ArrowRight', 'horizontal', 'rtl', false, 0, 100, 5)).toBe(45);
		expect(sliderKeyboardValue(50, 'ArrowUp', 'vertical', 'ltr', true, 0, 100, 5)).toBe(45);
		expect(
			sliderValueFromPointer(
				{ clientX: 75, clientY: 50 },
				{ bottom: 100, height: 100, left: 0, top: 0, width: 100 },
				'horizontal',
				'rtl',
				false,
				0,
				100,
				5
			)
		).toBe(25);
	});
});
