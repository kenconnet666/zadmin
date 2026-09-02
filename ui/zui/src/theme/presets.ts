import { defaultTheme } from './default.js';
import { extendTheme } from './define.js';

export const auroraLight = extendTheme(defaultTheme, {
	color: {
		accent: '#7431e8',
		accentHover: '#5b21b6',
		border: '#c9d7ec',
		canvas: '#ffffff',
		codeBackground: '#0b1020',
		codeBorder: '#273459',
		codeMuted: '#94a3c4',
		codeSelection: '#5b21b6',
		codeText: '#f4f7ff',
		danger: '#bd1742',
		dangerHover: '#b81740',
		focus: '#0891b2',
		overlay: '#17203380',
		primary: '#2457e6',
		primaryHover: '#173fb5',
		success: '#006b4f',
		surface: '#eef4ff',
		text: '#172033',
		textMuted: '#52627a',
		warning: '#9a4709'
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

export const paperLight = extendTheme(defaultTheme, {
	color: {
		accent: '#7c3f00',
		accentHover: '#5f3000',
		border: '#b7a894',
		canvas: '#fffaf3',
		codeBackground: '#211c18',
		codeBorder: '#5c4d41',
		codeMuted: '#c8bbae',
		codeSelection: '#7c2d12',
		codeText: '#fffaf3',
		danger: '#b42318',
		dangerHover: '#8f1d14',
		focus: '#005fcc',
		overlay: '#2d261fb3',
		primary: '#9a3412',
		primaryHover: '#7c2d12',
		success: '#206b3a',
		surface: '#f5ede1',
		text: '#2d261f',
		textMuted: '#66584a',
		warning: '#8a4b08'
	},
	fontFamily: {
		mono: "'Fira Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
		sans: "'Source Sans 3', Inter, ui-sans-serif, system-ui, sans-serif"
	},
	shadow: {
		codeHighlight: 'inset 3px 0 0 #c65d2e',
		medium: '0 12px 32px rgb(45 38 31 / 0.1)',
		small: '0 1px 4px rgb(45 38 31 / 0.12)'
	}
});

export const neonDark = extendTheme(defaultTheme, {
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
		overlay: '#000000b8',
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

export const midnightDark = extendTheme(defaultTheme, {
	color: {
		accent: '#c4b5fd',
		accentHover: '#ddd6fe',
		border: '#334b6f',
		canvas: '#111827',
		codeBackground: '#020617',
		codeBorder: '#334b6f',
		codeMuted: '#a9b8ce',
		codeSelection: '#334f8d',
		codeText: '#f8fafc',
		danger: '#ff8a9b',
		dangerHover: '#ffb0bc',
		focus: '#fbbf24',
		overlay: '#020617cc',
		primary: '#8bafff',
		primaryHover: '#adc4ff',
		success: '#5ee6a8',
		surface: '#0b1220',
		text: '#f8fafc',
		textMuted: '#b8c5d8',
		warning: '#fcd34d'
	},
	fontFamily: {
		mono: "'Fira Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
		sans: 'Inter, ui-sans-serif, system-ui, sans-serif'
	},
	shadow: {
		codeHighlight: 'inset 3px 0 0 #8bafff',
		medium: '0 20px 56px rgb(2 6 23 / 0.38)',
		small: '0 2px 10px rgb(2 6 23 / 0.32)'
	}
});

export const highContrastLight = extendTheme(defaultTheme, {
	color: {
		accent: '#6b00a8',
		accentHover: '#480070',
		border: '#000000',
		canvas: '#ffffff',
		codeBackground: '#000000',
		codeBorder: '#ffffff',
		codeMuted: '#e6e6e6',
		codeSelection: '#0037ff',
		codeText: '#ffffff',
		danger: '#b00020',
		dangerHover: '#7a0016',
		focus: '#005fcc',
		overlay: '#000000cc',
		primary: '#0037cc',
		primaryHover: '#00268f',
		success: '#006b35',
		surface: '#ffffff',
		text: '#000000',
		textMuted: '#222222',
		warning: '#7a3e00'
	},
	shadow: {
		codeHighlight: 'inset 4px 0 0 #ffffff',
		medium: 'none',
		small: 'none'
	}
});

export const highContrastDark = extendTheme(defaultTheme, {
	color: {
		accent: '#ff80ff',
		accentHover: '#ffb3ff',
		border: '#ffffff',
		canvas: '#000000',
		codeBackground: '#000000',
		codeBorder: '#ffffff',
		codeMuted: '#f2f2f2',
		codeSelection: '#004cff',
		codeText: '#ffffff',
		danger: '#ff8ca0',
		dangerHover: '#ffb3c0',
		focus: '#ffff00',
		overlay: '#000000e6',
		primary: '#66b3ff',
		primaryHover: '#a3d0ff',
		success: '#62ffa8',
		surface: '#000000',
		text: '#ffffff',
		textMuted: '#f2f2f2',
		warning: '#ffe066'
	},
	shadow: {
		codeHighlight: 'inset 4px 0 0 #ffffff',
		medium: 'none',
		small: 'none'
	}
});
