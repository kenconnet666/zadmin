export const UNIT_FAMILIES = {
	angle: {
		deg: 'deg',
		grad: 'grad',
		rad: 'rad',
		turn: 'turn'
	},
	fraction: {
		fr: 'fr'
	},
	length: {
		cap: 'cap',
		ch: 'ch',
		cm: 'cm',
		cqb: 'cqb',
		cqh: 'cqh',
		cqi: 'cqi',
		cqw: 'cqw',
		dvh: 'dvh',
		dvw: 'dvw',
		em: 'em',
		ex: 'ex',
		ic: 'ic',
		in: 'in',
		lh: 'lh',
		lvh: 'lvh',
		lvw: 'lvw',
		mm: 'mm',
		pc: 'pc',
		pt: 'pt',
		px: 'px',
		rem: 'rem',
		rlh: 'rlh',
		svh: 'svh',
		svw: 'svw',
		vb: 'vb',
		vh: 'vh',
		vi: 'vi',
		vmax: 'vmax',
		vmin: 'vmin',
		vw: 'vw'
	},
	percent: {
		percent: '%'
	},
	time: {
		ms: 'ms',
		s: 's'
	}
} as const;

export type UnitFamilyName = keyof typeof UNIT_FAMILIES;

export type UnitName = {
	[TFamily in UnitFamilyName]: keyof (typeof UNIT_FAMILIES)[TFamily];
}[UnitFamilyName];

export function getUnitSuffix(unit: UnitName): string | undefined {
	for (const family of Object.values(UNIT_FAMILIES)) {
		const suffix = (family as Readonly<Record<string, string>>)[unit];
		if (suffix !== undefined) return suffix;
	}
	return undefined;
}

export function getUnitNames(families: readonly UnitFamilyName[]): ReadonlySet<string> {
	return new Set(families.flatMap((family) => Object.keys(UNIT_FAMILIES[family])));
}
