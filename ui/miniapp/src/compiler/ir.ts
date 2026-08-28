import { parse } from 'svelte/compiler';

import { assertSupportedSvelteSource } from './diagnostics.ts';
import { collectNativeElements } from './marker.ts';

export interface MiniappComponentIr {
	readonly filename: string;
	readonly nativeElements: readonly string[];
	readonly source: string;
}

export function analyzeMiniappComponent(source: string, filename: string): MiniappComponentIr {
	assertSupportedSvelteSource(source, filename);
	const ast = parse(source, { filename, modern: true });
	return Object.freeze({
		filename,
		nativeElements: Object.freeze([...collectNativeElements(ast.fragment)].sort()),
		source
	});
}
