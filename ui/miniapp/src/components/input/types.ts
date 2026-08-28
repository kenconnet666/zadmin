import type { MiniComponentProps, MiniappEvent } from '../types.ts';

export type MInputType = 'digit' | 'idcard' | 'nickname' | 'number' | 'safe-password' | 'text';
export type MInputConfirmType = 'done' | 'go' | 'next' | 'search' | 'send';

export interface MInputProps extends Omit<MiniComponentProps, 'children'> {
	readonly confirmHold?: boolean;
	readonly confirmType?: MInputConfirmType;
	readonly disabled?: boolean;
	readonly maxlength?: number;
	readonly onConfirm?: (value: string, event: MiniappEvent<{ value: string }>) => void;
	readonly onValueChange?: (value: string, event: MiniappEvent<{ value: string }>) => void;
	readonly password?: boolean;
	readonly placeholder?: string;
	readonly type?: MInputType;
	value?: string;
}
