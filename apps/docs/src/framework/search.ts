import type { CommandItem } from '@zadmin/zui';
import type { GuideDefinition } from '../content/guides.js';
import type { ComponentCatalogManifestEntry } from './catalog-manifest.generated.js';
import type { ComponentDoc } from './component-doc.js';
import { componentRoute, guideRoute } from './router.js';

export interface DocsCommandItem extends CommandItem {
	readonly href: string;
}

export type DocsSearchGuide = Pick<
	GuideDefinition,
	'eyebrow' | 'id' | 'sections' | 'summary' | 'title'
>;

type SearchDoc = Pick<
	ComponentCatalogManifestEntry,
	'name' | 'summary' | 'category' | 'status' | 'keywords'
> &
	Partial<Pick<ComponentDoc, 'props'>>;
function searchableText(doc: SearchDoc): string {
	return [
		doc.name,
		doc.summary,
		doc.category,
		doc.status,
		...doc.keywords,
		...(doc.props?.flatMap((prop) => [prop.name, prop.type, prop.description]) ?? [])
	]
		.join(' ')
		.toLocaleLowerCase();
}

export function searchComponentDocs<T extends SearchDoc>(
	docs: readonly T[],
	query: string
): readonly T[] {
	const normalized = query.trim().toLocaleLowerCase();
	if (normalized.length === 0) return docs;
	return docs.filter((doc) => searchableText(doc).includes(normalized));
}

function guideKeywords(guide: DocsSearchGuide): readonly string[] {
	return [
		guide.eyebrow,
		guide.summary,
		guide.title,
		...guide.sections.flatMap((section) => [
			section.title,
			...section.paragraphs,
			...(section.bullets ?? []),
			...(section.links?.flatMap((link) => [link.label]) ?? [])
		])
	];
}

export function createDocsCommandItems(
	docs: readonly ComponentCatalogManifestEntry[],
	guides: readonly DocsSearchGuide[],
	categoryLabel: (doc: ComponentCatalogManifestEntry) => string
): readonly DocsCommandItem[] {
	return [
		...guides.map((guide): DocsCommandItem => ({
			description: guide.summary,
			group: '指南',
			href: guideRoute(guide.id),
			key: `guide:${guide.id}`,
			keywords: guideKeywords(guide),
			label: guide.id === 'theme' ? 'Theme Lab' : guide.eyebrow
		})),
		...docs.map((doc): DocsCommandItem => ({
			description: doc.summary,
			disabled: doc.status === 'deprecated' || undefined,
			group: `组件 · ${categoryLabel(doc)}`,
			href: componentRoute(doc.id),
			key: `component:${doc.id}`,
			keywords: [doc.summary, doc.category, doc.status, ...doc.keywords],
			label: doc.name
		}))
	];
}
