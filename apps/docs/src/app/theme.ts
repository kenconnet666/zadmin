import type {
	ZuiColorScheme,
	ZuiContrast,
	ZuiDensity,
	ZuiDirection,
	ZuiMotion,
	ThemePaletteName,
	ZuiTheme
} from '@zadmin/zui';
import {
	auroraLight,
	highContrastDark,
	highContrastLight,
	midnightDark,
	neonDark,
	paperLight
} from '@zadmin/zui/themes';

interface DocsThemeDefinition {
	readonly highContrast: boolean;
	readonly label: string;
	readonly scheme: ZuiColorScheme;
	readonly theme: ZuiTheme;
}

export const docsThemeById = {
	'aurora-light': {
		highContrast: false,
		label: '极光明亮',
		scheme: 'light',
		theme: auroraLight
	},
	'paper-light': {
		highContrast: false,
		label: '纸张暖白',
		scheme: 'light',
		theme: paperLight
	},
	'neon-dark': {
		highContrast: false,
		label: '霓虹暗色',
		scheme: 'dark',
		theme: neonDark
	},
	'midnight-dark': {
		highContrast: false,
		label: '午夜专业',
		scheme: 'dark',
		theme: midnightDark
	},
	'high-contrast-light': {
		highContrast: true,
		label: '高对比亮色',
		scheme: 'light',
		theme: highContrastLight
	},
	'high-contrast-dark': {
		highContrast: true,
		label: '高对比暗色',
		scheme: 'dark',
		theme: highContrastDark
	}
} as const satisfies Readonly<Record<string, DocsThemeDefinition>>;

export type DocsThemeId = keyof typeof docsThemeById;
export type DocsTheme = (typeof docsThemeById)[DocsThemeId];
export type DocsPalette = 'preset' | ThemePaletteName;

export const docsThemes = Object.entries(docsThemeById).map(([id, definition]) => ({
	...definition,
	id: id as DocsThemeId
}));

export interface DocsPreferences {
	contrast: ZuiContrast;
	density: ZuiDensity;
	direction: ZuiDirection;
	motion: ZuiMotion;
	palette: DocsPalette;
	themeId: DocsThemeId;
}

const contrasts = new Set<ZuiContrast>(['auto', 'high', 'normal']);
const densities = new Set<ZuiDensity>(['compact', 'comfortable', 'spacious']);
const directions = new Set<ZuiDirection>(['ltr', 'rtl']);
const motions = new Set<ZuiMotion>(['auto', 'full', 'reduced']);
const paletteNames = new Set<ThemePaletteName>([
	'blue',
	'violet',
	'teal',
	'green',
	'amber',
	'orange',
	'rose',
	'slate'
]);

export const docsLightTheme = auroraLight;
export const docsDarkTheme = neonDark;
export const docsHighContrastLightTheme = highContrastLight;
export const docsHighContrastDarkTheme = highContrastDark;

export function getDocsTheme(themeId: DocsThemeId): DocsTheme {
	return docsThemeById[themeId];
}

export function resolveDocsThemeId(
	stored: string | null | undefined,
	prefersDark: boolean
): DocsThemeId {
	if (stored && Object.hasOwn(docsThemeById, stored)) return stored as DocsThemeId;
	if (stored === 'dark') return 'neon-dark';
	if (stored === 'light') return 'aurora-light';
	return prefersDark ? 'neon-dark' : 'aurora-light';
}

export function resolveDocsTheme(themeId: DocsThemeId, highContrast: boolean): DocsTheme {
	const selected = getDocsTheme(themeId);
	if (!highContrast || selected.highContrast) return selected;
	return selected.scheme === 'dark'
		? docsThemeById['high-contrast-dark']
		: docsThemeById['high-contrast-light'];
}

export function resolveDocsPreferences(
	stored: string | null | undefined,
	fallbackThemeId: DocsThemeId
): DocsPreferences {
	const fallback: DocsPreferences = {
		contrast: 'normal',
		density: 'comfortable',
		direction: 'ltr',
		motion: 'auto',
		palette: 'preset',
		themeId: fallbackThemeId
	};
	if (!stored) return fallback;

	try {
		const value = JSON.parse(stored) as Partial<Record<keyof DocsPreferences, unknown>>;
		if (typeof value !== 'object' || value === null || Array.isArray(value)) return fallback;
		const storedTheme = typeof value.themeId === 'string' ? value.themeId : undefined;
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
			palette:
				value.palette === 'preset' || paletteNames.has(value.palette as ThemePaletteName)
					? (value.palette as DocsPalette)
					: fallback.palette,
			themeId: resolveDocsThemeId(storedTheme, fallbackThemeId.endsWith('-dark'))
		};
	} catch {
		return fallback;
	}
}
