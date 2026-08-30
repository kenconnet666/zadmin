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
	readonly keywords: readonly string[];
	readonly status: ZuiComponentStatus;
}

interface ComponentDocDefinition extends Pick<ComponentDoc, 'accessibility' | 'demos'> {
	readonly keywords?: readonly string[];
	readonly members?: readonly ZuiComponentMetadata[];
}

function appendMetadataApi(
	api: ApiSection[],
	metadata: ZuiComponentMetadata,
	prefix = '',
	titlePrefix = ''
): void {
	api.push({
		description: '下表来自组件单文件中的公开metadata；组件同时转发适用的原生属性。',
		id: `${prefix}props`,
		rows: metadata.props,
		title: `${titlePrefix}Props`
	});
	if (metadata.bindings.length > 0) {
		api.push({
			id: `${prefix}bindings`,
			rows: metadata.bindings.map((binding) => ({ ...binding, bindable: true })),
			title: `${titlePrefix}Bindings`
		});
	}
	if (metadata.events.length > 0) {
		api.push({ id: `${prefix}events`, rows: metadata.events, title: `${titlePrefix}Events` });
	}
	if (metadata.snippets.length > 0) {
		api.push({ id: `${prefix}snippets`, rows: metadata.snippets, title: `${titlePrefix}Snippets` });
	}
	if (metadata.parts.length > 0) {
		api.push({
			id: `${prefix}parts`,
			rows: metadata.parts.map((part) => ({ ...part, feature: 'DOM part', type: 'string' })),
			title: `${titlePrefix}Parts`
		});
	}
	if (metadata.states.length > 0) {
		api.push({
			id: `${prefix}states`,
			rows: metadata.states.map((state) => ({
				description: state.description,
				feature: 'data attribute',
				name: state.name,
				type: state.values.map((value) => JSON.stringify(value)).join(' | ')
			})),
			title: `${titlePrefix}States`
		});
	}
	if (metadata.keyboard.length > 0) {
		api.push({
			id: `${prefix}keyboard`,
			rows: metadata.keyboard.map((item) => ({
				description: item.description,
				feature: 'keyboard',
				name: item.key,
				type: 'KeyboardEvent'
			})),
			title: `${titlePrefix}Keyboard`
		});
	}
}

export function defineComponentDoc(
	metadata: ZuiComponentMetadata,
	doc: ComponentDocDefinition
): ComponentDoc {
	if (doc.demos.length < 2) {
		throw new TypeError(`${metadata.name} documentation requires at least two distinct demos.`);
	}
	const demoIds = new Set<string>();
	for (const demo of doc.demos) {
		if (demoIds.has(demo.id))
			throw new TypeError(`${metadata.name} has duplicate demo id "${demo.id}".`);
		if (!demo.source.trim())
			throw new TypeError(`${metadata.name} demo "${demo.id}" has no source.`);
		demoIds.add(demo.id);
	}
	const api: ApiSection[] = [];
	appendMetadataApi(api, metadata);
	for (const member of doc.members ?? []) {
		appendMetadataApi(api, member, `${member.id}-`, `${member.name} `);
	}
	const { members: _members, ...page } = doc;
	void _members;

	return Object.freeze({
		...metadata,
		...page,
		api: Object.freeze(api),
		keywords: Object.freeze(doc.keywords ?? [])
	});
}
