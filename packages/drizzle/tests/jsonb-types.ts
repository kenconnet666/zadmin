import { defineRelations, sql, type SQL } from 'drizzle-orm';
import { alias, customType, integer, jsonb, pgTable, text } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import { jsonbText, jsonbValue } from '../src/index.ts';

type Equal<Left, Right> =
	(<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
		? true
		: false;
type Expect<Value extends true> = Value;
type Result<Expression extends SQL> = Expression['_']['type'];

interface Document {
	profile?: { name: string; enabled: boolean | null } | null;
	items: readonly { sku: string; quantity: number }[];
	pair: readonly [{ first: string }, { last: number }];
	choice: { kind: 'person'; person: { name: string } } | { kind: 'team'; team: { size: number } };
	'0': { numericKey: boolean };
}

const records = pgTable('jsonb_type_contract', {
	id: integer(),
	label: text(),
	document: jsonb().$type<Document>(),
	requiredDocument: jsonb().$type<Document>().notNull(),
	numericDocument: jsonb().$type<Record<number, { name: string }>>(),
	unknownDocument: jsonb(),
	nonJsonDocument: jsonb().$type<{ when: Date; amount: bigint }>(),
	customDocument: customType<{ data: Document }>({ dataType: () => 'jsonb' })(),
	mappedDocument: customType<{ data: { amount: string }; driverData: { amount: number } }>({
		dataType: () => 'jsonb',
		fromDriver: (value) => ({ amount: String(value.amount) })
	})(),
	optionalTuple: jsonb().$type<readonly [string, number?]>(),
	restTuple: jsonb().$type<readonly [string, ...number[]]>(),
	dictionary: jsonb().$type<Readonly<Record<string, { value: number }>>>(),
	nullableUnion: jsonb().$type<{ item?: { value: string } } | { item: { value: number } } | null>(),
	jsonNull: jsonb().$type<null>(),
	jsonPrimitive: jsonb().$type<42>()
});

const name = jsonbValue(records.document, ['profile', 'name']);
const enabled = jsonbValue(records.document, ['profile', 'enabled']);
const sku = jsonbValue(records.document, ['items', -1, 'sku']);
const stringIndex = jsonbValue(records.document, ['items', '0', 'quantity']);
const tupleLast = jsonbValue(records.document, ['pair', -1, 'last']);
const tupleFirst = jsonbValue(records.document, ['pair', '-2', 'first']);
const unionBranch = jsonbValue(records.document, ['choice', 'person', 'name']);
const numericKey = jsonbValue(records.document, [0, 'numericKey']);
const numericDictionaryValue = jsonbValue(records.numericDocument, ['1', 'name']);
const root = jsonbValue(records.requiredDocument, []);
const textValue = jsonbText(records.document, ['profile']);
const unknownValue = jsonbValue(records.unknownDocument, ['anything', 1]);
const customValue = jsonbValue(records.customDocument, ['profile', 'name']);
const customMappedValue = jsonbValue(records.mappedDocument, ['amount']);
const customMappedText = jsonbText(records.mappedDocument, ['amount']);
const dateValue = jsonbValue(records.nonJsonDocument, ['when']);
const bigintValue = jsonbValue(records.nonJsonDocument, ['amount']);
const nonJsonRoot = jsonbValue(records.nonJsonDocument, []);
const nonJsonText = jsonbText(records.nonJsonDocument, ['when']);

const expression = sql<Document>`'{}'::jsonb`;
const sqlValue = jsonbValue(expression, ['profile', 'name']);
const sqlAliasValue = jsonbValue(expression.as('document'), ['items', 0, 'sku']);
const mappedExpression = sql<{ amount: number }>`'{"amount":7}'::jsonb`.mapWith(() => ({
	amount: 'mapped'
}));
const sqlMappedValue = jsonbValue(mappedExpression, ['amount']);
const sqlMappedAliasValue = jsonbValue(mappedExpression.as('mapped_document'), ['amount']);
const sqlMappedText = jsonbText(mappedExpression, ['amount']);
const tableAlias = alias(records, 'other_records');
const aliasValue = jsonbValue(tableAlias.document, ['profile', 'name']);
const columnAliasValue = jsonbValue(records.document.as('document_alias'), ['profile', 'name']);

declare const dynamicPath: readonly (string | number)[];
const dynamicValue = jsonbValue(records.document, dynamicPath);
declare const dynamicIndex: number;
const dynamicArrayIndex = jsonbValue(records.document, ['items', dynamicIndex, 'sku']);
declare const dynamicKey: string;
const dynamicObjectKey = jsonbValue(records.document, ['profile', dynamicKey]);
declare const recursive: SQL<{ next?: { next?: unknown } }>;
const depthEight = jsonbValue(recursive, ['next', 'next', 'a', 'b', 'c', 'd', 'e', 'f']);
declare const dateExpression: SQL<Date>;
const dateRoot = jsonbValue(dateExpression, []);
const optionalTupleLast = jsonbValue(records.optionalTuple, [-1]);
const optionalTupleIndex = jsonbValue(records.optionalTuple, [1]);
const restTupleFirst = jsonbValue(records.restTuple, [0]);
const restTupleLast = jsonbValue(records.restTuple, [-1]);
const dictionaryValue = jsonbValue(records.dictionary, ['arbitrary-key', 'value']);
const nullableUnionValue = jsonbValue(records.nullableUnion, ['item', 'value']);
declare const unionKey: 'name' | 'enabled';
const unionKeyValue = jsonbValue(records.document, ['profile', unionKey]);
declare const untypedExpression: SQL<ReturnType<typeof JSON.parse>>;
const untypedValue = jsonbValue(untypedExpression, ['anything']);
const jsonNull = jsonbValue(records.jsonNull, []);
const jsonPrimitive = jsonbValue(records.jsonPrimitive, []);

// Keep these assertions exported so the contract remains checked with noUnusedLocals.
export type JsonbTypeContracts = [
	Expect<Equal<Result<typeof name>, string | null>>,
	Expect<Equal<Result<typeof enabled>, boolean | null>>,
	Expect<Equal<Result<typeof sku>, string | null>>,
	Expect<Equal<Result<typeof stringIndex>, number | null>>,
	Expect<Equal<Result<typeof tupleLast>, number | null>>,
	Expect<Equal<Result<typeof tupleFirst>, string | null>>,
	Expect<Equal<Result<typeof unionBranch>, string | null>>,
	Expect<Equal<Result<typeof numericKey>, boolean | null>>,
	Expect<Equal<Result<typeof numericDictionaryValue>, string | null>>,
	Expect<Equal<Result<typeof root>, Document | null>>,
	Expect<Equal<Result<typeof textValue>, string | null>>,
	Expect<Equal<Result<typeof unknownValue>, unknown>>,
	Expect<Equal<Result<typeof customValue>, unknown>>,
	Expect<Equal<Result<typeof customMappedValue>, unknown>>,
	Expect<Equal<Result<typeof customMappedText>, string | null>>,
	Expect<Equal<Result<typeof dateValue>, unknown>>,
	Expect<Equal<Result<typeof bigintValue>, unknown>>,
	Expect<Equal<Result<typeof nonJsonRoot>, { when: unknown; amount: unknown } | null>>,
	Expect<Equal<Result<typeof nonJsonText>, string | null>>,
	Expect<Equal<Result<typeof sqlValue>, unknown>>,
	Expect<Equal<Result<typeof sqlAliasValue>, unknown>>,
	Expect<Equal<Result<typeof sqlMappedValue>, unknown>>,
	Expect<Equal<Result<typeof sqlMappedAliasValue>, unknown>>,
	Expect<Equal<Result<typeof sqlMappedText>, string | null>>,
	Expect<Equal<Result<typeof aliasValue>, string | null>>,
	Expect<Equal<Result<typeof columnAliasValue>, string | null>>,
	Expect<Equal<Result<typeof dynamicValue>, unknown>>,
	Expect<Equal<Result<typeof dynamicArrayIndex>, string | null>>,
	Expect<Equal<Result<typeof dynamicObjectKey>, unknown>>,
	Expect<Equal<Result<typeof depthEight>, unknown>>,
	Expect<Equal<Result<typeof dateRoot>, unknown>>,
	Expect<Equal<Result<typeof optionalTupleLast>, string | number | null>>,
	Expect<Equal<Result<typeof optionalTupleIndex>, number | null>>,
	Expect<Equal<Result<typeof restTupleFirst>, string | number | null>>,
	Expect<Equal<Result<typeof restTupleLast>, string | number | null>>,
	Expect<Equal<Result<typeof dictionaryValue>, number | null>>,
	Expect<Equal<Result<typeof nullableUnionValue>, string | number | null>>,
	Expect<Equal<Result<typeof unionKeyValue>, string | boolean | null>>,
	Expect<Equal<Result<typeof untypedValue>, unknown>>,
	Expect<Equal<Result<typeof jsonNull>, null>>,
	Expect<Equal<Result<typeof jsonPrimitive>, 42 | null>>
];

// @ts-expect-error Scalar columns are not JSONB sources.
jsonbValue(records.label, []);
// @ts-expect-error Scalar columns are not JSONB sources, even for text extraction.
jsonbText(records.id, []);
// @ts-expect-error A misspelled literal key cannot fall back to the dynamic path signature.
jsonbValue(records.document, ['profiel', 'name']);
// @ts-expect-error A wrong prefix remains invalid even with a dynamic final segment.
jsonbValue(records.document, ['profiel', dynamicKey]);
// @ts-expect-error Primitive values do not expose JavaScript properties through JSON paths.
jsonbValue(records.document, ['profile', 'name', 'length']);
// @ts-expect-error Arrays require integer indexes, not arbitrary string keys.
jsonbValue(records.document, ['items', 'length']);
// @ts-expect-error Fractional literal indexes are invalid.
jsonbValue(records.document, ['items', 0.5]);
// @ts-expect-error Fractional string indexes are invalid.
jsonbValue(records.document, ['items', '0.5']);
// @ts-expect-error Tuple indexes are bounded by their declared length.
jsonbValue(records.document, ['pair', 2]);
// @ts-expect-error Negative tuple indexes are also bounded.
jsonbValue(records.document, ['pair', -3]);
// @ts-expect-error Numeric-looking strings must use the canonical integer spelling.
jsonbValue(records.document, ['items', '01']);
// @ts-expect-error Non-JSON model methods are not exposed as JSON fields.
jsonbValue(records.nonJsonDocument, ['when', 'toISOString']);
// @ts-expect-error Symbol path segments are unsupported.
jsonbValue(records.document, [Symbol('profile')]);
// @ts-expect-error Statically known paths stop at eight segments.
jsonbValue(recursive, ['next', 'next', 'a', 'b', 'c', 'd', 'e', 'f', 'g']);
// @ts-expect-error Text extraction validates the same literal keys.
jsonbText(records.document, ['missing']);
// @ts-expect-error Numeric record keys require canonical numeric strings.
jsonbValue(records.numericDocument, ['01', 'name']);
// @ts-expect-error A numeric index signature does not accept arbitrary object keys.
jsonbValue(records.numericDocument, ['first', 'name']);
declare const invalidUnionKey: 'name' | 'missing';
// @ts-expect-error Every member of a literal key union must be valid.
jsonbValue(records.document, ['profile', invalidUnionKey]);
declare const invalidUnionIndex: 0 | 0.5;
// @ts-expect-error A union containing a fractional index is not valid.
jsonbValue(records.document, ['items', invalidUnionIndex]);
// @ts-expect-error Arbitrary SQLWrapper objects do not assert a JSONB expression.
jsonbValue(sql.identifier('document'), []);
// @ts-expect-error A JSON primitive does not expose object paths.
jsonbValue(records.jsonPrimitive, ['toString']);

const relations = defineRelations({ records });
const db = drizzle.mock({ relations });
db.query.records.findMany({
	extras: {
		profileName: (record) => {
			const callbackValue = jsonbValue(record.document, ['profile', 'name']);
			const checked: SQL<string | null> = callbackValue;
			// @ts-expect-error RQB callback columns keep their known JSONB paths.
			jsonbText(record.document, ['missing']);
			return checked;
		}
	}
});
