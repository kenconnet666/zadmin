import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { parse } from 'svelte/compiler';
import { describe, expect, it } from 'vitest';

interface AstNode {
	readonly attributes?: readonly AstNode[];
	readonly name?: string;
	readonly type?: string;
	readonly [key: string]: unknown;
}

function hasNativeResetOutputOptIn(node: AstNode): boolean {
	return (
		node.attributes?.some(
			(attribute) => attribute.type === 'Attribute' && attribute.name === 'data-native-reset-output'
		) === true
	);
}

function outputsInsideResetOwner(root: unknown): number {
	let count = 0;
	const seen = new Set<object>();
	const visit = (value: unknown, insideResetOwner = false): void => {
		if (value === null || typeof value !== 'object' || seen.has(value)) return;
		seen.add(value);
		const node = value as AstNode;
		const nextInside =
			insideResetOwner ||
			(node.type === 'RegularElement' && node.name === 'form') ||
			(node.type === 'Component' && node.name === 'ZForm');
		if (
			nextInside &&
			node.type === 'RegularElement' &&
			node.name === 'output' &&
			!hasNativeResetOutputOptIn(node)
		)
			count += 1;
		for (const [key, child] of Object.entries(node)) {
			if (key === 'parent') continue;
			if (Array.isArray(child)) child.forEach((item) => visit(item, nextInside));
			else visit(child, nextInside);
		}
	};
	visit(root);
	return count;
}

describe('form reset fixture contracts', () => {
	it('keeps state diagnostics outside native reset owners', async () => {
		const testRoot = resolve(import.meta.dirname);
		const fixtures = (await readdir(testRoot)).filter((name) => name.endsWith('.svelte'));
		const violations: string[] = [];
		for (const fixture of fixtures) {
			const source = await readFile(resolve(testRoot, fixture), 'utf8');
			const ast = parse(source, { modern: true });
			if (outputsInsideResetOwner(ast.fragment) > 0) violations.push(fixture);
		}
		expect(
			violations,
			'Native form reset owns <output>. Put Svelte state diagnostics outside the form or explicitly mark a native reset-output contract.'
		).toEqual([]);
	});
});
