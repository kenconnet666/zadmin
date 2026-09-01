export interface ProgressRange {
	readonly max: number;
	readonly min: number;
	readonly value?: number;
}

export type MeterState = 'critical' | 'optimal' | 'suboptimal';

export interface MeterRange extends Required<ProgressRange> {
	readonly high: number;
	readonly low: number;
	readonly optimum: number;
}

export function normalizeProgressRange(range: ProgressRange): ProgressRange {
	if (!Number.isFinite(range.min) || !Number.isFinite(range.max) || range.max <= range.min) {
		throw new TypeError('Progress max must be finite and greater than min.');
	}
	if (range.value !== undefined && !Number.isFinite(range.value)) {
		throw new TypeError('Progress value must be finite.');
	}
	return Object.freeze({
		max: range.max,
		min: range.min,
		value:
			range.value === undefined ? undefined : Math.min(range.max, Math.max(range.min, range.value))
	});
}

export function normalizeMeterRange(
	range: ProgressRange & {
		readonly high?: number;
		readonly low?: number;
		readonly optimum?: number;
	}
): MeterRange {
	const base = normalizeProgressRange({ max: range.max, min: range.min });
	if (range.value === undefined) throw new TypeError('Meter value is required.');
	if (!Number.isFinite(range.value) || range.value < base.min || range.value > base.max) {
		throw new TypeError('Meter value must be finite and satisfy min <= value <= max.');
	}
	const progress = Object.freeze({ ...base, value: range.value });
	const low = range.low ?? progress.min;
	const high = range.high ?? progress.max;
	const optimum = range.optimum ?? (progress.min + progress.max) / 2;
	if (
		!Number.isFinite(low) ||
		!Number.isFinite(high) ||
		!Number.isFinite(optimum) ||
		low < progress.min ||
		high > progress.max ||
		low > high ||
		optimum < progress.min ||
		optimum > progress.max
	) {
		throw new TypeError('Meter thresholds must satisfy min <= low <= high <= max.');
	}
	return Object.freeze({
		high,
		low,
		max: progress.max,
		min: progress.min,
		optimum,
		value: progress.value
	});
}

export function meterState(range: MeterRange): MeterState {
	if (range.optimum < range.low) {
		if (range.value <= range.low) return 'optimal';
		return range.value <= range.high ? 'suboptimal' : 'critical';
	}
	if (range.optimum > range.high) {
		if (range.value >= range.high) return 'optimal';
		return range.value >= range.low ? 'suboptimal' : 'critical';
	}
	return range.value >= range.low && range.value <= range.high ? 'optimal' : 'suboptimal';
}
