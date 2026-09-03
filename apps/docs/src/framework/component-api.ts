import type { ZuiOpaqueBoundaryKind } from '@zadmin/zui/metadata';

export interface ComponentApiPropFact {
	readonly name: string;
	readonly required: boolean;
	readonly type: string;
}

export interface ComponentApiFacts {
	readonly declaration: string;
	readonly id: string;
	readonly inheritedFrom: readonly string[];
	readonly name: `Z${string}`;
	readonly props: readonly ComponentApiPropFact[];
	readonly source: `ui/zui/src/components/${string}.svelte`;
	readonly metadataGapProps: readonly string[];
	readonly opaqueProps?: readonly { readonly path: string; readonly kind: ZuiOpaqueBoundaryKind }[];
	readonly members?: () => readonly ComponentApiFacts[];
}

export interface ComponentPropTeaching {
	readonly default?: string;
	readonly description: string;
}

export interface ComponentTeachingMetadata {
	readonly omitMetadataProps?: readonly string[];
	readonly props?: Readonly<Record<string, ComponentPropTeaching>>;
	readonly summary?: string;
}
