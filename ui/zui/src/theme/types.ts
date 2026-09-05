import type { DEFAULT_THEME_SCHEMA } from './schema.js';

export type ThemeTokenValue = string | number;
export type DurationTokenValue = number | `${number}ms` | `${number}s`;

export type ThemeTokenGroup = Readonly<Record<string, ThemeTokenValue>>;

export type ThemeSchema = Readonly<Record<string, ThemeTokenGroup>>;

export type DeepReadonly<T> = T extends ThemeTokenValue
	? T
	: T extends ReadonlyArray<infer TItem>
		? ReadonlyArray<DeepReadonly<TItem>>
		: T extends object
			? { readonly [TKey in keyof T]: DeepReadonly<T[TKey]> }
			: T;

export type DeepPartial<T> = T extends ThemeTokenValue
	? T
	: T extends ReadonlyArray<infer TItem>
		? ReadonlyArray<DeepPartial<TItem>>
		: T extends object
			? { readonly [TKey in keyof T]?: DeepPartial<T[TKey]> }
			: T;

export type Theme<TSchema extends ThemeSchema = ThemeSchema> = DeepReadonly<TSchema>;

type WidenToken<TToken, TGroup extends string> = TGroup extends 'duration'
	? DurationTokenValue
	: TToken extends string
		? string
		: TToken extends number
			? string | number
			: ThemeTokenValue;

type WidenTokenGroup<TGroup, TGroupName extends string> = {
	readonly [TToken in keyof TGroup]: WidenToken<TGroup[TToken], TGroupName>;
};

export type ZuiTheme = {
	readonly [TGroup in keyof typeof DEFAULT_THEME_SCHEMA]: WidenTokenGroup<
		(typeof DEFAULT_THEME_SCHEMA)[TGroup],
		TGroup & string
	>;
};
