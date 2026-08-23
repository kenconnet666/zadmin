export type ThemeTokenValue = string | number;

export type ThemeTokenGroup = Readonly<Record<string, ThemeTokenValue>>;

export type ThemeSchema = Readonly<Record<string, ThemeTokenGroup>>;

export type DeepReadonly<T> = T extends ThemeTokenValue
	? T
	: T extends ReadonlyArray<infer TItem>
		? ReadonlyArray<DeepReadonly<TItem>>
		: T extends object
			? { readonly [TKey in keyof T]: DeepReadonly<T[TKey]> }
			: T;

export type Theme<TSchema extends ThemeSchema = ThemeSchema> = DeepReadonly<TSchema>;
