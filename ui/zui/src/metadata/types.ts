export type ZuiComponentCategory =
	'data-display' | 'feedback' | 'gene' | 'input' | 'layout' | 'navigation' | 'overlay' | 'utility';
export type ZuiComponentStatus =
	'approved' | 'candidate' | 'deprecated' | 'experimental' | 'stable';
export type ZuiReleasedVersion = `${number}.${number}.${number}`;
export type ZuiComponentSince = ZuiReleasedVersion | 'unreleased';

export interface ZuiApiMetadata {
	readonly description: string;
	readonly name: string;
	readonly type: string;
}

export type ZuiBindingMetadata = ZuiApiMetadata;
export type ZuiEventMetadata = ZuiApiMetadata;
export type ZuiSnippetMetadata = ZuiApiMetadata;

export interface ZuiPartMetadata {
	readonly description: string;
	readonly name: string;
}

export interface ZuiDataStateMetadata {
	readonly description: string;
	readonly name: string;
	readonly values: readonly string[];
}

export interface ZuiKeyboardMetadata {
	readonly description: string;
	readonly key: string;
}

export interface ZuiPropMetadata {
	readonly bindable?: boolean;
	readonly default: string;
	readonly description: string;
	readonly name: string;
	readonly required?: boolean;
	readonly type: string;
}

export interface ZuiComponentMetadata {
	readonly bindings: readonly ZuiBindingMetadata[];
	readonly category: ZuiComponentCategory;
	readonly dependencies: readonly string[];
	readonly events: readonly ZuiEventMetadata[];
	readonly id: string;
	readonly importStatement: string;
	readonly keyboard: readonly ZuiKeyboardMetadata[];
	readonly name: `Z${string}`;
	readonly parts: readonly ZuiPartMetadata[];
	readonly props: readonly ZuiPropMetadata[];
	readonly since: ZuiComponentSince;
	readonly snippets: readonly ZuiSnippetMetadata[];
	readonly source: `ui/zui/src/components/${string}.svelte`;
	readonly states: readonly ZuiDataStateMetadata[];
	readonly status: ZuiComponentStatus;
	readonly summary: string;
}
