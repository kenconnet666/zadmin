import { defaultTheme, extendTheme } from '@zadmin/zui';

export const docsTheme = extendTheme(defaultTheme, {
	color: {
		border: '#dfe5ee',
		canvas: '#ffffff',
		focus: '#2563eb',
		primary: '#2563eb',
		primaryHover: '#1d4ed8',
		surface: '#f6f8fb',
		text: '#18212f',
		textMuted: '#647084'
	},
	fontFamily: {
		mono: "'Fira Mono', ui-monospace, SFMono-Regular, Consolas, monospace",
		sans: 'Inter, ui-sans-serif, system-ui, sans-serif'
	},
	shadow: {
		medium: '0 16px 45px rgb(24 33 47 / 0.08)',
		small: '0 1px 3px rgb(24 33 47 / 0.12)'
	}
});
