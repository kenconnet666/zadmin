export const DEFAULT_THEME_SCHEMA = {
	borderWidth: {
		hairline: 1,
		medium: 2
	},
	breakpoint: {
		large: '64rem',
		medium: '48rem',
		small: '30rem'
	},
	color: {
		accent: '#7c3aed',
		accentHover: '#6d28d9',
		border: '#e2e8f0',
		canvas: '#ffffff',
		codeBackground: '#0d1117',
		codeBorder: '#30363d',
		codeMuted: '#8b949e',
		codeSelection: '#1d4ed8',
		codeText: '#e6edf3',
		danger: '#dc2626',
		dangerHover: '#b91c1c',
		focus: '#60a5fa',
		overlay: '#0f172a99',
		primary: '#2563eb',
		primaryHover: '#1d4ed8',
		success: '#16a34a',
		surface: '#f8fafc',
		text: '#0f172a',
		textMuted: '#64748b',
		warning: '#d97706'
	},
	duration: {
		fast: 120,
		normal: 200,
		slow: 320
	},
	fontFamily: {
		mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
		sans: 'Inter, ui-sans-serif, system-ui, sans-serif'
	},
	fontSize: {
		large: 18,
		medium: 14,
		small: 12,
		xlarge: 24
	},
	fontWeight: {
		bold: 700,
		medium: 500,
		normal: 400,
		semibold: 600
	},
	indicatorSize: {
		large: 20,
		medium: 18,
		small: 16,
		switchLargeBlock: 26,
		switchLargeInline: 48,
		switchMediumBlock: 22,
		switchMediumInline: 40,
		switchSmallBlock: 18,
		switchSmallInline: 32,
		switchThumbLarge: 22,
		switchThumbMedium: 18,
		switchThumbSmall: 14
	},
	lineHeight: {
		compact: 1.25,
		normal: 1.5,
		relaxed: 1.75
	},
	opacity: {
		disabled: 0.5,
		muted: 0.72,
		opaque: 1
	},
	radius: {
		large: 12,
		medium: 8,
		none: 0,
		small: 4
	},
	shadow: {
		codeHighlight: 'inset 3px 0 0 #2563eb',
		medium: '0 8px 24px rgb(0 0 0 / 0.12)',
		none: 'none',
		small: '0 1px 2px rgb(0 0 0 / 0.08)'
	},
	size: {
		dialogMedium: 512,
		drawerLarge: 560,
		drawerMedium: 400,
		drawerSmall: 320,
		full: '100%',
		large: 48,
		medium: 32,
		small: 24
	},
	space: {
		large: 16,
		medium: 8,
		none: 0,
		small: 4,
		xlarge: 24,
		xsmall: 2
	},
	zIndex: {
		dropdown: 1000,
		modal: 1200,
		overlay: 1100
	}
} as const;
