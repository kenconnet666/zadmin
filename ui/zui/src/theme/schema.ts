export const DEFAULT_THEME_SCHEMA = {
	borderWidth: {
		hairline: 1,
		medium: 2,
		progress: 8
	},
	easing: {
		enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
		exit: 'cubic-bezier(0.7, 0, 0.84, 0)',
		linear: 'linear',
		standard: 'ease'
	},
	breakpoint: {
		large: '64rem',
		medium: '48rem',
		small: '30rem'
	},
	color: {
		accent: '#7c3aed',
		accentHover: '#6d28d9',
		accentSubtle: 'color-mix(in srgb, #7c3aed 8%, #ffffff)',
		border: '#e2e8f0',
		canvas: '#ffffff',
		codeBackground: '#0d1117',
		codeBorder: '#30363d',
		codeMuted: '#8b949e',
		codeSelection: '#1d4ed8',
		codeText: '#e6edf3',
		danger: '#b42318',
		dangerHover: '#8f1d14',
		dangerSubtle: 'color-mix(in srgb, #b42318 8%, #ffffff)',
		focus: '#60a5fa',
		onDanger: '#ffffff',
		onPrimary: '#ffffff',
		overlay: '#0f172a99',
		primary: '#2563eb',
		primaryHover: '#1d4ed8',
		primarySubtle: 'color-mix(in srgb, #2563eb 8%, #ffffff)',
		primarySubtleHover: 'color-mix(in srgb, #2563eb 14%, #ffffff)',
		success: '#166534',
		successSubtle: 'color-mix(in srgb, #166534 8%, #ffffff)',
		surface: '#f8fafc',
		surfaceHover: 'color-mix(in srgb, #0f172a 6%, #ffffff)',
		text: '#0f172a',
		textMuted: '#64748b',
		warning: '#92400e',
		warningSubtle: 'color-mix(in srgb, #92400e 8%, #ffffff)'
	},
	duration: {
		fast: 120,
		loadingBarIndeterminate: 1200,
		normal: 200,
		progressIndeterminate: 1000,
		skeletonPulse: 1400,
		spinnerSpin: 800,
		slow: 320
	},
	focusOffset: { inner: -2, none: 0, outer: 2, tight: 1 },
	fontFamily: {
		mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
		sans: 'Inter, ui-sans-serif, system-ui, sans-serif'
	},
	fontSize: {
		large: 18,
		medium: 14,
		small: 12,
		xlarge: 24,
		xxlarge: 32
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
		large: '0 16px 48px rgb(0 0 0 / 0.18)',
		medium: '0 8px 24px rgb(0 0 0 / 0.12)',
		none: 'none',
		small: '0 1px 2px rgb(0 0 0 / 0.08)'
	},
	size: {
		calendarCellLarge: 56,
		dialogMedium: 512,
		drawerLarge: 560,
		drawerMedium: 400,
		drawerSmall: 320,
		full: '100%',
		large: 48,
		loadingBar: 3,
		menu: 192,
		medium: 32,
		popconfirm: 320,
		progressCircle: 96,
		progressLine: 8,
		skeletonLine: 12,
		small: 24,
		timelineMarker: 12
	},
	space: {
		large: 16,
		medium: 8,
		none: 0,
		small: 4,
		xlarge: 24,
		xsmall: 2
	},
	transform: {
		switchThumbTravelLarge: 'translateX(20px)',
		switchThumbTravelMedium: 'translateX(16px)',
		switchThumbTravelSmall: 'translateX(12px)'
	},
	zIndex: {
		sticky: 50,
		pageLoading: 100,
		dropdown: 1000,
		modal: 1200,
		overlay: 1100,
		toast: 1300
	}
} as const;
