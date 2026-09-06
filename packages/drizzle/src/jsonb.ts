import { is, SQL, sql } from 'drizzle-orm';
import { makePgArray, PgColumn } from 'drizzle-orm/pg-core';
import type { JsonbPath, JsonbPathConstraint, JsonbSource, JsonbValue } from './jsonb-types.ts';

const textArrayEncoder = { mapToDriverValue: makePgArray };

/**
 * Extracts a JSON value with PostgreSQL's #> operator.
 *
 * Literal paths on native JSONB columns infer their declared JSON leaf type.
 * Dynamic paths, custom columns, and SQL sources return unknown because their
 * declared result type may describe a decoder's output rather than stored JSON.
 * Missing paths and SQL NULL return null. An empty path selects the entire JSON value.
 * Source decoders are not applied to the extracted value; use mapWith on the result
 * when a leaf needs runtime validation or conversion.
 */
export function jsonbValue<Source extends JsonbSource, const Path extends JsonbPath>(
	source: Source,
	path: Path & JsonbPathConstraint<NoInfer<Source>, NoInfer<Path>>
): SQL<JsonbValue<Source, Path>> {
	assertJsonbSource(source);
	return sql<JsonbValue<Source, Path>>`((${source}) #> ${pathParameter(path)}::text[])`;
}

/**
 * Extracts PostgreSQL text with #>>, including for numeric and boolean JSON leaves.
 * JSON null, SQL NULL, and missing paths return null. An empty path selects the
 * root's PostgreSQL text representation, not a guaranteed JSON.stringify format.
 */
export function jsonbText<Source extends JsonbSource, const Path extends JsonbPath>(
	source: Source,
	path: Path & JsonbPathConstraint<NoInfer<Source>, NoInfer<Path>>
): SQL<string | null> {
	assertJsonbSource(source);
	return sql<string | null>`((${source}) #>> ${pathParameter(path)}::text[])`;
}

function assertJsonbSource(source: JsonbSource): void {
	if (is(source, PgColumn)) {
		// RC.4 stores SQL array dimensions separately from the base getSQLType().
		if (source.dimensions !== 0 || source.getSQLType().trim().toLowerCase() !== 'jsonb') {
			throw new TypeError('JSONB path expressions require a jsonb column.');
		}
	} else if (!is(source, SQL) && !is(source, SQL.Aliased)) {
		throw new TypeError('JSONB path expressions require a PostgreSQL column or SQL expression.');
	}
}

function pathParameter(path: JsonbPath) {
	if (!Array.isArray(path)) throw new TypeError('A JSONB path must be an array.');
	if (path.length > 8) throw new RangeError('A JSONB path must contain at most 8 segments.');
	const segments: string[] = [];
	for (const segment of path) {
		if (typeof segment === 'string') {
			if (segment.includes('\0')) throw new TypeError('JSONB path keys cannot contain NUL.');
			segments.push(segment);
		} else if (
			typeof segment === 'number' &&
			Number.isInteger(segment) &&
			segment >= -2_147_483_648 &&
			segment <= 2_147_483_647
		) {
			segments.push(String(segment));
		} else {
			throw new TypeError('JSONB path segments must be strings or signed 32-bit integers.');
		}
	}
	// Copy before binding: later mutations of the caller's array must not alter the query.
	return sql.param(segments, textArrayEncoder);
}
