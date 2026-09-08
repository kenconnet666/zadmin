import { readFileSync } from 'node:fs';
import * as ts from 'typescript';
import { expect, it } from 'vitest';
import {
	createContextKey,
	type HotModuleLike,
	type ImportMetaLike
} from '../src/runtime/foundation/context-key.js';

it('retains a module-local context identity across hot replacement without global symbol collisions', () => {
	const data = {};
	const hot = { data } satisfies HotModuleLike;
	const module = { hot } satisfies ImportMetaLike;
	const first = createContextKey(module, 'field');
	expect(createContextKey({ hot: { data } }, 'field')).toBe(first);
	expect(createContextKey({ hot: { data } }, 'group')).not.toBe(first);
	expect(createContextKey({ hot: { data: {} } }, 'field')).not.toBe(first);
	expect(createContextKey({}, 'field')).not.toBe(createContextKey({}, 'field'));
});

it('preserves the caller direct hot access after TypeScript erases the local compatibility type', () => {
	const source = readFileSync(
		new URL('../src/runtime/foundation/grid-context.ts', import.meta.url),
		'utf8'
	);
	const output = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.ESNext, removeComments: true }
	}).outputText;

	expect(output.match(/import\.meta\.hot/gu)).toHaveLength(1);
	expect(output).not.toContain('ImportMetaLike');
});
