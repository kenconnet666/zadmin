export interface LocalizedNumberParseResult {
	readonly partial: boolean;
	readonly valid: boolean;
	readonly value?: number;
}

const BIDI_MARKS = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu;

export function parseLocalizedNumber(input: string, locale: string): LocalizedNumberParseResult {
	const format = new Intl.NumberFormat(locale, { useGrouping: true });
	const parts = format.formatToParts(-12345.6);
	const group = parts.find(({ type }) => type === 'group')?.value;
	const decimal = parts.find(({ type }) => type === 'decimal')?.value ?? '.';
	const minus = parts.find(({ type }) => type === 'minusSign')?.value ?? '-';
	const plus = new Intl.NumberFormat(locale, { signDisplay: 'always' })
		.formatToParts(1)
		.find(({ type }) => type === 'plusSign')?.value;
	const digits = new Map<string, string>();
	const digitFormat = new Intl.NumberFormat(locale, { useGrouping: false });
	for (let digit = 0; digit <= 9; digit += 1) digits.set(digitFormat.format(digit), String(digit));
	let normalized = input.trim().replace(BIDI_MARKS, '');
	for (const [localized, ascii] of digits) normalized = normalized.replaceAll(localized, ascii);
	if (group) normalized = normalized.replaceAll(group, '');
	normalized = normalized.replace(/[\s\u00a0\u202f]/gu, '');
	if (decimal !== '.') normalized = normalized.replaceAll(decimal, '.');
	if (minus !== '-') normalized = normalized.replaceAll(minus, '-');
	if (plus && plus !== '+') normalized = normalized.replaceAll(plus, '+');
	const partial = normalized === '' || /^[+-]?(?:\d+\.?|\d*\.?)$/u.test(normalized);
	if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/u.test(normalized)) {
		return Object.freeze({ partial, valid: normalized === '' });
	}
	const value = Number(normalized);
	return Number.isFinite(value)
		? Object.freeze({ partial: false, valid: true, value })
		: Object.freeze({ partial: false, valid: false });
}

export function clampNumber(value: number, min?: number, max?: number): number {
	return Math.max(
		min ?? Number.NEGATIVE_INFINITY,
		Math.min(max ?? Number.POSITIVE_INFINITY, value)
	);
}

function decimalPlaces(value: number): number {
	const [, fraction = '', exponent = '0'] =
		String(value).match(/^[+-]?(?:\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/iu) ?? [];
	return Math.max(0, fraction.length - Number(exponent));
}

export function stepNumber(
	value: number,
	direction: -1 | 1,
	step: number,
	min?: number,
	max?: number,
	multiplier = 1
): number {
	const precision = Math.min(12, Math.max(decimalPlaces(value), decimalPlaces(step)));
	const next = value + direction * step * multiplier;
	const normalized = Number(next.toFixed(precision));
	return clampNumber(normalized, min, max);
}
