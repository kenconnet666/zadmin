import { describe, expect, it } from 'vitest';

import { defaultTheme } from '../src/theme/default.js';
import { themePalettes, withPrimaryPalette } from '../src/theme/palettes.js';
import { auroraLight, paperLight, neonDark, midnightDark } from '../src/theme/presets.js';

type Rgb = readonly [number, number, number];
const names = Object.keys(themePalettes) as Array<keyof typeof themePalettes>;

function rgb(hex: string): Rgb {
	return [
		parseInt(hex.slice(1, 3), 16),
		parseInt(hex.slice(3, 5), 16),
		parseInt(hex.slice(5, 7), 16)
	];
}

function contrast(foreground: string, background: string): number {
	const luminance = (value: string) =>
		rgb(value)
			.map((channel) => channel / 255)
			.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
			.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index]!, 0);
	const a = luminance(foreground);
	const b = luminance(background);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function mix(foreground: string, background: string, percentage: number): string {
	const a = rgb(foreground);
	const b = rgb(background);
	return `#${a
		.map((channel, index) =>
			Math.round((channel * percentage) / 100 + b[index]! * (1 - percentage / 100))
				.toString(16)
				.padStart(2, '0')
		)
		.join('')}`;
}

describe('theme primary palettes', () => {
	it('publishes frozen eight-by-two palettes with readable solid foregrounds', () => {
		for (const name of names) {
			expect(Object.isFrozen(themePalettes[name])).toBe(true);
			for (const mode of ['light', 'dark'] as const) {
				const palette = themePalettes[name][mode];
				const canvas = mode === 'light' ? '#ffffff' : '#0f172a';
				expect(Object.isFrozen(palette)).toBe(true);
				expect(contrast(palette.onPrimary, palette.primary)).toBeGreaterThanOrEqual(4.5);
				expect(contrast(palette.onPrimary, palette.primaryHover)).toBeGreaterThanOrEqual(4.5);
				expect(contrast(palette.primary, mix(palette.primary, canvas, 8))).toBeGreaterThanOrEqual(
					4.5
				);
				expect(
					contrast(palette.primaryHover, mix(palette.primary, canvas, 14))
				).toBeGreaterThanOrEqual(4.5);
			}
		}
		expect(Object.isFrozen(themePalettes)).toBe(true);
	});

	it('overrides only primary axes and lets extendTheme derive subtle colors', () => {
		for (const name of names) {
			for (const mode of ['light', 'dark'] as const) {
				const palette = themePalettes[name][mode];
				const theme = withPrimaryPalette(defaultTheme, name, mode);
				expect(theme.color.primary).toBe(palette.primary);
				expect(theme.color.primaryHover).toBe(palette.primaryHover);
				expect(theme.color.onPrimary).toBe(palette.onPrimary);
				expect(theme.color.primarySubtle).toBe(
					`color-mix(in srgb, ${palette.primary} 8%, ${defaultTheme.color.canvas})`
				);
				expect(theme.color.primarySubtleHover).toBe(
					`color-mix(in srgb, ${palette.primary} 14%, ${defaultTheme.color.canvas})`
				);
				expect(theme.color.text).toBe(defaultTheme.color.text);
				expect(theme.space).toEqual(defaultTheme.space);
				expect(Object.isFrozen(theme)).toBe(true);
			}
		}
	});

	it('keeps primary text readable on the four standard preset canvases and subtle states', () => {
		for (const [base, mode] of [
			[auroraLight, 'light'],
			[paperLight, 'light'],
			[neonDark, 'dark'],
			[midnightDark, 'dark']
		] as const) {
			for (const name of names) {
				const theme = withPrimaryPalette(base, name, mode);
				for (const background of [
					theme.color.canvas,
					theme.color.surface,
					mix(theme.color.primary, theme.color.canvas, 8)
				]) {
					expect(
						contrast(theme.color.primary, background),
						`${name}/${mode}`
					).toBeGreaterThanOrEqual(4.5);
				}
				expect(
					contrast(theme.color.primaryHover, mix(theme.color.primary, theme.color.canvas, 14)),
					`${name}/${mode} hover`
				).toBeGreaterThanOrEqual(4.5);
			}
		}
	});

	it('rejects invalid palette names and modes', () => {
		expect(() => withPrimaryPalette(defaultTheme, 'missing' as never, 'light')).toThrow(
			/Unknown theme palette/
		);
		expect(() => withPrimaryPalette(defaultTheme, 'blue', 'system' as never)).toThrow(
			/mode must be light or dark/
		);
	});
});
