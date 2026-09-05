import { extendTheme } from './define.js';
import type { ZuiTheme } from './types.js';

export type ThemePaletteName =
	'blue' | 'violet' | 'teal' | 'green' | 'amber' | 'orange' | 'rose' | 'slate';
export type ThemePaletteMode = 'light' | 'dark';

export const themePalettes = Object.freeze({
	blue: Object.freeze({
		light: Object.freeze({ primary: '#1d4ed8', primaryHover: '#1e40af', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#93c5fd', primaryHover: '#bfdbfe', onPrimary: '#0f172a' })
	}),
	violet: Object.freeze({
		light: Object.freeze({ primary: '#6d28d9', primaryHover: '#5b21b6', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#c4b5fd', primaryHover: '#ddd6fe', onPrimary: '#0f172a' })
	}),
	teal: Object.freeze({
		light: Object.freeze({ primary: '#0f766e', primaryHover: '#115e59', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#5eead4', primaryHover: '#99f6e4', onPrimary: '#0f172a' })
	}),
	green: Object.freeze({
		light: Object.freeze({ primary: '#166534', primaryHover: '#14532d', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#86efac', primaryHover: '#bbf7d0', onPrimary: '#0f172a' })
	}),
	amber: Object.freeze({
		light: Object.freeze({ primary: '#92400e', primaryHover: '#78350f', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#fcd34d', primaryHover: '#fde68a', onPrimary: '#0f172a' })
	}),
	orange: Object.freeze({
		light: Object.freeze({ primary: '#9a3412', primaryHover: '#7c2d12', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#fdba74', primaryHover: '#fed7aa', onPrimary: '#0f172a' })
	}),
	rose: Object.freeze({
		light: Object.freeze({ primary: '#be123c', primaryHover: '#9f1239', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#fda4af', primaryHover: '#fecdd3', onPrimary: '#0f172a' })
	}),
	slate: Object.freeze({
		light: Object.freeze({ primary: '#475569', primaryHover: '#334155', onPrimary: '#ffffff' }),
		dark: Object.freeze({ primary: '#cbd5e1', primaryHover: '#e2e8f0', onPrimary: '#0f172a' })
	})
} as const);

export function withPrimaryPalette(
	base: ZuiTheme,
	name: ThemePaletteName,
	mode: ThemePaletteMode
): ZuiTheme {
	if (!Object.hasOwn(themePalettes, name)) throw new TypeError(`Unknown theme palette "${name}".`);
	if (mode !== 'light' && mode !== 'dark')
		throw new TypeError(`Theme palette mode must be light or dark, got "${mode}".`);
	return extendTheme(base, { color: themePalettes[name][mode] });
}
