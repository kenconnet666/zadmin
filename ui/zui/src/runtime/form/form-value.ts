export type PrimitiveFormValue = bigint | boolean | number | string;
export type FormValue = PrimitiveFormValue | null | readonly PrimitiveFormValue[] | undefined;

export function serializeFormValue(value: PrimitiveFormValue): string | undefined {
	if (value === false) return undefined;
	if (value === true) return 'on';
	if (typeof value === 'number' && !Number.isFinite(value)) {
		throw new TypeError('Form number values must be finite.');
	}
	return String(value);
}

export function createFormEntries(
	name: string,
	value: FormValue
): readonly (readonly [string, string])[] {
	if (name.length === 0) throw new TypeError('Form field name must not be empty.');
	if (value === null || value === undefined) return [];
	const values = Array.isArray(value) ? value : [value];
	return Object.freeze(
		values.flatMap((item) => {
			const serialized = serializeFormValue(item);
			return serialized === undefined ? [] : ([[name, serialized]] as const);
		})
	);
}
