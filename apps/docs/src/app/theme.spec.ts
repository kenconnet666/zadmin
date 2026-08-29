import { describe, expect, it } from 'vitest';

import {
	docsDarkTheme,
	docsHighContrastDarkTheme,
	docsHighContrastLightTheme,
	docsLightTheme,
	resolveDocsPreferences,
	resolveDocsThemeMode
} from './theme.js';

function luminance(hex: string): number {
	const channels = [1, 3, 5].map(
		(offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
	);
	const linear = channels.map((channel) =>
		channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
	);
	return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrast(foreground: string, background: string): number {
	const values = [luminance(foreground), luminance(background)].sort((left, right) => right - left);
	return (values[0]! + 0.05) / (values[1]! + 0.05);
}

describe('docs themes', () => {
	it.each([
		['light', docsLightTheme],
		['dark', docsDarkTheme],
		['high-contrast-light', docsHighContrastLightTheme],
		['high-contrast-dark', docsHighContrastDarkTheme]
	] as const)('keeps %s text and code colors above WCAG AA', (_name, theme) => {
		expect(contrast(theme.color.text, theme.color.canvas)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.textMuted, theme.color.canvas)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.danger, theme.color.surface)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.codeText, theme.color.codeBackground)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.codeMuted, theme.color.codeBackground)).toBeGreaterThanOrEqual(4.5);
	});

	it('uses an explicit saved mode before the system preference', () => {
		expect(resolveDocsThemeMode('light', true)).toBe('light');
		expect(resolveDocsThemeMode('dark', false)).toBe('dark');
		expect(resolveDocsThemeMode(null, true)).toBe('dark');
		expect(resolveDocsThemeMode('invalid', false)).toBe('light');
	});

	it('restores valid display preferences and repairs invalid fields independently', () => {
		expect(
			resolveDocsPreferences(
				JSON.stringify({
					contrast: 'high',
					density: 'compact',
					direction: 'rtl',
					motion: 'reduced',
					themeMode: 'dark'
				}),
				'light'
			)
		).toEqual({
			contrast: 'high',
			density: 'compact',
			direction: 'rtl',
			motion: 'reduced',
			themeMode: 'dark'
		});
		expect(resolveDocsPreferences('{"density":"invalid","themeMode":"dark"}', 'light')).toEqual({
			contrast: 'normal',
			density: 'comfortable',
			direction: 'ltr',
			motion: 'auto',
			themeMode: 'dark'
		});
		expect(resolveDocsPreferences('not-json', 'dark').themeMode).toBe('dark');
	});
});
