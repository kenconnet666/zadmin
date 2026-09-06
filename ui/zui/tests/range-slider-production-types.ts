import type { ComponentProps, Snippet } from 'svelte';

import ZRangeSlider, {
	type RangeSliderThumbRefs,
	type ZRangeSliderProps
} from '../src/components/input/ZRangeSlider.svelte';
import ZSlider, {
	type SliderMark,
	type ZSliderVariants,
	type ZSliderProps
} from '../src/components/input/ZSlider.svelte';
import type { SliderRangeValue } from '../src/runtime/slider.js';

const label = (() => undefined) as unknown as Snippet<[value: number, index: 0 | 1]>;
const mark = (() => undefined) as unknown as Snippet<[mark: SliderMark, index: number]>;
const value: SliderRangeValue = [20, 80];
const refs: RangeSliderThumbRefs = [null, null];
const range = {
	collision: 'push',
	defaultValue: value,
	formatValue: (next: number, index: 0 | 1) => `${index}:${next}`,
	label,
	mark,
	marks: [{ label: 'Middle', value: 50 }],
	minRange: 10,
	onValueChange: (next: SliderRangeValue) => void next,
	onValueCommit: (next: SliderRangeValue) => void next,
	orientation: 'vertical',
	reversed: true,
	size: 'xlarge',
	thumbLabels: ['Minimum', 'Maximum'],
	thumbRefs: refs,
	tone: 'success',
	value,
	valueLabel: 'always'
} satisfies ComponentProps<typeof ZRangeSlider> satisfies ZRangeSliderProps;
const single = {
	'aria-label': 'Volume',
	marks: [{ value: 0 }, { label: 'Maximum', value: 100 }],
	onValueCommit: (next: number) => void next,
	orientation: 'vertical',
	reversed: true,
	tone: 'warning',
	valueLabel: 'drag'
} satisfies ComponentProps<typeof ZSlider> satisfies ZSliderProps;
const legacyVariants = {
	orientation: 'horizontal',
	reversed: false,
	size: 'medium',
	tone: 'neutral',
	valueLabel: 'focus'
} satisfies ZSliderVariants;

const invalidValue = {
	thumbLabels: ['Minimum', 'Maximum'],
	// @ts-expect-error A range always has exactly two values.
	value: [10]
} satisfies ZRangeSliderProps;
// @ts-expect-error Each real native thumb requires its own accessible name.
const missingThumbLabels = { value: [10, 90] } satisfies ZRangeSliderProps;
const invalidCollision = {
	// @ts-expect-error Collision is a closed behavior contract.
	collision: 'cross',
	thumbLabels: ['Minimum', 'Maximum']
} satisfies ZRangeSliderProps;
const invalidOrientation = {
	// @ts-expect-error Slider orientation is a closed physical axis.
	orientation: 'diagonal'
} satisfies ZSliderProps;

void [
	range,
	single,
	legacyVariants,
	invalidValue,
	missingThumbLabels,
	invalidCollision,
	invalidOrientation
];
