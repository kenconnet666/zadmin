import path from 'node:path';

import MagicString from 'magic-string';
import { parse, type PreprocessorGroup } from 'svelte/compiler';

import { findIcssBindings, findVariableCallsites } from './analyze.ts';
import { rewriteIcssBindings } from './rewrite.ts';
import type { IcssPreprocessOptions, PositionedProgram } from './types.ts';

const COMPILED_MARKER = '@zui-icss-compiled';

function chooseSlotLocal(source: string): string {
	let suffix = 0;
	let candidate = '__zuiIcssSlot';
	while (new RegExp(`\\b${candidate}\\b`, 'u').test(source)) {
		suffix += 1;
		candidate = `__zuiIcssSlot${suffix}`;
	}
	return candidate;
}

export function icssPreprocess(options: IcssPreprocessOptions = {}): PreprocessorGroup {
	const dynamicValues = options.dynamicValues ?? 'inline-vars';
	const internalModule = options.internalModule ?? '@zadmin/zui/internal';
	const modules = new Set(options.modules ?? ['@zadmin/zui']);
	const root = path.resolve(options.root ?? process.cwd());

	return {
		name: 'zui-icss',
		markup({ content, filename }) {
			if (
				dynamicValues === 'class-rules' ||
				content.includes(COMPILED_MARKER) ||
				![...modules].some((moduleName) => content.includes(moduleName))
			) {
				return undefined;
			}

			const ast = parse(content, { filename, modern: true });
			const program = ast.instance?.content as PositionedProgram | undefined;
			if (program === undefined) return undefined;
			const icssBindings = findIcssBindings(program, modules);
			if (icssBindings.size === 0) return undefined;

			const analyzed = findVariableCallsites(program, icssBindings, filename);
			for (const diagnostic of analyzed.diagnostics) options.onDiagnostic?.(diagnostic);

			const magic = new MagicString(content);
			const slotLocal = chooseSlotLocal(content);
			const rewritten = rewriteIcssBindings(
				ast.fragment,
				analyzed.callsites,
				icssBindings,
				magic,
				content,
				slotLocal,
				root,
				filename
			);
			for (const diagnostic of rewritten.diagnostics) options.onDiagnostic?.(diagnostic);
			if (!rewritten.changed) return undefined;

			const internalImport = `import { __icssSlot as ${slotLocal} } from '${internalModule}'; /* ${COMPILED_MARKER} */\n`;
			magic.appendLeft(program.start, internalImport);
			return {
				code: magic.toString(),
				map: magic.generateMap({
					file: filename,
					hires: true,
					includeContent: true,
					source: filename
				})
			};
		}
	};
}

export type { DynamicValuesMode, IcssCompilerDiagnostic, IcssPreprocessOptions } from './types.ts';
