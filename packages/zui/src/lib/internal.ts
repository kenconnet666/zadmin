import { createIcssSlot } from './icss/values.js';

/** @internal Compiler carrier: `never` keeps generated calls assignable to every CSS value type. */
export function __icssSlot(variable: `--${string}`): never {
	return createIcssSlot(variable) as never;
}
