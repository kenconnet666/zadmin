import type { ComponentDoc } from './component-doc.js';

function searchableText(doc: ComponentDoc): string {
	return [
		doc.name,
		doc.summary,
		doc.category,
		doc.status,
		...doc.props.flatMap((prop) => [
			prop.name,
			prop.type,
			prop.description,
			prop.bindable ? 'bindable' : '',
			prop.required ? 'required' : ''
		])
	]
		.join(' ')
		.toLocaleLowerCase();
}

export function searchComponentDocs(
	docs: readonly ComponentDoc[],
	query: string
): readonly ComponentDoc[] {
	const normalized = query.trim().toLocaleLowerCase();
	if (normalized.length === 0) return docs;
	return docs.filter((doc) => searchableText(doc).includes(normalized));
}
