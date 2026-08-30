import { describe, expect, it } from 'vitest';

import { defaultTheme } from '../src/entrypoints/index.js';
import {
	assertIcssClassName,
	assertIcssResourcesStable,
	createIcssFixture,
	createTestIcssRuntime
} from '../src/testing/index.js';

describe('@zadmin/zui/testing', () => {
	it('creates an inspectable memory runtime and deterministic fixture', () => {
		const harness = createTestIcssRuntime();
		const fixture = createIcssFixture(harness, defaultTheme, (s) => s.display.flex);
		const owned = createIcssFixture(harness, defaultTheme, (s) => s.display.grid, 'fixture-owner');

		assertIcssClassName(fixture.className);
		expect(fixture.snapshot).toMatchObject({ entries: 1, metrics: { classes: 1, rules: 1 } });
		expect(owned.className).toMatch(/^c-/u);
		expect(fixture.snapshot.cssText).toContain('display:flex');
		expect(fixture.snapshot.styleTag).toContain('data-icss');

		harness.reset();
		expect(harness.snapshot()).toMatchObject({ entries: 0, metrics: { classes: 0, rules: 0 } });
	});

	it('asserts resource stability with an actionable metric delta', () => {
		const harness = createTestIcssRuntime();
		const before = harness.snapshot();
		assertIcssResourcesStable(before, harness.snapshot());

		createIcssFixture(harness, defaultTheme, (s) => s.display.grid);
		expect(() => assertIcssResourcesStable(before, harness.snapshot())).toThrow(/classes: 0 -> 1/u);
		expect(() => assertIcssClassName('button')).toThrow(/Expected an ICSS class name/u);
	});
});
