import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { eq, sql, type SQL } from 'drizzle-orm';
import { alias, customType, integer, json, jsonb, PgDialect, pgTable } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import { jsonbText, jsonbValue } from '../src/index.ts';

const table = pgTable('jsonb_read_unit', {
	id: integer(),
	payload: jsonb(),
	plainJson: json(),
	jsonbArray: jsonb().array(),
	customJsonb: customType<{ data: unknown }>({ dataType: () => 'jsonb' })(),
	customText: customType<{ data: unknown }>({ dataType: () => 'text' })()
});
const dialect = new PgDialect();
const readers = { jsonbValue, jsonbText };

for (const [name, reader] of Object.entries(readers)) {
	describe(name, () => {
		function read(source: unknown, path: unknown): SQL {
			return Reflect.apply(reader, undefined, [source, path]) as SQL;
		}

		it('binds hostile and special keys as one path parameter', () => {
			const hostile = "'); select 'zadmin_injection'; --";
			const path = ['', 'comma,key', 'double"quote', 'back\\slash', hostile];
			const query = dialect.sqlToQuery(read(table.payload, path));

			assert.equal(query.params.length, 1);
			const [encodedPath] = query.params;
			assert.ok(typeof encodedPath === 'string');
			assert.match(encodedPath, /zadmin_injection/);
			assert.doesNotMatch(query.sql, /zadmin_injection|comma,key|double"quote|back\\slash/);
			assert.match(query.sql, /\$1\s*::\s*text\[\]/);
			assert.match(query.sql, name === 'jsonbValue' ? /#>(?!>)/ : /#>>/);
		});

		it('keeps the captured path independent of later input mutations', () => {
			const path: (string | number)[] = ['items', -1];
			const expression = read(table.payload, path);
			const before = dialect.sqlToQuery(expression);
			path[0] = 'changed';
			path.push('another');

			assert.deepEqual(dialect.sqlToQuery(expression), before);
		});

		it('accepts root paths, eight segments and signed PostgreSQL array indices', () => {
			assert.deepEqual(dialect.sqlToQuery(read(table.payload, [])).params, ['{}']);
			for (const path of [
				['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
				['items', -1],
				['items', -2147483648],
				['items', 2147483647],
				['2147483648']
			]) {
				assert.doesNotThrow(() => dialect.sqlToQuery(read(table.payload, path)));
			}
		});

		it('rejects malformed runtime paths before creating a query', () => {
			const invalidPaths: unknown[] = [
				undefined,
				null,
				'field',
				{},
				['nul\u0000key'],
				Array.from({ length: 9 }, () => 'nested'),
				[undefined],
				[null],
				[true],
				[{}],
				[Symbol('key')],
				[sql.placeholder('path')],
				new Array(1)
			];
			for (const path of invalidPaths) assert.throws(() => read(table.payload, path));
		});

		it('rejects fractional, non-finite and out-of-range numeric indices', () => {
			for (const index of [
				0.5,
				NaN,
				Infinity,
				-Infinity,
				2147483648,
				-2147483649,
				Number.MAX_SAFE_INTEGER + 1
			]) {
				assert.throws(() => read(table.payload, ['items', index]));
			}
		});

		it('accepts JSONB columns and rejects incompatible column or source types', () => {
			assert.doesNotThrow(() => read(table.customJsonb, ['key']));
			for (const source of [
				table.id,
				table.plainJson,
				table.jsonbArray,
				table.customText,
				null,
				'payload',
				{},
				{ getSQL: () => sql`'{}'::jsonb` }
			]) {
				assert.throws(() => read(source, ['key']));
			}
		});

		it('composes with native aliases, predicates and SQL expressions', () => {
			const other = alias(table, 'other');
			const db = drizzle.mock();
			const expression = read(sql`coalesce(${other.payload}, '{}'::jsonb)`, ['key']);
			const query = db
				.select({ value: expression.as('extracted') })
				.from(other)
				.where(eq(jsonbText(other.payload, ['key']), 'expected'))
				.toSQL();

			assert.match(query.sql, /"other"\."payload"/);
			assert.match(query.sql, /coalesce/);
			assert.match(query.sql, /as "extracted"/);
			assert.equal(query.params.at(-1), 'expected');
		});
	});
}
