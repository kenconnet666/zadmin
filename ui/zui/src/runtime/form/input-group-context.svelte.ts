import { getContext, setContext } from 'svelte';

import { createContextKey } from '../foundation/context-key.js';
import type { ZControlSize } from '../foundation/control-size.js';

export interface ZInputGroupControl {
	focus(): void;
}

export interface ZInputGroupContext {
	readonly controlId?: string;
	readonly describedBy?: string;
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly labelId?: string;
	readonly name?: string;
	readonly readonly: boolean;
	readonly required: boolean;
	readonly size?: ZControlSize;
	registerControl(control: ZInputGroupControl): () => void;
}

const INPUT_GROUP_CONTEXT = createContextKey({ hot: import.meta.hot }, 'zui-input-group-context');

export function provideZInputGroup(context: ZInputGroupContext): ZInputGroupContext {
	setContext(INPUT_GROUP_CONTEXT, context);
	return context;
}

export function useZInputGroup(): ZInputGroupContext | undefined {
	return getContext<ZInputGroupContext | undefined>(INPUT_GROUP_CONTEXT);
}
