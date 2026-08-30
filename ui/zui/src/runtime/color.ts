export interface RgbaColor {
	readonly alpha: number;
	readonly blue: number;
	readonly green: number;
	readonly red: number;
}

const byte = (value: number): string => Math.round(value).toString(16).padStart(2, '0');

export function parseHexColor(value: string): RgbaColor | undefined {
	const match = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/iu.exec(value.trim());
	if (!match) return undefined;
	const digits = match[1]!;
	const expanded =
		digits.length <= 4
			? Array.from(digits)
					.map((digit) => `${digit}${digit}`)
					.join('')
			: digits;
	return Object.freeze({
		alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
		blue: Number.parseInt(expanded.slice(4, 6), 16),
		green: Number.parseInt(expanded.slice(2, 4), 16),
		red: Number.parseInt(expanded.slice(0, 2), 16)
	});
}

export function formatHexColor(color: RgbaColor, includeAlpha = false): string {
	const rgb = `#${byte(color.red)}${byte(color.green)}${byte(color.blue)}`;
	return includeAlpha ? `${rgb}${byte(Math.max(0, Math.min(1, color.alpha)) * 255)}` : rgb;
}

export function normalizeHexColor(value: string, includeAlpha = false): string | undefined {
	const parsed = parseHexColor(value);
	return parsed
		? formatHexColor({ ...parsed, alpha: includeAlpha ? parsed.alpha : 1 }, includeAlpha)
		: undefined;
}
