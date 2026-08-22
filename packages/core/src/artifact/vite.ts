import ts from 'typescript';
import type { Plugin } from 'vite';

const TYPESCRIPT_FILE = /\.tsx?$/;
const STANDARD_DECORATOR = /(^|[\r\n])\s*@[$A-Z_a-z][$\w]*/;

/** Lowers standard decorators until Vite's default Oxc transform can do so for Node. */
export function standardDecorators(): Plugin {
	return {
		name: 'zadmin-standard-decorators',
		enforce: 'pre',
		transform(code, id) {
			const path = id.split('?', 1)[0] ?? id;
			if (!TYPESCRIPT_FILE.test(path) || !STANDARD_DECORATOR.test(code)) return undefined;
			const result = ts.transpileModule(code, {
				fileName: path,
				compilerOptions: {
					inlineSources: true,
					jsx: ts.JsxEmit.Preserve,
					module: ts.ModuleKind.ESNext,
					moduleResolution: ts.ModuleResolutionKind.Bundler,
					sourceMap: true,
					target: ts.ScriptTarget.ES2022,
					useDefineForClassFields: true
				},
				reportDiagnostics: true
			});
			const errors = result.diagnostics?.filter(
				({ category }) => category === ts.DiagnosticCategory.Error
			);
			if (errors?.length) {
				throw new Error(
					ts.formatDiagnosticsWithColorAndContext(errors, {
						getCanonicalFileName: (fileName) => fileName,
						getCurrentDirectory: () => process.cwd(),
						getNewLine: () => '\n'
					})
				);
			}
			return {
				code: result.outputText.replace(/\n\/\/# sourceMappingURL=.*\s*$/, '\n'),
				map: result.sourceMapText ? JSON.parse(result.sourceMapText) : undefined
			};
		}
	};
}
