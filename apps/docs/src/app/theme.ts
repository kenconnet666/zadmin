import {
	defaultTheme,
	extendTheme,
	type ZuiContrast,
	type ZuiDensity,
	type ZuiDirection,
	type ZuiMotion
} from '@zadmin/zui';

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

export const docsLightTheme = extendTheme(defaultTheme, {
	color: {
		accent: '#7c3aed',
		accentHover: '#5b21b6',
		border: '#c9d7ec',
		canvas: '#ffffff',
		codeBackground: '#0b1020',
		codeBorder: '#273459',
		codeMuted: '#94a3c4',
		codeSelection: '#5b21b6',
		codeText: '#f4f7ff',
		danger: '#d51a49',
		dangerHover: '#b81740',
		focus: '#0891b2',
		primary: '#2457e6',
		primaryHover: '#173fb5',
		success: '#078f63',
		surface: '#eef4ff',
		text: '#172033',
		textMuted: '#52627a',
		warning: '#b45309'
	},
	fontFamily: {
		mono: "'Fira Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
		sans: 'Inter, ui-sans-serif, system-ui, sans-serif'
	},
	shadow: {
		codeHighlight: 'inset 3px 0 0 #a78bfa',
		medium: '0 18px 50px rgb(36 87 230 / 0.12)',
		small: '0 2px 8px rgb(36 87 230 / 0.12)'
	}
});

export const docsDarkTheme = extendTheme(defaultTheme, {
	color: {
		accent: '#f34edc',
		accentHover: '#ff87eb',
		border: '#26385f',
		canvas: '#0c1424',
		codeBackground: '#02040c',
		codeBorder: '#203969',
		codeMuted: '#8ca3c7',
		codeSelection: '#6d1c72',
		codeText: '#ecfeff',
		danger: '#ff4d73',
		dangerHover: '#ff7a96',
		focus: '#facc15',
		primary: '#22d3ee',
		primaryHover: '#67e8f9',
		success: '#34d399',
		surface: '#050914',
		text: '#ebfaff',
		textMuted: '#9aafd1',
		warning: '#fbbf24'
	},
	fontFamily: {
		mono: "'Fira Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
		sans: 'Inter, ui-sans-serif, system-ui, sans-serif'
	},
	shadow: {
		codeHighlight: 'inset 3px 0 0 #f34edc',
		medium: '0 20px 60px rgb(0 229 255 / 0.12)',
		small: '0 2px 12px rgb(243 78 220 / 0.14)'
	}
});

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
