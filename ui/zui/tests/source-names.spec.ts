import type { Identifier } from 'estree';
import { describe, expect, it } from 'vitest';

import {
	createCallsiteId,
	createModuleId,
	createVariableName,
	sourceVariableName
} from '../src/compiler/source-names.js';
import type { Positioned, PositionedCallExpression } from '../src/compiler/types.js';

function identifier(name: string): Positioned<Identifier> {
	return { end: name.length, name, start: 0, type: 'Identifier' };
}

describe('compiler source names', () => {
	it('normalizes direct TypeScript identifiers', () => {
		expect(sourceVariableName(identifier('$panelWidth'))).toBe('panel-width');
		expect(sourceVariableName(identifier('already_snake'))).toBe('already_snake');
		expect(sourceVariableName(identifier('宽度'))).toBeUndefined();
		expect(
			sourceVariableName({ end: 1, raw: '1', start: 0, type: 'Literal', value: 1 })
		).toBeUndefined();
	});

	it('creates named and anonymous slot names', () => {
		expect(createVariableName('abc', 0, 'width')).toBe('--width-abc-0');
		expect(createVariableName('abc', 1)).toBe('--abc-1');
	});

	it('uses portable relative or basename-only module identities', () => {
		const call = {
			arguments: [],
			callee: identifier('icss'),
			end: 6,
			optional: false,
			start: 0,
			type: 'CallExpression'
		} as unknown as PositionedCallExpression;
		expect(createCallsiteId(call, 'icss()', 'C:/project/src/App.svelte', 'C:/project')).toMatch(
			/^[a-z0-9]+$/u
		);
		expect(createCallsiteId(call, 'icss()', 'D:/outside/App.svelte', 'C:/project')).toMatch(
			/^[a-z0-9]+$/u
		);
		expect(createModuleId(undefined, 'C:/project')).toMatch(/^m-[a-z0-9]+$/u);
	});
});
