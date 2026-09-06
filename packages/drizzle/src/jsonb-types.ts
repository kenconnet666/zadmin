import type { SQL } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

/** SQL expressions must represent JSONB; column SQL types are checked at runtime. */
export type JsonbSource =
	(PgColumn & { readonly dataType: 'object json' | 'custom' }) | SQL | SQL.Aliased;

/** PostgreSQL object keys and array indexes, limited to eight segments at runtime. */
export type JsonbPath = readonly (string | number)[];

/** Only native JSON columns describe raw JSON; custom and SQL types may describe decoded values. */
export type JsonbSourceData<Source extends JsonbSource> = Source extends PgColumn & {
	readonly dataType: 'object json';
}
	? Source['_']['data']
	: unknown;

type IsAny<Value> = 0 extends 1 & Value ? true : false;
type Next<Depth extends readonly unknown[]> = [...Depth, unknown];
type JsonPrimitive = string | number | boolean | null;
type NonJsonObject =
	| Date
	| RegExp
	| ReadonlyMap<unknown, unknown>
	| ReadonlySet<unknown>
	| ((...arguments_: never[]) => unknown);

/** JSON operators do not apply source-column codecs or reconstruct class instances. */
type JsonbCanonical<Value, Depth extends readonly unknown[] = []> =
	IsAny<Value> extends true
		? unknown
		: unknown extends Value
			? unknown
			: Value extends undefined
				? never
				: Value extends JsonPrimitive
					? Value
					: Value extends NonJsonObject
						? unknown
						: Value extends object
							? Depth['length'] extends 8
								? unknown
								: { [Key in keyof Value]: JsonbCanonical<Value[Key], Next<Depth>> }
							: unknown;

type Integer<Index extends number> = number extends Index
	? Index
	: `${Index}` extends `${bigint}`
		? Index
		: never;

type NumericKey<Key extends string | number> = Key extends number
	? Key
	: Key extends `${infer Index extends number}`
		? `${Index}` extends Key
			? Index
			: never
		: never;

type ArrayIndex<Key extends string | number> = Integer<NumericKey<Key>>;

type FromEnd<
	Tuple extends readonly unknown[],
	Distance extends number,
	Count extends readonly unknown[] = [unknown]
> = Tuple extends readonly [...infer Rest, infer Last]
	? Count['length'] extends Distance
		? Last
		: FromEnd<Rest, Distance, Next<Count>>
	: never;

type TupleValue<Tuple extends readonly unknown[], Index extends number> = number extends Index
	? Tuple[number]
	: `${Index}` extends `-${infer Distance extends number}`
		? Tuple extends Required<Tuple>
			? FromEnd<Tuple, Distance>
			: [FromEnd<Required<Tuple>, Distance>] extends [never]
				? never
				: Tuple[number]
		: `${Index}` extends keyof Tuple
			? Tuple[`${Index}`]
			: never;

type ArrayValue<Array extends readonly unknown[], Key extends string | number> =
	ArrayIndex<Key> extends infer Index extends number
		? number extends Array['length']
			? [Index] extends [never]
				? never
				: Array[number]
			: Index extends number
				? TupleValue<Array, Index>
				: never
		: never;

type Step<Value, Key extends string | number> =
	IsAny<Value> extends true
		? unknown
		: unknown extends Value
			? unknown
			: Value extends NonJsonObject | JsonPrimitive | undefined
				? never
				: Value extends readonly unknown[]
					? ArrayValue<Value, Key>
					: Value extends object
						? string extends Key
							? unknown
							: number extends Key
								? unknown
								: Key extends keyof Value
									? Value[Key]
									: Key extends number
										? `${Key}` extends keyof Value
											? Value[`${Key}`]
											: never
										: [NumericKey<Key>] extends [never]
											? never
											: NumericKey<Key> extends keyof Value
												? Value[NumericKey<Key>]
												: never
						: never;

type ValidKey<Value, Key extends string | number> = Key extends number
	? [Integer<Key>] extends [never]
		? false
		: [Step<Value, Key>] extends [never]
			? false
			: true
	: [Step<Value, Key>] extends [never]
		? false
		: true;

type ValidPath<
	Value,
	Path extends JsonbPath,
	Depth extends readonly unknown[] = []
> = Path extends readonly []
	? true
	: Depth['length'] extends 8
		? false
		: Path extends readonly [infer Key extends string | number, ...infer Rest extends JsonbPath]
			? false extends ValidKey<Value, Key>
				? false
				: ValidPath<Step<Value, Key>, Rest, Next<Depth>>
			: true;

/** Intersect with an independently inferred const path; no permissive fallback overload. */
export type JsonbPathConstraint<Source extends JsonbSource, Path extends JsonbPath> =
	false extends ValidPath<JsonbSourceData<Source>, Path> ? never : unknown;

type PathValue<
	Value,
	Path extends JsonbPath,
	Depth extends readonly unknown[] = []
> = number extends Path['length']
	? unknown
	: Path extends readonly []
		? JsonbCanonical<Exclude<Value, undefined>>
		: Depth['length'] extends 8
			? unknown
			: Path extends readonly [infer Key extends string | number, ...infer Rest extends JsonbPath]
				? PathValue<Step<Value, Key>, Rest, Next<Depth>>
				: unknown;

/** Missing keys, absent array elements, and SQL/JSON null all remain nullable. */
export type JsonbValue<Source extends JsonbSource, Path extends JsonbPath> = PathValue<
	JsonbSourceData<Source>,
	Path
> | null;
