import {
	createBrowserIcssRuntime,
	type BrowserStyleSheetOptions,
	type IcssRuntime
} from '@zadmin/zui/runtime';

/** Creates an explicit client runtime; the default `icss()` runtime hydrates automatically. */
export function createHydratedZuiRuntime(options: BrowserStyleSheetOptions = {}): IcssRuntime {
	return createBrowserIcssRuntime(options);
}
