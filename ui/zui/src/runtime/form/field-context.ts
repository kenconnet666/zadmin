import { getContext, setContext } from 'svelte';

export interface ZFieldContext {
	readonly controlId: string;
	readonly describedBy?: string;
	readonly disabled: boolean;
	readonly invalid: boolean;
	readonly labelId: string;
	readonly name?: string;
	readonly readonly: boolean;
	readonly required: boolean;
	registerFocusOwner(focus: () => void): () => void;
}

/**
 * The compound component that owns a field's business value.
 *
 * Claiming the owner shadows the inherited field context for ordinary descendants. Internal
 * search, draft and filter inputs therefore stay auxiliary unless the compound explicitly
 * projects the claimed semantics onto its real focus and form owners.
 */
export interface ZFieldControlOwner {
	readonly field: ZFieldContext | undefined;
	registerFocusOwner(focus: () => void): () => void;
}

const FIELD_CONTEXT = Symbol('zui-field-context');
const FIELD_CONTROL_OWNER_CONTEXT = Symbol('zui-field-control-owner-context');

export function provideZField(read: () => ZFieldContext): ZFieldContext {
	const context: ZFieldContext = {
		get controlId() {
			return read().controlId;
		},
		get describedBy() {
			return read().describedBy;
		},
		get disabled() {
			return read().disabled;
		},
		get invalid() {
			return read().invalid;
		},
		get labelId() {
			return read().labelId;
		},
		get name() {
			return read().name;
		},
		get readonly() {
			return read().readonly;
		},
		get required() {
			return read().required;
		},
		registerFocusOwner(focus) {
			return read().registerFocusOwner(focus);
		}
	};
	setContext(FIELD_CONTEXT, context);
	return context;
}

export function useZField(): ZFieldContext | undefined {
	return getContext<ZFieldContext | undefined>(FIELD_CONTEXT);
}

export function provideZFieldAuxiliaryBoundary(): void {
	setContext<ZFieldContext | undefined>(FIELD_CONTEXT, undefined);
}

export function claimZFieldControlOwner(): ZFieldControlOwner {
	const field = useZField();
	const owner: ZFieldControlOwner = {
		field,
		registerFocusOwner(focus) {
			return field?.registerFocusOwner(focus) ?? (() => undefined);
		}
	};
	setContext(FIELD_CONTROL_OWNER_CONTEXT, owner);
	provideZFieldAuxiliaryBoundary();
	return owner;
}

export function useZFieldControlOwner(): ZFieldControlOwner | undefined {
	return getContext<ZFieldControlOwner | undefined>(FIELD_CONTROL_OWNER_CONTEXT);
}
