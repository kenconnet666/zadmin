import { defaultTheme } from './default.js';
import { extendTheme } from './define.js';

export const auroraLight = extendTheme(defaultTheme, {
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
