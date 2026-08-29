import type { Component } from 'svelte';
import type {
	ZuiComponentCategory,
	ZuiComponentMetadata,
	ZuiComponentStatus
} from '@zadmin/zui/metadata';

export interface ApiRow {
	readonly bindable?: boolean;
	readonly default: string;
	readonly description: string;
	readonly name: string;
	readonly required?: boolean;
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

export type ComponentCategory = ZuiComponentCategory;

export interface ComponentDoc extends ZuiComponentMetadata {
	readonly accessibility: readonly string[];
	readonly api: readonly ApiSection[];
	readonly demos: readonly DemoDefinition[];
	readonly status: ZuiComponentStatus;
}

export function defineComponentDoc(
	metadata: ZuiComponentMetadata,
	doc: Pick<ComponentDoc, 'accessibility' | 'demos'>
): ComponentDoc {
	return Object.freeze({
		...metadata,
		...doc,
		api: Object.freeze([
			{
				description: '下表来自组件单文件中的公开metadata；组件同时转发适用的原生属性。',
				rows: metadata.props,
				title: 'Props'
			}
		])
	});
}
