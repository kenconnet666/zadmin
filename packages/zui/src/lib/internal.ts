import { disposeIcssModule, ownedIcss } from './icss/runtime.js';
import { createIcssSlot } from '@zadmin/zui-core';

export { setServerRuntimeResolver as __setServerRuntimeResolver } from './icss/runtime.js';

export const __icssOwned = ownedIcss;
export const __disposeIcssModule = disposeIcssModule;

interface IcssHotModule {
	readonly hot?: {
		dispose(callback: () => void): void;
	};
}

export function __registerIcssHmr(meta: ImportMeta, owner: string): void {
	(meta as IcssHotModule).hot?.dispose(() => disposeIcssModule(owner));
}

/** @internal Compiler carrier: `never` keeps generated calls assignable to every CSS value type. */
export function __icssSlot(variable: `--${string}`): never {
	return createIcssSlot(variable) as never;
}
