import type { Component } from 'svelte';
import type {
	ZuiComponentCategory,
	ZuiComponentMetadata,
	ZuiComponentStatus,
	ZuiPropMetadata
} from '@zadmin/zui/metadata';
import type { ComponentApiFacts, ComponentTeachingMetadata } from './component-api.js';

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
	readonly sourceApi?: ComponentApiFacts;
	readonly teaching?: ComponentTeachingMetadata;
}

function sourceBackedProps(
	metadata: ZuiComponentMetadata,
	facts: ComponentApiFacts | undefined,
	teaching: ComponentTeachingMetadata | undefined
): readonly ZuiPropMetadata[] {
	const factsByName = new Map(facts?.props.map((prop) => [prop.name, prop]) ?? []);
	const documentedNames = new Set([
		...metadata.bindings.map(({ name }) => name),
		...metadata.props.map(({ name }) => name),
		...metadata.snippets.map(({ name }) => name)
	]);
	const rows = metadata.props.map((prop) => {
		const fact = factsByName.get(prop.name);
		const supplement = teaching?.props?.[prop.name];
		return {
			...prop,
			...(fact
				? { required: fact.required || undefined, type: fact.type }
				: { required: prop.required }),
			...supplement
		};
	});
	for (const fact of facts?.props ?? []) {
		const supplement = teaching?.props?.[fact.name];
		if (!supplement || documentedNames.has(fact.name)) continue;
		rows.push({
			default: supplement.default ?? '—',
			description: supplement.description,
			name: fact.name,
			required: fact.required || undefined,
			type: fact.type
		});
	}
	return rows;
}

function appendMetadataApi(
	api: ApiSection[],
	metadata: ZuiComponentMetadata,
	props: readonly ZuiPropMetadata[],
	facts?: ComponentApiFacts,
	prefix = '',
	titlePrefix = ''
): void {
	api.push({
		description: facts
			? `类型和必填性来自${facts.declaration}的静态AST；默认值与说明由文档教学metadata补充。组件同时转发适用的原生属性。`
			: '下表来自组件单文件中的公开metadata；组件同时转发适用的原生属性。',
		id: `${prefix}props`,
		rows: props,
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
	const sourceApi = doc.sourceApi;
	if (sourceApi && (sourceApi.id !== metadata.id || sourceApi.name !== metadata.name)) {
		throw new TypeError(
			`${metadata.name} documentation received API facts for ${sourceApi.name} (${sourceApi.id}).`
		);
	}
	if (sourceApi && sourceApi.undocumentedProps.length > 0) {
		throw new TypeError(
			`${metadata.name} cannot enable generated Props until its teaching metadata covers: ${sourceApi.undocumentedProps.join(', ')}.`
		);
	}
	const resolvedMetadata = {
		...metadata,
		props: sourceBackedProps(metadata, sourceApi, doc.teaching),
		summary: doc.teaching?.summary ?? metadata.summary
	} satisfies ZuiComponentMetadata;
	appendMetadataApi(api, resolvedMetadata, resolvedMetadata.props, sourceApi);
	for (const member of doc.members ?? []) {
		appendMetadataApi(api, member, member.props, undefined, `${member.id}-`, `${member.name} `);
	}
	const { members: _members, sourceApi: _sourceApi, teaching: _teaching, ...page } = doc;
	void _members;
	void _sourceApi;
	void _teaching;

	return Object.freeze({
		...resolvedMetadata,
		...page,
		api: Object.freeze(api),
		keywords: Object.freeze(doc.keywords ?? [])
	});
}
