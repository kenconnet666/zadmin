import { describe, expect, it } from 'vitest';

import {
	docsThemeById,
	docsThemes,
	resolveDocsPreferences,
	resolveDocsTheme,
	resolveDocsThemeId
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
	it.each(docsThemes)('keeps $id text and code colors above WCAG AA', ({ theme }) => {
		expect(contrast(theme.color.text, theme.color.canvas)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.textMuted, theme.color.canvas)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.danger, theme.color.surface)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.codeText, theme.color.codeBackground)).toBeGreaterThanOrEqual(4.5);
		expect(contrast(theme.color.codeMuted, theme.color.codeBackground)).toBeGreaterThanOrEqual(4.5);
	});

	it('uses a saved preset before the system preference', () => {
		expect(resolveDocsThemeId('paper-light', true)).toBe('paper-light');
		expect(resolveDocsThemeId('light', true)).toBe('aurora-light');
		expect(resolveDocsThemeId('dark', false)).toBe('neon-dark');
		expect(resolveDocsThemeId(null, true)).toBe('neon-dark');
		expect(resolveDocsThemeId('invalid', false)).toBe('aurora-light');
	});

	it('resolves the contrast axis without hiding explicit high-contrast presets', () => {
		expect(resolveDocsTheme('paper-light', true)).toBe(docsThemeById['high-contrast-light']);
		expect(resolveDocsTheme('midnight-dark', true)).toBe(docsThemeById['high-contrast-dark']);
		expect(resolveDocsTheme('high-contrast-dark', false)).toBe(docsThemeById['high-contrast-dark']);
	});

	it('restores valid display preferences and repairs invalid fields independently', () => {
		expect(
			resolveDocsPreferences(
				JSON.stringify({
					contrast: 'high',
					density: 'compact',
					direction: 'rtl',
					motion: 'reduced',
					palette: 'rose',
					themeId: 'midnight-dark'
				}),
				'aurora-light'
			)
		).toEqual({
			contrast: 'high',
			density: 'compact',
			direction: 'rtl',
			motion: 'reduced',
			palette: 'rose',
			themeId: 'midnight-dark'
		});
		expect(
			resolveDocsPreferences('{"density":"invalid","palette":"invalid"}', 'aurora-light')
		).toEqual({
			contrast: 'normal',
			density: 'comfortable',
			direction: 'ltr',
			motion: 'auto',
			palette: 'preset',
			themeId: 'aurora-light'
		});
		expect(resolveDocsPreferences('not-json', 'midnight-dark').themeId).toBe('midnight-dark');
	});
});
