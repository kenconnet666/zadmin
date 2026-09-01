/** A schema field address. Numeric segments describe array entries without losing their type. */
export type FieldPath = readonly (string | number)[];
export type FieldPathInput = string | number | FieldPath;

const IDENTIFIER_SEGMENT = /^[\p{ID_Start}_$][\p{ID_Continue}_$]*$/u;

function assertSegment(segment: string | number): void {
	if (typeof segment === 'string') return;
	if (!Number.isSafeInteger(segment) || segment < 0) {
		throw new TypeError('ZForm FieldPath numeric segments must be non-negative safe integers.');
	}
}

/** Normalize a public path without conflating a scalar string with a segmented path. */
export function normalizeFieldPath(path: FieldPathInput): FieldPath {
	const segments = (Array.isArray(path) ? path : [path]) as readonly (string | number)[];
	if (segments.length === 0) throw new TypeError('ZForm FieldPath cannot be empty.');
	for (const segment of segments) assertSegment(segment);
	return Object.freeze([...segments]);
}

/**
 * Collision-free internal identity. The segment type is encoded so `['1']` and `[1]` stay distinct.
 */
export function fieldPathKey(path: FieldPathInput): string {
	return JSON.stringify(
		normalizeFieldPath(path).map((segment) =>
			typeof segment === 'number' ? (['n', segment] as const) : (['s', segment] as const)
		)
	);
}

/**
 * Stable public spelling used by errors and generated HTML names.
 *
 * Simple names remain backwards compatible (`account`). Segmented paths use familiar dot/bracket
 * syntax (`users[0].email`), while punctuation-bearing string segments remain unambiguous
 * (`["users[0]"]`).
 */
export function fieldPathToString(path: FieldPath): string {
	let result = '';
	for (const segment of path) {
		assertSegment(segment);
		if (typeof segment === 'number') {
			result += `[${segment}]`;
			continue;
		}
		if (IDENTIFIER_SEGMENT.test(segment)) {
			result += result.length === 0 ? segment : `.${segment}`;
			continue;
		}
		result += `[${JSON.stringify(segment)}]`;
	}
	return result;
}

export function fieldPathStartsWith(path: FieldPath, prefix: FieldPath): boolean {
	return (
		prefix.length <= path.length &&
		prefix.every((segment, index) => Object.is(segment, path[index]))
	);
}
