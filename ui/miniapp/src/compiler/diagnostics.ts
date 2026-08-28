export class SvelteTaroCompileError extends Error {
	readonly code = 'svelte_taro_unsupported';
	readonly column: number;
	readonly filename: string;
	readonly line: number;
	readonly suggestion: string;

	constructor(options: {
		column: number;
		feature: string;
		filename: string;
		line: number;
		suggestion: string;
	}) {
		super(
			`${options.filename}:${options.line}:${options.column} ${options.feature} is not supported by the Svelte Taro renderer. ${options.suggestion}`
		);
		this.name = 'SvelteTaroCompileError';
		this.column = options.column;
		this.filename = options.filename;
		this.line = options.line;
		this.suggestion = options.suggestion;
	}
}

type UnsupportedFeature = {
	readonly feature: string;
	readonly pattern: RegExp;
	readonly suggestion: string;
};

const UNSUPPORTED: readonly UnsupportedFeature[] = [
	{
		feature: 'Regular-element bind:',
		pattern: /<[a-z][^>]*\bbind:[a-zA-Z]/u,
		suggestion: 'Use component props, callbacks, or a component-level $bindable value.'
	},
	{
		feature: 'Transition and animation directives',
		pattern: /\b(?:animate|in|out|transition):[a-zA-Z]/u,
		suggestion: 'Express state with class/style and Mini Program animation APIs.'
	},
	{
		feature: 'Browser global special elements',
		pattern: /<svelte:(?:body|document|head|window)\b/u,
		suggestion: 'Use @zadmin/miniapp/platform or App/Page lifecycle hooks.'
	},
	{
		feature: 'Dynamic svelte:element',
		pattern: /<svelte:element\b/u,
		suggestion: 'Use a statically enumerable Svelte component or native element.'
	},
	{
		feature: 'Raw HTML rendering',
		pattern: /\{@html\b/u,
		suggestion: 'Render typed Text/components; arbitrary HTML is not Mini Program markup.'
	},
	{
		feature: 'createRawSnippet',
		pattern: /\bcreateRawSnippet\s*\(/u,
		suggestion: 'Use a same-renderer declarative snippet instead.'
	},
	{
		feature: 'Boundary failed/pending snippets in the pinned renderer artifact',
		pattern: /\{#snippet\s+(?:failed|pending)\s*\(/u,
		suggestion:
			'Use <svelte:boundary onerror={handler}> and render recovery state outside the boundary.'
	}
];

function position(source: string, index: number): { column: number; line: number } {
	const prefix = source.slice(0, index);
	const lines = prefix.split('\n');
	return { column: (lines.at(-1)?.length ?? 0) + 1, line: lines.length };
}

export function assertSupportedSvelteSource(source: string, filename: string): void {
	for (const unsupported of UNSUPPORTED) {
		const match = unsupported.pattern.exec(source);
		if (match === null) continue;
		throw new SvelteTaroCompileError({
			...position(source, match.index),
			feature: unsupported.feature,
			filename,
			suggestion: unsupported.suggestion
		});
	}
}
