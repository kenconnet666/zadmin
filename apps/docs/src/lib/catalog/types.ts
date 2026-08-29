import type { Component } from 'svelte';

export interface ApiRow {
	readonly default: string;
	readonly description: string;
	readonly name: string;
	readonly type: string;
}

export interface ApiSection {
	readonly description?: string;
	readonly rows: readonly ApiRow[];
	readonly title: string;
}

export interface DemoDefinition {
	readonly component: Component;
	readonly description: string;
	readonly id: string;
	readonly source: string;
	readonly title: string;
}

export interface ComponentDoc {
	readonly accessibility: readonly string[];
	readonly api: readonly ApiSection[];
	readonly demos: readonly DemoDefinition[];
	readonly id: string;
	readonly importStatement: string;
	readonly name: string;
	readonly source: string;
	readonly summary: string;
}

export function defineComponentDoc<const TDoc extends ComponentDoc>(doc: TDoc): Readonly<TDoc> {
	return Object.freeze(doc);
}
