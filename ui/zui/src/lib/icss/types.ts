import type * as CSS from 'csstype';

import type { PROPERTY_DEFINITIONS } from '../theme/properties.js';
import type { ThemeSchema } from '../theme/types.js';
import type { UNIT_FAMILIES, UnitFamilyName } from '../theme/units.js';
import type { IcssDeclarationValue, IcssDynamicSlot } from './values.js';

declare const ICSS_CLASS: unique symbol;

export type IcssClassName = string & { readonly [ICSS_CLASS]: true };

export interface DeclarationInstruction {
	readonly important: boolean;
	readonly kind: 'declaration';
	readonly property: string;
	readonly values: readonly IcssDeclarationValue[];
}

export interface NestedInstruction {
	readonly block: StyleBlock;
	readonly kind: 'nested';
	readonly query: string;
	readonly type: 'at-rule' | 'selector';
}

export type StyleInstruction = DeclarationInstruction | NestedInstruction;

export interface StyleBlock {
	readonly instructions: StyleInstruction[];
}

export interface StyleProgram {
	readonly block: StyleBlock;
	readonly theme: ThemeSchema;
}

type CssPropertyName = keyof CSS.Properties<string | number> & string;
type CssPropertyValue<TProperty extends CssPropertyName> = CSS.Properties<
	string | number
>[TProperty];
type CssQuad<T> = [T] | [T, T] | [T, T, T] | [T, T, T, T];

type GlobalKeywordAccessors = {
	readonly inherit: void;
	readonly initial: void;
	readonly revert: void;
	readonly revertLayer: void;
	readonly unset: void;
};

type DefinitionFor<TProperty extends string> = TProperty extends keyof typeof PROPERTY_DEFINITIONS
	? (typeof PROPERTY_DEFINITIONS)[TProperty]
	: never;

type TokenAccessors<TTheme extends ThemeSchema, TProperty extends string> =
	DefinitionFor<TProperty> extends { readonly token: infer TCategory extends string }
		? TCategory extends keyof TTheme
			? {
					readonly [TToken in keyof TTheme[TCategory] & string as `_${TToken}`]: void;
				}
			: object
		: object;

type KeywordAccessors<TProperty extends string> =
	DefinitionFor<TProperty> extends {
		readonly keywords: infer TKeywords extends Readonly<Record<string, string>>;
	}
		? { readonly [TKeyword in keyof TKeywords & string]: void }
		: object;

type UnitFamiliesFor<TProperty extends string> =
	DefinitionFor<TProperty> extends {
		readonly units: readonly (infer TFamily extends UnitFamilyName)[];
	}
		? TFamily
		: never;

type UnitNamesFor<TProperty extends string> =
	UnitFamiliesFor<TProperty> extends infer TFamily
		? TFamily extends UnitFamilyName
			? keyof (typeof UNIT_FAMILIES)[TFamily] & string
			: never
		: never;

type UnitAccessors<TProperty extends string> = {
	readonly [TUnit in UnitNamesFor<TProperty>]: (
		...values: CssQuad<number | IcssDynamicSlot>
	) => void;
};

export type IcssPropertyCarrier<TTheme extends ThemeSchema, TProperty extends CssPropertyName> = ((
	value: CssPropertyValue<TProperty> | IcssDynamicSlot | null | undefined
) => void) &
	GlobalKeywordAccessors &
	KeywordAccessors<TProperty> &
	TokenAccessors<TTheme, TProperty> &
	UnitAccessors<TProperty> & {
		readonly raw: (value: string | number | IcssDynamicSlot | null | undefined) => void;
	};

type IcssProperties<TTheme extends ThemeSchema> = {
	readonly [TProperty in CssPropertyName]-?: IcssPropertyCarrier<TTheme, TProperty>;
};

export interface IcssConditions<TTheme extends ThemeSchema> {
	readonly _active: (factory: IcssFactory<TTheme>) => void;
	readonly _after: (factory: IcssFactory<TTheme>) => void;
	readonly _before: (factory: IcssFactory<TTheme>) => void;
	readonly _container: (query: string, factory: IcssFactory<TTheme>) => void;
	readonly _disabled: (factory: IcssFactory<TTheme>) => void;
	readonly _focus: (factory: IcssFactory<TTheme>) => void;
	readonly _focusVisible: (factory: IcssFactory<TTheme>) => void;
	readonly _hover: (factory: IcssFactory<TTheme>) => void;
	readonly _media: (query: string, factory: IcssFactory<TTheme>) => void;
	readonly _selector: (selector: string, factory: IcssFactory<TTheme>) => void;
	readonly _supports: (query: string, factory: IcssFactory<TTheme>) => void;
	readonly set: <TProperty extends CssPropertyName>(
		property: TProperty,
		value: CssPropertyValue<TProperty> | null | undefined
	) => void;
}

export type IcssStyle<TTheme extends ThemeSchema> = IcssProperties<TTheme> & IcssConditions<TTheme>;

export type IcssFactory<TTheme extends ThemeSchema> = (style: IcssStyle<TTheme>) => void;
