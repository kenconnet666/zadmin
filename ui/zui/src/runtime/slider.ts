function assertFinite(value: number, label: string): void {
	if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
}

export type SliderCollision = 'clamp' | 'push' | 'swap';
export type SliderOrientation = 'horizontal' | 'vertical';
export type SliderRangeValue = readonly [number, number];

export interface SliderRangeChange {
	readonly activeIndex: 0 | 1;
	readonly value: SliderRangeValue;
}

export function normalizeSliderValue(value: number, min = 0, max = 100, step = 1): number {
	assertFinite(value, 'Slider value');
	assertFinite(min, 'Slider min');
	assertFinite(max, 'Slider max');
	assertFinite(step, 'Slider step');
	if (max <= min) throw new TypeError('Slider max must be greater than min.');
	if (step <= 0) throw new TypeError('Slider step must be positive.');
	const clamped = Math.min(max, Math.max(min, value));
	const precision = Math.max(
		0,
		...([min, max, step] as const).map((item) => item.toString().split('.')[1]?.length ?? 0)
	);
	const stepped = min + Math.round((clamped - min) / step) * step;
	return Number(Math.min(max, Math.max(min, stepped)).toFixed(precision));
}

export function normalizeSliderRange(
	value: SliderRangeValue,
	min = 0,
	max = 100,
	step = 1
): SliderRangeValue {
	if (!Array.isArray(value) || value.length !== 2)
		throw new TypeError('RangeSlider value must be a two-number tuple.');
	const first = normalizeSliderValue(value[0], min, max, step);
	const second = normalizeSliderValue(value[1], min, max, step);
	return first <= second ? Object.freeze([first, second]) : Object.freeze([second, first]);
}

export function sliderPercent(value: number, min: number, max: number, reversed = false): number {
	assertFinite(value, 'Slider value');
	assertFinite(min, 'Slider min');
	assertFinite(max, 'Slider max');
	if (max <= min) throw new TypeError('Slider max must be greater than min.');
	const normalized = Math.min(max, Math.max(min, value));
	const percent = (normalized - min) / (max - min);
	return reversed ? 1 - percent : percent;
}

export function sliderValueFromPointer(
	event: Pick<PointerEvent, 'clientX' | 'clientY'>,
	rect: Pick<DOMRect, 'bottom' | 'height' | 'left' | 'top' | 'width'>,
	orientation: SliderOrientation,
	direction: 'ltr' | 'rtl',
	reversed: boolean,
	min: number,
	max: number,
	step: number
): number {
	let percent =
		orientation === 'vertical'
			? rect.height <= 0
				? 0
				: (rect.bottom - event.clientY) / rect.height
			: rect.width <= 0
				? 0
				: (event.clientX - rect.left) / rect.width;
	if (orientation === 'horizontal' && direction === 'rtl') percent = 1 - percent;
	if (reversed) percent = 1 - percent;
	return normalizeSliderValue(
		min + Math.min(1, Math.max(0, percent)) * (max - min),
		min,
		max,
		step
	);
}

export function sliderKeyboardValue(
	value: number,
	key: string,
	orientation: SliderOrientation,
	direction: 'ltr' | 'rtl',
	reversed: boolean,
	min: number,
	max: number,
	step: number
): number | undefined {
	if (key === 'Home') return min;
	if (key === 'End') return max;
	const page = Math.max(step, Math.max(step * 10, (max - min) / 10));
	let delta: number | undefined;
	if (key === 'PageUp') delta = page;
	else if (key === 'PageDown') delta = -page;
	else if (orientation === 'vertical') {
		if (key === 'ArrowUp') delta = step;
		else if (key === 'ArrowDown') delta = -step;
	} else {
		if (key === 'ArrowRight') delta = direction === 'rtl' ? -step : step;
		else if (key === 'ArrowLeft') delta = direction === 'rtl' ? step : -step;
	}
	if (delta === undefined) return undefined;
	if (reversed) delta *= -1;
	return normalizeSliderValue(value + delta, min, max, step);
}

export function applySliderRangeChange(
	current: SliderRangeValue,
	index: 0 | 1,
	candidate: number,
	options: {
		readonly collision: SliderCollision;
		readonly max: number;
		readonly min: number;
		readonly minRange: number;
		readonly step: number;
	}
): SliderRangeChange {
	const { collision, max, min, minRange, step } = options;
	if (!Number.isFinite(minRange) || minRange < 0 || minRange > max - min)
		throw new TypeError('RangeSlider minRange must be between zero and max - min.');
	if (!['clamp', 'push', 'swap'].includes(collision))
		throw new TypeError('RangeSlider collision must be clamp, push or swap.');
	const precision = Math.max(
		0,
		...([min, max, step, minRange] as const).map(
			(item) => item.toString().split('.')[1]?.length ?? 0
		)
	);
	const gap = Number((Math.ceil(minRange / step) * step).toFixed(precision));
	if (gap > max - min)
		throw new TypeError('RangeSlider minRange cannot be represented by the current step.');
	let [lower, upper] = normalizeSliderRange(current, min, max, step);
	const next = normalizeSliderValue(candidate, min, max, step);
	if (collision === 'swap') {
		if (index === 0 && (gap === 0 ? next > upper : next >= upper + gap))
			return { activeIndex: 1, value: Object.freeze([upper, next]) };
		if (index === 1 && (gap === 0 ? next < lower : next <= lower - gap))
			return { activeIndex: 0, value: Object.freeze([next, lower]) };
	}
	if (collision === 'push') {
		if (index === 0) {
			lower = next;
			upper = Math.max(upper, lower + gap);
			if (upper > max) {
				upper = max;
				lower = normalizeSliderValue(max - gap, min, max, step);
			}
		} else {
			upper = next;
			lower = Math.min(lower, upper - gap);
			if (lower < min) {
				lower = min;
				upper = normalizeSliderValue(min + gap, min, max, step);
			}
		}
	} else if (index === 0) lower = Math.min(next, upper - gap);
	else upper = Math.max(next, lower + gap);
	return {
		activeIndex: index,
		value: Object.freeze([
			normalizeSliderValue(lower, min, max, step),
			normalizeSliderValue(upper, min, max, step)
		])
	};
}
