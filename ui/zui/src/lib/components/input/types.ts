import type { HTMLInputAttributes } from 'svelte/elements';

export type ZInputType = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';
export type ZInputSize = 'large' | 'medium' | 'small';

export interface ZInputProps extends Omit<
	HTMLInputAttributes,
	'children' | 'size' | 'type' | 'value'
> {
	readonly invalid?: boolean;
	readonly onValueChange?: (value: string) => void;
	readonly size?: ZInputSize;
	readonly type?: ZInputType;
	value?: string;
	ref?: HTMLInputElement | null;
}
