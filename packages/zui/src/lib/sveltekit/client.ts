import { createBrowserIcssRuntime, type IcssRuntime } from '../icss/runtime.js';
import type { BrowserStyleSheetOptions } from '../icss/sheet.js';

/** Creates an explicit client runtime; the default `icss()` runtime hydrates automatically. */
export function createHydratedIcssRuntime(options: BrowserStyleSheetOptions = {}): IcssRuntime {
	return createBrowserIcssRuntime(options);
}
