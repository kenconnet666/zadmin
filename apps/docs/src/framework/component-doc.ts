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
	readonly covers?: readonly ComponentCapability[];
	readonly component: Component;
	readonly description: string;
	readonly id: string;
	readonly source: string;
	readonly title: string;
}

export type ComponentProfile =
	| 'animated'
	| 'collection'
	| 'data-view'
	| 'form-control'
	| 'layer'
	| 'primitive'
	| 'service'
	| 'virtualized';

export type ComponentCapability =
	| 'accessible-name'
	| 'basic-render'
	| 'composition'
	| 'controlled'
	| 'density'
	| 'disabled'
	| 'external-clear'
	| 'focus'
	| 'form-data'
	| 'form-reset'
	| 'full-motion'
	| 'invalid'
	| 'keyboard'
	| 'loading'
	| 'locale'
	| 'native-props'
	| 'portal'
	| 'readonly'
	| 'reduced-motion'
	| 'resource-cleanup'
	| 'rtl'
	| 'ssr'
	| 'uncontrolled'
	| 'variants-and-states';

export type ComponentCategory = ZuiComponentCategory;

export interface ComponentDoc extends ZuiComponentMetadata {
	readonly accessibility: readonly string[];
	readonly api: readonly ApiSection[];
	readonly demos: readonly DemoDefinition[];
	readonly keywords: readonly string[];
	readonly profiles: readonly ComponentProfile[];
	readonly status: ZuiComponentStatus;
}

interface ComponentDocDefinition extends Pick<ComponentDoc, 'accessibility' | 'demos'> {
	readonly additionalApi?: readonly ApiSection[];
	readonly keywords?: readonly string[];
	readonly members?: readonly ZuiComponentMetadata[];
	readonly profiles?: readonly ComponentProfile[];
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
	const omittedMetadataProps = new Set(teaching?.omitMetadataProps ?? []);
	const rows = metadata.props
		.filter(({ name }) => !omittedMetadataProps.has(name))
		.map((prop) => {
			const fact = factsByName.get(prop.name);
			const supplement = teaching?.props?.[prop.name];
			return {
				...prop,
				...(fact
					? { required: fact.required || prop.required || undefined, type: fact.type }
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
	if (doc.sourceApi && (doc.profiles?.length ?? 0) === 0) {
		throw new TypeError(
			`${metadata.name} generated API documentation requires a component profile.`
		);
	}
	if (doc.profiles && new Set(doc.profiles).size !== doc.profiles.length) {
		throw new TypeError(`${metadata.name} documentation has duplicate component profiles.`);
	}
	const demoIds = new Set<string>();
	for (const demo of doc.demos) {
		if (demoIds.has(demo.id))
			throw new TypeError(`${metadata.name} has duplicate demo id "${demo.id}".`);
		if (!demo.source.trim())
			throw new TypeError(`${metadata.name} demo "${demo.id}" has no source.`);
		if (doc.sourceApi && (demo.covers?.length ?? 0) === 0) {
			throw new TypeError(`${metadata.name} demo "${demo.id}" has no capability evidence.`);
		}
		if (demo.covers && new Set(demo.covers).size !== demo.covers.length) {
			throw new TypeError(`${metadata.name} demo "${demo.id}" repeats capability evidence.`);
		}
		demoIds.add(demo.id);
	}
	const api: ApiSection[] = [];
	const sourceApi = doc.sourceApi;
	if (sourceApi && (sourceApi.id !== metadata.id || sourceApi.name !== metadata.name)) {
		throw new TypeError(
			`${metadata.name} documentation received API facts for ${sourceApi.name} (${sourceApi.id}).`
		);
	}
	const metadataPropNames = new Set(metadata.props.map(({ name }) => name));
	const omittedMetadataProps = doc.teaching?.omitMetadataProps ?? [];
	if (new Set(omittedMetadataProps).size !== omittedMetadataProps.length) {
		throw new TypeError(`${metadata.name} teaching repeats omitted metadata props.`);
	}
	const unknownOmittedProps = omittedMetadataProps.filter((name) => !metadataPropNames.has(name));
	if (unknownOmittedProps.length > 0) {
		throw new TypeError(
			`${metadata.name} teaching cannot omit unknown metadata props: ${unknownOmittedProps.join(', ')}.`
		);
	}
	if (sourceApi && doc.teaching?.props) {
		const knownTeachingProps = new Set([
			...sourceApi.props.map(({ name }) => name),
			...metadata.bindings.map(({ name }) => name),
			...metadata.events.map(({ name }) => name),
			...metadata.props.map(({ name }) => name),
			...metadata.snippets.map(({ name }) => name)
		]);
		const unknownTeachingProps = Object.keys(doc.teaching.props).filter(
			(name) => !knownTeachingProps.has(name)
		);
		if (unknownTeachingProps.length > 0) {
			throw new TypeError(
				`${metadata.name} teaching contains unknown public props: ${unknownTeachingProps.join(', ')}.`
			);
		}
	}
	const uncoveredProps = sourceApi?.undocumentedProps.filter(
		(name) => doc.teaching?.props?.[name] === undefined
	);
	if (sourceApi && uncoveredProps && uncoveredProps.length > 0) {
		throw new TypeError(
			`${metadata.name} cannot enable generated Props until its teaching metadata covers: ${uncoveredProps.join(', ')}.`
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
	const apiIds = new Set(api.map(({ id }) => id));
	for (const section of doc.additionalApi ?? []) {
		if (!section.id.trim() || !section.title.trim() || section.rows.length === 0) {
			throw new TypeError(`${metadata.name} additional API sections require id, title and rows.`);
		}
		if (apiIds.has(section.id)) {
			throw new TypeError(`${metadata.name} repeats API section id "${section.id}".`);
		}
		const rowNames = section.rows.map(({ name }) => name);
		if (new Set(rowNames).size !== rowNames.length) {
			throw new TypeError(`${metadata.name} ${section.title} repeats API row names.`);
		}
		apiIds.add(section.id);
		api.push(section);
	}
	const {
		additionalApi: _additionalApi,
		members: _members,
		profiles = [],
		sourceApi: _sourceApi,
		teaching: _teaching,
		...page
	} = doc;
	void _additionalApi;
	void _members;
	void _sourceApi;
	void _teaching;

	return Object.freeze({
		...resolvedMetadata,
		...page,
		api: Object.freeze(api),
		keywords: Object.freeze(doc.keywords ?? []),
		profiles: Object.freeze(profiles)
	});
}
