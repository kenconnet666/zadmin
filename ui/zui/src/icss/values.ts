import type { UnitName } from '../theme/units.js';

export const ICSS_SLOT = Symbol.for('@zadmin/zui/icss-slot');

export interface IcssDynamicSlot {
	readonly [ICSS_SLOT]: true;
	readonly debugName?: string;
	readonly id: string;
}

export type IcssInputValue = string | number | IcssDynamicSlot | null | undefined;

export interface IcssDeclarationValue {
	readonly unit?: UnitName;
	readonly value: string | number | IcssDynamicSlot;
}

export function createIcssSlot(id: string, debugName?: string): IcssDynamicSlot {
	if (id.length === 0) throw new TypeError('ICSS slot id cannot be empty.');
	return Object.freeze({
		[ICSS_SLOT]: true as const,
		...(debugName === undefined ? {} : { debugName }),
		id
	});
}

export function isIcssSlot(value: unknown): value is IcssDynamicSlot {
	return typeof value === 'object' && value !== null && ICSS_SLOT in value;
}

export function normalizeDeclarationValues(
	values: readonly IcssInputValue[],
	unit?: UnitName
): readonly IcssDeclarationValue[] {
	return values.flatMap((value) => {
		if (value === null || value === undefined) return [];
		if (typeof value === 'number' && !Number.isFinite(value)) {
			throw new TypeError('ICSS numeric values must be finite.');
		}
		return [{ value, ...(unit === undefined ? {} : { unit }) }];
	});
}
