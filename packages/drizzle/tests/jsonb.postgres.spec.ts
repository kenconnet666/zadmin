import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { and, defineRelations, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { alias, customType, integer, jsonb, pgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { jsonbText, jsonbValue } from '../src/index.ts';

interface Document {
	text: string;
	number: number;
	boolean: boolean;
	nullValue: null;
	contact?: { email: string };
	items: string[];
	special: Record<string, string>;
}

type DecodedDocument = Omit<Document, 'number'> & { number: string };

test('JSONB readers preserve PostgreSQL values and native query composition', async (t) => {
	const url = process.env.DRIZZLE_TEST_DATABASE_URL;
	assert.ok(url, 'DRIZZLE_TEST_DATABASE_URL is required for the PostgreSQL integration suite.');
	const client = postgres(url, { max: 1, connect_timeout: 5 });
	const tableName = `zadmin_jsonb_${randomUUID().replaceAll('-', '')}`;
	let decodedDocuments = 0;
	const customJsonb = customType<{ data: DecodedDocument; driverData: unknown }>({
		dataType: () => 'jsonb',
		toDriver: (value) => JSON.stringify(value),
		fromDriver: (value) => {
			assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value));
			decodedDocuments++;
			return { ...(value as Document), number: String((value as Document).number) };
		}
	});
	const records = pgTable(tableName, {
		id: integer().primaryKey(),
		parentId: integer('parent_id'),
		payload: jsonb().$type<Document>(),
		customPayload: customJsonb('custom_payload')
	});
	const relations = defineRelations({ records }, (r) => ({
		records: {
			children: r.many.records({ from: r.records.id, to: r.records.parentId })
		}
	}));
	const db = drizzle({ client, relations });
	const specialKeys = [
		'',
		'comma,key',
		'double"quote',
		'back\\slash',
		'brace{key}',
		"'); --",
		'汉字'
	];
	const document: Document = {
		text: 'hello "JSON" \\ world',
		number: 42.5,
		boolean: true,
		nullValue: null,
		contact: { email: 'first@example.test' },
		items: ['first', 'middle', 'last'],
		special: Object.fromEntries(specialKeys.map((key, index) => [key, `value-${index}`]))
	};

	try {
		await db.transaction(async (tx) => {
			await tx.execute(sql`
				create temporary table ${sql.identifier(tableName)} (
					id integer primary key,
					parent_id integer,
					payload jsonb,
					custom_payload jsonb
				) on commit drop
			`);
			await tx.insert(records).values([
				{ id: 1, payload: document, customPayload: sql`${JSON.stringify(document)}::jsonb` },
				{ id: 2, payload: { ...document, contact: undefined } },
				{ id: 3, payload: sql`'null'::jsonb` },
				{ id: 4, payload: null },
				{ id: 5, payload: sql`'{}'::jsonb` },
				{ id: 6, parentId: 1, payload: { ...document, text: 'child' } }
			]);

			await t.test('returns JSON scalar types and textual representations', async () => {
				const [row] = await tx
					.select({
						textValue: jsonbValue(records.payload, ['text']),
						textText: jsonbText(records.payload, ['text']),
						numberValue: jsonbValue(records.payload, ['number']),
						numberText: jsonbText(records.payload, ['number']),
						booleanValue: jsonbValue(records.payload, ['boolean']),
						booleanText: jsonbText(records.payload, ['boolean']),
						nullValue: jsonbValue(records.payload, ['nullValue']),
						nullText: jsonbText(records.payload, ['nullValue'])
					})
					.from(records)
					.where(eq(records.id, 1));
				assert.deepEqual(row, {
					textValue: document.text,
					textText: document.text,
					numberValue: 42.5,
					numberText: '42.5',
					booleanValue: true,
					booleanText: 'true',
					nullValue: null,
					nullText: null
				});
			});

			await t.test(
				'preserves scalar roots without reparsing strings or inheriting SQL decoders',
				async () => {
					for (const value of ['123', 'true', 'null', '', 0, false, null]) {
						const source = sql<unknown>`${JSON.stringify(value)}::jsonb`;
						const [row] = await tx
							.select({ value: jsonbValue(source, []), text: jsonbText(source, []) })
							.from(records)
							.where(eq(records.id, 1));
						assert.deepEqual(row, {
							value,
							text:
								value === null ? null : typeof value === 'string' ? value : JSON.stringify(value)
						});
					}

					let decodedExpressions = 0;
					const source = sql<Document>`${records.payload}`.mapWith((value): DecodedDocument => {
						assert.ok(value !== null && typeof value === 'object');
						decodedExpressions++;
						return { ...(value as Document), number: String((value as Document).number) };
					});
					const [whole] = await tx.select({ value: source }).from(records).where(eq(records.id, 1));
					assert.deepEqual(whole?.value, { ...document, number: '42.5' });
					assert.equal(decodedExpressions, 1);

					const [extracted] = await tx
						.select({
							value: jsonbValue(source, ['number']),
							text: jsonbText(source, ['text']),
							root: jsonbValue(source, [])
						})
						.from(records)
						.where(eq(records.id, 1));
					assert.deepEqual(extracted, { value: 42.5, text: document.text, root: document });
					assert.equal(decodedExpressions, 1);
				}
			);

			await t.test('reads object, array, root, optional and negative-index paths', async () => {
				const [row] = await tx
					.select({
						root: jsonbValue(records.payload, []),
						rootText: jsonbText(records.payload, []),
						contact: jsonbValue(records.payload, ['contact']),
						items: jsonbValue(records.payload, ['items']),
						last: jsonbValue(records.payload, ['items', -1]),
						lastText: jsonbText(records.payload, ['items', -1]),
						outOfRange: jsonbValue(records.payload, ['items', 100])
					})
					.from(records)
					.where(eq(records.id, 1));
				assert.ok(row);
				assert.deepEqual(row.root, document);
				assert.deepEqual(JSON.parse(row.rootText!), document);
				assert.deepEqual(row.contact, document.contact);
				assert.deepEqual(row.items, document.items);
				assert.equal(row.last, 'last');
				assert.equal(row.lastText, 'last');
				assert.equal(row.outOfRange, null);
				const [missing] = await tx
					.select({ email: jsonbText(records.payload, ['contact', 'email']) })
					.from(records)
					.where(eq(records.id, 2));
				assert.deepEqual(missing, { email: null });
			});

			await t.test(
				'distinguishes SQL NULL, JSON null and absent keys through native predicates',
				async () => {
					const rows = await tx
						.select({
							id: records.id,
							rootIsSqlNull: isNull(jsonbValue(records.payload, [])),
							leafIsSqlNull: isNull(jsonbValue(records.payload, ['nullValue'])),
							leafIsJsonValue: isNotNull(jsonbValue(records.payload, ['nullValue'])),
							leafTextIsNull: isNull(jsonbText(records.payload, ['nullValue']))
						})
						.from(records)
						.where(sql`${records.id} in (1, 3, 4, 5)`)
						.orderBy(records.id);
					assert.deepEqual(rows, [
						{
							id: 1,
							rootIsSqlNull: false,
							leafIsSqlNull: false,
							leafIsJsonValue: true,
							leafTextIsNull: true
						},
						{
							id: 3,
							rootIsSqlNull: false,
							leafIsSqlNull: true,
							leafIsJsonValue: false,
							leafTextIsNull: true
						},
						{
							id: 4,
							rootIsSqlNull: true,
							leafIsSqlNull: true,
							leafIsJsonValue: false,
							leafTextIsNull: true
						},
						{
							id: 5,
							rootIsSqlNull: false,
							leafIsSqlNull: true,
							leafIsJsonValue: false,
							leafTextIsNull: true
						}
					]);
				}
			);

			await t.test('preserves special keys without executing them as SQL', async () => {
				for (const [index, key] of specialKeys.entries()) {
					const [row] = await tx
						.select({
							value: jsonbValue(records.payload, ['special', key]),
							text: jsonbText(records.payload, ['special', key])
						})
						.from(records)
						.where(eq(records.id, 1));
					assert.deepEqual(row, { value: `value-${index}`, text: `value-${index}` });
				}
			});

			await t.test('composes aliases, subqueries, SQL operands and predicates', async () => {
				const other = alias(records, 'other');
				const rows = await tx
					.select({ email: jsonbText(other.payload, ['contact', 'email']) })
					.from(other)
					.where(and(eq(other.id, 1), eq(jsonbText(other.payload, ['number']), '42.5')));
				assert.deepEqual(rows, [{ email: 'first@example.test' }]);

				const source = tx
					.select({ payload: jsonbValue(records.payload, []).as('document') })
					.from(records)
					.where(eq(records.id, 1))
					.as('documents');
				const [projected] = await tx
					.select({ email: jsonbText(source.payload, ['contact', 'email']) })
					.from(source);
				assert.deepEqual(projected, { email: 'first@example.test' });

				const [combined] = await tx
					.select({
						value: jsonbText(
							sql<Document>`coalesce(${records.payload}, '{}'::jsonb) || '{"text":"overridden"}'::jsonb`,
							['text']
						)
					})
					.from(records)
					.where(eq(records.id, 1));
				assert.deepEqual(combined, { value: 'overridden' });
			});

			await t.test('uses RQB callback aliases in parent and nested relations', async () => {
				const row = await tx.query.records.findFirst({
					where: { id: 1, RAW: (r) => eq(jsonbText(r.payload, ['number']), '42.5') },
					columns: { id: true },
					extras: {
						text: (r) => jsonbText(r.payload, ['text']),
						contact: (r) => jsonbValue(r.payload, ['contact'])
					},
					with: {
						children: {
							columns: { id: true },
							extras: {
								text: (r) => jsonbText(r.payload, ['text']),
								number: (r) => jsonbValue(r.payload, ['number'])
							},
							orderBy: { id: 'asc' }
						}
					}
				});
				assert.deepEqual(row, {
					id: 1,
					text: document.text,
					contact: document.contact,
					children: [{ id: 6, text: 'child', number: 42.5 }]
				});
			});

			await t.test('does not apply a whole-document decoder to extracted values', async () => {
				const [whole] = await tx
					.select({ payload: records.customPayload })
					.from(records)
					.where(eq(records.id, 1));
				assert.deepEqual(whole?.payload, { ...document, number: '42.5' });
				assert.equal(decodedDocuments, 1);

				const [extracted] = await tx
					.select({
						value: jsonbValue(records.customPayload, ['number']),
						text: jsonbText(records.customPayload, ['number']),
						root: jsonbValue(records.customPayload, [])
					})
					.from(records)
					.where(eq(records.id, 1));
				assert.deepEqual(extracted, { value: 42.5, text: '42.5', root: document });
				assert.equal(decodedDocuments, 1);
			});
		});

		const [cleanup] = await db.execute<{ name: string | null }>(
			sql`select to_regclass(${`pg_temp.${tableName}`})::text as name`
		);
		assert.equal(cleanup?.name, null, 'The transaction must remove its temporary table.');
	} finally {
		await client.end({ timeout: 5 });
	}
});
