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
	readonly undocumentedProps: readonly string[];
}

export interface ComponentPropTeaching {
	readonly default?: string;
	readonly description: string;
}

export interface ComponentTeachingMetadata {
	readonly props?: Readonly<Record<string, ComponentPropTeaching>>;
	readonly summary?: string;
}
