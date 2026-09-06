export type ResizableLength = number | `${number}%` | `${number}px` | `${number}rem`;

export type ResizableLengthUnit = 'percent-number' | 'percent' | 'px' | 'rem';

export interface ParsedResizableLength {
	readonly unit: ResizableLengthUnit;
	readonly value: number;
}

export interface ResizableBounds {
	readonly min: number;
	readonly max: number;
}

export interface ResizableAllocation {
	readonly bounds: readonly ResizableBounds[];
	readonly feasible: boolean;
	readonly pixels: readonly number[];
}

const LENGTH_PATTERN = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(rem|px|%)$/u;
const EPSILON = 0.000_001;

function finiteNonNegative(value: number, name: string): number {
	if (!Number.isFinite(value) || value < 0)
		throw new TypeError(`${name} must be non-negative and finite.`);
	return value;
}

export function parseResizableLength(value: ResizableLength, name = 'size'): ParsedResizableLength {
	if (typeof value === 'number') {
		return { unit: 'percent-number', value: finiteNonNegative(value, name) };
	}
	const match = LENGTH_PATTERN.exec(value.trim());
	if (!match) throw new TypeError(`${name} must use a number, %, px, or rem.`);
	const numeric = finiteNonNegative(Number(match[1]), name);
	const suffix = match[2];
	return {
		unit: suffix === '%' ? 'percent' : suffix === 'px' ? 'px' : 'rem',
		value: numeric
	};
}

export function resolveResizableLength(
	value: ResizableLength,
	availablePixels: number,
	rootFontPixels: number,
	name = 'size'
): number {
	finiteNonNegative(availablePixels, 'availablePixels');
	if (!Number.isFinite(rootFontPixels) || rootFontPixels <= 0)
		throw new TypeError('rootFontPixels must be positive and finite.');
	const parsed = parseResizableLength(value, name);
	if (parsed.unit === 'px') return parsed.value;
	if (parsed.unit === 'rem') return parsed.value * rootFontPixels;
	return (parsed.value / 100) * availablePixels;
}

function round(value: number): number {
	return Math.round(value * 1_000_000) / 1_000_000;
}

/** Re-encodes measured geometry in the caller-declared unit. */
export function encodeResizableLength(
	pixels: number,
	declared: ResizableLength,
	availablePixels: number,
	rootFontPixels: number
): ResizableLength {
	const parsed = parseResizableLength(declared);
	const value =
		parsed.unit === 'px'
			? pixels
			: parsed.unit === 'rem'
				? pixels / rootFontPixels
				: availablePixels <= EPSILON
					? 0
					: (pixels / availablePixels) * 100;
	const normalized = Math.max(0, round(value));
	if (parsed.unit === 'percent-number') return normalized;
	return `${normalized}${parsed.unit === 'percent' ? '%' : parsed.unit}`;
}

function distribute(
	values: number[],
	bounds: readonly ResizableBounds[],
	target: number,
	weights: readonly number[]
): void {
	for (let pass = 0; pass <= values.length; pass += 1) {
		const difference = target - values.reduce((sum, value) => sum + value, 0);
		if (Math.abs(difference) <= EPSILON) return;
		const growing = difference > 0;
		const adjustable = values.flatMap((value, index) => {
			const room = growing ? bounds[index].max - value : value - bounds[index].min;
			return room > EPSILON ? [index] : [];
		});
		if (adjustable.length === 0) return;
		const weightTotal = adjustable.reduce(
			(sum, index) => sum + Math.max(weights[index] ?? 0, EPSILON),
			0
		);
		for (const index of adjustable) {
			const share = difference * (Math.max(weights[index] ?? 0, EPSILON) / weightTotal);
			values[index] = Math.min(
				bounds[index].max,
				Math.max(bounds[index].min, values[index] + share)
			);
		}
	}
}

/**
 * Resolves mixed flexible (`number`/`%`) and fixed (`px`/`rem`) sizes into a
 * content-box allocation. Dynamic containers smaller than all minima degrade
 * proportionally instead of producing negative geometry.
 */
export function allocateResizableLengths(
	sizes: readonly ResizableLength[],
	minimums: readonly (ResizableLength | undefined)[],
	maximums: readonly (ResizableLength | undefined)[],
	availablePixels: number,
	rootFontPixels: number
): ResizableAllocation {
	finiteNonNegative(availablePixels, 'availablePixels');
	if (sizes.length === 0 || minimums.length !== sizes.length || maximums.length !== sizes.length)
		throw new TypeError('Resizable allocation arrays must have the same non-zero length.');
	const parsed = sizes.map((value, index) => parseResizableLength(value, `sizes[${index}]`));
	const bounds = sizes.map((_, index): ResizableBounds => {
		const min =
			minimums[index] === undefined
				? 0
				: resolveResizableLength(
						minimums[index],
						availablePixels,
						rootFontPixels,
						`minimums[${index}]`
					);
		const max =
			maximums[index] === undefined
				? Number.POSITIVE_INFINITY
				: resolveResizableLength(
						maximums[index],
						availablePixels,
						rootFontPixels,
						`maximums[${index}]`
					);
		if (min > max + EPSILON)
			throw new TypeError(`Resizable minimums[${index}] cannot exceed maximums[${index}].`);
		return { min, max };
	});
	const minimumTotal = bounds.reduce((sum, value) => sum + value.min, 0);
	const maximumTotal = bounds.reduce((sum, value) => sum + value.max, 0);
	if (minimumTotal > availablePixels + EPSILON) {
		const scale = minimumTotal <= EPSILON ? 0 : availablePixels / minimumTotal;
		return {
			bounds,
			feasible: false,
			pixels: Object.freeze(bounds.map((value) => round(value.min * scale)))
		};
	}

	const fixedTotal = parsed.reduce(
		(sum, value) =>
			sum +
			(value.unit === 'px' ? value.value : value.unit === 'rem' ? value.value * rootFontPixels : 0),
		0
	);
	const flexibleTotal = parsed.reduce(
		(sum, value) =>
			sum + (value.unit === 'percent' || value.unit === 'percent-number' ? value.value : 0),
		0
	);
	const flexibleCount = parsed.filter(
		(value) => value.unit === 'percent' || value.unit === 'percent-number'
	).length;
	const flexibleSpace = Math.max(0, availablePixels - fixedTotal);
	const desired = parsed.map((value) => {
		if (value.unit === 'px') return value.value;
		if (value.unit === 'rem') return value.value * rootFontPixels;
		return flexibleTotal <= EPSILON
			? flexibleSpace / Math.max(1, flexibleCount)
			: flexibleSpace * (value.value / flexibleTotal);
	});
	if (fixedTotal > availablePixels && flexibleTotal <= EPSILON) {
		const scale = fixedTotal <= EPSILON ? 0 : availablePixels / fixedTotal;
		for (let index = 0; index < desired.length; index += 1) desired[index] *= scale;
	}
	const pixels = desired.map((value, index) =>
		Math.min(bounds[index].max, Math.max(bounds[index].min, value))
	);
	const weights = desired.map((value) => Math.max(value, 1));
	distribute(pixels, bounds, Math.min(availablePixels, maximumTotal), weights);
	return {
		bounds,
		feasible: maximumTotal + EPSILON >= availablePixels,
		pixels: Object.freeze(pixels.map(round))
	};
}

export function adjacentResizableRange(
	pixels: readonly number[],
	bounds: readonly ResizableBounds[],
	handleIndex: number
): Readonly<{ max: number; min: number }> {
	if (
		!Number.isSafeInteger(handleIndex) ||
		handleIndex < 0 ||
		handleIndex >= pixels.length - 1 ||
		bounds.length !== pixels.length
	)
		throw new TypeError('handleIndex must identify an adjacent resizable pair.');
	const pair = pixels[handleIndex] + pixels[handleIndex + 1];
	return Object.freeze({
		min: Math.max(bounds[handleIndex].min, pair - bounds[handleIndex + 1].max),
		max: Math.min(bounds[handleIndex].max, pair - bounds[handleIndex + 1].min)
	});
}

/** Applies a physical pointer/keyboard delta to one adjacent pair. */
export function resizeAdjacentPair(
	pixels: readonly number[],
	bounds: readonly ResizableBounds[],
	handleIndex: number,
	delta: number
): readonly number[] {
	if (!Number.isFinite(delta)) throw new TypeError('Resize delta must be finite.');
	const range = adjacentResizableRange(pixels, bounds, handleIndex);
	const before = Math.min(range.max, Math.max(range.min, pixels[handleIndex] + delta));
	const next = [...pixels];
	next[handleIndex] = round(before);
	next[handleIndex + 1] = round(pixels[handleIndex] + pixels[handleIndex + 1] - before);
	return Object.freeze(next);
}
