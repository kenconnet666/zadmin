import { describe, expect, it } from 'vitest';

import { defaultTheme, defineTheme, extendTheme } from '../src/entrypoints/index.js';
import {
	auroraLight,
	highContrastDark,
	highContrastLight,
	midnightDark,
	neonDark,
	paperLight
} from '../src/entrypoints/themes.js';

describe('ZUI themes', () => {
	type Rgb = readonly [number, number, number];

	function rgb(hex: string): Rgb {
		return [
			parseInt(hex.slice(1, 3), 16),
			parseInt(hex.slice(3, 5), 16),
			parseInt(hex.slice(5, 7), 16)
		];
	}

	function blend(foreground: string, background: string, opacity: number): Rgb {
		const foregroundChannels = rgb(foreground);
		const backgroundChannels = rgb(background);
		return [
			foregroundChannels[0] * opacity + backgroundChannels[0] * (1 - opacity),
			foregroundChannels[1] * opacity + backgroundChannels[1] * (1 - opacity),
			foregroundChannels[2] * opacity + backgroundChannels[2] * (1 - opacity)
		];
	}

	function contrastRatio(foreground: string | Rgb, background: string | Rgb): number {
		const luminance = (color: string | Rgb): number => {
			const channels = (typeof color === 'string' ? rgb(color) : color).map(
				(channel) => channel / 255
			);
			const linear = channels.map((channel) =>
				channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
			);
			return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
		};
		const foregroundLuminance = luminance(foreground);
		const backgroundLuminance = luminance(background);
		return (
			(Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
			(Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
		);
	}

	it('keeps every semantic foreground readable on its derived subtle background', () => {
		const themes = [
			['defaultTheme', defaultTheme],
			['auroraLight', auroraLight],
			['paperLight', paperLight],
			['neonDark', neonDark],
			['midnightDark', midnightDark],
			['highContrastLight', highContrastLight],
			['highContrastDark', highContrastDark]
		] as const;
		const failures: Array<{ readonly contract: string; readonly ratio: number }> = [];
		for (const [name, theme] of themes) {
			for (const tone of ['accent', 'danger', 'success', 'warning'] as const) {
				const foreground = theme.color[tone];
				expect(theme.color[`${tone}Subtle`]).toBe(
					`color-mix(in srgb, ${foreground} 8%, ${theme.color.canvas})`
				);
				const ratio = contrastRatio(foreground, blend(foreground, theme.color.canvas, 0.08));
				if (ratio < 4.5) failures.push({ contract: `${name}.${tone} on subtle`, ratio });
			}
			for (const [foreground, background, description] of [
				[theme.color.onPrimary, theme.color.primary, 'primary foreground'],
				[theme.color.onDanger, theme.color.danger, 'danger foreground'],
				[
					theme.color.primaryHover,
					blend(theme.color.primary, theme.color.canvas, 0.14),
					'selected hover'
				]
			] as const) {
				const ratio = contrastRatio(foreground, background);
				if (ratio < 4.5) failures.push({ contract: `${name}.${description}`, ratio });
			}
		}
		expect(failures).toEqual([]);
	});

	it('copies and deeply freezes the strict theme contract', () => {
		const source = {
			...defaultTheme,
			color: { ...defaultTheme.color, primary: '#123456' }
		};
		const theme = defineTheme(source);

		expect(theme).not.toBe(source);
		expect(theme.color).not.toBe(source.color);
		expect(Object.isFrozen(theme)).toBe(true);
		expect(Object.isFrozen(theme.color)).toBe(true);
		expect(theme.color.primary).toBe('#123456');
	});

	it('rejects non-finite numbers, missing values and unknown contract keys', () => {
		expect(() => defineTheme(null as never)).toThrow(/Theme must be an object/);
		expect(() => defineTheme([] as never)).toThrow(/Theme must be an object/);
		expect(() =>
			defineTheme({
				...defaultTheme,
				opacity: { ...defaultTheme.opacity, disabled: Number.NaN }
			})
		).toThrow(/finite/);
		expect(() => defineTheme({ color: null } as never)).toThrow(/required|must be an object/);
		expect(() =>
			defineTheme({
				...defaultTheme,
				color: { ...defaultTheme.color, unexpected: '#fff' }
			} as never)
		).toThrow(/Unknown theme token/);
		expect(() => defineTheme({ ...defaultTheme, unexpected: {} } as never)).toThrow(
			/Unknown theme group/
		);
		expect(() => {
			const { primary: _primary, ...missingPrimary } = defaultTheme.color;
			void _primary;
			defineTheme({ ...defaultTheme, color: missingPrimary } as never);
		}).toThrow(/color\.primary.*required/);
		expect(() => defineTheme({ ...defaultTheme, color: [] } as never)).toThrow(
			/color.*must be an object/
		);
		expect(() =>
			defineTheme({
				...defaultTheme,
				color: { ...defaultTheme.color, primary: true }
			} as never)
		).toThrow(/color\.primary.*non-empty string/);
	});

	it('enforces runtime token value families and numeric CSS ranges', () => {
		expect(() =>
			defineTheme({ ...defaultTheme, color: { ...defaultTheme.color, primary: 123 } } as never)
		).toThrow(/color\.primary.*non-empty string/);
		expect(() =>
			defineTheme({ ...defaultTheme, fontFamily: { ...defaultTheme.fontFamily, sans: 7 } } as never)
		).toThrow(/fontFamily\.sans.*non-empty string/);
		expect(() =>
			defineTheme({
				...defaultTheme,
				fontFamily: { ...defaultTheme.fontFamily, sans: '   ' }
			} as never)
		).toThrow(/fontFamily\.sans.*non-empty string/);
		expect(() =>
			defineTheme({ ...defaultTheme, opacity: { ...defaultTheme.opacity, disabled: 1.1 } } as never)
		).toThrow(/between 0 and 1/);
		expect(() =>
			defineTheme({
				...defaultTheme,
				fontWeight: { ...defaultTheme.fontWeight, normal: 1001 }
			} as never)
		).toThrow(/between 1 and 1000/);
		expect(() =>
			defineTheme({ ...defaultTheme, radius: { ...defaultTheme.radius, small: -1 } } as never)
		).toThrow(/non-negative/);
		expect(() =>
			defineTheme({ ...defaultTheme, size: { ...defaultTheme.size, medium: '  ' } } as never)
		).toThrow(/must not be an empty string/);
		expect(() =>
			defineTheme({ ...defaultTheme, fontSize: { ...defaultTheme.fontSize, small: 0 } } as never)
		).toThrow(/positive/);
		expect(() =>
			defineTheme({
				...defaultTheme,
				lineHeight: { ...defaultTheme.lineHeight, compact: -0.1 }
			} as never)
		).toThrow(/non-negative/);

		expect(() =>
			defineTheme({
				...defaultTheme,
				duration: { ...defaultTheme.duration, normal: 'calc(100ms + 20ms)' }
			} as never)
		).toThrow(/duration\.normal.*ms or s/);
		expect(
			defineTheme({
				...defaultTheme,
				duration: { ...defaultTheme.duration, normal: '0.2s' },
				size: { ...defaultTheme.size, medium: 'var(--control-size)' }
			}).duration.normal
		).toBe('0.2s');
		expect(
			defineTheme({
				...defaultTheme,
				lineHeight: { ...defaultTheme.lineHeight, normal: 0 }
			} as never)
		).toBeTruthy();
	});

	it('extends themes immutably and rejects unknown patch keys', () => {
		const theme = extendTheme(defaultTheme, {
			color: { primary: '#6d28d9', primaryHover: '#5b21b6' },
			radius: { medium: 6 }
		});

		expect(theme.color.primary).toBe('#6d28d9');
		expect(theme.radius.medium).toBe(6);
		expect(defaultTheme.color.primary).toBe('#2563eb');
		expect(Object.isFrozen(theme.color)).toBe(true);
		expect(() => extendTheme(defaultTheme, null as never)).toThrow(/Theme patch must be an object/);
		expect(() => extendTheme(defaultTheme, { color: [] } as never)).toThrow(
			/color.*must be an object/
		);
		expect(() => extendTheme(defaultTheme, { color: { missing: '#fff' } } as never)).toThrow(
			/Unknown theme token/
		);
		expect(() => extendTheme(defaultTheme, { missing: {} } as never)).toThrow(
			/Unknown theme group/
		);
	});

	it('derives semantic color surfaces from patched source colors with explicit override precedence', () => {
		const theme = extendTheme(defaultTheme, {
			color: {
				accent: 'var(--accent)',
				canvas: 'var(--canvas)',
				primary: 'var(--primary)',
				primaryHover: 'var(--primary-hover)',
				danger: 'var(--danger)',
				success: 'var(--success)',
				warning: 'var(--warning)',
				text: 'var(--text)'
			}
		});
		expect(theme.color.primarySubtle).toBe('color-mix(in srgb, var(--primary) 8%, var(--canvas))');
		expect(theme.color.primarySubtleHover).toBe(
			'color-mix(in srgb, var(--primary) 14%, var(--canvas))'
		);
		expect(theme.color.surfaceHover).toBe('color-mix(in srgb, var(--text) 6%, var(--canvas))');
		expect(theme.color.onPrimary).toBe('var(--canvas)');
		expect(theme.color.onDanger).toBe('var(--canvas)');

		const overridden = extendTheme(defaultTheme, {
			color: {
				primary: '#111111',
				primarySubtle: '#222222',
				onPrimary: '#ffffff'
			}
		});
		expect(overridden.color.primarySubtle).toBe('#222222');
		expect(overridden.color.onPrimary).toBe('#ffffff');
		expect(overridden.color.primarySubtleHover).toBe('color-mix(in srgb, #111111 14%, #ffffff)');
		const primaryOnly = extendTheme(defaultTheme, { color: { primary: '#123456' } });
		expect(primaryOnly.color.primarySubtle).toBe('color-mix(in srgb, #123456 8%, #ffffff)');
		expect(primaryOnly.color.primarySubtleHover).toBe('color-mix(in srgb, #123456 14%, #ffffff)');

		const customBase = extendTheme(defaultTheme, {
			color: { primarySubtle: '#custom-subtle' }
		});
		const unrelated = extendTheme(customBase, { radius: { medium: 6 } });
		expect(unrelated.color.primarySubtle).toBe('#custom-subtle');
		expect(Object.isFrozen(unrelated)).toBe(true);
		expect(Object.isFrozen(unrelated.color)).toBe(true);
	});

	it('provides the complete semantic default theme', () => {
		expect(Object.keys(defaultTheme)).toHaveLength(16);
		expect(defaultTheme.duration.loadingBarIndeterminate).toBe(1200);
		expect(defaultTheme.duration.spinnerSpin).toBe(800);
		expect(defaultTheme.fontFamily.mono).toContain('ui-monospace');
		expect(defaultTheme.shadow.codeHighlight).toContain('inset');
		expect(defaultTheme.color.accent).toBe('#7c3aed');
		expect(defaultTheme.color.codeBackground).toBe('#0d1117');
		expect(defaultTheme.color.codeText).toBe('#e6edf3');
		expect(defaultTheme.color.dangerHover).toBe('#8f1d14');
		expect(defaultTheme.color.focus).toBe('#60a5fa');
		expect(defaultTheme.color.overlay).toBe('#0f172a99');
		expect(defaultTheme.size.drawerSmall).toBe(320);
		expect(defaultTheme.size.drawerMedium).toBe(400);
		expect(defaultTheme.size.drawerLarge).toBe(560);
		expect(defaultTheme.size.popconfirm).toBe(320);
		expect(defaultTheme.size.menu).toBe(192);
		expect(defaultTheme.color.primary).toBe('#2563eb');
		expect(defaultTheme.size.dialogMedium).toBe(512);
		expect(defaultTheme.size.loadingBar).toBe(3);
		expect(defaultTheme.size.progressCircle).toBe(96);
		expect(defaultTheme.size.progressLine).toBe(8);
		expect(defaultTheme.size.skeletonLine).toBe(12);
		expect(defaultTheme.size.timelineMarker).toBe(12);
		expect(defaultTheme.borderWidth.progress).toBe(8);
		expect(defaultTheme.indicatorSize.medium).toBe(18);
		expect(defaultTheme.fontSize.xxlarge).toBe(32);
		expect(defaultTheme.space.medium).toBe(8);
	});

	it('publishes six distinct frozen production presets', () => {
		const themes = [
			auroraLight,
			paperLight,
			neonDark,
			midnightDark,
			highContrastLight,
			highContrastDark
		];
		expect(auroraLight.color.canvas).toBe('#ffffff');
		expect(paperLight.color.canvas).toBe('#fffaf3');
		expect(neonDark.color.canvas).toBe('#0c1424');
		expect(midnightDark.color.canvas).toBe('#111827');
		expect(highContrastLight.color.border).toBe('#000000');
		expect(highContrastDark.color.border).toBe('#ffffff');
		expect(new Set(themes.map((theme) => theme.color.primary)).size).toBe(6);
		expect(themes.every((theme) => Object.isFrozen(theme))).toBe(true);
		expect(themes.every((theme) => Object.isFrozen(theme.color))).toBe(true);
		expect(
			themes.every(
				(theme) =>
					theme.color.primarySubtle ===
					`color-mix(in srgb, ${theme.color.primary} 8%, ${theme.color.canvas})`
			)
		).toBe(true);
		expect(themes.every((theme) => theme.color.onPrimary === theme.color.canvas)).toBe(true);
		expect(themes.every((theme) => theme.color.onDanger === theme.color.canvas)).toBe(true);
	});
});
