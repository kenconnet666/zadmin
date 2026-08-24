export type TaroStylePrimitive = string | number | null | undefined;
export type TaroStyleObject = Readonly<Record<string, TaroStylePrimitive>>;
export type TaroStyle = string | TaroStyleObject | null | undefined;

export function hyphenateTaroProperty(property: string): string {
	if (property.startsWith('--')) return property;
	return property.replace(/[A-Z]/gu, (character) => `-${character.toLowerCase()}`);
}

function objectStyle(style: TaroStyleObject): string {
	return Object.entries(style)
		.flatMap(([property, value]) => {
			if (value === null || value === undefined) return [];
			if (typeof value === 'number' && !Number.isFinite(value)) {
				throw new TypeError(`Taro style "${property}" must be finite.`);
			}
			return [`${hyphenateTaroProperty(property)}:${String(value)}`];
		})
		.join(';');
}

export function mergeTaroStyles(...styles: readonly TaroStyle[]): string | undefined {
	const output = styles
		.flatMap((style) => {
			if (style === null || style === undefined || style === '') return [];
			return [typeof style === 'string' ? style.replace(/;+$/u, '') : objectStyle(style)];
		})
		.filter(Boolean)
		.join(';');
	return output || undefined;
}
