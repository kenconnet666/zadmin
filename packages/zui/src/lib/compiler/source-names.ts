import path from 'node:path';

import type { Expression } from 'estree';

import { hashString } from '../icss/hash.ts';
import type { Positioned, PositionedCallExpression } from './types.ts';

function normalizeRelativeFilename(filename: string | undefined, root: string): string {
	if (filename === undefined) return 'anonymous.svelte';
	const relative = path.relative(root, filename).replaceAll(path.sep, '/');
	if (!path.isAbsolute(relative) && !relative.startsWith('../') && relative !== '..')
		return relative;
	return path.basename(filename);
}

export function createCallsiteId(
	call: PositionedCallExpression,
	source: string,
	filename: string | undefined,
	root: string
): string {
	const moduleName = normalizeRelativeFilename(filename, root);
	const callSource = source.slice(call.start, call.end).replace(/\s+/g, ' ');
	return hashString(`${moduleName}:${call.start}:${callSource}`).slice(0, 8);
}

export function createModuleId(filename: string | undefined, root: string): string {
	return `m-${hashString(normalizeRelativeFilename(filename, root)).slice(0, 10)}`;
}

export function sourceVariableName(expression: Positioned<Expression>): string | undefined {
	if (expression.type !== 'Identifier') return undefined;
	const normalized = expression.name
		.replace(/^\$+/u, '')
		.replace(/([a-z\d])([A-Z])/gu, '$1-$2')
		.replace(/[^a-zA-Z\d_-]+/gu, '-')
		.replace(/^-+|-+$/gu, '')
		.toLowerCase();
	return normalized.length === 0 ? undefined : normalized;
}

export function createVariableName(
	callsiteId: string,
	slot: number,
	sourceName?: string
): `--${string}` {
	return `--${sourceName === undefined ? '' : `${sourceName}-`}${callsiteId}-${slot}`;
}
