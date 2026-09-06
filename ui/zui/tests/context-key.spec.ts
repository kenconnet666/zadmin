import { expect, it } from 'vitest';
import { createContextKey } from '../src/runtime/foundation/context-key.js';

it('retains a module-local context identity across hot replacement without global symbol collisions', () => {
	const data = {};
	const first = createContextKey({ hot: { data } }, 'field');
	expect(createContextKey({ hot: { data } }, 'field')).toBe(first);
	expect(createContextKey({ hot: { data } }, 'group')).not.toBe(first);
	expect(createContextKey({ hot: { data: {} } }, 'field')).not.toBe(first);
	expect(createContextKey({}, 'field')).not.toBe(createContextKey({}, 'field'));
});
