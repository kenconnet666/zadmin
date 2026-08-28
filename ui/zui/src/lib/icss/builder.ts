import { getPropertyDefinition } from '../theme/properties.js';
import type { ThemeSchema } from '../theme/types.js';
import { getUnitNames, getUnitSuffix, type UnitName } from '../theme/units.js';
import type {
	DeclarationInstruction,
	IcssFactory,
	IcssStyle,
	NestedInstruction,
	StyleBlock,
	StyleProgram
} from './types.js';
import {
	isIcssSlot,
	normalizeDeclarationValues,
	type IcssInputValue,
	type IcssDynamicSlot
} from './values.js';

const GLOBAL_KEYWORDS: Readonly<Record<string, string>> = {
	inherit: 'inherit',
	initial: 'initial',
	revert: 'revert',
	revertLayer: 'revert-layer',
	unset: 'unset'
};

const SELECTORS: Readonly<Record<string, string>> = {
	_active: '&:active',
	_after: '&::after',
	_before: '&::before',
	_disabled: '&:disabled,&[aria-disabled="true"]',
	_focus: '&:focus',
	_focusVisible: '&:focus-visible',
	_hover: '&:hover'
};

function createBlock(): StyleBlock {
	return { instructions: [] };
}

function assertValues(values: readonly IcssInputValue[]): void {
	if (values.length === 0 || values.length > 4) {
		throw new TypeError('ICSS properties accept between one and four values.');
	}
}

function appendDeclaration(
	block: StyleBlock,
	property: string,
	values: readonly IcssInputValue[],
	unit?: UnitName
): void {
	assertValues(values);
	const normalized = normalizeDeclarationValues(values, unit);
	if (normalized.length === 0) return;
	const instruction: DeclarationInstruction = {
		important: false,
		kind: 'declaration',
		property,
		values: normalized
	};
	block.instructions.push(instruction);
}

function appendNested<TTheme extends ThemeSchema>(
	block: StyleBlock,
	theme: TTheme,
	type: NestedInstruction['type'],
	query: string,
	factory: IcssFactory<TTheme>
): void {
	const nestedBlock = createBlock();
	factory(createBuilder(theme, nestedBlock));
	if (nestedBlock.instructions.length === 0) return;
	block.instructions.push({ block: nestedBlock, kind: 'nested', query, type });
}

function assertQuery(name: string, query: string): string {
	const normalized = query.trim();
	if (normalized.length === 0) throw new TypeError(`${name} query cannot be empty.`);
	if (normalized.includes('{') || normalized.includes('}')) {
		throw new TypeError(`${name} query cannot contain CSS blocks.`);
	}
	return normalized;
}

function createCarrier<TTheme extends ThemeSchema>(
	theme: TTheme,
	block: StyleBlock,
	property: string
): unknown {
	const definition = getPropertyDefinition(property);
	const units = getUnitNames(definition?.units ?? []);

	const target = (value: IcssInputValue): void => appendDeclaration(block, property, [value]);
	return new Proxy(target, {
		get(_target, key) {
			if (typeof key !== 'string' || key === 'then') return undefined;
			if (key === 'raw') {
				return (value: IcssInputValue): void => appendDeclaration(block, property, [value]);
			}

			const globalKeyword = GLOBAL_KEYWORDS[key];
			if (globalKeyword !== undefined) {
				appendDeclaration(block, property, [globalKeyword]);
				return undefined;
			}

			if (units.has(key)) {
				const suffix = getUnitSuffix(key as UnitName);
				if (suffix === undefined) return undefined;
				return (...values: IcssInputValue[]): void => {
					appendDeclaration(block, property, values, key as UnitName);
				};
			}

			if (key.startsWith('_') && definition?.token !== undefined) {
				const token = key.slice(1);
				const value = theme[definition.token]?.[token];
				if (value === undefined) {
					throw new TypeError(`Unknown theme token "${definition.token}.${token}".`);
				}
				appendDeclaration(block, property, [value], definition.tokenUnit);
				return undefined;
			}

			const keyword = definition?.keywords?.[key];
			if (keyword !== undefined) {
				appendDeclaration(block, property, [keyword]);
				return undefined;
			}
			return undefined;
		}
	});
}

function createBuilder<TTheme extends ThemeSchema>(
	theme: TTheme,
	block: StyleBlock
): IcssStyle<TTheme> {
	const carriers = new Map<string, unknown>();
	return new Proxy({} as IcssStyle<TTheme>, {
		get(_target, key) {
			if (typeof key !== 'string' || key === 'then') return undefined;

			const selector = SELECTORS[key];
			if (selector !== undefined) {
				return (factory: IcssFactory<TTheme>): void => {
					appendNested(block, theme, 'selector', selector, factory);
				};
			}

			if (key === '_selector') {
				return (value: string, factory: IcssFactory<TTheme>): void => {
					const normalized = assertQuery('Selector', value);
					if (!normalized.includes('&')) {
						throw new TypeError('Nested ICSS selectors must contain "&".');
					}
					appendNested(block, theme, 'selector', normalized, factory);
				};
			}

			if (key === '_media' || key === '_supports' || key === '_container') {
				return (value: string, factory: IcssFactory<TTheme>): void => {
					const name = key.slice(1);
					appendNested(block, theme, 'at-rule', `@${name} ${assertQuery(name, value)}`, factory);
				};
			}

			if (key === 'set') {
				return (property: string, value: IcssInputValue): void => {
					if (!/^(?:--)?[a-zA-Z][\w-]*$/.test(property)) {
						throw new TypeError(`Invalid CSS property "${property}".`);
					}
					appendDeclaration(block, property, [value]);
				};
			}

			let carrier = carriers.get(key);
			if (carrier === undefined) {
				carrier = createCarrier(theme, block, key);
				carriers.set(key, carrier);
			}
			return carrier;
		}
	});
}

export function createStyleProgram<TTheme extends ThemeSchema>(
	theme: TTheme,
	factory: IcssFactory<TTheme>
): StyleProgram {
	const block = createBlock();
	factory(createBuilder(theme, block));
	return { block, theme };
}

export function isDynamicSlot(value: unknown): value is IcssDynamicSlot {
	return isIcssSlot(value);
}
