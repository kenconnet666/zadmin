import type { UnitName } from '../theme/units.js';

export const ICSS_SLOT = Symbol.for('@zadmin/zui/icss-slot');

export interface IcssRuntimeSlot {
	readonly [ICSS_SLOT]: true;
	readonly variable: `--${string}`;
}

export type IcssInputValue = string | number | IcssRuntimeSlot | null | undefined;

export interface IcssDeclarationValue {
	readonly unit?: UnitName;
	readonly value: string | number | IcssRuntimeSlot;
}

export function createIcssSlot(variable: `--${string}`): IcssRuntimeSlot {
	return Object.freeze({ [ICSS_SLOT]: true as const, variable });
}

export function isIcssSlot(value: unknown): value is IcssRuntimeSlot {
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
