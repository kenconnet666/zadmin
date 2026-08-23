import path from 'node:path';

import MagicString from 'magic-string';
import { parse, type PreprocessorGroup } from 'svelte/compiler';

import { findIcssBindings, findVariableCallsites, findZuiComponentBindings } from './analyze.ts';
import { rewriteIcssBindings } from './rewrite.ts';
import { createModuleId } from './source-names.ts';
import type { IcssPreprocessOptions, PositionedProgram } from './types.ts';

const COMPILED_MARKER = '@zui-icss-compiled';

function chooseLocal(source: string, base: string): string {
	let suffix = 0;
	let candidate = base;
	while (new RegExp(`\\b${candidate}\\b`, 'u').test(source)) {
		suffix += 1;
		candidate = `${base}${suffix}`;
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
			const zuiComponents = findZuiComponentBindings(program, modules);

			const analyzed = findVariableCallsites(program, icssBindings, filename);
			for (const diagnostic of analyzed.diagnostics) options.onDiagnostic?.(diagnostic);

			const magic = new MagicString(content);
			const slotLocal = chooseLocal(content, '__zuiIcssSlot');
			const ownedLocal = chooseLocal(content, '__zuiIcssOwned');
			const hmrLocal = chooseLocal(content, '__zuiRegisterIcssHmr');
			const owner = createModuleId(filename, root);
			const rewritten = rewriteIcssBindings(
				ast.fragment,
				analyzed.callsites,
				icssBindings,
				zuiComponents,
				magic,
				content,
				slotLocal,
				ownedLocal,
				owner,
				root,
				filename
			);
			for (const diagnostic of rewritten.diagnostics) options.onDiagnostic?.(diagnostic);
			if (!rewritten.changed) return undefined;

			const internalModuleCode = `import { __icssOwned as ${ownedLocal}, __icssSlot as ${slotLocal}, __registerIcssHmr as ${hmrLocal} } from '${internalModule}'; /* ${COMPILED_MARKER} */
${hmrLocal}(import.meta, '${owner}');
`;
			if (ast.module == null) {
				magic.prepend(`<script module>\n${internalModuleCode}</script>\n`);
			} else {
				const moduleProgram = ast.module.content as PositionedProgram;
				magic.appendLeft(moduleProgram.start, internalModuleCode);
			}
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
