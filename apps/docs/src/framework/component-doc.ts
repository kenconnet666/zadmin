import type { Component } from 'svelte';
import type {
	ZuiComponentCategory,
	ZuiComponentMetadata,
	ZuiComponentStatus
} from '@zadmin/zui/metadata';

export interface ApiRow {
	readonly bindable?: boolean;
	readonly default?: string;
	readonly description: string;
	readonly feature?: string;
	readonly name: string;
	readonly required?: boolean;
	readonly type: string;
}

export interface ApiSection {
	readonly description?: string;
	readonly id: string;
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
	const api: ApiSection[] = [
		{
			description: '下表来自组件单文件中的公开metadata；组件同时转发适用的原生属性。',
			id: 'props',
			rows: metadata.props,
			title: 'Props'
		}
	];
	if (metadata.bindings.length > 0) {
		api.push({
			id: 'bindings',
			rows: metadata.bindings.map((binding) => ({ ...binding, bindable: true })),
			title: 'Bindings'
		});
	}
	if (metadata.events.length > 0) {
		api.push({ id: 'events', rows: metadata.events, title: 'Events' });
	}
	if (metadata.snippets.length > 0) {
		api.push({ id: 'snippets', rows: metadata.snippets, title: 'Snippets' });
	}
	if (metadata.parts.length > 0) {
		api.push({
			id: 'parts',
			rows: metadata.parts.map((part) => ({ ...part, feature: 'DOM part', type: 'string' })),
			title: 'Parts'
		});
	}
	if (metadata.states.length > 0) {
		api.push({
			id: 'states',
			rows: metadata.states.map((state) => ({
				description: state.description,
				feature: 'data attribute',
				name: state.name,
				type: state.values.map((value) => JSON.stringify(value)).join(' | ')
			})),
			title: 'States'
		});
	}
	if (metadata.keyboard.length > 0) {
		api.push({
			id: 'keyboard',
			rows: metadata.keyboard.map((item) => ({
				description: item.description,
				feature: 'keyboard',
				name: item.key,
				type: 'KeyboardEvent'
			})),
			title: 'Keyboard'
		});
	}

	return Object.freeze({
		...metadata,
		...doc,
		api: Object.freeze(api)
	});
}
