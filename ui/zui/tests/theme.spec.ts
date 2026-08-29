import { describe, expect, it } from 'vitest';

import { defaultTheme, defineTheme, extendTheme } from '../src/entrypoints/index.js';
import { auroraLight, neonDark } from '../src/entrypoints/themes.js';

describe('ZUI themes', () => {
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
		).toThrow(/color\.primary.*string or number/);
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

	it('provides the complete semantic default theme', () => {
		expect(Object.keys(defaultTheme)).toHaveLength(15);
		expect(defaultTheme.fontFamily.mono).toContain('ui-monospace');
		expect(defaultTheme.shadow.codeHighlight).toContain('inset');
		expect(defaultTheme.color.accent).toBe('#7c3aed');
		expect(defaultTheme.color.codeBackground).toBe('#0d1117');
		expect(defaultTheme.color.codeText).toBe('#e6edf3');
		expect(defaultTheme.color.dangerHover).toBe('#b91c1c');
		expect(defaultTheme.color.focus).toBe('#60a5fa');
		expect(defaultTheme.color.overlay).toBe('#0f172a99');
		expect(defaultTheme.size.drawerSmall).toBe(320);
		expect(defaultTheme.size.drawerMedium).toBe(400);
		expect(defaultTheme.size.drawerLarge).toBe(560);
		expect(defaultTheme.size.popconfirm).toBe(320);
		expect(defaultTheme.color.primary).toBe('#2563eb');
		expect(defaultTheme.size.dialogMedium).toBe(512);
		expect(defaultTheme.indicatorSize.medium).toBe(18);
		expect(defaultTheme.space.medium).toBe(8);
	});

	it('publishes distinct frozen light and dark production presets', () => {
		expect(auroraLight.color.canvas).toBe('#ffffff');
		expect(neonDark.color.canvas).toBe('#0c1424');
		expect(auroraLight.color.primary).not.toBe(neonDark.color.primary);
		expect(Object.isFrozen(auroraLight)).toBe(true);
		expect(Object.isFrozen(neonDark.color)).toBe(true);
	});
});
