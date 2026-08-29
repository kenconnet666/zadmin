import {
	extendTheme,
	type ZuiContrast,
	type ZuiDensity,
	type ZuiDirection,
	type ZuiMotion
} from '@zadmin/zui';
import { auroraLight, neonDark } from '@zadmin/zui/themes';

export type DocsThemeMode = 'dark' | 'light';

export interface DocsPreferences {
	contrast: ZuiContrast;
	density: ZuiDensity;
	direction: ZuiDirection;
	motion: ZuiMotion;
	themeMode: DocsThemeMode;
}

const contrasts = new Set<ZuiContrast>(['auto', 'high', 'normal']);
const densities = new Set<ZuiDensity>(['compact', 'comfortable', 'spacious']);
const directions = new Set<ZuiDirection>(['ltr', 'rtl']);
const motions = new Set<ZuiMotion>(['auto', 'full', 'reduced']);

export const docsLightTheme = auroraLight;
export const docsDarkTheme = neonDark;

export const docsHighContrastLightTheme = extendTheme(docsLightTheme, {
	color: {
		border: '#172033',
		codeBorder: '#f8fafc',
		focus: '#0047ff',
		surface: '#f1f5f9',
		textMuted: '#344054'
	}
});

export const docsHighContrastDarkTheme = extendTheme(docsDarkTheme, {
	color: {
		border: '#f8fafc',
		canvas: '#000000',
		codeBorder: '#e0f2fe',
		focus: '#fde047',
		surface: '#020617',
		textMuted: '#dbeafe'
	}
});

export function resolveDocsThemeMode(
	stored: string | null | undefined,
	prefersDark: boolean
): DocsThemeMode {
	if (stored === 'dark' || stored === 'light') return stored;
	return prefersDark ? 'dark' : 'light';
}

export function resolveDocsPreferences(
	stored: string | null | undefined,
	fallbackThemeMode: DocsThemeMode
): DocsPreferences {
	const fallback: DocsPreferences = {
		contrast: 'normal',
		density: 'comfortable',
		direction: 'ltr',
		motion: 'auto',
		themeMode: fallbackThemeMode
	};
	if (!stored) return fallback;

	try {
		const value = JSON.parse(stored) as Partial<Record<keyof DocsPreferences, unknown>>;
		if (typeof value !== 'object' || value === null || Array.isArray(value)) return fallback;
		return {
			contrast: contrasts.has(value.contrast as ZuiContrast)
				? (value.contrast as ZuiContrast)
				: fallback.contrast,
			density: densities.has(value.density as ZuiDensity)
				? (value.density as ZuiDensity)
				: fallback.density,
			direction: directions.has(value.direction as ZuiDirection)
				? (value.direction as ZuiDirection)
				: fallback.direction,
			motion: motions.has(value.motion as ZuiMotion)
				? (value.motion as ZuiMotion)
				: fallback.motion,
			themeMode:
				value.themeMode === 'dark' || value.themeMode === 'light'
					? value.themeMode
					: fallback.themeMode
		};
	} catch {
		return fallback;
	}
}
