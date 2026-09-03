export type ZuiComponentCategory =
	'data-display' | 'feedback' | 'gene' | 'input' | 'layout' | 'navigation' | 'overlay' | 'utility';
export type ZuiComponentStatus =
	'approved' | 'candidate' | 'deprecated' | 'experimental' | 'stable';
export type ZuiReleasedVersion = `${number}.${number}.${number}`;
export type ZuiComponentSince = ZuiReleasedVersion | 'unreleased';
export type ZuiOpaqueBoundaryKind =
	'caller-generic' | 'external-protocol' | 'external-descriptor' | 'dynamic-record';
export type ZuiOpaqueResolution = 'generic-unexpanded' | 'external-resolved' | 'dynamic-key';
export interface ZuiOpaqueMetadata {
	readonly kind: ZuiOpaqueBoundaryKind;
	readonly resolution: ZuiOpaqueResolution;
	readonly type: string;
	readonly genericParameters?: readonly string[];
	readonly source?: string;
	readonly reason: string;
	readonly owner: string;
	readonly serializable?: boolean;
}

interface ZuiApiMetadataBase {
	readonly description: string;
	readonly name: string;
	readonly type: string;
	/** Version in which this public API was introduced. */
	readonly since?: ZuiComponentSince;
	/** Version in which this API entered the deprecation period. */
	readonly deprecatedSince?: ZuiComponentSince;
	/** Public API name or external migration target. */
	readonly replacement?: string;
	/** Set when replacement intentionally points outside the ZUI public API. */
	readonly replacementExternal?: boolean;
	/** Planned removal version. Pre-1.0 removal is opt-in and must be explicit. */
	readonly removeAfter?: ZuiReleasedVersion;
	/** Relative migration document or external migration URL. */
	readonly migration?: string;
}

/** A structured API is either expanded into owned members or explicitly opaque, never both. */
export type ZuiApiMetadata = ZuiApiMetadataBase &
	(
		| {
				readonly members?: readonly ZuiApiMemberMetadata[];
				readonly opaque?: never;
		  }
		| {
				readonly members?: never;
				readonly opaque: ZuiOpaqueMetadata;
		  }
	);

export type ZuiApiMemberMetadata = ZuiApiMetadata & {
	readonly default?: string;
	readonly required?: boolean;
	/** Human-readable condition for discriminated-union members that are not always required. */
	readonly requiredWhen?: string;
};

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

export type ZuiPropMetadata = ZuiApiMetadata & {
	readonly bindable?: boolean;
	readonly default: string;
	readonly required?: boolean;
};

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
