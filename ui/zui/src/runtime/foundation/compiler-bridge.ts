import { disposeIcssModule, ownedIcss } from '../../icss/runtime.js';
import { createIcssSlot } from '../../icss/values.js';
import type { IcssVariables } from './root-style.js';
import type { Attachment } from 'svelte/attachments';

export { setServerRuntimeResolver as __setServerRuntimeResolver } from '../../icss/runtime.js';

export const __icssOwned = ownedIcss;
export const __disposeIcssModule = disposeIcssModule;

const ICSS_CARRIER_VALUES = Symbol.for('@zadmin/zui/icss-carrier-values');

type IcssCarrier = Readonly<Record<symbol, Attachment<Element>>>;
type IcssCarrierAttachment = Attachment<Element> & {
	readonly [ICSS_CARRIER_VALUES]?: IcssVariables;
};

/** @internal Compiler-generated Symbol carrier that remains visible during SSR. */
export function __icssCarrier(variables: IcssVariables): IcssCarrier {
	const attachment: IcssCarrierAttachment = () => undefined;
	Object.defineProperty(attachment, ICSS_CARRIER_VALUES, { value: variables });
	return { [Symbol('zui-icss-carrier')]: attachment };
}

/** @internal Reads compiler variables without exposing a public string prop. */
export function readIcssCarrier(value: object): IcssVariables | undefined {
	for (const key of Object.getOwnPropertySymbols(value)) {
		const attachment = (value as Readonly<Record<symbol, unknown>>)[key];
		if (typeof attachment !== 'function') continue;
		const variables = (attachment as IcssCarrierAttachment)[ICSS_CARRIER_VALUES];
		if (variables !== undefined) return variables;
	}
	return undefined;
}

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
