import { compile, middleware, prefixer, rulesheet, serialize, stringify } from 'stylis';
import { getUnitSuffix } from '../theme/units.js';
import type { StyleBlock, StyleProgram } from './types.js';
import { isIcssSlot, type IcssDeclarationValue } from './values.js';

export interface SerializedStyle {
	readonly cssText: string;
	readonly rules: readonly string[];
}

export function hyphenateProperty(property: string): string {
	if (property.startsWith('--')) return property;
	return property
		.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
		.replace(/^ms-/, '-ms-');
}

function serializeValue(declaration: IcssDeclarationValue): string {
	const { unit, value } = declaration;
	if (isIcssSlot(value)) {
		if (unit === undefined) return `var(${value.id})`;
		const suffix = getUnitSuffix(unit);
		if (suffix === undefined) throw new TypeError(`Unknown ICSS unit "${unit}".`);
		return `calc(var(${value.id}) * 1${suffix})`;
	}
	if (unit === undefined || typeof value === 'string') return String(value);
	const suffix = getUnitSuffix(unit);
	if (suffix === undefined) throw new TypeError(`Unknown ICSS unit "${unit}".`);
	return `${value}${suffix}`;
}

function serializeBlock(block: StyleBlock): string {
	let output = '';
	for (const instruction of block.instructions) {
		if (instruction.kind === 'declaration') {
			const value = instruction.values.map(serializeValue).join(' ');
			output += `${hyphenateProperty(instruction.property)}:${value}${
				instruction.important ? '!important' : ''
			};`;
			continue;
		}
		output += `${instruction.query}{${serializeBlock(instruction.block)}}`;
	}
	return output;
}

export function canonicalizeStyleProgram(program: StyleProgram): string {
	return serializeBlock(program.block);
}

export function serializeStyleProgram(program: StyleProgram, className: string): SerializedStyle {
	const rules: string[] = [];
	const input = `.${className}{${canonicalizeStyleProgram(program)}}`;
	const cssText = serialize(
		compile(input),
		middleware([
			prefixer,
			stringify,
			rulesheet((rule) => {
				rules.push(rule);
			})
		])
	);
	return { cssText, rules };
}
