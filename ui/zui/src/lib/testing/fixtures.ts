import type { ThemeSchema } from '../theme/types.js';
import type { IcssFactory } from '../icss/types.js';
import type { IcssFixtureResult, IcssTestRuntime } from './types.js';

export function createIcssFixture<TTheme extends ThemeSchema>(
	harness: IcssTestRuntime,
	theme: TTheme,
	factory: IcssFactory<TTheme>,
	owner?: string
): IcssFixtureResult {
	const className =
		owner === undefined
			? harness.runtime.icss(theme, factory)
			: harness.runtime.ownedIcss(owner, theme, factory);
	return Object.freeze({ className, snapshot: harness.snapshot() });
}
