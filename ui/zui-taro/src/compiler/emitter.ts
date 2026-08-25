import {
	getUnitSuffix,
	hashString,
	isIcssSlot,
	type IcssDeclarationValue,
	type IcssDynamicSlot,
	type StyleProgram
} from '@zadmin/zui-core';

import { hyphenateTaroProperty } from '../runtime/styles.ts';

const SUPPORTED_PROPERTIES = new Set([
	'alignContent',
	'alignItems',
	'alignSelf',
	'backgroundColor',
	'borderBottomColor',
	'borderBottomLeftRadius',
	'borderBottomRightRadius',
	'borderBottomWidth',
	'borderColor',
	'borderLeftColor',
	'borderLeftWidth',
	'borderRadius',
	'borderRightColor',
	'borderRightWidth',
	'borderTopColor',
	'borderTopLeftRadius',
	'borderTopRightRadius',
	'borderTopWidth',
	'borderWidth',
	'bottom',
	'boxSizing',
	'color',
	'columnGap',
	'display',
	'flexDirection',
	'flexWrap',
	'fontSize',
	'fontWeight',
	'gap',
	'height',
	'justifyContent',
	'left',
	'lineHeight',
	'margin',
	'marginBottom',
	'marginLeft',
	'marginRight',
	'marginTop',
	'maxHeight',
	'maxWidth',
	'minHeight',
	'minWidth',
	'opacity',
	'overflow',
	'overflowX',
	'overflowY',
	'padding',
	'paddingBottom',
	'paddingLeft',
	'paddingRight',
	'paddingTop',
	'position',
	'right',
	'rowGap',
	'textAlign',
	'top',
	'visibility',
	'whiteSpace',
	'width',
	'zIndex'
]);

const SUPPORTED_UNITS = new Set(['percent', 'px']);
const RPX = /^-?(?:\d+|\d*\.\d+)rpx$/u;

export interface TaroDynamicDeclaration {
	readonly property: string;
	readonly values: readonly IcssDeclarationValue[];
}

export interface CompiledTaroIcss {
	readonly className: string;
	readonly cssText: string;
	readonly dynamic: readonly TaroDynamicDeclaration[];
}

function assertProperty(property: string): void {
	if (!SUPPORTED_PROPERTIES.has(property)) {
		throw new TypeError(`ICSS property "${property}" is not supported by the Taro subset.`);
	}
}

function serializeStaticValue(value: IcssDeclarationValue): string {
	if (isIcssSlot(value.value))
		throw new TypeError('Dynamic slots cannot be emitted as static WXSS.');
	if (value.unit !== undefined && !SUPPORTED_UNITS.has(value.unit)) {
		throw new TypeError(`ICSS unit "${value.unit}" is not supported by the Taro subset.`);
	}
	if (typeof value.value === 'string') {
		if (/^-?(?:\d+|\d*\.\d+)rpx$/u.test(value.value)) return value.value;
		return value.value;
	}
	if (!Number.isFinite(value.value)) throw new TypeError('ICSS numeric values must be finite.');
	const suffix = value.unit === undefined ? '' : getUnitSuffix(value.unit);
	return `${value.value}${suffix ?? ''}`;
}

function canonicalValue(value: IcssDeclarationValue): string {
	const raw = isIcssSlot(value.value) ? `$${value.value.id}` : String(value.value);
	return `${raw}@${value.unit ?? ''}`;
}

export function compileTaroIcss(program: StyleProgram): CompiledTaroIcss {
	const declarations: string[] = [];
	const dynamic: TaroDynamicDeclaration[] = [];
	const canonical: string[] = [];
	for (const instruction of program.block.instructions) {
		if (instruction.kind === 'nested') {
			throw new TypeError(
				`ICSS ${instruction.type} "${instruction.query}" is not supported by the Taro subset.`
			);
		}
		assertProperty(instruction.property);
		canonical.push(
			`${instruction.property}:${instruction.values.map(canonicalValue).join(' ')}:${instruction.important}`
		);
		if (instruction.values.some((value) => isIcssSlot(value.value))) {
			dynamic.push({ property: instruction.property, values: instruction.values });
			continue;
		}
		const value = instruction.values.map(serializeStaticValue).join(' ');
		declarations.push(
			`${hyphenateTaroProperty(instruction.property)}:${value}${instruction.important ? '!important' : ''}`
		);
	}
	const className = `zt-${hashString(canonical.join(';'))}`;
	return {
		className,
		cssText: declarations.length === 0 ? '' : `.${className}{${declarations.join(';')}}`,
		dynamic
	};
}

function dynamicValue(
	declaration: IcssDeclarationValue,
	values: Readonly<Record<string, unknown>>
): string | undefined {
	const raw = isIcssSlot(declaration.value) ? values[declaration.value.id] : declaration.value;
	if (raw === null || raw === undefined) return undefined;
	if (typeof raw === 'number' && !Number.isFinite(raw)) {
		throw new TypeError('ICSS dynamic numeric values must be finite.');
	}
	if (declaration.unit !== undefined && !SUPPORTED_UNITS.has(declaration.unit)) {
		throw new TypeError(`ICSS unit "${declaration.unit}" is not supported by the Taro subset.`);
	}
	if (typeof raw === 'string') return raw;
	const suffix = declaration.unit === undefined ? '' : getUnitSuffix(declaration.unit);
	return `${String(raw)}${suffix ?? ''}`;
}

export function bindTaroIcss(
	compiled: CompiledTaroIcss,
	values: Readonly<Record<string, unknown>>
): string | undefined {
	const styles = compiled.dynamic.flatMap((declaration) => {
		const serialized = declaration.values.flatMap((value) => dynamicValue(value, values) ?? []);
		if (serialized.length === 0) return [];
		return [`${hyphenateTaroProperty(declaration.property)}:${serialized.join(' ')}`];
	});
	return styles.length === 0 ? undefined : styles.join(';');
}

export function rpx(value: number): string {
	if (!Number.isFinite(value)) throw new TypeError('rpx() requires a finite number.');
	const result = `${value}rpx`;
	if (!RPX.test(result)) throw new TypeError('Invalid rpx value.');
	return result;
}

export function slotValues(
	entries: readonly (readonly [IcssDynamicSlot, unknown])[]
): Readonly<Record<string, unknown>> {
	return Object.fromEntries(entries.map(([slot, value]) => [slot.id, value]));
}
