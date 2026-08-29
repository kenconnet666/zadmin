export type ZuiComponentCategory = 'gene' | 'input' | 'layout';
export type ZuiComponentStatus = 'deprecated' | 'experimental' | 'stable';

export interface ZuiPropMetadata {
	readonly bindable?: boolean;
	readonly default: string;
	readonly description: string;
	readonly name: string;
	readonly required?: boolean;
	readonly type: string;
}

export interface ZuiComponentMetadata {
	readonly category: ZuiComponentCategory;
	readonly id: string;
	readonly importStatement: string;
	readonly name: `Z${string}`;
	readonly props: readonly ZuiPropMetadata[];
	readonly source: `ui/zui/src/lib/components/${string}.svelte`;
	readonly status: ZuiComponentStatus;
	readonly summary: string;
}
