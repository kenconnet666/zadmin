export const iconManifest = {
	check: ['M9.55 18 3.85 12.3l1.4-1.4 4.3 4.3 9.2-9.2 1.4 1.4z'],
	chevronDown: ['m7.4 8.6 4.6 4.6 4.6-4.6L18 10l-6 6-6-6z'],
	close: [
		'M18.3 5.7 12 12l6.3 6.3-1.4 1.4-6.3-6.3-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4 6.3 6.3 6.3-6.3z'
	],
	menu: ['M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z'],
	plus: ['M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z'],
	search: [
		'M10 3a7 7 0 1 0 4.9 12l4.55 4.55 1.4-1.4L16.3 13.6A7 7 0 0 0 10 3m0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10'
	],
	user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5'],
	warning: ['M12 2 1 21h22zm1 15h-2v2h2zm0-7h-2v5h2z']
} as const satisfies Readonly<Record<string, readonly string[]>>;
