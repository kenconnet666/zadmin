function assertFinite(value: number, label: string): void {
	if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
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
